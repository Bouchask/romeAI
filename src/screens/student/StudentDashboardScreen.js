import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StatCard } from '../../components/StatCard';
import { ApiService } from '../../services/api';

export default function StudentDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [myModules, setMyModules] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [modules, sessions] = await Promise.all([
        ApiService.getModules(),
        ApiService.getSessions()
      ]);

      // Filter modules by student's filiere
      const filteredModules = modules.filter(m => m.filiere_id === user.filiere_id);
      setMyModules(filteredModules);

      // Get today's date YYYY-MM-DD
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      const todayName = now.toLocaleDateString('en-US', { weekday: 'long' });
      
      console.log('--- STUDENT DASHBOARD DEBUG ---');
      console.log('User Filiere ID:', user.filiere_id);
      console.log('Target Date:', todayStr, todayName);
      console.log('Total Raw Sessions:', sessions.length);

      const todayFiltered = sessions.filter(s => {
        // Direct comparison using the new filiere_id field from backend
        const matchesFiliere = s.filiere_id === user.filiere_id;
        const matchesDate = s.date === todayStr;
        const matchesDayFallback = !s.date && s.day === todayName;
        
        const ok = matchesFiliere && (matchesDate || matchesDayFallback);
        if (matchesFiliere) {
           console.log(`Checking session ${s.id}: matchesDate=${matchesDate} (${s.date}), matchesDay=${matchesDayFallback} (${s.day}) -> Result: ${ok}`);
        }
        return ok;
      });
      
      console.log('Filtered Today Sessions Count:', todayFiltered.length);
      setTodayClasses(todayFiltered);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [user.filiere_id]);

  useEffect(() => {
    if (isFocused) fetchData();
  }, [isFocused, fetchData]);

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} color={theme.colors.primary} />}
    >
      <ScreenHeader 
        title={`Hi, ${user?.name?.split(' ')[0]}!`} 
        subtitle={`Program: ${user?.filiere_name || 'Assigned'}`}
      />
      
      <View style={styles.content}>
        <View style={styles.statsRow}>
          <StatCard title="Today's Classes" value={todayClasses.length.toString()} icon="calendar" color={theme.colors.primary} />
          <StatCard title="Total Modules" value={myModules.length.toString()} icon="library" color={theme.colors.success} />
        </View>

        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        {todayClasses.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No classes scheduled for today.</Text>
          </Card>
        ) : (
          todayClasses.map((c) => (
            <Card 
              key={c.id} 
              style={styles.scheduleCard}
              onPress={() => navigation.navigate('SessionDetail', { session: c })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.moduleInfo}>
                  <Text style={styles.moduleTitle}>{c.module_name}</Text>
                  <Text style={styles.professorName}>{c.professor_name}</Text>
                </View>
                <View style={styles.typeBadge}><Text style={styles.typeText}>{c.type}</Text></View>
              </View>
              <View style={styles.cardFooter}>
                <View style={styles.infoItem}>
                  <Ionicons name="location-outline" size={14} color={theme.colors.primary} />
                  <Text style={styles.infoText}>{c.room_name}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={14} color={theme.colors.primary} />
                  <Text style={styles.infoText}>{c.start_time} - {c.end_time}</Text>
                </View>
              </View>
            </Card>
          ))
        )}

        <Text style={styles.sectionTitle}>My Learning Path</Text>
        <Card noPadding>
          {myModules.length === 0 ? (
            <View style={styles.emptyPadding}><Text style={styles.emptyText}>No modules assigned yet.</Text></View>
          ) : (
            myModules.map((m, i, arr) => (
              <TouchableOpacity 
                key={m.id} 
                style={[styles.moduleItem, i === arr.length - 1 && styles.lastItem]}
                onPress={() => navigation.navigate('ModuleHistory', { module: m })}
              >
                <View style={styles.moduleIcon}><Ionicons name="journal" size={20} color={theme.colors.primary} /></View>
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
  content: { padding: theme.spacing.lg, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: theme.spacing.md },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 24 },
  scheduleCard: { marginBottom: 12, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  moduleInfo: { flex: 1 },
  moduleTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  professorName: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  typeBadge: { backgroundColor: theme.colors.primaryLight + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeText: { fontSize: 10, fontWeight: '800', color: theme.colors.primary },
  cardFooter: { flexDirection: 'row', gap: 16, marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '600' },
  moduleItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  lastItem: { borderBottomWidth: 0 },
  moduleIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  moduleName: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.colors.text },
  emptyCard: { padding: 30, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: theme.colors.border },
  emptyText: { color: theme.colors.textMuted, fontSize: 14, textAlign: 'center' },
  emptyPadding: { padding: 30 }
});
