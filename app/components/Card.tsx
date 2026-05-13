import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';

export function Card({ children, style, color = '#FFFFFF' }: { children: React.ReactNode; style?: ViewStyle | ViewStyle[]; color?: string }) {
  return <View style={[styles.card, { backgroundColor: color }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
});
