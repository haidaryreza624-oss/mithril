import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { fetchFinalScore, FinalScoreResponse } from '../api/hemisApi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const SubjectCard = ({ subject }: { subject: any }) => {
  const { theme } = useTheme();

  const getChanceIcon = (chance: number | null) => {
    if (!chance) return null;
    return (
      <View style={[styles.chanceBadge, { backgroundColor: theme.colors.accent + '15' }]}>
        <Text style={[styles.chanceText, { color: theme.colors.accent }]}>{chance}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.subjectCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.subjectHeader}>

        <Text style={[styles.subjectName, { color: theme.colors.text }]}>{subject.name}</Text>
        <View style={[styles.creditBadge, { backgroundColor: theme.colors.accent + '15' }]}>
          <MaterialCommunityIcons name="star" size={12} color={theme.colors.accent} />
          <Text style={[styles.creditText, { color: theme.colors.accent }]}>{subject.credits}</Text>
        </View>
      </View>

      <View style={styles.scoresContainer}>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>اول</Text>
          <Text style={[styles.scoreValue, { color: subject.first_chance ? theme.colors.success : theme.colors.textSecondary }]}>
            {subject.first_chance ?? '—'}
          </Text>
        </View>

        <View style={styles.scoreItem}>
          <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>دوم</Text>
          <Text style={[styles.scoreValue, { color: subject.second_chance ? theme.colors.success : theme.colors.textSecondary }]}>
            {subject.second_chance ?? '—'}
          </Text>
        </View>

        <View style={styles.scoreItem}>
          <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>سوم</Text>
          <Text style={[styles.scoreValue, { color: subject.third_chance ? theme.colors.success : theme.colors.textSecondary }]}>
            {subject.third_chance ?? '—'}
          </Text>
        </View>

        <View style={styles.scoreItem}>
          <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>چهارم</Text>
          <Text style={[styles.scoreValue, { color: subject.fourth_chance ? theme.colors.success : theme.colors.textSecondary }]}>
            {subject.fourth_chance ?? '—'}
          </Text>
        </View>
      </View>

      <View style={styles.subjectFooter}>
        <Text style={[styles.weightedScore, { color: theme.colors.accent }]}>
          {subject.weighted_score} امتیاز
        </Text>
        <View style={styles.passInfo}>
          <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.success} />
          <Text style={[styles.passText, { color: theme.colors.textSecondary }]}>
            پاس شده در چانس {subject.pass_chance} با نمره {subject.pass_score}
          </Text>
        </View>
      </View>
    </View>
  );
};


