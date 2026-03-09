import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';

export default function StudentProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    const performLogout = () => logout();
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to sign out?')) performLogout();
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to exit?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: performLogout }
      ]);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="My Profile" subtitle="Student Academic ID" />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'S'}</Text>
            <View style={styles.onlineBadge} />
          </View>
          <Text style={styles.name}>{user?.name || 'Academic Student'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>OFFICIAL STUDENT</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Academic Information</Text>
        <Card style={styles.infoCard}>
          <InfoItem icon="finger-print" label="Registration ID" value={user?.registration_number || 'Pending'} />
          <InfoItem icon="school" label="Program (Filiere)" value={user?.filiere_name || 'Not Assigned'} />
          <InfoItem icon="business" label="Department" value={user?.department_name || 'General Faculty'} />
        </Card>

        <Text style={styles.sectionTitle}>Account Actions</Text>
        <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
          <View style={[styles.actionIcon, { backgroundColor: theme.colors.primaryLight + '20' }]}>
            <Ionicons name="settings-outline" size={20} color={theme.colors.primary} />
          </View>
          <Text style={styles.actionLabel}>Preferences</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
          <View style={[styles.actionIcon, { backgroundColor: theme.colors.primaryLight + '20' }]}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.primary} />
          </View>
          <Text style={styles.actionLabel}>Change Password</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionItem, styles.logoutBtn]} onPress={handleLogout}>
          <View style={[styles.actionIcon, { backgroundColor: theme.colors.error + '10' }]}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          </View>
          <Text style={[styles.actionLabel, { color: theme.colors.error }]}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.version}>Campus Room Manager v1.0.2</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={18} color={theme.colors.textSecondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabelText}>{label}</Text>
        <Text style={styles.infoValueText}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  header: { alignItems: 'center', marginVertical: 20 },
  avatarContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  onlineBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: theme.colors.success, borderHeight: 3, borderColor: '#FFF', position: 'absolute', bottom: 5, right: 5, borderWidth: 3 },
  name: { fontSize: 22, fontWeight: '800', color: theme.colors.text },
  email: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
  roleBadge: { marginTop: 12, backgroundColor: theme.colors.primaryLight + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 10, fontWeight: '900', color: theme.colors.primary, letterSpacing: 1 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 32, marginBottom: 12 },
  infoCard: { padding: 16, gap: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  infoIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  infoLabelText: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase' },
  infoValueText: { fontSize: 15, fontWeight: '700', color: theme.colors.text, marginTop: 2 },
  actionItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#FFF', borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
  actionIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  actionLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.colors.text },
  logoutBtn: { marginTop: 12, borderColor: theme.colors.error + '30' },
  footer: { marginTop: 40, alignItems: 'center', paddingBottom: 20 },
  version: { fontSize: 12, color: theme.colors.textMuted }
});
