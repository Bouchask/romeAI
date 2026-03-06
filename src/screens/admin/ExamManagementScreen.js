import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Button } from '../../components/Button';

const EXAMS = [
  { id: '1', module: 'Algorithms', room: 'Room 101', filiere: 'Computer Science', date: 'Mar 15', status: 'Published' },
  { id: '2', module: 'Database Systems', room: 'Room 205', filiere: 'Computer Science', date: 'Mar 18', status: 'Draft' },
];

export default function ExamManagementScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader 
        title="Exam Control" 
        subtitle="Schedule and oversee formal assessments" 
      />
      <View style={styles.content}>
        <Button 
          title="Create New Exam Session" 
          icon="add" 
          style={styles.addBtn} 
          onPress={() => navigation.navigate('CreateExam')}
        />

        <Text style={styles.sectionTitle}>Active Schedules</Text>
        {EXAMS.map((e) => (
          <Card 
            key={e.id} 
            style={styles.examCard}
            onPress={() => navigation.navigate('ExamDetail', { exam: e })}
          >
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Ionicons name="document-attach" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <Text style={styles.module}>{e.module}</Text>
                  <View style={[styles.statusBadge, e.status === 'Draft' && styles.statusDraft]}>
                    <Text style={[styles.statusText, e.status === 'Draft' && styles.statusTextDraft]}>{e.status}</Text>
                  </View>
                </View>
                <Text style={styles.meta}>{e.filiere}</Text>
                
                <View style={styles.footerRow}>
                  <View style={styles.infoItem}>
                    <Ionicons name="calendar-outline" size={14} color={theme.colors.textMuted} />
                    <Text style={styles.infoText}>{e.date}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="location-outline" size={14} color={theme.colors.textMuted} />
                    <Text style={styles.infoText}>{e.room}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.editBtn}>
                <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
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
});
