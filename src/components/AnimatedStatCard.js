import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableWithoutFeedback, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { Card } from './Card';

export const AnimatedStatCard = ({ title, value, icon, color = theme.colors.primary, subtitle, delay = 0 }) => {
  // Animation values
  const entranceAnim = useRef(new Animated.Value(0)).current; // Opacity & Translation
  const scaleAnim = useRef(new Animated.Value(0.9)).current; // Scale
  const pressAnim = useRef(new Animated.Value(1)).current; // Interaction Scale

  useEffect(() => {
    // Staggered Entrance Animation
    Animated.parallel([
      Animated.timing(entranceAnim, {
        toValue: 1,
        duration: 600,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const translateY = entranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (
    <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View 
        style={[
          styles.wrapper, 
          { 
            opacity: entranceAnim,
            transform: [
              { translateY },
              { scale: Animated.multiply(scaleAnim, pressAnim) }
            ]
          }
        ]}
      >
        <Card style={styles.card} noPadding>
          <View style={styles.innerPadding}>
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={20} color={color} />
              </View>
              {subtitle && (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </View>
            <View style={styles.content}>
              <Text style={styles.value} numberOfLines={1}>{value}</Text>
              <Text style={styles.title} numberOfLines={1}>{title}</Text>
            </View>
          </View>
        </Card>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: '45%',
  },
  card: {
    flex: 1,
    overflow: 'hidden',
  },
  innerPadding: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginTop: theme.spacing.xs,
  },
  value: {
    ...theme.typography.statValue,
    color: theme.colors.text,
  },
  title: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.success,
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  }
});
