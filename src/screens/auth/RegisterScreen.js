import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Button } from '../../components/Button';
import { ROLES } from '../../constants/roles';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.STUDENT);
  const [field, setField] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();

  const handleRegister = () => {
    if (email && password && password === confirmPassword) {
      const extra = selectedRole === ROLES.STUDENT ? { filiereId: 'f1' } : {};
      register(email, password, name, selectedRole, extra);
    }
  };

  const roles = [
    { key: ROLES.STUDENT, label: 'Student', icon: 'school-outline' },
    { key: ROLES.PROFESSOR, label: 'Professor', icon: 'person-outline' },
    { key: ROLES.ADMIN, label: 'Admin', icon: 'shield-checkmark-outline' },
  ];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our modern campus platform</Text>
        </View>

        <Text style={styles.label}>Sign up as</Text>
        <View style={styles.roleGrid}>
          {roles.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={[styles.roleCard, selectedRole === r.key && styles.activeRoleCard]}
              onPress={() => setSelectedRole(r.key)}
            >
              <Ionicons 
                name={r.icon} 
                size={24} 
                color={selectedRole === r.key ? theme.colors.primary : theme.colors.textMuted} 
              />
              <Text style={[styles.roleLabel, selectedRole === r.key && styles.activeRoleLabel]}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor={theme.colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        <Text style={styles.label}>University Email</Text>
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
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Button title="Sign Up" onPress={handleRegister} style={styles.submitBtn} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: theme.spacing.xl, flexGrow: 1, justifyContent: 'center' },
  header: { marginBottom: theme.spacing.xxl, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.text, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: theme.colors.textSecondary, marginTop: 4 },
  label: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.sm, marginTop: theme.spacing.md },
  roleGrid: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  roleCard: { flex: 1, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.card, borderWidth: 1.5, borderColor: theme.colors.border, alignItems: 'center', gap: 8 },
  activeRoleCard: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  roleLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  activeRoleLabel: { color: theme.colors.primary },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md, borderWidth: 1.5, borderColor: theme.colors.border, paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.sm },
  inputIcon: { marginRight: theme.spacing.sm },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: theme.colors.text },
  submitBtn: { marginTop: theme.spacing.xl },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing.xl },
  footerText: { color: theme.colors.textSecondary },
  link: { color: theme.colors.primary, fontWeight: '700' }
});