const SemesterCard = ({ semester, isExpanded, onToggle }: { semester: any; isExpanded: boolean; onToggle: () => void }) => {
  const { theme } = useTheme();
  const result = semester.semester_result;

  return (
    <View style={[styles.semesterCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <TouchableOpacity onPress={onToggle} style={styles.semesterHeader}>
        <View style={styles.semesterHeaderLeft}>
          <MaterialCommunityIcons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color={theme.colors.textSecondary}
          />
          <View style={[styles.semesterBadge, { backgroundColor: theme.colors.accent + '15' }]}>
            <Text style={[styles.semesterBadgeText, { color: theme.colors.accent }]}>
              سمستر {semester.semester_number}
            </Text>
          </View>
        </View>

       {result ? (
  <View style={styles.semesterStats}>
    <View style={styles.semesterStat}>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>فیصدی</Text>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{result.result_metric}</Text>
    </View>
    <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(result.grade, theme) }]}>
      <Text style={styles.gradeText}>{result.grade}</Text>
    </View>
  </View>
) : (
  <View style={styles.semesterStats}>
    <View style={styles.semesterStat}>
  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>فیصدی</Text>
  <Text style={styles.noResultText}>
    فیصدی این سمستر در سیستم موجود نیست
  </Text>
</View>
    <View style={[styles.circularRedIndicator, { backgroundColor: theme.colors.danger || '#ff0000' }]}>
      <MaterialCommunityIcons name="close" size={24} color="#fff" />
    </View>
  </View>
)}
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.semesterContent}>
          {result ? (
  <View style={[styles.semesterResultCard, { backgroundColor: theme.mode === 'light' ? '#f1f5f9' : '#1e293b' }]}>
    <View style={styles.resultRow}>
      <Text style={[styles.resultLabel, { color: theme.colors.textSecondary }]}>وضعیت سمستر</Text>
      <View style={[styles.statusBadge, { backgroundColor: result.passed === 'بلی' ? theme.colors.success + '15' : theme.colors.danger + '15' }]}>
        <MaterialCommunityIcons
          name={result.passed === 'بلی' ? "check-circle" : "close-circle"}
          size={14}
          color={result.passed === 'بلی' ? theme.colors.success : theme.colors.danger}
        />
        <Text style={[styles.statusText, { color: result.passed === 'بلی' ? theme.colors.success : theme.colors.danger }]}>
          {result.passed === 'بلی' ? 'کامیاب' : 'ناکام'}
        </Text>
      </View>
    </View>

    <View style={styles.resultRow}>
      <Text style={[styles.resultLabel, { color: theme.colors.textSecondary }]}>ارتقا به سمستر بعد</Text>
      <View style={[styles.statusBadge, { backgroundColor: result.semester_promotion === 'بلی' ? theme.colors.success + '15' : theme.colors.danger + '15' }]}>
        <MaterialCommunityIcons
          name={result.semester_promotion === 'بلی' ? "arrow-up" : "arrow-down"}
          size={14}
          color={result.semester_promotion === 'بلی' ? theme.colors.success : theme.colors.danger}
        />
        <Text style={[styles.statusText, { color: result.semester_promotion === 'بلی' ? theme.colors.success : theme.colors.danger }]}>
          {result.semester_promotion}
        </Text>
      </View>
    </View>

    <View style={styles.creditsRow}>
      <View style={styles.creditItem}>
        <Text style={[styles.creditItemLabel, { color: theme.colors.textSecondary }]}>کریدیت سمستر</Text>
        <Text style={[styles.creditItemValue, { color: theme.colors.text }]}>{result.semester_credits}</Text>
      </View>
      <View style={styles.creditItem}>
        <Text style={[styles.creditItemLabel, { color: theme.colors.textSecondary }]}>پاس شده</Text>
        <Text style={[styles.creditItemValue, { color: theme.colors.success }]}>{result.passed_credits}</Text>
      </View>
    </View>
  </View>
) : (
  <View style={[styles.semesterResultCard, { backgroundColor: theme.mode === 'light' ? '#f1f5f9' : '#1e293b', padding: 16, alignItems: 'center' }]}>
    <Text style={[styles.resultLabel, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
      نتیجه نهایی برای این سمستر هنوز در سیستم موجود نیست
    </Text>
  </View>
)}

          <View style={styles.subjectsList}>

            {semester.subjects.map((subject: any, index: number) => (
              <SubjectCard key={index} subject={subject} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

// Helper function for grade colors
const getGradeColor = (grade: string, theme: any) => {
  switch (grade) {
    case 'A': return '#22c55e';
    case 'B': return '#3b82f6';
    case 'C': return '#eab308';
    case 'D': return '#f97316';
    default: return '#6b7280';
  }
};

// Main Component
export default function FinalScoreScreen() {
  const { theme } = useTheme();
  const { token } = useAuth();
  const [data, setData] = useState<FinalScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSemester, setExpandedSemester] = useState<number | null>(1); // Auto-expand first semester

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetchFinalScore(token);
        setData(res);
      } catch (e) {
        setError('بارگذاری نمرات نهایی ناموفق بود');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  const final = data?.final_result;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Stats */}
      <View style={[styles.headerCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Text style={[styles.headerStatLabel, { color: theme.colors.textSecondary }]}>فیصدی کل</Text>
            <Text style={[styles.headerStatValue, { color: theme.colors.text }]}>{final?.average_score}</Text>
          </View>
          <View style={[styles.headerDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.headerStat}>
            <Text style={[styles.headerStatLabel, { color: theme.colors.textSecondary }]}>سمستر های پاس شده</Text>
            <Text style={[styles.headerStatValue, { color: theme.colors.success }]}>{final?.passed_semesters}</Text>
          </View>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <MaterialCommunityIcons name="book-open-variant" size={24} color={theme.colors.accent} />
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{final?.subjects_count}</Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>مضامین</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <MaterialCommunityIcons name="star" size={24} color={theme.colors.accent} />
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{final?.total_credits}</Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>کریدیت کل</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <MaterialCommunityIcons name="trophy" size={24} color={theme.colors.accent} />
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{final?.total_score}</Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>امتیاز کل</Text>
        </View>
      </View>

      {/* Semesters */}
      <View style={styles.semestersContainer}>
        
        {data?.semesters.map((semester, index) => (
          <SemesterCard
            key={index}
            semester={semester}
            isExpanded={expandedSemester === semester.semester_number}
            onToggle={() => setExpandedSemester(expandedSemester === semester.semester_number ? null : semester.semester_number)}
          />
        ))}
      </View>

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.danger + '15' }]}>
          <MaterialCommunityIcons name="alert-circle" size={20} color={theme.colors.danger} />
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  noResultText: {
  fontSize: 12,          
  color: '#94a3b8',     
  fontWeight: '400',    
  marginTop: 4,         
  fontStyle: 'italic',  
},
  circularRedIndicator: {
  width: 35,
  height: 35,
  borderRadius: 25,
  justifyContent: 'center',
  alignItems: 'center',
},
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 20,
    gap: 16,
  },
  headerCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  headerStat: {
    alignItems: 'center',
    gap: 4,
  },
  headerStatLabel: {
    fontSize: 13,
  },
  headerStatValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerDivider: {
    width: 1,
    height: 40,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 12,
  },
  semestersContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  semesterCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  semesterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  semesterHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  semesterBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  semesterBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  semesterStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  semesterStat: {
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 11,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  gradeBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  semesterContent: {
    padding: 16,
    paddingTop: 0,
    gap: 16,
  },
  semesterResultCard: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  creditsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  creditItem: {
    alignItems: 'center',
    gap: 2,
  },
  creditItemLabel: {
    fontSize: 11,
  },
  creditItemValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  subjectsList: {
    gap: 12,
  },
  subjectsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  subjectCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginVertical: 4,
    gap: 12,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    gap: 8, 
  },

  subjectName: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
    writingDirection: 'rtl',
  }
  ,
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  creditText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    padding: 10,
  },
  scoreItem: {
    alignItems: 'center',
    gap: 2,
  },
  scoreLabel: {
    fontSize: 10,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  subjectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  passInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passText: {
    fontSize: 11,
  },
  weightedScore: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});