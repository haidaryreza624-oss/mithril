import AsyncStorage from '@react-native-async-storage/async-storage';
import { parse } from 'node-html-parser';

const BASE_URL = 'https://hemis.edu.af';
const LOGIN_URL = `${BASE_URL}/student/login`;
const PROFILE_URL = `${BASE_URL}/student/profile`;
const SCORE_URL = `${BASE_URL}/student/scores-list`;
const FINAL_SCORE_URL = `${BASE_URL}/student/final-scores-list`;
const SCHEDULE_URL = `${BASE_URL}/student/timetable/course`;
const LOGOUT_URL = `${BASE_URL}/student/logout`;

const COOKIE_STORAGE_KEY = 'hemis_cookie_jar';

function parseSetCookie(setCookie: string): string | null {
  const match = setCookie.match(/^([^=]+=[^;]+)/);
  return match ? match[1] : null;
}

function mergeCookies(existing: string | null, newCookie: string | null): string {
  if (!newCookie) return existing || '';
  if (!existing) return newCookie;
  return `${existing}; ${newCookie}`;
}

async function fetchWithManualRedirect(
  url: string,
  options: RequestInit,
  initialCookie?: string
): Promise<{ response: Response; finalCookie: string }> {
  let currentUrl = url;
  let currentCookie = initialCookie || '';
  let redirectCount = 0;
  const maxRedirects = 10;

  while (redirectCount < maxRedirects) {
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ...(options.headers as Record<string, string>),
    };
    if (currentCookie) headers['Cookie'] = currentCookie;

    const res = await fetch(currentUrl, {
      ...options,
      headers,
      redirect: 'manual',
    });

    const setCookieHeader = res.headers.get('set-cookie');
    if (setCookieHeader) {
      const newCookie = parseSetCookie(setCookieHeader);
      if (newCookie) currentCookie = mergeCookies(currentCookie, newCookie);
    }

    if (res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308) {
      const location = res.headers.get('location');
      if (!location) throw new Error('Redirect without Location header');
      currentUrl = new URL(location, currentUrl).href;
      if (res.status === 302 || res.status === 303) {
        options.method = 'GET';
        options.body = undefined;
      }
      redirectCount++;
      continue;
    }

    return { response: res, finalCookie: currentCookie };
  }
  throw new Error('Too many redirects');
}

export async function login(email: string, password: string): Promise<void> {
  const getResult = await fetchWithManualRedirect(LOGIN_URL, { method: 'GET' });
  if (!getResult.response.ok) throw new Error('Failed to load login page');
  const html = await getResult.response.text();
  const root = parse(html);
  const csrfToken = root.querySelector('input[name="_token"]')?.getAttribute('value');
  if (!csrfToken) throw new Error('CSRF token not found');

  const formData = new URLSearchParams();
  formData.append('_token', csrfToken);
  formData.append('form', 'login');
  formData.append('guard', 'student');
  formData.append('email', email);
  formData.append('password', password);
  formData.append('remember', 'on');

  const postOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': LOGIN_URL,
    },
    body: formData.toString(),
  };

  const postResult = await fetchWithManualRedirect(LOGIN_URL, postOptions, getResult.finalCookie);
  const finalResponse = postResult.response;

  if (!finalResponse.url.toLowerCase().includes('login')) {
    await AsyncStorage.setItem(COOKIE_STORAGE_KEY, postResult.finalCookie);
    return;
  }

  const responseText = await finalResponse.text();
  if (responseText.includes('login') || responseText.includes('رمز عبور')) {
    throw new Error('Invalid email or password');
  }
  throw new Error('Login failed');
}

async function fetchProtectedPage(url: string): Promise<string> {
  const cookie = await AsyncStorage.getItem(COOKIE_STORAGE_KEY);
  if (!cookie) throw new Error('No session cookie. Please login first.');

  const result = await fetchWithManualRedirect(url, { method: 'GET' }, cookie);
  const html = await result.response.text();

  if (result.response.url.toLowerCase().includes('login')) {
    throw new Error('Session expired, please login again');
  }
  await AsyncStorage.setItem(COOKIE_STORAGE_KEY, result.finalCookie);
  return html;
}

