import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

export default function ProfessorProfileScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ modules: 0, sessions: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [modules, sessions] = await Promise.all([
        ApiService.getModules(),
        ApiService.getSessions()
      ]);
      
      const myModules = modules.filter(m => m.professor_id === user.id);
      const mySessions = sessions.filter(s => myModules.some(m => m.id === s.module_id));
      
      setStats({
        modules: myModules.length,
        sessions: mySessions.length
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStats} color={theme.colors.primary} />}
    >
      <ScreenHeader title="Faculty Profile" subtitle="Academic identity management" />
      
      <View style={styles.content}>
        <Card style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.name || 'P').charAt(0)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.name}</Text>
              <Text style={styles.dept}>{user?.department_name || 'General Faculty'}</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Teaching Overview</Text>
        <View style={styles.statsRow}>
          <StatBox label="ACTIVE MODULES" value={stats.modules} icon="book" color={theme.colors.primary} />
          <StatBox label="WEEKLY SESSIONS" value={stats.sessions} icon="calendar" color={theme.colors.success} />
        </View>

        <Text style={styles.sectionTitle}>Account Details</Text>
        <Card noPadding>
          <ProfileItem icon="mail-outline" label="Email" value={user?.email} />
          <ProfileItem icon="id-card-outline" label="Professor ID" value={`#PRF-${user?.id}`} />
          <ProfileItem icon="time-outline" label="Status" value="Active Faculty" isLast />
        </Card>

        <Button 
          title="Sign Out" 
          variant="outline" 
          onPress={logout} 
          style={styles.logoutBtn}
          textStyle={{ color: theme.colors.error }}
        />
      </View>
    </ScrollView>
  );
}

function StatBox({ label, value, icon, color }) {
  return (
    <Card style={styles.statCard}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

function ProfileItem({ icon, label, value, isLast }) {
  return (
    <View style={[styles.itemRow, isLast && { borderBottomWidth: 0 }]}>
      <Ionicons name={icon} size={20} color={theme.colors.textSecondary} />
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  profileCard: { padding: 20 },
  avatarWrap: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  name: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  dept: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', marginTop: 24, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, alignItems: 'center', padding: 16 },
  statValue: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginTop: 8 },
  statLabel: { fontSize: 9, fontWeight: '700', color: theme.colors.textMuted, marginTop: 4 },
  itemRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  itemLabel: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted },
  itemValue: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginTop: 2 },
  logoutBtn: { marginTop: 40, borderColor: theme.colors.error + '40' }
});
