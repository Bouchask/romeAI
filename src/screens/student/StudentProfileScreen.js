import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Button } from '../../components/Button';
import { FILIERES } from '../../data/mockData';

export default function StudentProfileScreen() {
  const { user, logout } = useAuth();
  const studentFiliere = FILIERES.find(f => f.id === user?.filiereId)?.name || 'Computer Science';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader 
        title="My Profile" 
        subtitle="Student Information" 
      />
      
      <View style={styles.content}>
        <Card style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.name || 'S').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.name || 'Student'}</Text>
              <View style={styles.roleBadge}>
                <Ionicons name="school" size={12} color={theme.colors.primary} />
                <Text style={styles.roleText}>Student Account</Text>
              </View>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Academic Status</Text>
        <Card noPadding>
          <ProfileRow icon="business-outline" label="Department" value={studentFiliere} />
          <ProfileRow icon="id-card-outline" label="Student ID" value={`STU-2024-${user?.id || '001'}`} />
          <ProfileRow icon="calendar-outline" label="Current Semester" value="Semester 4" isLast />
        </Card>

        <Text style={styles.sectionTitle}>Personal Details</Text>
        <Card noPadding>
          <ProfileRow icon="mail-outline" label="University Email" value={user?.email || 'student@university.edu'} />
          <ProfileRow icon="phone-portrait-outline" label="Phone" value="+1 (555) 000-0000" isLast />
        </Card>

        <Button 
          title="Log Out" 
          variant="outline" 
          onPress={logout} 
          style={styles.logoutBtn}
          textStyle={{ color: theme.colors.error }}
        />
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
  logoutBtn: { marginTop: theme.spacing.xxl, borderColor: theme.colors.error + '40' },
});
