import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (__DEV__) {
      console.error('App Error:', error, info?.componentStack);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.message}>{this.state.error?.message || String(this.state.error)}</Text>
            {this.state.error?.stack && (
              <Text style={styles.stack}>{this.state.error.stack}</Text>
            )}
          </ScrollView>
          <TouchableOpacity style={styles.button} onPress={() => this.setState({ error: null })}>
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 24, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 16, textAlign: 'center' },
  scroll: { maxHeight: 300, marginBottom: 24 },
  message: { fontSize: 14, color: '#EF4444', fontFamily: 'monospace', marginBottom: 8 },
  stack: { fontSize: 11, color: '#64748B', fontFamily: 'monospace' },
  button: { backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
