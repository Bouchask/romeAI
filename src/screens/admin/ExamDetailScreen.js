import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Platform, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [newDate, setNewDate] = useState(new Date(initialExam.date));
  const [newStart, setNewStart] = useState(() => {
    const d = new Date();
    const [h, m] = initialExam.start_time.split(':');
    d.setHours(parseInt(h), parseInt(m), 0, 0);
    return d;
  });
  const [newEnd, setNewEnd] = useState(() => {
    const d = new Date();
    const [h, m] = initialExam.end_time.split(':');
    d.setHours(parseInt(h), parseInt(m), 0, 0);
    return d;
  });
  const [selectedRoomId, setSelectedRoomId] = useState(initialExam.room_id);
  const [saving, setSaving] = useState(false);

  // Picker visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

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
      if (freshExam) {
        setExam(freshExam);
        setNewDate(new Date(freshExam.date));
        const [sh, sm] = freshExam.start_time.split(':');
        const [eh, em] = freshExam.end_time.split(':');
        const d1 = new Date(); d1.setHours(parseInt(sh), parseInt(sm), 0, 0);
        const d2 = new Date(); d2.setHours(parseInt(eh), parseInt(em), 0, 0);
        setNewStart(d1);
        setNewEnd(d2);
      }

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

  const formatDate = (date) => {
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const handleUpdateExam = async () => {
    // Time Validation: start < end and within university intervals
    const startH = newStart.getHours();
    const startM = newStart.getMinutes();
    const endH = newEnd.getHours();
    const endM = newEnd.getMinutes();
    
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (startTotal >= endTotal) {
      const msg = 'End time must be after start time.';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Invalid Time', msg);
      return;
    }

    const isMorning = (startTotal >= 8 * 60 && endTotal <= 12 * 60);
    const isAfternoon = (startTotal >= 14 * 60 && endTotal <= 18 * 60);

    if (!isMorning && !isAfternoon) {
      const msg = 'Exams must be scheduled within standard intervals:\nMorning: 08:00 - 12:00\nAfternoon: 14:00 - 18:00';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Outside Hours', msg);
      return;
    }

    setSaving(true);
    try {
      const dateString = newDate.toISOString().split('T')[0];
      const startTimeString = newStart.getHours().toString().padStart(2, '0') + ':' + 
                              newStart.getMinutes().toString().padStart(2, '0');
      const endTimeString = newEnd.getHours().toString().padStart(2, '0') + ':' + 
                            newEnd.getMinutes().toString().padStart(2, '0');

      await ApiService.updateExam(exam.id, {
        date: dateString,
        start_time: startTimeString,
        end_time: endTimeString,
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
              <Text style={styles.labelSmall}>DATE</Text>
              {Platform.OS === 'web' ? (
                <TextInput
                  style={styles.input}
                  value={newDate.toISOString().split('T')[0]}
                  onChangeText={(val) => setNewDate(new Date(val))}
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <TouchableOpacity 
                  style={styles.dateDisplay}
                  onPress={() => {
                    setShowDatePicker(!showDatePicker);
                    setShowStartTimePicker(false);
                    setShowEndTimePicker(false);
                  }}
                >
                  <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.dateDisplayText}>{formatDate(newDate)}</Text>
                </TouchableOpacity>
              )}
              {!Platform.isWeb && showDatePicker && (
                <DateTimePicker
                  value={newDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(e, d) => { setShowDatePicker(Platform.OS === 'ios'); if(d) setNewDate(d); }}
                />
              )}
              
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.labelSmall}>START</Text>
                  {Platform.OS === 'web' ? (
                    <TextInput
                      style={styles.input}
                      value={newStart.getHours().toString().padStart(2, '0') + ':' + newStart.getMinutes().toString().padStart(2, '0')}
                      onChangeText={(val) => {
                        const [h, m] = val.split(':');
                        if (h && m) {
                          const d = new Date(newStart);
                          d.setHours(parseInt(h), parseInt(m));
                          setNewStart(d);
                        }
                      }}
                      placeholder="HH:mm"
                    />
                  ) : (
                    <TouchableOpacity 
                      style={styles.dateDisplay}
                      onPress={() => {
                        setShowStartTimePicker(!showStartTimePicker);
                        setShowDatePicker(false);
                        setShowEndTimePicker(false);
                      }}
                    >
                      <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                      <Text style={styles.dateDisplayText}>{formatTime(newStart)}</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.labelSmall}>END</Text>
                  {Platform.OS === 'web' ? (
                    <TextInput
                      style={styles.input}
                      value={newEnd.getHours().toString().padStart(2, '0') + ':' + newEnd.getMinutes().toString().padStart(2, '0')}
                      onChangeText={(val) => {
                        const [h, m] = val.split(':');
                        if (h && m) {
                          const d = new Date(newEnd);
                          d.setHours(parseInt(h), parseInt(m));
                          setNewEnd(d);
                        }
                      }}
                      placeholder="HH:mm"
                    />
                  ) : (
                    <TouchableOpacity 
                      style={styles.dateDisplay}
                      onPress={() => {
                        setShowEndTimePicker(!showEndTimePicker);
                        setShowDatePicker(false);
                        setShowStartTimePicker(false);
                      }}
                    >
                      <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                      <Text style={styles.dateDisplayText}>{formatTime(newEnd)}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {!Platform.isWeb && showStartTimePicker && (
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerHeader}>Select Start Time</Text>
                  <DateTimePicker
                    value={newStart}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(e, d) => { setShowStartTimePicker(Platform.OS === 'ios'); if(d) setNewStart(d); }}
                  />
                </View>
              )}

              {!Platform.isWeb && showEndTimePicker && (
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerHeader}>Select End Time</Text>
                  <DateTimePicker
                    value={newEnd}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(e, d) => { setShowEndTimePicker(Platform.OS === 'ios'); if(d) setNewEnd(d); }}
                  />
                </View>
              )}

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
  labelSmall: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted, marginBottom: 4 },
  input: { backgroundColor: theme.colors.accent, padding: 12, borderRadius: 10, fontSize: 14, borderWidth: 1, borderColor: theme.colors.border },
  dateDisplay: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: theme.colors.accent, 
    padding: 12, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: theme.colors.border,
    gap: 10
  },
  dateDisplayText: { fontSize: 14, color: theme.colors.text, fontWeight: '500' },
  dateDisplayActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight + '10' },
  row: { flexDirection: 'row', gap: 12, marginTop: 8 },
  roomPicker: { flexDirection: 'row', marginVertical: 10 },
  roomChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: theme.colors.accent, marginRight: 8, borderWidth: 1, borderColor: theme.colors.border },
  activeRoomChip: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  roomChipText: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  activeRoomChipText: { color: '#FFF' },
  pickerContainer: { 
    marginTop: 20, 
    padding: 15, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: theme.colors.border,
    ...theme.shadows.md,
    minHeight: 250,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pickerHeader: { 
    fontSize: 11, 
    fontWeight: '900', 
    color: theme.colors.primary, 
    marginBottom: 15, 
    textAlign: 'center', 
    textTransform: 'uppercase',
    letterSpacing: 2
  }
});
