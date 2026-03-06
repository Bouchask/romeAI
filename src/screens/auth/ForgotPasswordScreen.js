import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Button } from '../../components/Button';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="key" size={40} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          {sent 
            ? `Check your inbox! We've sent a link to ${email}`
            : "Enter your email address and we'll send you instructions to reset your password."}
        </Text>

        {!sent ? (
          <>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="name@university.edu"
                placeholderTextColor={theme.colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <Button title="Send Instructions" onPress={() => email && setSent(true)} style={styles.submitBtn} />
          </>
        ) : (
          <Button title="Back to Sign In" variant="secondary" onPress={() => navigation.navigate('Login')} style={styles.submitBtn} />
        )}

        <TouchableOpacity style={styles.backLink} onPress={() => navigation.navigate('Login')}>
          <Ionicons name="arrow-back" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.backText}>Return to Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, padding: theme.spacing.xl, justifyContent: 'center', alignItems: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 20, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.xl },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.text, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: theme.colors.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 22, marginBottom: theme.spacing.xxl },
  inputContainer: { width: '100%', maxWidth: 400, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, borderWidth: 1.5, borderColor: theme.colors.border, paddingHorizontal: theme.spacing.md },
  inputIcon: { marginRight: theme.spacing.sm },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: theme.colors.text },
  submitBtn: { width: '100%', maxWidth: 400, marginTop: theme.spacing.xl },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: theme.spacing.xxl },
  backText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary }
});
