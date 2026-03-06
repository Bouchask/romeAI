import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';

const EXAMS = [
  { id: '1', module: 'Algorithms', room: 'Room 101', date: 'Mar 15, 2025', time: '09:00', duration: '3h' },
  { id: '2', module: 'Database Systems', room: 'Room 205', date: 'Mar 18, 2025', time: '14:00', duration: '2h' },
  { id: '3', module: 'Operating Systems', room: 'Room 102', date: 'Mar 22, 2025', time: '10:00', duration: '3h' },
];

export default function StudentExamScheduleScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader 
        title="Exam Schedule" 
        subtitle="Dates, times & locations for finals" 
      />
      <View style={styles.content}>
        {EXAMS.map((e) => (
          <Card key={e.id} style={styles.examCard}>
            <View style={styles.cardRow}>
              <View style={styles.iconWrap}>
                <Ionicons name="document-text" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.body}>
                <View style={styles.headerRow}>
                  <Text style={styles.module}>{e.module}</Text>
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{e.duration}</Text>
                  </View>
                </View>
                
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.meta}>{e.date}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.meta}>{e.time}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="location-outline" size={14} color={theme.colors.primary} />
                    <Text style={[styles.meta, { color: theme.colors.primary, fontWeight: '600' }]}>{e.room}</Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  examCard: { marginBottom: theme.spacing.md, padding: theme.spacing.md },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  iconWrap: { width: 50, height: 50, borderRadius: 12, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md },
  body: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
  module: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  durationBadge: { backgroundColor: theme.colors.accent, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  durationText: { fontSize: 11, fontWeight: '700', color: theme.colors.textSecondary },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, marginTop: 4 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { fontSize: 13, color: theme.colors.textSecondary },
});
