import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { theme } from '../theme';

export const Card = ({ children, style, onPress, noPadding = false }) => {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container 
      style={[
        styles.card, 
        !noPadding && styles.padding,
        style
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
    ...Platform.select({
      web: {
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
        ':hover': {
          transform: 'translateY(-2px)',
          ...theme.shadows.md,
        }
      }
    })
  },
  padding: {
    padding: theme.spacing.md,
  }
});
