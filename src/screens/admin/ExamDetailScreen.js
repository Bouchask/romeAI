import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export default function ExamDetailScreen({ navigation, route }) {
  const { exam } = route.params || { exam: { module: 'Exam', room: '---', filiere: '---', date: '---', status: 'Draft' } };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader 
        title={exam.module} 
        subtitle="Exam Session Control" 
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      <View style={styles.content}>
        <Card style={styles.mainCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, exam.status === 'Draft' && styles.draftBadge]}>
              <Text style={[styles.statusText, exam.status === 'Draft' && styles.draftText]}>{exam.status}</Text>
            </View>
            <Text style={styles.sessionType}>Normal Session - S1</Text>
          </View>
          
          <Text style={styles.moduleName}>{exam.module}</Text>
          <Text style={styles.filiereName}>{exam.filiere}</Text>

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Ionicons name="calendar" size={20} color={theme.colors.primary} />
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoVal}>{exam.date}</Text>
            </View>
            <View style={styles.infoBox}>
              <Ionicons name="location" size={20} color={theme.colors.primary} />
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoVal}>{exam.room}</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.label}>Logistics & Staffing</Text>
        <Card noPadding>
          <View style={styles.row}>
            <Ionicons name="people" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.rowText}>120 Enrolled Students</Text>
          </View>
          <View style={styles.dividerLight} />
          <View style={styles.row}>
            <Ionicons name="person-circle" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.rowText}>4 Proctors Assigned</Text>
          </View>
        </Card>

        <View style={styles.actions}>
          <Button title="Edit Exam Schedule" variant="outline" onPress={() => {}} />
          <Button title="Publish to Students" onPress={() => alert('Exam Published!')} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  mainCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.xl },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  statusBadge: { backgroundColor: theme.colors.success + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  draftBadge: { backgroundColor: theme.colors.accent },
  statusText: { fontSize: 10, fontWeight: '800', color: theme.colors.success, textTransform: 'uppercase' },
  draftText: { color: theme.colors.textSecondary },
  sessionType: { fontSize: 12, fontWeight: '600', color: theme.colors.textMuted },
  moduleName: { fontSize: 22, fontWeight: '800', color: theme.colors.text },
  filiereName: { fontSize: 15, color: theme.colors.textSecondary, marginTop: 4 },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.lg },
  dividerLight: { height: 1, backgroundColor: theme.colors.accent },
  infoGrid: { flexDirection: 'row', gap: theme.spacing.xl },
  infoBox: { flex: 1, gap: 4 },
  infoLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.textMuted, textTransform: 'uppercase' },
  infoVal: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  label: { fontSize: 13, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: theme.spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: theme.spacing.md },
  rowText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  actions: { marginTop: theme.spacing.xxl, gap: theme.spacing.md },
});
