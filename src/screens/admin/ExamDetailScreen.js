import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Platform, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

export default function ExamDetailScreen({ navigation, route }) {
  const { exam: initialExam } = route.params;
  const [exam, setExam] = useState(initialExam);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [newDate, setNewDate] = useState(initialExam.date);
  const [newStart, setNewStart] = useState(initialExam.start_time);
  const [newEnd, setNewEnd] = useState(initialExam.end_time);
  const [selectedRoomId, setSelectedRoomId] = useState(initialExam.room_id);
  const [saving, setSaving] = useState(false);

  const fetchExamDetails = useCallback(async () => {
    setLoading(true);
    try {
      const [allStudents, allModules, allExams, allRooms] = await Promise.all([
        ApiService.getStudents(),
        ApiService.getModules(),
        ApiService.getExams(),
        ApiService.getRooms()
      ]);

      const freshExam = allExams.find(e => e.id === exam.id);
      if (freshExam) setExam(freshExam);

      const currentModule = allModules.find(m => m.id === exam.module_id);
      const enrolled = allStudents.filter(s => s.filiere_id === currentModule?.filiere_id);
      setStudents(enrolled);
      setRooms(allRooms.filter(r => r.status === 'active'));
    } catch (err) {
      console.error('Error fetching exam details:', err);
    } finally {
      setLoading(false);
    }
  }, [exam.id]);

  useEffect(() => { fetchExamDetails(); }, [fetchExamDetails]);

  const handleUpdateExam = async () => {
    setSaving(true);
    try {
      await ApiService.updateExam(exam.id, {
        date: newDate,
        start_time: newStart,
        end_time: newEnd,
        room_id: selectedRoomId
      });
      
      setIsEditing(false);
      fetchExamDetails();
      const msg = 'Exam updated and audit log recorded.';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Success', msg);
    } catch (err) {
      alert('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const openGps = () => {
    if (exam.room_gps) {
      Linking.openURL(exam.room_gps).catch(() => alert("Could not open maps"));
    }
  };

  if (loading && !isEditing) return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Exam Control" 
        subtitle={`Session #${exam.id}`} 
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.headerCard}>
          <View style={styles.statusRow}>
            <View style={styles.badge}><Text style={styles.badgeText}>{exam.type}</Text></View>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editScheduleBtn}>
              <Ionicons name={isEditing ? "close-circle" : "create-outline"} size={18} color={theme.colors.primary} />
              <Text style={styles.editText}>{isEditing ? "Cancel" : "Modify"}</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.moduleName}>{exam.module_name}</Text>
          <Text style={styles.profName}>{exam.filiere_name} Program</Text>

          {isEditing ? (
            <View style={styles.editForm}>
              <Text style={styles.labelSmall}>DATE & TIME</Text>
              <TextInput style={styles.input} value={newDate} onChangeText={setNewDate} type={Platform.OS === 'web' ? 'date' : 'default'} />
              
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.labelSmall}>START</Text>
                  <TextInput style={styles.input} value={newStart} onChangeText={setNewStart} type={Platform.OS === 'web' ? 'time' : 'default'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.labelSmall}>END</Text>
                  <TextInput style={styles.input} value={newEnd} onChangeText={setNewEnd} type={Platform.OS === 'web' ? 'time' : 'default'} />
                </View>
              </View>

              <Text style={[styles.labelSmall, { marginTop: 12 }]}>EXAMINATION ROOM</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomPicker}>
                {rooms.map(r => (
                  <TouchableOpacity 
                    key={r.id} 
                    style={[styles.roomChip, selectedRoomId === r.id && styles.activeRoomChip]}
                    onPress={() => setSelectedRoomId(r.id)}
                  >
                    <Text style={[styles.roomChipText, selectedRoomId === r.id && styles.activeRoomChipText]}>{r.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Button title="Save All Changes" loading={saving} onPress={handleUpdateExam} />
            </View>
          ) : (
            <View style={styles.detailsList}>
              <DetailRow icon="calendar" label="DATE" value={exam.date} color={theme.colors.primary} />
              <DetailRow icon="time" label="TIME" value={`${exam.start_time} - ${exam.end_time}`} color="#10B981" />
              <DetailRow icon="location" label="ROOM" value={exam.room_name} color="#F59E0B" />
              {exam.room_gps && (
                <TouchableOpacity onPress={openGps} style={styles.gpsLink}>
                  <Ionicons name="map" size={14} color={theme.colors.primary} />
                  <Text style={styles.gpsText}>View GPS Location</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Card>

        <Text style={styles.sectionTitle}>Eligible Students ({students.length})</Text>
        {students.map((stu) => (
          <Card key={stu.id} style={styles.stuCard}>
            <View style={styles.stuRow}>
              <View style={styles.stuAvatar}><Text style={styles.stuAvatarText}>{stu.name.charAt(0)}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stuName}>{stu.name}</Text>
                <Text style={styles.stuMeta}>{stu.registration_number || 'STU-NEW'}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            </View>
          </Card>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, label, value, color }) {
  return (
    <View style={styles.detailItem}>
      <View style={[styles.detailIcon, { backgroundColor: color + '15' }]}><Ionicons name={icon} size={18} color={color} /></View>
      <View>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: theme.spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: { padding: 20, marginTop: 16 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  badge: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: theme.colors.primary, fontSize: 11, fontWeight: '800' },
  editScheduleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  editText: { fontSize: 13, fontWeight: '700', color: theme.colors.primary },
  moduleName: { fontSize: 22, fontWeight: '800', color: theme.colors.text },
  profName: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 20 },
  detailsList: { gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.border },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  detailLabel: { fontSize: 9, fontWeight: '800', color: theme.colors.textMuted },
  detailValue: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  gpsLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, marginLeft: 48 },
  gpsText: { fontSize: 12, color: theme.colors.primary, fontWeight: '700' },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: theme.colors.textMuted, marginTop: 32, marginBottom: 12, textTransform: 'uppercase' },
  stuCard: { marginBottom: 8, padding: 12 },
  stuRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stuAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  stuAvatarText: { color: theme.colors.textSecondary, fontWeight: '700' },
  stuName: { fontSize: 14, fontWeight: '700' },
  stuMeta: { fontSize: 12, color: theme.colors.textMuted },
  editForm: { gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.border },
  labelSmall: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted },
  input: { backgroundColor: theme.colors.accent, padding: 12, borderRadius: 10, fontSize: 14, borderWidth: 1, borderColor: theme.colors.border },
  row: { flexDirection: 'row', gap: 12 },
  roomPicker: { flexDirection: 'row', marginVertical: 10 },
  roomChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: theme.colors.accent, marginRight: 8, borderWidth: 1, borderColor: theme.colors.border },
  activeRoomChip: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  roomChipText: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  activeRoomChipText: { color: '#FFF' }
});
