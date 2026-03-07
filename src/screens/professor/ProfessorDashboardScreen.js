import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StatCard } from '../../components/StatCard';
import { ApiService } from '../../services/api';

export default function ProfessorDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myModules, setMyModules] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [modules, sessions] = await Promise.all([
        ApiService.getModules(),
        ApiService.getSessions()
      ]);

      // Filter modules taught by this professor
      const filteredModules = modules.filter(m => m.professor_id === user.id);
      setMyModules(filteredModules);

      // Filter today's sessions for this professor
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const todayName = dayNames[new Date().getDay()];
      
      const filteredSessions = sessions.filter(s => {
        const mod = modules.find(m => m.id === s.module_id);
        return s.day === todayName && mod?.professor_id === user.id;
      });
      setTodaySessions(filteredSessions);
    } catch (err) {
      console.error('Error fetching professor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      onRefresh={fetchData}
      refreshing={loading}
    >
      <ScreenHeader 
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Professor'}`} 
        subtitle={user?.department_name || "Faculty Member"}
        rightElement={
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.substring(0, 2).toUpperCase()}</Text>
          </View>
        }
      />
      
      <View style={styles.content}>
        <View style={styles.statsRow}>
          <StatCard title="Today's Classes" value={todaySessions.length.toString()} icon="time" color={theme.colors.primary} />
          <StatCard title="Total Modules" value={myModules.length.toString()} icon="book" color={theme.colors.success} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Sessions Today</Text>
        </View>

        {todaySessions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No sessions scheduled for today.</Text>
          </Card>
        ) : (
          todaySessions.map((s) => (
            <Card 
              key={s.id} 
              style={styles.sessionCard}
              onPress={() => navigation.navigate('SessionDetail', { session: s })}
            >
              <View style={styles.sessionHeader}>
                <View style={styles.moduleBadge}>
                  <Ionicons name="school" size={16} color={theme.colors.primary} />
                  <Text style={styles.moduleText}>{s.module_name}</Text>
                </View>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{s.type}</Text>
                </View>
              </View>

              <View style={styles.sessionBody}>
                <View style={styles.timeInfo}>
                  <Text style={styles.timeText}>{s.start_time} - {s.end_time}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.locationText}>Room {s.room_name}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => navigation.navigate('AttendanceManagement', { session: s })}
              >
                <Text style={styles.actionBtnText}>Manage Attendance</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </Card>
          ))
        )}

        <Text style={styles.sectionTitle}>My Modules</Text>
        <View style={styles.modulesGrid}>
          {myModules.length === 0 ? (
            <Text style={styles.emptyText}>No modules assigned yet.</Text>
          ) : (
            myModules.map((m) => (
              <Card 
                key={m.id} 
                style={styles.moduleCard}
                onPress={() => navigation.navigate('ModuleSessions', { module: m })}
              >
                <View style={styles.moduleIcon}>
                  <Ionicons name="library" size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.moduleName} numberOfLines={1}>{m.name}</Text>
                <Text style={styles.moduleSub}>{user.department_name}</Text>
              </Card>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md, marginTop: theme.spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  seeAll: { fontSize: 14, color: theme.colors.primary, fontWeight: '600' },
  sessionCard: { marginBottom: theme.spacing.md, padding: theme.spacing.md },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  moduleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.primaryLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  moduleText: { fontSize: 13, fontWeight: '700', color: theme.colors.primary },
  typeBadge: { backgroundColor: theme.colors.accent, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeText: { fontSize: 11, fontWeight: '600', color: theme.colors.textSecondary },
  sessionBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  timeText: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText: { fontSize: 13, color: theme.colors.textSecondary },
  studentInfo: { alignItems: 'flex-end' },
  studentAvatars: { flexDirection: 'row', marginBottom: 4 },
  miniAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.border, borderWidth: 2, borderColor: '#FFF' },
  studentCount: { fontSize: 12, color: theme.colors.textMuted, fontWeight: '500' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: theme.spacing.md },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: theme.colors.primary },
  modulesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, marginTop: theme.spacing.xs },
  moduleCard: { flex: 1, minWidth: 140, alignItems: 'center', padding: theme.spacing.md },
  moduleIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.sm },
  moduleName: { fontSize: 14, fontWeight: '700', color: theme.colors.text, textAlign: 'center' },
  moduleSub: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyCard: { padding: theme.spacing.xl, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.md },
  emptyText: { color: theme.colors.textMuted, fontSize: 14, textAlign: 'center' },
});
