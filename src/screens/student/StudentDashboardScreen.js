import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StatCard } from '../../components/StatCard';
import { FILIERES, MODULES } from '../../data/mockData';

const TODAY_CLASSES = [
  { id: '1', module: 'Algorithms', professor: 'Dr. Jane Smith', room: '101', time: '09:00 - 10:30', status: 'Upcoming' },
  { id: '2', module: 'Database Systems', professor: 'Prof. John Doe', room: '205', time: '14:00 - 15:30', status: 'Afternoon' },
];

export default function StudentDashboardScreen({ navigation }) {
  const { user } = useAuth();
  
  const userName = user?.name?.split(' ')[0] || 'Student';
  const studentFiliereId = user?.filiereId || 'f1';
  const filiereObj = FILIERES.find(f => f.id === studentFiliereId);
  const studentFiliere = filiereObj ? filiereObj.name : 'Computer Science';

  const myModules = MODULES.filter(m => m.filiereId === studentFiliereId);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
          <StatCard title="Today's Classes" value="2" icon="calendar" color={theme.colors.primary} />
          <StatCard title="My Modules" value={myModules.length.toString()} icon="library" color={theme.colors.success} />
        </View>

        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        {TODAY_CLASSES.map((c) => (
          <Card 
            key={c.id} 
            style={styles.scheduleCard}
            onPress={() => navigation?.navigate('SessionDetail', { session: c })}
          >
            <View style={styles.cardHeader}>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleTitle}>{c.module}</Text>
                <Text style={styles.professorName}>{c.professor}</Text>
              </View>
              <View style={[styles.statusBadge, c.status === 'Upcoming' ? styles.upcomingBadge : styles.afternoonBadge]}>
                <Text style={[styles.statusText, c.status === 'Upcoming' ? styles.upcomingText : styles.afternoonText]}>
                  {c.status}
                </Text>
              </View>
            </View>
            
            <View style={styles.cardFooter}>
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={16} color={theme.colors.textMuted} />
                <Text style={styles.infoText}>{c.room}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={16} color={theme.colors.textMuted} />
                <Text style={styles.infoText}>{c.time}</Text>
              </View>
            </View>
          </Card>
        ))}

        <Text style={styles.sectionTitle}>My Learning Path</Text>
        <Card noPadding>
          {myModules.map((m, i, arr) => (
            <TouchableOpacity 
              key={m.id} 
              style={[styles.moduleItem, i === arr.length - 1 && styles.lastItem]}
              onPress={() => navigation?.navigate('SessionDetail', { session: { module: m.name, room: 'TBA', time: 'Weekly' } })}
            >
              <View style={styles.moduleIcon}>
                <Ionicons name="journal-outline" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.moduleName}>{m.name}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ))}
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
});
