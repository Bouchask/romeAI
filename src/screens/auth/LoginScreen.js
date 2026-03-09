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
  Alert
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
    if (!email || !password) {
      const msg = 'Please enter both email and password.';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Error', msg);
      return;
    }

    setLoading(true);
    const success = await login(email, password, selectedRole);
    setLoading(false);
    
    if (!success) {
      const msg = 'Login failed. Please check your credentials and account type.';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Login Error', msg);
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="business" size={40} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>Campus Manager</Text>
          <Text style={styles.subtitle}>Enter your institutional credentials</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Identity Type</Text>
          <View style={styles.roleGrid}>
            {roles.map((r) => (
              <TouchableOpacity
                key={r.key}
                style={[styles.roleCard, selectedRole === r.key && styles.activeRoleCard]}
                onPress={() => setSelectedRole(r.key)}
              >
                <Ionicons name={r.icon} size={24} color={selectedRole === r.key ? theme.colors.primary : theme.colors.textMuted} />
                <Text style={[styles.roleLabel, selectedRole === r.key && styles.activeRoleLabel]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Institutional Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="user@university.edu"
              placeholderTextColor={theme.colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.label}>Access Password</Text>
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

          <Button 
            title="Authenticate" 
            onPress={handleLogin} 
            loading={loading}
            style={styles.submitBtn}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Secure University Access Portal</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: theme.spacing.xl },
  header: { alignItems: 'center', marginBottom: 40 },
  logoContainer: { width: 80, height: 80, borderRadius: 20, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.text, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: theme.colors.textSecondary, marginTop: 4 },
  form: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  label: { fontSize: 13, fontWeight: '700', color: theme.colors.text, marginBottom: 8, marginTop: 16 },
  roleGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleCard: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: theme.colors.border, alignItems: 'center', gap: 6 },
  activeRoleCard: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight + '10' },
  roleLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.textSecondary },
  activeRoleLabel: { color: theme.colors.primary },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1.5, borderColor: theme.colors.border, paddingHorizontal: 12 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: theme.colors.text },
  submitBtn: { marginTop: 32 },
  footer: { alignItems: 'center', marginTop: 40 },
  footerText: { color: theme.colors.textMuted, fontSize: 12, fontWeight: '600' }
});
