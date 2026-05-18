import { useState, useEffect } from 'react';
import { StyleSheet, Switch, Text, View, TouchableOpacity, ScrollView, Alert, Share, Linking } from 'react-native';
import { useTheme, COLOR_PRESETS, themeUtils } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { logoutRequest } from '../api/hemisApi';
import { useAuth } from '../context/AuthContext';
// Storage keys
const STORAGE_KEYS = {
  NOTIFICATIONS: '@settings_notifications',
  COMPACT_VIEW: '@settings_compact_view',
  AUTO_SYNC: '@settings_auto_sync',
  FONT_SIZE: '@settings_font_size',
};

export default function SettingsScreen() {
  const { theme, toggleTheme, setPrimaryColor, primaryColor } = useTheme();

  const [notifications, setNotifications] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [fontSize, setFontSize] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [
        notificationsVal,
        compactViewVal,
        autoSyncVal,
        fontSizeVal
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.COMPACT_VIEW),
        AsyncStorage.getItem(STORAGE_KEYS.AUTO_SYNC),
        AsyncStorage.getItem(STORAGE_KEYS.FONT_SIZE),
      ]);

      setNotifications(notificationsVal ? JSON.parse(notificationsVal) : true);
      setCompactView(compactViewVal ? JSON.parse(compactViewVal) : false);
      setAutoSync(autoSyncVal ? JSON.parse(autoSyncVal) : true);
      setFontSize(fontSizeVal ? parseInt(fontSizeVal) : 1);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  };




  const handleColorChange = (color: string, name: string) => {
    Alert.alert(
      'تغییر رنگ',
      `آیا می‌خواهید رنگ اصلی به ${name} تغییر کند؟`,
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'تایید',
          onPress: () => setPrimaryColor(color)
        },
      ]
    );
  };







  const handleRateApp = () => {
    Alert.alert(
      'امتیاز دهید',
      'این قابلیت در حال حاضر در دسترس نیست',
      [
        { text: 'باشه', style: 'cancel' }
      ]
    );
  };
  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'برنامه HEMIS Student Portal - مدیریت نمرات و برنامه درسی',
        title: 'اشتراک‌گذاری برنامه',
      });
    } catch (error) {
      Alert.alert('خطا', 'اشتراک‌گذاری با مشکل مواجه شد');
    }
  };
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleAbout = () => {
    navigation.navigate('About');
  };
  const { token, logout: authLogout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'خروج از حساب',
      'آیا مطمئن هستید که می‌خواهید خارج شوید؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'خروج',
          style: 'destructive',
          onPress: async () => {
            try {
              if (token) {
                await logoutRequest(token);
              }
              await authLogout();

              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });

            } catch (error) {
              console.error('Logout error:', error);
              await authLogout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          },
        },
      ]
    );
  };


  const resetToDefault = async () => {
    Alert.alert(
      'بازنشانی تنظیمات',
      'آیا می‌خواهید همه تنظیمات به حالت پیش‌فرض بازگردند؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'بازنشانی',
          onPress: async () => {
            await setPrimaryColor('#0284c7');
            if (theme.mode === 'dark') toggleTheme();
            setNotifications(true);
            setCompactView(false);
            setAutoSync(true);
            setFontSize(1);
            await Promise.all([
              saveSetting(STORAGE_KEYS.NOTIFICATIONS, true),
              saveSetting(STORAGE_KEYS.COMPACT_VIEW, false),
              saveSetting(STORAGE_KEYS.AUTO_SYNC, true),
              saveSetting(STORAGE_KEYS.FONT_SIZE, 1),
            ]);

            Alert.alert('موفق', 'تنظیمات به حالت پیش‌فرض بازگشتند');
          },
          style: 'destructive'
        },
      ]
    );
  };

  const getFontSizeLabel = () => {
    switch (fontSize) {
      case 0: return 'کوچک';
      case 1: return 'متوسط';
      case 2: return 'بزرگ';
      default: return 'متوسط';
    }
  };
  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      {/* <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{title}</Text> */}
      <View style={[styles.sectionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        {children}
      </View>
    </View>
  );
  const SettingsRow = ({
    icon,
    label,
    description,
    children,
    onPress,
    showBorder = true
  }: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    description?: string;
    children: React.ReactNode;
    onPress?: () => void;
    showBorder?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.settingsRow, showBorder && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.accent + '15' }]}>
          <MaterialCommunityIcons name={icon} size={22} color={theme.colors.accent} />
        </View>
        <View style={styles.rowText}>
          <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{label}</Text>
          {description && <Text style={[styles.rowDescription, { color: theme.colors.textSecondary }]}>{description}</Text>}
        </View>
      </View>
      <View style={styles.rowRight}>
        {children}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.colors.text }}>در حال بارگذاری...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >


      {/* Appearance Section */}
      <SettingsSection title="ظاهر">
        {/* Dark Mode Toggle */}
        <SettingsRow
          icon="theme-light-dark"
          label="حالت تاریک"
          description="تغییر بین تم روشن و تاریک"
          showBorder={true}
        >
          <Switch
            value={theme.mode === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
            thumbColor="#f9fafb"
          />
        </SettingsRow>




      </SettingsSection>

      {/* Color Themes Section */}
      <SettingsSection title="رنگ اصلی">
        <View style={styles.colorPreviewContainer}>
          <View style={[styles.currentColorPreview, { backgroundColor: theme.colors.accent }]}>
            <Text style={[styles.currentColorText, { color: themeUtils.getContrastColor(primaryColor) }]}>
              رنگ فعلی
            </Text>
          </View>
        </View>

        <View style={styles.colorGrid}>
          {COLOR_PRESETS.map((color) => (
            <TouchableOpacity
              key={color.primary}
              style={[
                styles.colorOption,
                { backgroundColor: color.primary },
                primaryColor === color.primary && styles.colorOptionSelected
              ]}
              onPress={() => handleColorChange(color.primary, color.name)}
            >
              {primaryColor === color.primary && (
                <MaterialCommunityIcons name="check" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.colorHint, { color: theme.colors.textSecondary }]}>
          با تغییر رنگ اصلی، تمام رنگ‌های برنامه به طور خودکار تنظیم می‌شوند
        </Text>
      </SettingsSection>




      {/* About Section */}
      <SettingsSection title="درباره">


        <SettingsRow
          icon="star"
          label="امتیاز دهید"
          description="اگر از برنامه راضی هستید، به ما امتیاز دهید"
          showBorder={true}
          onPress={handleRateApp}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={theme.colors.textSecondary} />
        </SettingsRow>

        <SettingsRow
          icon="share"
          label="اشتراک‌گذاری"
          description="برنامه را به دوستان خود معرفی کنید"
          showBorder={false}
          onPress={handleShareApp}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={theme.colors.textSecondary} />
        </SettingsRow>

        {/* <SettingsRow
          icon="information"
          label="نسخه برنامه"
          description="1.2.0"
          showBorder={true}
          onPress={handleAbout}

        > */}
          <MaterialCommunityIcons name="chevron-left" size={24} color={theme.colors.textSecondary} />
        </SettingsRow>
      </SettingsSection>

      {/* Reset Button */}
      <TouchableOpacity
        style={[styles.resetButton, { borderColor: theme.colors.danger }]}
        onPress={resetToDefault}
      >
        <MaterialCommunityIcons name="restore" size={20} color={theme.colors.danger} />
        <Text style={[styles.resetButtonText, { color: theme.colors.danger }]}>بازنشانی به تنظیمات پیش‌فرض</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.logoutButton, { borderColor: theme.colors.danger }]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <View style={[styles.logoutIconContainer, { backgroundColor: theme.colors.danger + '15' }]}>
          <MaterialCommunityIcons name="logout" size={24} color={theme.colors.danger} />
        </View>
        <View style={styles.logoutTextContainer}>
          <Text style={[styles.logoutLabel, { color: theme.colors.text }]}>خروج از حساب</Text>
          <Text style={[styles.logoutDescription, { color: theme.colors.textSecondary }]}>
            خارج شده و به صفحه ورود بازگردید
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-left" size={24} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
        Mithril v1.2.0
      </Text>
    </ScrollView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  logoutIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutTextContainer: {
    flex: 1,
  },
  logoutLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  logoutDescription: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  contentContainer: {
    paddingBottom: 30,
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
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
    writingDirection: 'rtl',
    paddingHorizontal: 4,
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rowDescription: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fontSizeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  fontSizeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSizeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  colorPreviewContainer: {
    padding: 16,
    alignItems: 'center',
  },
  currentColorPreview: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentColorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingTop: 0,
    gap: 12,
    justifyContent: 'center',
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  colorHint: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    writingDirection: 'rtl',
  },
  versionText: {
    fontSize: 14,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 30,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
  },
});