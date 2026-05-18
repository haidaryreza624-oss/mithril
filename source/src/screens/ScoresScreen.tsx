import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, SectionList, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { fetchScores, ScoreResponse } from '../api/hemisApi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Subject = {
  number: number;
  name: string;
  credits: number;
  attendance: number;
  absent: number;
  homework_10: number;
  activity_10: number;
  midterm_20: number;
  final_60: number;
  total_100: number;
  second_chance: number | null;
  third_chance: number | null;
  fourth_chance: number | null;
  status: string;
  final_approval: string;
};

type Semester = {
  semester_number: number;
  subjects: Subject[];
};

type ScoreData = {
  semesters: Semester[];
};

const SubjectCard = ({ subject }: { subject: Subject }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    return status === 'کامیاب' ? theme.colors.success : theme.colors.danger;
  };

  const getAttendanceColor = (attended: number, total: number) => {
    const percentage = (attended / total) * 100;
    if (percentage >= 90) return theme.colors.success;
    if (percentage >= 75) return '#eab308'; 
    
    return theme.colors.danger;
  };

  const calculateTotalClasses = (attendance: number, absent: number) => {
    return attendance + absent;
  };

  const totalClasses = calculateTotalClasses(subject.attendance, subject.absent);
  const attendancePercentage = ((subject.attendance / totalClasses) * 100).toFixed(1);

  return (
    <View style={[styles.subjectCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.subjectHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.subjectHeaderLeft}>
          <MaterialCommunityIcons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.colors.textSecondary}
          />


          <Text style={[styles.subjectName, { color: theme.colors.text }]}>{subject.name}</Text>
          <View style={[styles.creditBadge, { backgroundColor: theme.colors.accent + '15' }]}>
            <MaterialCommunityIcons name="star" size={12} color={theme.colors.accent} />
            <Text style={[styles.creditText, { color: theme.colors.accent }]}>{subject.credits}</Text>
          </View>
        </View>

        <View style={styles.subjectTitleContainer}>

          <View style={styles.subjectMeta}>


          </View>
        </View>

        { subject.total_100 && <Text style={[styles.totalScore, { color: getStatusColor(subject.status) }]}>{subject.total_100}</Text>
         || (subject.second_chance || subject.third_chance || subject.fourth_chance) && (
            <View style={styles.detailSection}>
              
              <View style={styles.chancesContainer}>
                {subject.second_chance && (
                  <View style={[styles.chanceBadge, { backgroundColor: theme.colors.accent + '15' }]}>
                    <Text style={[styles.chanceLabel, { color: theme.colors.textSecondary }]}>چانس دوم</Text>
                    <Text style={[styles.chanceScore, { color: theme.colors.accent }]}>{subject.second_chance}</Text>
                  </View>
                )}
                {subject.third_chance && (
                  <View style={[styles.chanceBadge, { backgroundColor: theme.colors.accent + '15' }]}>
                    <Text style={[styles.chanceLabel, { color: theme.colors.textSecondary }]}>چانس سوم</Text>
                    <Text style={[styles.chanceScore, { color: theme.colors.accent }]}>{subject.third_chance}</Text>
                  </View>
                )}
                {subject.fourth_chance && (
                  <View style={[styles.chanceBadge, { backgroundColor: theme.colors.accent + '15' }]}>
                    <Text style={[styles.chanceLabel, { color: theme.colors.textSecondary }]}>چانس چهارم</Text>
                    <Text style={[styles.chanceScore, { color: theme.colors.accent }]}>{subject.fourth_chance}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
          
      </TouchableOpacity>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="book-open" size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.statText, { color: theme.colors.text }]}>{subject.homework_10 || 0}/10</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="account" size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.statText, { color: theme.colors.text }]}>{subject.activity_10 || 0}/10</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="calendar" size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.statText, { color: theme.colors.text }]}>{subject.midterm_20 || 0}/20</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="file-document" size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.statText, { color: theme.colors.text }]}>{subject.final_60 || 0 }/60</Text>
        </View>
      </View>

      {/* Expanded Details */}
      {expanded && (
        <View style={styles.expandedDetails}>
          {/* Attendance Section */}
          <View style={styles.detailSection}>
            <Text style={[styles.detailSectionTitle, { color: theme.colors.textSecondary }]}>حضور و غیاب</Text>
            <View style={styles.attendanceContainer}>
              <View style={styles.attendanceBar}>
                <View
                  style={[
                    styles.attendanceFill,
                    {
                      width: `${attendancePercentage}%`,
                      backgroundColor: getAttendanceColor(subject.attendance, totalClasses)
                    }
                  ]}
                />
              </View>
              <View style={styles.attendanceStats}>
                <View style={styles.attendanceStat}>
                  <MaterialCommunityIcons name="check-circle" size={14} color={theme.colors.success} />
                  <Text style={[styles.attendanceStatText, { color: theme.colors.text }]}>حاضر: {subject.attendance}</Text>
                </View>
                <View style={styles.attendanceStat}>
                  <MaterialCommunityIcons name="close-circle" size={14} color={theme.colors.danger} />
                  <Text style={[styles.attendanceStatText, { color: theme.colors.text }]}>غیرحاظر: {subject.absent}</Text>
                </View>
                <Text style={[styles.attendancePercentage, { color: theme.colors.textSecondary }]}>{attendancePercentage}%</Text>
              </View>
            </View>
          </View>
          
          {/* Final Approval */}
          {subject.final_approval && subject.final_approval !== '' && (
            <View style={[styles.approvalBadge, { backgroundColor: theme.colors.accent + '10' }]}>
              <MaterialCommunityIcons name="check-decagram" size={16} color={theme.colors.accent} />
              <Text style={[styles.approvalText, { color: theme.colors.accent }]}>{subject.final_approval}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const SemesterHeader = ({ semester, isExpanded, onToggle, stats }: {
  semester: Semester;
  isExpanded: boolean;
  onToggle: () => void;
  stats: { totalCredits: number; averageScore: string; passedCount: number };
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.semesterHeader, { borderBottomColor: theme.colors.border }]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
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

      <View style={styles.semesterStats}>
        <View style={styles.semesterStat}>
          <Text style={[styles.semesterStatLabel, { color: theme.colors.textSecondary }]}>کریدیت</Text>
          <Text style={[styles.semesterStatValue, { color: theme.colors.text }]}>{stats.totalCredits}</Text>
        </View>
        <View style={styles.semesterStat}>
          <Text style={[styles.semesterStatLabel, { color: theme.colors.textSecondary }]}>معدل</Text>
          <Text style={[styles.semesterStatValue, { color: theme.colors.text }]}>{stats.averageScore}</Text>
        </View>
        <View style={[styles.passedBadge, { backgroundColor: theme.colors.success + '15' }]}>
          <MaterialCommunityIcons name="check-circle" size={14} color={theme.colors.success} />
          <Text style={[styles.passedText, { color: theme.colors.success }]}>{stats.passedCount} کامیاب</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ScoresScreen() {
  const { theme } = useTheme();
  const { token } = useAuth();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSemesters, setExpandedSemesters] = useState<Set<number>>(new Set([1]));

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetchScores(token);
        setData(res);
      } catch (e) {
        setError('بارگذاری نمرات ناموفق بود');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY]);

  const toggleSemester = (semesterNumber: number) => {
    setExpandedSemesters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(semesterNumber)) {
        newSet.delete(semesterNumber);
      } else {
        newSet.add(semesterNumber);
      }
      return newSet;
    });
  };

  const calculateSemesterStats = (subjects: Subject[]) => {
    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    const totalWeightedScore = subjects.reduce((sum, s) => sum + (s.total_100 * s.credits), 0);
    const averageScore = (totalWeightedScore / totalCredits).toFixed(2);
    const passedCount = subjects.filter(s => s.status === 'کامیاب').length;

    return { totalCredits, averageScore, passedCount };
  };

  const calculateOverallStats = () => {
    if (!data?.semesters) return { totalCredits: 0, overallAverage: '0.00', totalSubjects: 0 };

    let totalCredits = 0;
    let totalWeightedScore = 0;
    let totalSubjects = 0;

    data.semesters.forEach(semester => {
      semester.subjects.forEach(subject => {
        totalCredits += subject.credits;
        totalWeightedScore += subject.total_100 * subject.credits;
        totalSubjects++;
      });
    });

    const overallAverage = (totalWeightedScore / totalCredits).toFixed(2);

    return { totalCredits, overallAverage, totalSubjects };
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  const overallStats = calculateOverallStats();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with Overall Stats */}
      <Animated.View style={[styles.header, { opacity, transform: [{ translateY }] }]}>



        <View style={[styles.overallStatsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.overallStat}>
            <Text style={[styles.overallStatLabel, { color: theme.colors.textSecondary }]}>معدل کل</Text>
            <Text style={[styles.overallStatValue, { color: theme.colors.text }]}>{overallStats.overallAverage}</Text>
          </View>
          <View style={[styles.overallDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.overallStat}>
            <Text style={[styles.overallStatLabel, { color: theme.colors.textSecondary }]}>کریدیت کل</Text>
            <Text style={[styles.overallStatValue, { color: theme.colors.text }]}>{overallStats.totalCredits}</Text>
          </View>
          <View style={[styles.overallDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.overallStat}>
            <Text style={[styles.overallStatLabel, { color: theme.colors.textSecondary }]}>مضامین</Text>
            <Text style={[styles.overallStatValue, { color: theme.colors.text }]}>{overallStats.totalSubjects}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Semesters List */}
      <SectionList
        sections={data?.semesters.map(semester => ({
          title: `سمستر ${semester.semester_number}`,
          data: expandedSemesters.has(semester.semester_number) ? semester.subjects : [],
          semester: semester,
          stats: calculateSemesterStats(semester.subjects)
        })) || []}
        keyExtractor={(item, index) => `${item.number}-${index}`}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section }) => (
          <SemesterHeader
            semester={section.semester}
            isExpanded={expandedSemesters.has(section.semester.semester_number)}
            onToggle={() => toggleSemester(section.semester.semester_number)}
            stats={section.stats}
          />
        )}
        renderItem={({ item }) => <SubjectCard subject={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: 20 }} />}
      />

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.danger + '15' }]}>
          <MaterialCommunityIcons name="alert-circle" size={20} color={theme.colors.danger} />
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  subheading: {
    marginTop: 4,
    fontSize: 14,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  overallStatsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 16,
  },
  overallStat: {
    alignItems: 'center',
    gap: 4,
  },
  overallStatLabel: {
    fontSize: 12,
  },
  overallStatValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  overallDivider: {
    width: 1,
    height: 30,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  semesterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    marginTop: 10,
    marginBottom: 8,
  },
  semesterHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    alignItems: 'center',
    gap: 2,
  },
  semesterStatLabel: {
    fontSize: 10,
  },
  semesterStatValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  passedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  passedText: {
    fontSize: 11,
    fontWeight: '500',
  },
  subjectCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginVertical: 2,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subjectHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  subjectTitleContainer: {
    flex: 1,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 4,
  },
  subjectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  creditText: {
    fontSize: 11,
    fontWeight: '600',
  },
  subjectNumber: {
    fontSize: 11,
  },
  totalScore: {
    fontSize: 20,
    fontWeight: '700',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 14,
    padding: 10,
    marginTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  expandedDetails: {
    marginTop: 14,
    gap: 14,
  },
  detailSection: {
    gap: 8,
  },
  detailSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  attendanceContainer: {
    gap: 8,
  },
  attendanceBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  attendanceFill: {
    height: '100%',
    borderRadius: 4,
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attendanceStatText: {
    fontSize: 12,
  },
  attendancePercentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  chancesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  chanceLabel: {
    fontSize: 11,
  },
  chanceScore: {
    fontSize: 12,
    fontWeight: '600',
  },
  approvalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 14,
    gap: 8,
  },
  approvalText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});