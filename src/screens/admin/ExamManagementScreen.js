import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

export default function ExamManagementScreen({ navigation }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ApiService.getExams();
      setExams(data);
    } catch (err) {
      console.error('Fetch exams error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchExams();
    }
  }, [isFocused, fetchExams]);

  const renderExam = ({ item }) => (
    <Card 
      key={item.id} 
      style={styles.examCard}
      onPress={() => navigation.navigate('ExamDetail', { exam: item })}
    >
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name="document-attach" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.module}>{item.module_name}</Text>
            <View style={[styles.statusBadge, item.status === 'Draft' && styles.statusDraft]}>
              <Text style={[styles.statusText, item.status === 'Draft' && styles.statusTextDraft]}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.meta}>{item.filiere_name} • {item.type}</Text>
          
          <View style={styles.footerRow}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={14} color={theme.colors.textMuted} />
              <Text style={styles.infoText}>{item.date}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={14} color={theme.colors.textMuted} />
              <Text style={styles.infoText}>{item.room_name}</Text>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Exam Control" 
        subtitle="Schedule and oversee formal assessments" 
      />
      <FlatList
        data={exams}
        renderItem={renderExam}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <Button 
            title="Create New Exam Session" 
            icon="add" 
            style={styles.addBtn} 
            onPress={() => navigation.navigate('CreateExam')}
          />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={theme.colors.border} />
              <Text style={styles.emptyText}>No exams scheduled yet.</Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchExams} color={theme.colors.primary} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  addBtn: { marginBottom: theme.spacing.xl },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: theme.spacing.md },
  examCard: { marginBottom: theme.spacing.md, padding: theme.spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  iconWrap: { width: 48, height: 48, borderRadius: 12, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md },
  body: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  module: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: theme.colors.primary + '15' },
  statusDraft: { backgroundColor: theme.colors.accent },
  statusText: { fontSize: 9, fontWeight: '800', color: theme.colors.primary, textTransform: 'uppercase' },
  statusTextDraft: { color: theme.colors.textSecondary },
  meta: { fontSize: 13, color: theme.colors.textSecondary },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg, marginTop: 10 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 12, color: theme.colors.textMuted, fontWeight: '500' },
  editBtn: { padding: 4 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 16, color: theme.colors.textMuted, fontSize: 15, fontWeight: '500' }
});
