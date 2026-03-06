import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Button } from '../../components/Button';

export default function AdminProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader 
        title="Settings" 
        subtitle="Manage your administrative account" 
      />
      
      <View style={styles.content}>
        <Card style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.name || 'A').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.name || 'Admin User'}</Text>
              <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark" size={12} color={theme.colors.primary} />
                <Text style={styles.roleText}>System Administrator</Text>
              </View>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Account Details</Text>
        <Card noPadding>
          <ProfileRow icon="mail-outline" label="Email" value={user?.email || 'admin@university.edu'} />
          <ProfileRow icon="key-outline" label="Account Type" value="Full Access" />
          <ProfileRow icon="calendar-outline" label="Joined" value="March 2024" isLast />
        </Card>

        <Text style={styles.sectionTitle}>System Preferences</Text>
        <Card noPadding>
          <MenuRow icon="notifications-outline" label="Notifications" />
          <MenuRow icon="lock-closed-outline" label="Security & Privacy" />
          <MenuRow icon="help-circle-outline" label="Help & Support" isLast />
        </Card>

        <Button 
          title="Sign Out" 
          variant="outline" 
          onPress={logout} 
          style={styles.logoutBtn}
          textStyle={{ color: theme.colors.error }}
        />
        
        <Text style={styles.version}>Campus Manager v1.0.4</Text>
      </View>
    </ScrollView>
  );
}

function ProfileRow({ icon, label, value, isLast }) {
  return (
    <View style={[styles.row, isLast && styles.lastRow]}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={theme.colors.textSecondary} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

function MenuRow({ icon, label, isLast }) {
  return (
    <TouchableOpacity style={[styles.row, isLast && styles.lastRow]}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={20} color={theme.colors.textSecondary} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  profileCard: { marginBottom: theme.spacing.xl, padding: theme.spacing.lg },
  avatarWrap: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg },
  avatar: { width: 70, height: 70, borderRadius: 20, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#FFF' },
  profileInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: theme.colors.primaryLight, alignSelf: 'flex-start' },
  roleText: { fontSize: 11, fontWeight: '700', color: theme.colors.primary, textTransform: 'uppercase' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: theme.spacing.sm, marginTop: theme.spacing.lg, marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  lastRow: { borderBottomWidth: 0 },
  rowIcon: { width: 32, alignItems: 'center' },
  rowBody: { flex: 1, marginLeft: theme.spacing.sm },
  rowLabel: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 },
  rowValue: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: theme.colors.text, marginLeft: theme.spacing.sm },
  logoutBtn: { marginTop: theme.spacing.xxl, borderColor: theme.colors.error + '40' },
  version: { textAlign: 'center', color: theme.colors.textMuted, fontSize: 12, marginTop: theme.spacing.xl },
});
