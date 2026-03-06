import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StatCard } from '../../components/StatCard';
import { ApiService } from '../../services/api';

export default function StudentDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myModules, setMyModules] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);

  const userName = user?.name?.split(' ')[0] || 'Student';
  const studentFiliere = user?.filiere_name || 'Computer Science';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [modules, sessions] = await Promise.all([
        ApiService.getModules(),
        ApiService.getSessions()
      ]);

      // Filter modules by student's filiere
      const filteredModules = modules.filter(m => m.filiere_id === user.filiere_id);
      setMyModules(filteredModules);

      // Simple today filter: match current day name
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const todayName = dayNames[new Date().getDay()];
      
      const todayFiltered = sessions.filter(s => {
        // Find if this session's module belongs to student's filiere
        const moduleOfSession = modules.find(m => m.id === s.module_id);
        return s.day === todayName && moduleOfSession?.filiere_id === user.filiere_id;
      });
      
      setTodayClasses(todayFiltered);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
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
        title={`Hi, ${userName}!`} 
        subtitle={`Department: ${studentFiliere}`}
        rightElement={
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#FFF" />
          </View>
        }
      />
      
      <View style={styles.content}>
        <View style={styles.statsRow}>
          <StatCard title="Today's Classes" value={todayClasses.length.toString()} icon="calendar" color={theme.colors.primary} />
          <StatCard title="My Modules" value={myModules.length.toString()} icon="library" color={theme.colors.success} />
        </View>

        <Text style={styles.sectionTitle}>Today's Schedule ({new Date().toLocaleDateString('en-US', { weekday: 'long' })})</Text>
        {todayClasses.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No classes scheduled for today.</Text>
          </Card>
        ) : (
          todayClasses.map((c) => (
            <Card 
              key={c.id} 
              style={styles.scheduleCard}
              onPress={() => navigation?.navigate('SessionDetail', { session: c })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.moduleInfo}>
                  <Text style={styles.moduleTitle}>{c.module_name}</Text>
                  <Text style={styles.professorName}>{c.professor_name}</Text>
                </View>
                <View style={[styles.statusBadge, styles.upcomingBadge]}>
                  <Text style={[styles.statusText, styles.upcomingText]}>
                    {c.type}
                  </Text>
                </View>
              </View>
              
              <View style={styles.cardFooter}>
                <View style={styles.infoItem}>
                  <Ionicons name="location-outline" size={16} color={theme.colors.textMuted} />
                  <Text style={styles.infoText}>{c.room_name}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={16} color={theme.colors.textMuted} />
                  <Text style={styles.infoText}>{c.start_time} - {c.end_time}</Text>
                </View>
              </View>
            </Card>
          ))
        )}

        <Text style={styles.sectionTitle}>My Learning Path</Text>
        <Card noPadding>
          {myModules.length === 0 ? (
            <View style={styles.emptyPadding}>
              <Text style={styles.emptyText}>No modules assigned to your department yet.</Text>
            </View>
          ) : (
            myModules.map((m, i, arr) => (
              <TouchableOpacity 
                key={m.id} 
                style={[styles.moduleItem, i === arr.length - 1 && styles.lastItem]}
                onPress={() => navigation?.navigate('SessionDetail', { session: { module_name: m.name, room_name: 'TBA', start_time: 'Weekly' } })}
              >
                <View style={styles.moduleIcon}>
                  <Ionicons name="journal-outline" size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.moduleName}>{m.name}</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))
          )}
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.lg },
  sectionTitle: { 
    fontSize: 13, 
    fontWeight: '800', 
    color: theme.colors.textMuted, 
    textTransform: 'uppercase', 
    letterSpacing: 1.2, 
    marginBottom: theme.spacing.md, 
    marginTop: theme.spacing.lg 
  },
  scheduleCard: { marginBottom: theme.spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md },
  moduleInfo: { flex: 1 },
  moduleTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  professorName: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  upcomingBadge: { backgroundColor: theme.colors.primaryLight },
  afternoonBadge: { backgroundColor: theme.colors.accent },
  statusText: { fontSize: 11, fontWeight: '700' },
  upcomingText: { color: theme.colors.primary },
  afternoonText: { color: theme.colors.textSecondary },
  cardFooter: { flexDirection: 'row', gap: theme.spacing.lg, paddingTop: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.border },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '500' },
  moduleItem: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  lastItem: { borderBottomWidth: 0 },
  moduleIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md },
  moduleName: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.colors.text },
  center: { justifyContent: 'center', alignItems: 'center' },
  emptyCard: { padding: theme.spacing.xl, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: theme.colors.border },
  emptyText: { color: theme.colors.textMuted, fontSize: 14, textAlign: 'center' },
  emptyPadding: { padding: theme.spacing.xl },
});
