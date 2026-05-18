import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/theme';
import ProfileScreen from '../screens/ProfileScreen';
import ScoresScreen from '../screens/ScoresScreen';
import FinalScoreScreen from '../screens/FinalScoreScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type MainTabParamList = {
  Scores: undefined;
  FinalScore: undefined;
  Profile: undefined;
  Schedule: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'school';

          if (route.name === 'Scores') iconName = 'bar-chart-outline';
          if (route.name === 'FinalScore') iconName = 'ribbon-outline';
          if (route.name === 'Profile') iconName = 'person-circle-outline';
          if (route.name === 'Schedule') iconName = 'calendar-outline';
          if (route.name === 'Settings') iconName = 'settings-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Scores" component={ScoresScreen} options={{ title: 'نمرات' }} />
      <Tab.Screen name="FinalScore" component={FinalScoreScreen} options={{ title: 'نمرات نهایی' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'پروفایل' }} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} options={{ title: 'تقسیم اوقات' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'تنظیمات' }} />
    </Tab.Navigator>
  );
}

