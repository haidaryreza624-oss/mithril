import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState, useRef, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
} from 'react-native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Animated } from 'react-native';
const { height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [dot1] = useState(new Animated.Value(0));
const [dot2] = useState(new Animated.Value(0));
const [dot3] = useState(new Animated.Value(0));
  
  const { theme } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const passwordInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  useEffect(() => {
  if (submitting) {
    const animate = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  } else {
    
  }
}, [submitting]);
  
  useEffect(() => {
    if (emailError) setEmailError(null);
    if (error) setError(null);
  }, [email]);

  useEffect(() => {
    if (passwordError) setPasswordError(null);
    if (error) setError(null);
  }, [password]);

  const validateForm = () => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError('ایمیل الزامی است');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('ایمیل معتبر وارد کنید');
      isValid = false;
    }

    if (!password) {
      setPasswordError('رمز عبور الزامی است');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (submitting) return;

    if (!validateForm()) return;

    setSubmitting(true);
    setError(null);
    Keyboard.dismiss();

    try {
      await login(email.trim(), password);
      navigation.replace('Main');
    } catch (e) {
      setError('ورود ناموفق بود. ایمیل یا رمز عبور اشتباه است.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.logoContainer, { backgroundColor: theme.colors.accent + '15' }]}>
                <MaterialCommunityIcons name="school" size={40} color={theme.colors.accent} />
              </View>
              <Text style={[styles.title, { color: theme.colors.text }]}>خوش آمدید</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                برای مشاهده نتایج تحصیلی خود وارد شوید
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email Field */}
              <View style={styles.fieldGroup}>
                <View style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: emailError ? theme.colors.danger : theme.colors.border
                  }
                ]}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={20}
                    color={emailError ? theme.colors.danger : theme.colors.textSecondary}
                  />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="example@mail.com"
                    placeholderTextColor={theme.colors.textSecondary}
                    style={[styles.input, { color: theme.colors.text }]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                    editable={!submitting}
                  />
                </View>
                {emailError && (
                  <Text style={[styles.fieldError, { color: theme.colors.danger }]}>
                    {emailError}
                  </Text>
                )}
              </View>

              {/* Password Field */}
              <View style={styles.fieldGroup}>
                <View style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: passwordError ? theme.colors.danger : theme.colors.border
                  }
                ]}>
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={20}
                    color={passwordError ? theme.colors.danger : theme.colors.textSecondary}
                  />
                  <TextInput
                    ref={passwordInputRef}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={theme.colors.textSecondary}
                    style={[styles.input, { color: theme.colors.text }]}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    editable={!submitting}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <MaterialCommunityIcons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                {passwordError && (
                  <Text style={[styles.fieldError, { color: theme.colors.danger }]}>
                    {passwordError}
                  </Text>
                )}
              </View>

              {/* General Error */}
              {error && (
                <View style={[styles.errorContainer, { backgroundColor: theme.colors.danger + '15' }]}>
                  <MaterialCommunityIcons name="alert-circle" size={20} color={theme.colors.danger} />
                  <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
                </View>
              )}

              {/* Login Button */}
              <TouchableOpacity
  style={[
    styles.button,
    {
      backgroundColor: theme.colors.accent,
      opacity: 1, 
    },
  ]}
  activeOpacity={0.8}
  onPress={handleLogin}
  disabled={submitting}
>
  
  <View style={[styles.buttonContent, { opacity: submitting ? 0.9 : 1 }]}>
    {submitting ? (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
  <Text style={styles.buttonText}>در حال ورود</Text>
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[dot1, dot2, dot3].map((dot, i) => (
      <Animated.View
        key={i}
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: '#fff',
          opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
          transform: [{ scale: dot.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] }) }],
        }}
      />
    ))}
  </View>
</View>
    ) : (
      <>
        <Text style={styles.buttonText}>ورود</Text>
        <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
      </>
    )}
  </View>
</TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24, 
  },
  card: {
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    gap: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    writingDirection: 'rtl',
    paddingHorizontal: 10,
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    gap: 8,
    alignItems: 'flex-start',
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    width: '100%',
  },
  input: {
    flex: 1,
    fontSize: 15,
    textAlign: 'right',
    writingDirection: 'rtl',
    paddingVertical: 0,
  },
  fieldError: {
    fontSize: 12,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginRight: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 14,
    gap: 8,
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
    writingDirection: 'rtl',
    flex: 1,
  },
  button: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
});