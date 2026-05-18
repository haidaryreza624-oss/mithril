import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  I18nManager,
} from 'react-native';
import { fetchProfile, ProfileResponse } from '../api/hemisApi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';


I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const { width } = Dimensions.get('window');


const ProfileAvatar = ({ uri, name, size = 80 }: { uri?: string; name?: string; size?: number }) => {
  const { theme } = useTheme();
  const initials = name?.[0] ?? '?';

  if (uri) {
    return (
      <View style={[styles.avatarContainer, { width: size, height: size }]}>
        <Image source={{ uri }} style={[styles.avatarImage, { width: size, height: size }]} />
        <View style={[styles.avatarBadge, { backgroundColor: theme.colors.background }]}>
          <MaterialCommunityIcons name="check-circle" size={18} color="#4CAF50" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.avatarContainer, { width: size, height: size }]}>
      <View style={[styles.avatarFallback, { width: size, height: size, backgroundColor: theme.colors.accent + '20' }]}>
        <Text style={[styles.avatarText, { color: theme.colors.accent, fontSize: size * 0.4 }]}>{initials}</Text>
      </View>
    </View>
  );
};


const InfoCard = ({ icon, label, value }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value?: string }) => {
  const { theme } = useTheme();

  if (!value) return null;

  return (
    <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.colors.text }]}>{value}</Text>
      </View>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.accent + '15' }]}>
        <MaterialCommunityIcons name={icon} size={24} color={theme.colors.accent} />
      </View>
    </View>
  );
};

const SectionCard = ({ title, icon, children }: { title: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; children: React.ReactNode }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.sectionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={[styles.sectionHeader, {
        backgroundColor: theme.mode === 'light' ? '#f1f5f9' : '#1e293b', // Different from card body
        borderBottomColor: theme.colors.border
      }]}>
        <MaterialCommunityIcons name={icon} size={22} color={theme.colors.accent} />
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
};

const InfoRow = ({ label, value }: { label: string; value?: string }) => {
  const { theme } = useTheme();

  if (!value) return null;

  return (
    <View style={[styles.infoRow, { borderBottomColor: theme.colors.border }]}>
      <Text style={[styles.rowLabel, { color: theme.colors.textSecondary, fontWeight: 'bold' }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
};

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { token } = useAuth();
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetchProfile(token);
        setData(res);
      } catch (e) {
        setError('بارگذاری پروفایل ناموفق بود');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const name = data?.personal_info?.['نام'];
  const department = data?.education_info?.['دیپارتمنت'];
  const university = data?.education_info?.['پوهنتون'];
  const studentId = data?.education_info?.['ID کانکور'];
  const phone = data?.contact_info?.['شماره تماس'];

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}>

      {/* Profile Header - Side by Side */}
      <View style={[styles.headerCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <ProfileAvatar uri={data?.profile_picture} name={name} size={70} />
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: theme.colors.text }]}>{name ?? 'محصل'}</Text>
          <View style={styles.headerTags}>
            <View style={[styles.headerTag, { backgroundColor: theme.colors.accent + '15' }]}>
              <Text style={[styles.headerTagText, { color: theme.colors.accent }]}>{department}</Text>
              <MaterialCommunityIcons name="school" size={14} color={theme.colors.accent} />
            </View>
            <View style={[styles.headerTag, { backgroundColor: theme.colors.accent + '15' }]}>
              <Text style={[styles.headerTagText, { color: theme.colors.accent }]}>{university}</Text>
              <MaterialCommunityIcons name="bank" size={14} color={theme.colors.accent} />
            </View>
          </View>
        </View>
      </View>

      {/* Quick Stats Cards */}
      <View style={styles.statsContainer}>
        <InfoCard icon="card-account-details" label="آیدی کانکور" value={studentId} />
        <InfoCard icon="phone" label="شماره تماس" value={phone} />
      </View>

      {/* Personal Information */}
      <SectionCard title="معلومات شخصی" icon="account">
        <InfoRow label="نام پدر" value={data?.personal_info?.['نام پدر']} />
        <InfoRow label="نام پدرکلان" value={data?.personal_info?.['نام پدرکلان']} />
        <InfoRow label="نام فامیلی" value={data?.personal_info?.['نام فامیلی']} />
        <InfoRow label="ملیت" value={data?.personal_info?.['ملیت']} />
        <InfoRow label="زبان مادری" value={data?.personal_info?.['زبان مادری']} />
        <InfoRow label="جنسیت" value={data?.personal_info?.['جنسیت']} />
      </SectionCard>

      {/* Education Information */}
      <SectionCard title="معلومات تحصیلی" icon="school">
        <InfoRow label="درجه" value={data?.education_info?.['درجه']} />
        <InfoRow label="پوهنتون" value={university} />
        <InfoRow label="دیپارتمنت" value={department} />
        <InfoRow label="سال کانکور" value={data?.education_info?.['سال کانکور']} />
        <InfoRow label="نمره کانکور" value={data?.education_info?.['نمره کانکور']} />
      </SectionCard>

      {/* Address Information */}
      <SectionCard title="آدرس" icon="map-marker">
        <InfoRow label="آدرس اصلی" value={data?.address_info?.['اصلی']} />
        <InfoRow label="آدرس فعلی" value={data?.address_info?.['فعلی']} />
      </SectionCard>

      {/* Family Information */}
      {data?.family_info && (
        <SectionCard title="معلومات فامیلی" icon="family-tree">
          <InfoRow label="نسبت" value={data.family_info.relation} />
          <InfoRow label="نام" value={data.family_info.name} />
          <InfoRow label="وظیفه" value={data.family_info.job} />
          <InfoRow label="شماره تماس" value={data.family_info.phone} />
        </SectionCard>
      )}

      {/* Other Information */}
      <SectionCard title="سایر معلومات" icon="information">
        <InfoRow label="نتیجه کانکور" value={data?.other_info?.['نتیجه کانکور']} />
        <InfoRow label="نمبر عمومی تذکره" value={data?.other_info?.['نمبر عمومی تذکره']} />
        <InfoRow label="سال تولد" value={data?.other_info?.['سال تولد']} />
        <InfoRow label="حالت مدنی" value={data?.other_info?.['حالت مدنی']} />
        <InfoRow label="نام مکتب" value={data?.other_info?.['نام مکتب']} />
        <InfoRow label="سال فراغت" value={data?.other_info?.['سال فراغت']} />
      </SectionCard>

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.danger + '15' }]}>
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
          <MaterialCommunityIcons name="alert-circle" size={20} color={theme.colors.danger} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionCard: {
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.02)', 
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
    letterSpacing: 0.5,
  },

  sectionContent: {
    padding: 20,
    gap: 12,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    padding: 20,
    gap: 16,
  },
  headerCard: {
    flexDirection: 'row',
    gap: 16,
    padding: 18,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  avatarContainer: {
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  avatarImage: {
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarFallback: {
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: {
    fontWeight: '600',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    borderRadius: 12,
    padding: 2,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  headerTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  headerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  headerTagText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'left',
    writingDirection: 'rtl',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    width: '100%',
  },


  rowLabel: {
    fontSize: 14,
    textAlign: 'left', 
    writingDirection: 'rtl',
    flex: 1,
    paddingLeft: 10, 
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right', 
    writingDirection: 'rtl',
    flex: 1,
    paddingRight: 10, 
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
});