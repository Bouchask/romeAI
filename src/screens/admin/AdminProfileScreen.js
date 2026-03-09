import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

export default function AdminProfileScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ students: 0, professors: 0, rooms: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [stu, prof, room] = await Promise.all([
        ApiService.getStudents(),
        ApiService.getProfessors(),
        ApiService.getRooms()
      ]);
      setStats({
        students: stu.length,
        professors: prof.length,
        rooms: room.length
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStats} color={theme.colors.primary} />}
    >
      <ScreenHeader 
        title="Admin Profile" 
        subtitle="System Management Identity" 
      />
      
      <View style={styles.content}>
        <Card style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.name || 'A').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.name || 'Administrator'}</Text>
              <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark" size={12} color={theme.colors.primary} />
                <Text style={styles.roleText}>System Level Access</Text>
              </View>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Account Information</Text>
        <Card noPadding>
          <ProfileRow icon="mail-outline" label="Official Email" value={user?.email || 'admin@university.edu'} />
          <ProfileRow icon="finger-print-outline" label="Admin ID" value={`#ADM-${user?.id || '001'}`} />
          <ProfileRow icon="calendar-outline" label="Account Active Since" value="March 2024" isLast />
        </Card>

        <Text style={styles.sectionTitle}>System Stats Snapshot</Text>
        <Card noPadding>
          <ProfileRow icon="people-outline" label="Managed Students" value={stats.students.toString()} />
          <ProfileRow icon="school-outline" label="Managed Professors" value={stats.professors.toString()} />
          <ProfileRow icon="business-outline" label="Registered Classrooms" value={stats.rooms.toString()} isLast />
        </Card>

        <Button 
          title="Security Sign Out" 
          variant="outline" 
          onPress={logout} 
          style={styles.logoutBtn}
          textStyle={{ color: theme.colors.error }}
        />
        
        <Text style={styles.version}>Campus Manager Core • v1.2.0</Text>
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
  version: { textAlign: 'center', color: theme.colors.textMuted, fontSize: 12, marginTop: theme.spacing.xl },
});