export async function logout(): Promise<void> {
  const cookie = await AsyncStorage.getItem(COOKIE_STORAGE_KEY);
  if (cookie) {
    await fetchWithManualRedirect(LOGOUT_URL, { method: 'POST' }, cookie);
  }
  await AsyncStorage.removeItem(COOKIE_STORAGE_KEY);
}

function clean(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function safeFloat(value: string): number | null {
  const cleaned = value.replace(/,/g, '').trim();
  if (cleaned === '') return null;
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function safeInt(value: string): number | null {
  const f = safeFloat(value);
  return f !== null ? Math.floor(f) : null;
}

export interface ProfileData {
  profile_picture: string | null;
  personal_info: Record<string, string>;
  education_info: Record<string, string>;
  contact_info: Record<string, string>;
  address_info: Record<string, string>;
  family_info: Record<string, string>;
  other_info: Record<string, string>;
}

function parseProfile(html: string): ProfileData {
  const root = parse(html);
  const result: ProfileData = {
    profile_picture: null,
    personal_info: {},
    education_info: {},
    contact_info: {},
    address_info: {},
    family_info: {},
    other_info: {},
  };

  const picImg = root.querySelector('div.profile-userpic img');
  if (picImg) result.profile_picture = picImg.getAttribute('src');

  const appDiv = root.querySelector('#app');
  if (!appDiv) return result;

  const clean = (text: string) => text.replace(/\s+/g, ' ').trim();

  const tables = appDiv.querySelectorAll('table');
  for (const table of tables) {
    const rows = table.querySelectorAll('tr');
    if (rows.length === 0) continue;

    const headerRow = rows[0];
    const headers = headerRow.querySelectorAll('th').map(th => clean(th.text));
    if (headers.length === 0) continue;

    if (rows.length < 2) continue;
    const valueRow = rows[1];
    const values = valueRow.querySelectorAll('td').map(td => clean(td.text));

    for (let i = 0; i < headers.length && i < values.length; i++) {
      const key = headers[i];
      const value = values[i];
      if (!value) continue;

      if (['نام', 'نام پدر', 'نام پدر کلان', 'تخلص', 'ملیت', 'زبان مادری', 'جنسیت'].includes(key)) {
        let actualKey = key;
        if (key === 'تخلص') actualKey = 'نام فامیلی';
        result.personal_info[actualKey] = value;
      } 
      else if (['مقطع', 'درجه', 'پوهنتون', 'پوهنځی', 'دیپارتمنت', 'سال کانکور', 'نمره کانکور', 'ID کانکور'].includes(key)) {
        result.education_info[key] = value;
      }
      else if (key.includes('تماس') || key.includes('شماره تماس')) {
        result.contact_info['شماره تماس'] = value;
      }
      else if (key === 'ادرس') {
      }
      else if (['قرابت', 'شهرت', 'وظیفه و محل آن', 'شماره تماس'].includes(key)) {
      }
      else {
        result.other_info[key] = value;
      }
    }
  }

  const addressTable = appDiv.querySelector('table:has(th:contains("ادرس"))');
  if (addressTable) {
    const rows = addressTable.querySelectorAll('tr');
    for (const row of rows) {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 5) {
        const label = clean(cells[0].text);
        if (label === 'اصلی') {
          result.address_info['اصلی'] = clean(cells[1].text);
        } else if (label === 'فعلی') {
          result.address_info['فعلی'] = clean(cells[1].text);
        }
      }
    }
  }

  const familyTable = appDiv.querySelector('table:has(th:contains("قرابت"))');
  if (familyTable) {
    const rows = familyTable.querySelectorAll('tr');
    if (rows.length >= 2) {
      const cells = rows[1].querySelectorAll('td');
      if (cells.length === 4) {
        result.family_info = {
          relation: clean(cells[0].text),
          name: clean(cells[1].text),
          job: clean(cells[2].text),
          phone: clean(cells[3].text),
        };
      }
    }
  }

  if (!result.education_info['ID کانکور']) {
    const idTable = appDiv.querySelector('table:has(th:contains("ID کانکور"))');
    if (idTable) {
      const rows = idTable.querySelectorAll('tr');
      if (rows.length >= 2) {
        const cells = rows[1].querySelectorAll('td');
        if (cells.length >= 6) {
          result.education_info['ID کانکور'] = clean(cells[5].text);
          result.contact_info['شماره تماس'] = clean(cells[4].text);
        }
      }
    }
  }

  return result;
}
export interface ScoreData {
  semesters: Array<{
    semester_number: number;
    subjects: Array<{
      number: number;
      name: string;
      credits: number | null;
      attendance: number | null;
      absent: number | null;
      homework_10: number | null;
      activity_10: number | null;
      midterm_20: number | null;
      final_60: number | null;
      total_100: number | null;
      second_chance: number | null;
      third_chance: number | null;
      fourth_chance: number | null;
      status: string;
      final_approval: string;
    }>;
  }>;
}

function parseScores(html: string): ScoreData {
  const root = parse(html);
  const semesters: ScoreData['semesters'] = [];

  const appDiv = root.querySelector('#app');
  if (!appDiv) return { semesters: [] };

  const tables = appDiv.querySelectorAll('table.table');
  for (const table of tables) {
    const groupRow = table.querySelector('tr.group-by');
    if (!groupRow) continue;
    const groupText = clean(groupRow.text);
    const semesterMatch = groupText.match(/سمستر\s*:\s*(\d+)/);
    if (!semesterMatch) continue;
    const semesterNumber = parseInt(semesterMatch[1], 10);

    const subjects = [];
    const rows = table.querySelectorAll('tr');
    for (let i = 2; i < rows.length; i++) {
      const cells = rows[i].querySelectorAll('td');
      if (cells.length < 15) continue;

      subjects.push({
        number: parseInt(clean(cells[0].text), 10),
        name: clean(cells[1].text),
        credits: safeFloat(cells[2].text),
        attendance: safeFloat(cells[3].text),
        absent: safeFloat(cells[4].text),
        homework_10: safeFloat(cells[5].text),
        activity_10: safeFloat(cells[6].text),
        midterm_20: safeFloat(cells[7].text),
        final_60: safeFloat(cells[8].text),
        total_100: safeFloat(cells[9].text),
        second_chance: safeFloat(cells[10].text),
        third_chance: safeFloat(cells[11].text),
        fourth_chance: safeFloat(cells[12].text),
        status: clean(cells[13].text),
        final_approval: clean(cells[14].text),
      });
    }
    semesters.push({ semester_number: semesterNumber, subjects });
  }
  return { semesters };
}
export interface FinalScoreData {
  semesters: Array<{
    semester_number: number | null;
    subjects: Array<{
      number: number | null;
      name: string | null;
      year: string | null;
      first_chance: number | null;
      second_chance: number | null;
      third_chance: number | null;
      fourth_chance: number | null;
      credits: number | null;
      pass_score: number | null;
      pass_chance: number | null;
      weighted_score: number | null;
    }>;
    semester_result: {
      year: string | null;
      semester: number | null;
      result_metric: number | null;
      grade: string | null;
      passed: string | null;
      semester_promotion: string | null;
      semester_credits: number | null;
      passed_credits: number | null;
    } | null;
  }>;
  final_result: {
    subjects_count: number | null;
    total_credits: number | null;
    total_score: number | null;
    average_score: number | null;
    passed_semesters: number | null;
  } | null;
}

function parseFinalScores(html: string): FinalScoreData {
  const root = parse(html);
  const result: FinalScoreData = { semesters: [], final_result: null };

  const semesterDivs = root.querySelectorAll('div.semester-scores');
  console.log('[parseFinalScores] found semester divs:', semesterDivs.length);

  for (const sem of semesterDivs) {
    const semesterInfo: any = { semester_number: null, subjects: [], semester_result: null };

    const groupRow = sem.querySelector('tr.group-by');
    if (groupRow) {
      const titleCell = groupRow.querySelector('td.semester-title');
      const semText = titleCell ? clean(titleCell.text) : clean(groupRow.text);
      const match = semText.match(/سمستر\s*:\s*(\d+)/);
      if (match) semesterInfo.semester_number = parseInt(match[1], 10);
    }

    const subjectTable = sem.querySelector('table.table-bordered.table-striped.dataTable');
    if (subjectTable) {
      const rows = subjectTable.querySelectorAll('tr');
      for (let i = 2; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll('td');
        if (cells.length < 11) continue;
        semesterInfo.subjects.push({
          number: safeInt(cells[0].text),
          name: clean(cells[1].text) || null,
          year: clean(cells[2].text) || null,
          first_chance: safeFloat(cells[3].text),
          second_chance: safeFloat(cells[4].text),
          third_chance: safeFloat(cells[5].text),
          fourth_chance: safeFloat(cells[6].text),
          credits: safeFloat(cells[7].text),
          pass_score: safeFloat(cells[8].text),
          pass_chance: safeInt(cells[9].text),
          weighted_score: safeFloat(cells[10].text),
        });
      }
    }

    const resultTable = sem.querySelector('table.results');
    if (resultTable) {
      const dataRow = resultTable.querySelector('tr.passed-semester');
      if (dataRow) {
        const cells = dataRow.querySelectorAll('td');
        if (cells.length === 8) {
          semesterInfo.semester_result = {
            year: clean(cells[0].text) || null,
            semester: safeInt(cells[1].text),
            result_metric: safeFloat(cells[2].text),
            grade: clean(cells[3].text) || null,
            passed: clean(cells[4].text) || null,
            semester_promotion: clean(cells[5].text) || null,
            semester_credits: safeFloat(cells[6].text),
            passed_credits: safeFloat(cells[7].text),
          };
        }
      }
    }

    result.semesters.push(semesterInfo);
  }

  const finalDiv = root.querySelector('div.row.total-results');
  if (finalDiv) {
    const finalTable = finalDiv.querySelector('table');
    if (finalTable) {
      const rows = finalTable.querySelectorAll('tr');
      if (rows.length >= 2) {
        const cells = rows[1].querySelectorAll('td');
        if (cells.length === 5) {
          result.final_result = {
            subjects_count: safeInt(cells[0].text),
            total_credits: safeFloat(cells[1].text),
            total_score: safeFloat(cells[2].text),
            average_score: safeFloat(cells[3].text),
            passed_semesters: safeInt(cells[4].text),
          };
        }
      }
    }
  }

  console.log('[parseFinalScores] semesters parsed:', result.semesters.length);
  return result;
}

export type ScheduleData = any[];

function parseSchedule(html: string): ScheduleData {
  const root = parse(html);
  const panelBody = root.querySelector('div.panel-body');
  if (!panelBody) return [];
  const allTables: ScheduleData = [];
  const tables = panelBody.querySelectorAll('table');
  for (const table of tables) {
    const tableData: any[] = [];
    const headers = table.querySelectorAll('th').map(th => clean(th.text));
    const rows = table.querySelectorAll('tr');
    for (const row of rows) {
      const cols = row.querySelectorAll('td');
      if (cols.length === 0) continue;
      if (headers.length && headers.length === cols.length) {
        const rowObj: any = {};
        cols.forEach((col, i) => { rowObj[headers[i]] = clean(col.text); });
        tableData.push(rowObj);
      } else {
        tableData.push(cols.map(col => clean(col.text)));
      }
    }
    allTables.push(tableData);
  }
  return allTables;
}

export async function getProfile(): Promise<ProfileData> {
  const html = await fetchProtectedPage(PROFILE_URL);
  return parseProfile(html);
}

export async function getScore(): Promise<ScoreData> {
  const html = await fetchProtectedPage(SCORE_URL);
  return parseScores(html);
}

export async function getFinalScore(): Promise<FinalScoreData> {
  const html = await fetchProtectedPage(FINAL_SCORE_URL);
  return parseFinalScores(html);
}

export async function getSchedule(): Promise<ScheduleData> {
  const html = await fetchProtectedPage(SCHEDULE_URL);
  return parseSchedule(html);
}