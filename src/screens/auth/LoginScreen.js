import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Button } from '../../components/Button';
import { ROLES } from '../../constants/roles';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.STUDENT);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (email && password) {
      setLoading(true);
      const success = await login(email, password, selectedRole);
      setLoading(false);
      // No navigation needed here as App.js RootNavigator will switch based on isAuthenticated
    }
  };

  const roles = [
    { key: ROLES.STUDENT, label: 'Student', icon: 'school-outline' },
    { key: ROLES.PROFESSOR, label: 'Professor', icon: 'person-outline' },
    { key: ROLES.ADMIN, label: 'Admin', icon: 'shield-checkmark-outline' },
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="business" size={40} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>Campus Manager</Text>
          <Text style={styles.subtitle}>Welcome back, please sign in</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Account Type</Text>
          <View style={styles.roleGrid}>
            {roles.map((r) => (
              <TouchableOpacity
                key={r.key}
                style={[
                  styles.roleCard,
                  selectedRole === r.key && styles.activeRoleCard
                ]}
                onPress={() => setSelectedRole(r.key)}
              >
                <Ionicons 
                  name={r.icon} 
                  size={24} 
                  color={selectedRole === r.key ? theme.colors.primary : theme.colors.textMuted} 
                />
                <Text style={[
                  styles.roleLabel,
                  selectedRole === r.key && styles.activeRoleLabel
                ]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="name@university.edu"
              placeholderTextColor={theme.colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={theme.colors.textMuted} 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button 
            title="Sign In" 
            onPress={handleLogin} 
            loading={loading}
            style={styles.submitBtn}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to the platform? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  roleGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  roleCard: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    gap: 8,
  },
  activeRoleCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeRoleLabel: {
    color: theme.colors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.text,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing.sm,
  },
  forgotText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: theme.spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    color: theme.colors.textSecondary,
  },
  link: {
    color: theme.colors.primary,
    fontWeight: '700',
  }
});
