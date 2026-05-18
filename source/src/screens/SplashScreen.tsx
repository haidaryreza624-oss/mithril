import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { token, loading } = useAuth();
  const scale = useRef(new Animated.Value(0.3)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(ringRotate, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(rotate, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(iconScale, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(iconScale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.stagger(100, [
          Animated.timing(dotOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideUp, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
    const timeout = setTimeout(() => {
      if (!loading) {
        if (token) {
          navigation.replace('Main');
        } else {
          navigation.replace('Login');
        }
      }
    }, 2600);

    return () => clearTimeout(timeout);
  }, [loading, navigation, token]);
  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '20deg'],
  });

  const ringRotateInterpolate = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View style={[styles.logoWrapper, { opacity }]}>
        <Animated.View style={[styles.logoContainer, { transform: [{ scale }] }]}>
          {/* Rotating outer ring */}
          <Animated.View style={[
            styles.outerRing,
            {
              borderColor: theme.colors.accent + '30',
              transform: [{ rotate: ringRotateInterpolate }]
            }
          ]}>
            {[0, 90, 180, 270].map((angle, index) => (
              <View
                key={index}
                style={[
                  styles.ringDot,
                  {
                    backgroundColor: theme.colors.accent,
                    transform: [
                      { rotate: angle + 'deg' },
                      { translateY: -45 }
                    ]
                  }
                ]}
              />
            ))}
          </Animated.View>

          {/* Main circle */}
          <View style={[styles.mainCircle, { backgroundColor: theme.colors.accent + '15' }]}>
            <Animated.View style={[
              styles.iconContainer,
              {
                transform: [
                  { rotate: rotateInterpolate },
                  { scale: iconScale }
                ]
              }
            ]}>
              <MaterialCommunityIcons
                name="school"
                size={50}
                color={theme.colors.accent}
              />
            </Animated.View>
          </View>

          {/* Inner ring */}
          <Animated.View style={[
            styles.innerRing,
            {
              borderColor: theme.colors.accent + '60',
              transform: [{ rotate: ringRotateInterpolate }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.1],
                outputRange: [0.3, 0.6],
              })
            }
          ]} />

          {/* Particles */}
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={`particle-${i}`}
              style={[
                styles.particle,
                {
                  backgroundColor: theme.colors.accent,
                  opacity: dotOpacity,
                  transform: [
                    {
                      translateX: pulseAnim.interpolate({
                        inputRange: [1, 1.1],
                        outputRange: [0, (i + 1) * 5],
                      })
                    },
                    {
                      translateY: pulseAnim.interpolate({
                        inputRange: [1, 1.1],
                        outputRange: [0, -(i + 1) * 5],
                      })
                    }
                  ],
                  left: i === 0 ? 70 : i === 1 ? 20 : 40,
                  top: i === 0 ? 20 : i === 1 ? 70 : 30,
                }
              ]}
            />
          ))}
        </Animated.View>

        {/* Dots */}
        <Animated.View style={[styles.dotsContainer, { transform: [{ translateY: slideUp }] }]}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: theme.colors.accent,
                  opacity: dotOpacity,
                  transform: [{
                    scale: dotOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    })
                  }]
                }
              ]}
            />
          ))}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderStyle: 'solid',
  },
  ringDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    left: 62,
    top: 62,
  },
  mainCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});