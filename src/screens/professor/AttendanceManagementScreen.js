import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { STUDENTS } from '../../data/mockData';

export default function AttendanceManagementScreen({ navigation, route }) {
  const [attendance, setAttendance] = useState(
    STUDENTS.reduce((acc, s) => ({ ...acc, [s.id]: 'present' }), {})
  );

  const SITUATIONS = [
    { label: 'P', value: 'present', color: theme.colors.success, full: 'Present' },
    { label: 'L', value: 'late', color: theme.colors.warning, full: 'Late' },
    { label: 'E', value: 'excused', color: theme.colors.info, full: 'Excused' },
    { label: 'A', value: 'absent', color: theme.colors.error, full: 'Absent' },
  ];

  const setStatus = (id, status) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const renderStudent = ({ item }) => {
    const currentStatus = attendance[item.id] || 'present';
    const activeSituation = SITUATIONS.find(s => s.value === currentStatus);

    return (
      <Card style={styles.studentCard}>
        <View style={styles.studentInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.studentId}>ID: STU-2024-{item.id}</Text>
          </View>
        </View>
        
        <View style={styles.selectorRow}>
          {SITUATIONS.map((sit) => (
            <TouchableOpacity 
              key={sit.value}
              onPress={() => setStatus(item.id, sit.value)}
              style={[
                styles.sitBtn, 
                currentStatus === sit.value && { backgroundColor: sit.color }
              ]}
            >
              <Text style={[
                styles.sitLabel,
                currentStatus === sit.value && styles.sitLabelActive
              ]}>{sit.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    );
  };

  const stats = {
    total: STUDENTS.length,
    present: Object.values(attendance).filter(v => v === 'present' || v === 'late').length,
    absent: Object.values(attendance).filter(v => v === 'absent').length,
  };

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Session Attendance" 
        subtitle="Mark student presence for Database Systems"
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{stats.total}</Text>
          <Text style={styles.statLabel}>ENROLLED</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statVal, { color: theme.colors.success }]}>{stats.present}</Text>
          <Text style={styles.statLabel}>PRESENT</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statVal, { color: theme.colors.error }]}>{stats.absent}</Text>
          <Text style={styles.statLabel}>ABSENT</Text>
        </View>
      </View>

      <FlatList
        data={STUDENTS}
        renderItem={renderStudent}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <Button 
          title="Submit Attendance Report" 
          onPress={() => alert('Attendance Saved!')}
          style={styles.submitBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  statsRow: { 
    flexDirection: 'row', 
    backgroundColor: theme.colors.card,
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  statLabel: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted, marginTop: 4 },
  statDivider: { width: 1, height: '100%', backgroundColor: theme.colors.border },
  list: { paddingHorizontal: theme.spacing.lg, paddingBottom: 100 },
  studentCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  studentInfo: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, flex: 1 },
  avatar: { width: 36, height: 36, borderRadius: 8, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', color: theme.colors.primary },
  nameBlock: {},
  studentName: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  studentId: { fontSize: 11, color: theme.colors.textMuted, marginTop: 1 },
  selectorRow: { flexDirection: 'row', gap: 6 },
  sitBtn: { 
    width: 32, 
    height: 32, 
    borderRadius: 6, 
    backgroundColor: theme.colors.accent, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sitLabel: { fontSize: 12, fontWeight: '800', color: theme.colors.textSecondary },
  sitLabelActive: { color: '#FFF' },
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: theme.spacing.lg, 
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  submitBtn: { ...theme.shadows.md },
});
