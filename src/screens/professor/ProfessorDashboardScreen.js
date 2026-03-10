import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StatCard } from '../../components/StatCard';
import { ApiService } from '../../services/api';

const getNavigatorDays = () => {
  const days = [];
  let current = new Date();
  for (let i = 0; i < 7; i++) {
    const temp = new Date(current);
    temp.setDate(current.getDate() + i);
    const dayName = temp.toLocaleDateString('en-US', { weekday: 'short' });
    const year = temp.getFullYear();
    const month = String(temp.getMonth() + 1).padStart(2, '0');
    const day = String(temp.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    days.push({ id: i, label: i === 0 ? 'Today' : dayName, date: dateStr, fullDay: temp.toLocaleDateString('en-US', { weekday: 'long' }) });
  }
  return days;
};

export default function ProfessorDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [allSessions, setAllSessions] = useState([]);
  const [myDepartments, setMyDepartments] = useState([]);
  const [stats, setStats] = useState({ today: 0, total: 0 });
  
  const navigatorDays = useMemo(() => getNavigatorDays(), []);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [modules, sessions, departments] = await Promise.all([
        ApiService.getModules(),
        ApiService.getSessions(),
        ApiService.getDepartments()
      ]);

      const myModules = Array.isArray(modules) ? modules.filter(m => m.professor_id === user.id) : [];
      
      const myDepIds = [...new Set(myModules.map(m => m.department_id).filter(id => id !== null))];
      const filteredDeps = Array.isArray(departments) ? departments.filter(d => myDepIds.includes(d.id)) : [];
      setMyDepartments(filteredDeps);

      const profSessions = Array.isArray(sessions) ? sessions.filter(s => s.professor_id === user.id) : [];
      setAllSessions(profSessions);

      const todayStr = navigatorDays[0].date;
      setStats({
        today: profSessions.filter(s => s.date === todayStr).length,
        total: myModules.length
      });
    } catch (err) {
      console.error(err);
      setAllSessions([]);
      setMyDepartments([]);
    } finally {
      setLoading(false);
    }
  }, [user.id, navigatorDays]);

  useEffect(() => { if (isFocused) fetchData(); }, [isFocused, fetchData]);

  const activeDay = navigatorDays[selectedDayIndex];
  const displayedAgenda = useMemo(() => {
    return allSessions.filter(s => s.date === activeDay.date || (!s.date && s.day === activeDay.fullDay));
  }, [allSessions, activeDay]);

  if (loading && !myDepartments.length && !allSessions.length) return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} color={theme.colors.primary} />}>
      <ScreenHeader title={`Welcome, Prof. ${user?.name?.split(' ')[0]}`} subtitle="Departmental Oversight" />
      <View style={styles.content}>
        <View style={styles.statsRow}>
          <StatCard title="Today's Load" value={stats.today.toString()} icon="time" color={theme.colors.primary} />
          <StatCard title="My Modules" value={stats.total.toString()} icon="book" color={theme.colors.success} />
        </View>

        <Text style={styles.sectionTitle}>Agenda Navigator</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roulette}>
          {navigatorDays.map((d, index) => (
            <TouchableOpacity key={d.id} style={[styles.dayTab, selectedDayIndex === index && styles.activeDayTab]} onPress={() => setSelectedDayIndex(index)}>
              <Text style={[styles.dayLabel, selectedDayIndex === index && styles.activeDayLabel]}>{d.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {displayedAgenda.length === 0 ? (
          <Card style={styles.emptyCard}><Text style={styles.emptyText}>No classes scheduled for {activeDay.label}.</Text></Card>
        ) : (
          displayedAgenda.map(session => (
            <Card key={session.id} style={styles.agendaCard} onPress={() => navigation.navigate('ProfessorModuleDetail', { module: { id: session.module_id, name: session.module_name } })}>
              <View style={styles.agendaRow}>
                <View style={styles.timeLabel}><Text style={styles.startText}>{session.start_time}</Text></View>
                <View style={styles.agendaBody}>
                  <Text style={styles.agendaModule}>{session.module_name}</Text>
                  <Text style={styles.locText}>{session.room_name} · {session.type}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('AttendanceManagement', { session })}>
                  <Ionicons name="checkbox" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Your Academic Departments</Text>
        {myDepartments.length === 0 ? <Text style={styles.emptyText}>No departments assigned.</Text> :
          myDepartments.map(dep => (
            <Card key={dep.id} style={styles.depCard} onPress={() => navigation.navigate('ProfessorFilieres', { department: dep })}>
              <View style={styles.row}>
                <View style={styles.iconBox}><Ionicons name="business" size={22} color={theme.colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.depName}>{dep.name}</Text>
                  <Text style={styles.depSub}>Manage your programs here</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
              </View>
            </Card>
          ))
        }
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: theme.spacing.md },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 24, marginBottom: 12 },
  roulette: { flexDirection: 'row', marginBottom: 16 },
  dayTab: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: theme.colors.card, borderRadius: 12, marginRight: 10, borderWidth: 1, borderColor: theme.colors.border },
  activeDayTab: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  dayLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.textSecondary },
  activeDayLabel: { color: '#FFF' },
  agendaCard: { marginBottom: 10, padding: 12, borderLeftWidth: 4, borderLeftColor: theme.colors.primary },
  agendaRow: { flexDirection: 'row', alignItems: 'center' },
  timeLabel: { width: 70 },
  startText: { fontSize: 14, fontWeight: '800' },
  agendaBody: { flex: 1 },
  agendaModule: { fontSize: 15, fontWeight: '700' },
  locText: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
  depCard: { marginBottom: 10, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  depName: { fontSize: 16, fontWeight: '700' },
  depSub: { fontSize: 12, color: theme.colors.textSecondary },
  emptyCard: { padding: 30, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: theme.colors.border },
  emptyText: { color: theme.colors.textMuted, fontSize: 14, textAlign: 'center' }
});
