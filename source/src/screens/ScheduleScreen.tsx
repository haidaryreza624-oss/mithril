import { useEffect, useState } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { fetchSchedule, ScheduleResponse } from '../api/hemisApi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ScheduleItem = {
  id: string;
  year: string;
  semester: string;
  semesterNumber: string;
  name: string;
  credits: string;
  teacher: string;
};

type ScheduleSection = {
  title: string;
  data: ScheduleItem[];
  isEmpty?: boolean;
};

const SubjectCard = ({ item }: { item: ScheduleItem }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.subjectCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.subjectHeader}>
        <Text style={[styles.subjectName, { color: theme.colors.text }]}>{item.name}</Text>
        <View style={[styles.creditBadge, { backgroundColor: theme.colors.accent + '15' }]}>
          <MaterialCommunityIcons name="star" size={12} color={theme.colors.accent} />
          <Text style={[styles.creditText, { color: theme.colors.accent }]}>{item.credits}</Text>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="account-tie" size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>{item.teacher}</Text>
        </View>

        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="calendar" size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>{item.semester} {item.year}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={[styles.semesterBadge, { backgroundColor: theme.colors.accent + '10' }]}>
          <MaterialCommunityIcons name="layers" size={12} color={theme.colors.accent} />
          <Text style={[styles.semesterBadgeText, { color: theme.colors.accent }]}>سمستر {item.semesterNumber}</Text>
        </View>
      </View>
    </View>
  );
};

export default function ScheduleScreen() {
  const { theme } = useTheme();
  const { token } = useAuth();
  const [allSections, setAllSections] = useState<ScheduleSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([1])); // Auto-expand second section

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res: ScheduleResponse = await fetchSchedule(token);

        const processedSections: ScheduleSection[] = [];

        res.forEach((section: any[], sectionIndex: number) => {
          if (!Array.isArray(section) || section.length === 0) return;
          const firstItem = section[0];
          const isFirstItemHeader = Array.isArray(firstItem) && firstItem.length === 1 && typeof firstItem[0] === 'string';

          let sectionTitle = '';
          let startIndex = 0;

          if (isFirstItemHeader) {
            sectionTitle = firstItem[0] || `تقسیم اوقات`;
            startIndex = 1; 
          } else {
            sectionTitle = `هفته`;
            startIndex = 0;
          }

          const hasItems = section.slice(startIndex).some(item => item && typeof item === 'object' && !Array.isArray(item));

          if (!hasItems) {
            // Empty section
            processedSections.push({
              title: sectionTitle,
              data: [],
              isEmpty: true,
            });
            return;
          }
          const items: ScheduleItem[] = [];
          for (let i = startIndex; i < section.length; i++) {
            const row = section[i];
            if (!row || typeof row !== 'object' || Array.isArray(row)) continue;

            items.push({
              id: row['شماره'] ?? String(items.length + 1),
              year: row['سال'] || '—',
              semester: row['نیم سال'] || '—',
              semesterNumber: row['سمستر'] || '—',
              name: row['نام مضمون'] || '—',
              credits: row['تعداد کریدت'] || '—',
              teacher: row['نام استاد'] || '—',
            });
          }

          if (items.length > 0) {
            processedSections.push({
              title: sectionTitle,
              data: items,
              isEmpty: false,
            });
          }
        });

        setAllSections(processedSections);
      } catch (e) {
        setError('بارگذاری جدول زمانی ناموفق بود');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const toggleSection = (index: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };
  const getVisibleSections = () => {
    return allSections.map((section, index) => {
      if (expandedSections.has(index) || section.isEmpty) {
        return section;
      } else {
        return {
          ...section,
          data: [],
        };
      }
    });
  };

  const renderEmptyWeek = (title: string) => (
    <View style={[styles.emptyWeekCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <MaterialCommunityIcons name="calendar-blank" size={32} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyWeekText, { color: theme.colors.textSecondary }]}>
        هیچ برنامه‌ای برای این هفته ثبت نشده است
      </Text>
    </View>
  );

  const renderSectionHeader = ({ section }: { section: ScheduleSection }) => {
    const index = allSections.findIndex(s => s.title === section.title);

    return (
      <TouchableOpacity
        style={[styles.sectionHeader, { borderBottomColor: theme.colors.border }]}
        onPress={() => toggleSection(index)}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderLeft}>
          <MaterialCommunityIcons
            name={expandedSections.has(index) ? "chevron-up" : "chevron-down"}
            size={22}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{section.title}</Text>
        </View>

        {!section.isEmpty && (
          <View style={[styles.countBadge, { backgroundColor: theme.colors.accent + '15' }]}>
            <Text style={[styles.countText, { color: theme.colors.accent }]}>{section.data.length} مضمون</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  const renderSectionFooter = ({ section }: { section: ScheduleSection }) => {
    if (!section.isEmpty) return null;
    return renderEmptyWeek(section.title);
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={[styles.heading, { color: theme.colors.text }]}>جدول زمانی</Text>
        <Text style={[styles.subheading, { color: theme.colors.textSecondary }]}>
          برنامه درسی هفتگی از سامانه HEMIS
        </Text>
      </View> */}

      {/* Schedule List */}
      <SectionList
        sections={getVisibleSections()}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={renderSectionHeader}
        renderItem={({ item, section }) => {
          if (section.isEmpty) return null;
          return <SubjectCard item={item} />;
        }}
        renderSectionFooter={renderSectionFooter}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && allSections.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="calendar-remove" size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                هیچ برنامه‌ای یافت نشد
              </Text>
            </View>
          ) : null
        }
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    marginTop: 10,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyWeekCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 10,
    gap: 12,
  },
  emptyWeekText: {
    fontSize: 14,
    textAlign: 'center',
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
  },
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
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    padding: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  detailText: {
    fontSize: 13,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  semesterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  semesterBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  subjectNumber: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
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