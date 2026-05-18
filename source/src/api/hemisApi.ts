import {
  login as scraperLogin,
  getProfile as scraperGetProfile,
  getScore as scraperGetScore,
  getFinalScore as scraperGetFinalScore,
  getSchedule as scraperGetSchedule,
  logout as scraperLogout,
  type ProfileData,
  type ScoreData,
  type FinalScoreData,
  type ScheduleData,
} from './hemisScraper';
import { getCachedData, setCachedData, clearCache } from '../utils/cache';

export type { ProfileData, ScoreData, FinalScoreData, ScheduleData };
async function fetchWithCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>
): Promise<T> {
  

  try {
    const fresh = await fetcher();
    
    await setCachedData(cacheKey, fresh);
    return fresh;
  } catch (err: any) {
    const cached = await getCachedData<T>(cacheKey);
    if (cached !== null) {
    
      return cached;
    }
    
    throw new Error(`قادر به بارگذاری اطلاعات نیستید. لطفاً اتصال اینترنت را بررسی کنید.`);
  }
}
export async function loginRequest(email: string, password: string): Promise<{ token: string; message: string }> {
  
  await scraperLogin(email, password);
  
  return { token: 'direct-scrape-session', message: 'Login successful' };
}

export async function fetchProfile(token: string): Promise<ProfileData> {
  return fetchWithCache('profile', scraperGetProfile);
}

export async function fetchScore(token: string): Promise<ScoreData> {
  return fetchWithCache('scores', scraperGetScore);
}

export async function fetchScores(token: string): Promise<ScoreData> {
  return fetchWithCache('scores', scraperGetScore);
}

export async function fetchFinalScore(token: string): Promise<FinalScoreData> {
  return fetchWithCache('finalScores', scraperGetFinalScore);
}

export async function fetchSchedule(token: string): Promise<ScheduleData> {
  return fetchWithCache('schedule', scraperGetSchedule);
}
export async function logoutRequest(token: string): Promise<{ message: string }> {
  
  await scraperLogout();
  await clearCache();
  return { message: 'Logged out successfully' };
}