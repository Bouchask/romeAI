import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { ApiService } from '../../services/api';

export default function StudentExamScheduleScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allExams, allModules] = await Promise.all([
        ApiService.getExams(),
        ApiService.getModules()
      ]);

      const today = new Date().toISOString().split('T')[0];

      // 1. Find modules belonging to student's filiere
      const myModuleIds = allModules
        .filter(m => m.filiere_id === user.filiere_id)
        .map(m => m.id);

      // 2. Filter exams: module in filiere AND date >= today
      const filtered = allExams
        .filter(e => myModuleIds.includes(e.module_id) && e.date >= today)
        .sort((a, b) => b.date.localeCompare(a.date)); // Descending order

      setExams(filtered);
    } catch (err) {
      console.error('Fetch student exams error:', err);
    } finally {
      setLoading(false);
    }
  }, [user.filiere_id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const renderExam = ({ item }) => (
    <Card 
      style={styles.examCard}
      onPress={() => navigation.navigate('SessionDetail', { session: { ...item, isExam: true, type: `Exam (${item.type})` } })}
    >
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name="document-text" size={24} color={theme.colors.error} />
        </View>
        <View style={styles.body}>
          <Text style={styles.moduleName}>{item.module_name}</Text>
          <Text style={styles.typeText}>{item.type} Assessment</Text>
          
          <View style={styles.footerRow}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={14} color={theme.colors.textMuted} />
              <Text style={styles.infoText}>{item.date}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={14} color={theme.colors.textMuted} />
              <Text style={styles.infoText}>{item.start_time} - {item.end_time}</Text>
            </View>
          </View>
          <View style={[styles.infoItem, { marginTop: 6 }]}>
            <Ionicons name="location-outline" size={14} color={theme.colors.textMuted} />
            <Text style={styles.infoText}>{item.room_name}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.border} />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Exam Schedule" subtitle="Your upcoming program assessments" />
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={theme.colors.primary} size="large" /></View>
      ) : (
        <FlatList
          data={exams}
          renderItem={renderExam}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={48} color={theme.colors.border} />
              <Text style={styles.emptyText}>No upcoming exams found for your program.</Text>
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
  examCard: { marginBottom: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: theme.colors.error },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.error + '10', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  body: { flex: 1 },
  moduleName: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  typeText: { fontSize: 12, color: theme.colors.error, fontWeight: '600', marginTop: 2 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 10 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '500' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, color: theme.colors.textMuted, fontSize: 15 }
});
