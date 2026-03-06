import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated, Platform } from 'react-native';
import { theme } from '../theme';

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  style,
  textStyle 
}) => {
  const animatedScale = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return { 
          button: styles.secondaryButton, 
          text: styles.secondaryText 
        };
      case 'outline':
        return { 
          button: styles.outlineButton, 
          text: styles.outlineText 
        };
      default:
        return { 
          button: styles.primaryButton, 
          text: styles.primaryText 
        };
    }
  };

  const variants = getVariantStyles();

  return (
    <Animated.View style={[{ transform: [{ scale: animatedScale }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.baseButton,
          variants.button,
          (disabled || loading) && styles.disabledButton
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? '#FFF' : theme.colors.primary} />
        ) : (
          <Text style={[styles.baseText, variants.text, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  baseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  primaryText: {
    color: '#FFF',
  },
  secondaryButton: {
    backgroundColor: theme.colors.primaryLight,
  },
  secondaryText: {
    color: theme.colors.primary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  }
});
