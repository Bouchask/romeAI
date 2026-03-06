import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';

// Simulated session data for all modules
const ALL_SESSIONS = [
  { id: '1', module: 'Database Systems', type: 'Lecture', room: '101', date: 'Mar 10', time: '09:00 - 10:30', status: 'Scheduled' },
  { id: '2', module: 'Web Development', type: 'Lab', room: '205', date: 'Mar 11', time: '14:00 - 15:30', status: 'Scheduled' },
  { id: '3', module: 'Database Systems', type: 'TD', room: '203', date: 'Mar 15', time: '10:30 - 12:00', status: 'Draft' },
  { id: '4', module: 'Database Systems', type: 'Exam', room: 'Hall A', date: 'Apr 02', time: '09:00 - 12:00', status: 'Upcoming' },
];

export default function ModuleSessionsScreen({ navigation, route }) {
  const { moduleName } = route.params || { moduleName: 'Module Sessions' };
  
  // Filter sessions for this specific module
  const filteredSessions = ALL_SESSIONS.filter(s => s.module === moduleName);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader 
        title={moduleName} 
        subtitle="All scheduled activities and exams" 
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>{filteredSessions.length} Total Sessions Found</Text>
        </View>

        {filteredSessions.length > 0 ? (
          filteredSessions.map((s) => (
            <Card 
              key={s.id} 
              style={styles.sessionCard}
              onPress={() => navigation.navigate('SessionDetail', { session: s })}
            >
              <View style={styles.row}>
                <View style={styles.body}>
                  <View style={styles.titleRow}>
                    <Text style={styles.typeText}>{s.type}</Text>
                    <View style={[styles.statusBadge, s.status === 'Draft' && styles.statusDraft]}>
                      <Text style={[styles.statusText, s.status === 'Draft' && styles.statusTextDraft]}>{s.status}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={14} color={theme.colors.textMuted} />
                    <Text style={styles.meta}>{s.date} · {s.time}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={14} color={theme.colors.textMuted} />
                    <Text style={styles.meta}>Room {s.room}</Text>
                  </View>
                </View>
                
                <Ionicons name="chevron-forward" size={20} color={theme.colors.border} />
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-clear-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>No sessions found for this module</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  summaryCard: { marginBottom: theme.spacing.lg, paddingHorizontal: 4 },
  summaryText: { fontSize: 14, fontWeight: '700', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  sessionCard: { marginBottom: theme.spacing.md, padding: theme.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  body: { flex: 1, gap: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  typeText: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  statusBadge: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusDraft: { backgroundColor: theme.colors.accent },
  statusText: { fontSize: 10, fontWeight: '800', color: theme.colors.primary, textTransform: 'uppercase' },
  statusTextDraft: { color: theme.colors.textSecondary },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  meta: { fontSize: 13, color: theme.colors.textSecondary },
  emptyState: { alignItems: 'center', marginTop: 100, gap: 16 },
  emptyText: { fontSize: 15, color: theme.colors.textMuted, fontWeight: '500' }
});
