import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { ApiService } from '../../services/api';

export default function StudentScheduleScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sessions, exams] = await Promise.all([
        ApiService.getSessions(),
        ApiService.getExams()
      ]);

      const today = new Date().toISOString().split('T')[0];

      // Filter: Only for student's filiere AND only future/today
      const sessFilt = sessions
        .filter(s => s.module_obj?.filiere_id === user.filiere_id && (s.date >= today || !s.date))
        .map(s => ({ ...s, isExam: false }));

      const examFilt = exams
        .filter(e => e.module_id && e.date >= today) // Assuming module_id presence check
        .map(e => ({ ...e, isExam: true, type: `Exam (${e.type})` }));

      const combined = [...sessFilt, ...examFilt].sort((a, b) => {
        const dA = a.date || '2024-01-01';
        const dB = b.date || '2024-01-01';
        return dA.localeCompare(dB);
      });

      setSchedule(combined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user.filiere_id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const renderItem = ({ item }) => (
    <Card 
      style={[styles.itemCard, item.isExam && styles.examBorder]}
      onPress={() => navigation.navigate('SessionDetail', { session: item })}
    >
      <View style={styles.row}>
        <View style={styles.timeBlock}>
          <Text style={styles.dayText}>{item.day || 'Scheduled'}</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.body}>
          <Text style={styles.moduleName}>{item.module_name}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.typeBadge, item.isExam && styles.examBadge]}>
              <Text style={[styles.typeText, item.isExam && styles.examTypeText]}>{item.type}</Text>
            </View>
            <Text style={styles.roomText}>{item.room_name}</Text>
          </View>
          <Text style={styles.timeText}>{item.start_time} - {item.end_time}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.border} />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="My Schedule" subtitle="Your upcoming program activities" />
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={theme.colors.primary} size="large" /></View>
      ) : (
        <FlatList
          data={schedule}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.isExam ? 'e' : 's'}-${item.id}-${index}`}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={48} color={theme.colors.border} />
              <Text style={styles.emptyText}>No upcoming sessions or exams found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  list: { padding: theme.spacing.lg },
  center: { flex: 1, justifyContent: 'center' },
  itemCard: { marginBottom: 12, padding: 12 },
  examBorder: { borderLeftWidth: 4, borderLeftColor: theme.colors.error },
  row: { flexDirection: 'row', alignItems: 'center' },
  timeBlock: { width: 80, alignItems: 'center' },
  dayText: { fontSize: 13, fontWeight: '800', color: theme.colors.text },
  dateText: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  divider: { width: 1, height: 40, backgroundColor: theme.colors.border, marginHorizontal: 12 },
  body: { flex: 1 },
  moduleName: { fontSize: 15, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  typeBadge: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeText: { fontSize: 10, fontWeight: '800', color: theme.colors.primary },
  examBadge: { backgroundColor: theme.colors.error + '15' },
  examTypeText: { color: theme.colors.error },
  roomText: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  timeText: { fontSize: 12, color: theme.colors.textMuted },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, color: theme.colors.textMuted, fontSize: 15 }
});
