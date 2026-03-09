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

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      // 1. Process Sessions: Only for student's filiere AND Date >= Today
      const sessFilt = sessions
        .filter(s => s.filiere_id === user.filiere_id && (s.date >= todayStr || !s.date))
        .map(s => ({ ...s, isExam: false }));

      // 2. Process Exams: Date >= Today
      // Note: Backend might not return filiere_id for exams directly, we check module_id presence
      const examFilt = exams
        .filter(e => e.date >= todayStr)
        .map(e => ({ ...e, isExam: true, type: `Exam (${e.type})` }));

      // 3. Combine and Sort by Date
      const combined = [...sessFilt, ...examFilt].sort((a, b) => {
        const dA = a.date || '2099-12-31';
        const dB = b.date || '2099-12-31';
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
          <Text style={styles.dayText}>{item.day || 'Date'}</Text>
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
      <ScreenHeader title="My Curriculum" subtitle="Upcoming sessions and exams" />
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={theme.colors.primary} size="large" /></View>
      ) : (
        <FlatList
          data={schedule}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.isExam ? 'e' : 's'}-${item.id}-${index}`}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} color={theme.colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={48} color={theme.colors.border} />
              <Text style={styles.emptyText}>No upcoming activities found.</Text>
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
  typeBadge: { backgroundColor: theme.colors.primaryLight + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeText: { fontSize: 10, fontWeight: '800', color: theme.colors.primary },
  examBadge: { backgroundColor: theme.colors.error + '10' },
  examTypeText: { color: theme.colors.error },
  roomText: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  timeText: { fontSize: 12, color: theme.colors.textMuted },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, color: theme.colors.textMuted, fontSize: 15 }
});
