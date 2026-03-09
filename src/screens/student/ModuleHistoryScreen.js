import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ModuleHistoryScreen({ navigation, route }) {
  const { module } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sessions, attendance] = await Promise.all([
        ApiService.getSessions(),
        ApiService.getAttendance({ studentId: user.id })
      ]);

      const today = new Date().toISOString().split('T')[0];

      // Filter sessions for this module
      const moduleSessions = sessions
        .filter(s => s.module_id === module.id)
        .map(s => {
          // Find student's attendance record for this session
          const att = attendance.find(a => a.session_id === s.id && a.student_id === user.id);
          
          let status = 'not market';
          let statusColor = theme.colors.textMuted;

          if (att) {
            status = att.status.toUpperCase();
            statusColor = att.status === 'present' ? theme.colors.success : theme.colors.error;
          } else if (s.date && s.date < today) {
            status = 'ABSENT (Auto)';
            statusColor = theme.colors.error;
          } else if (s.date && s.date > today) {
            status = 'UPCOMING';
            statusColor = theme.colors.primary;
          } else if (s.date === today) {
            status = 'TODAY (Mark Now)';
            statusColor = theme.colors.warning;
          }

          return { ...s, status, statusColor };
        })
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

      setHistory(moduleSessions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [module.id, user.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const renderItem = ({ item }) => (
    <Card style={styles.sessionCard} onPress={() => navigation.navigate('SessionDetail', { session: item })}>
      <View style={styles.row}>
        <View style={styles.dateBlock}>
          <Text style={styles.dayText}>{item.day || 'Day'}</Text>
          <Text style={styles.dateText}>{item.date || 'TBA'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.body}>
          <View style={styles.typeRow}>
            <Text style={styles.typeText}>{item.type}</Text>
            <View style={[styles.statusBadge, { backgroundColor: item.statusColor + '15' }]}>
              <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.timeText}>{item.start_time} - {item.end_time}</Text>
          <Text style={styles.roomText}>Room: {item.room_name}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title={module.name} 
        subtitle="Attendance History" 
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="journal-outline" size={48} color={theme.colors.border} />
              <Text style={styles.emptyText}>No sessions recorded for this module.</Text>
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
  sessionCard: { marginBottom: 12, padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  dateBlock: { width: 80, alignItems: 'center' },
  dayText: { fontSize: 13, fontWeight: '800' },
  dateText: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  divider: { width: 1, height: 40, backgroundColor: theme.colors.border, marginHorizontal: 12 },
  body: { flex: 1 },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  typeText: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800' },
  timeText: { fontSize: 12, color: theme.colors.textSecondary },
  roomText: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, color: theme.colors.textMuted, fontSize: 15 }
});
