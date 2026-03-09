import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

export default function AttendanceManagementScreen({ navigation, route }) {
  const { session } = route.params; // Can be a regular session or an exam object
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});

  const isExam = session.category === 'Exam';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allStudents, currentAtt] = await Promise.all([
        ApiService.getStudents(),
        ApiService.getAttendance(isExam ? { examId: session.id } : { sessionId: session.id })
      ]);

      const modules = await ApiService.getModules();
      const currentModule = modules.find(m => m.id === session.module_id);
      
      const enrolledStudents = allStudents.filter(s => s.filiere_id === currentModule?.filiere_id);
      setStudents(enrolledStudents);

      const initialAtt = {};
      enrolledStudents.forEach(s => {
        const found = currentAtt.find(a => a.student_id === s.id);
        initialAtt[s.id] = found ? found.status : 'present';
      });
      setAttendance(initialAtt);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [session, isExam]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const SITUATIONS = [
    { label: 'P', value: 'present', color: theme.colors.success },
    { label: 'L', value: 'late', color: theme.colors.warning },
    { label: 'E', value: 'excused', color: theme.colors.info },
    { label: 'A', value: 'absent', color: theme.colors.error },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const payload = Object.entries(attendance).map(([student_id, status]) => ({
        student_id: parseInt(student_id),
        session_id: isExam ? null : session.id,
        exam_id: isExam ? session.id : null,
        status,
        date: today
      }));

      await ApiService.submitAttendance(payload);
      const msg = 'Attendance report submitted successfully!';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Success', msg);
      navigation.goBack();
    } catch (err) {
      alert('Submission failed');
    } finally {
      setSaving(false);
    }
  };

  const renderStudent = ({ item }) => {
    const currentStatus = attendance[item.id] || 'present';
    return (
      <Card style={styles.studentCard}>
        <View style={styles.studentInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.studentId}>{item.registration_number || `ID: ${item.id}`}</Text>
          </View>
        </View>
        
        <View style={styles.selectorRow}>
          {SITUATIONS.map((sit) => (
            <TouchableOpacity 
              key={sit.value}
              onPress={() => setAttendance(p => ({...p, [item.id]: sit.value}))}
              style={[styles.sitBtn, currentStatus === sit.value && { backgroundColor: sit.color }]}
            >
              <Text style={[styles.sitLabel, currentStatus === sit.value && styles.sitLabelActive]}>{sit.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title={isExam ? "Exam Roll Call" : "Attendance"} 
        subtitle={session.module_name}
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      <FlatList
        data={students}
        renderItem={renderStudent}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No students found for this module.</Text>}
      />

      <View style={styles.footer}>
        <Button title="Save Attendance" loading={saving} onPress={handleSave} style={styles.submitBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: 'center' },
  list: { padding: theme.spacing.lg, paddingBottom: 100 },
  studentCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: 12 },
  studentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', color: theme.colors.primary },
  studentName: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  studentId: { fontSize: 11, color: theme.colors.textMuted },
  selectorRow: { flexDirection: 'row', gap: 6 },
  sitBtn: { width: 32, height: 32, borderRadius: 6, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  sitLabel: { fontSize: 12, fontWeight: '800', color: theme.colors.textSecondary },
  sitLabelActive: { color: '#FFF' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: theme.spacing.lg, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: theme.colors.border },
  empty: { textAlign: 'center', marginTop: 40, color: theme.colors.textMuted }
});
