import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingScreenProps {
  color?: string;
  size?: number | 'small' | 'large';
}

export default function LoadingScreen({ color = '#0d9488', size = 'large' }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
}); 