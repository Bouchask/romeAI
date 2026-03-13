import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

const SESSION_TYPES = [
  { key: 'Cours', icon: 'book-outline', roomMatch: ['Classroom', 'Amphi'] },
  { key: 'TD', icon: 'flask-outline', roomMatch: ['Classroom', 'TD'] },
  { key: 'TP', icon: 'people-outline', roomMatch: ['Lab', 'TP'] },
];

const getNextTeachingDays = () => {
  const days = [];
  let current = new Date();
  while (days.length < 6) {
    current.setDate(current.getDate() + 1);
    if (current.getDay() !== 0) {
      const name = current.toLocaleDateString('en-US', { weekday: 'long' });
      const dateStr = current.toISOString().split('T')[0];
      const shortDate = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push({ name, date: dateStr, label: `${name} (${shortDate})` });
    }
  }
  return days;
};

export default function CreateSessionScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [myModules, setMyModules] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);

  // Form State
  const [selectedModule, setSelectedModule] = useState(null);
  const [sessionType, setSessionType] = useState('Cours');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDayObj, setSelectedDayObj] = useState(null);
  
  // Date and Time State Objects
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(11, 0, 0, 0);
    return d;
  });

  // Picker visibility
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [modules, allRooms] = await Promise.all([
        ApiService.getModules(),
        ApiService.getRooms()
      ]);
      setMyModules(modules.filter(m => m.professor_id === user.id));
      setRooms(allRooms.filter(r => r.status === 'active'));
      const nextDays = getNextTeachingDays();
      setAvailableDays(nextDays);
      setSelectedDayObj(nextDays[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatTime = (time) => {
    return time.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  // Dynamic Room Filtering based on sessionType
  const filteredRooms = rooms.filter(r => {
    const typeObj = SESSION_TYPES.find(t => t.key === sessionType);
    return typeObj.roomMatch.includes(r.type) || r.type === 'Classroom';
  });

  const handleCreate = async () => {
    if (!selectedModule || !selectedRoom || !selectedDayObj) {
      const msg = 'Select module, room and date';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Validation', msg);
      return;
    }

    // Time Validation
    const startTotal = startTime.getHours() * 60 + startTime.getMinutes();
    const endTotal = endTime.getHours() * 60 + endTime.getMinutes();

    if (startTotal >= endTotal) {
      const msg = 'End time must be after start time';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Invalid Time', msg);
      return;
    }

    const isMorning = (startTotal >= 8 * 60 && endTotal <= 12 * 60);
    const isAfternoon = (startTotal >= 14 * 60 && endTotal <= 18 * 60);

    if (!isMorning && !isAfternoon) {
      const msg = 'Classes must be scheduled within standard intervals:\nMorning: 08:00 - 12:00\nAfternoon: 14:00 - 18:00';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Outside Hours', msg);
      return;
    }

    setCreating(true);
    try {
      const startTimeString = startTime.getHours().toString().padStart(2, '0') + ':' + 
                              startTime.getMinutes().toString().padStart(2, '0');
      const endTimeString = endTime.getHours().toString().padStart(2, '0') + ':' + 
                            endTime.getMinutes().toString().padStart(2, '0');

      await ApiService.addSession({
        module_id: selectedModule.id,
        room_id: selectedRoom.id,
        type: sessionType,
        day: selectedDayObj.name,
        date: selectedDayObj.date,
        start_time: startTimeString,
        end_time: endTimeString
      });
      
      const successMsg = 'Session scheduled successfully!';
      if (Platform.OS === 'web') alert(successMsg); else Alert.alert('Success', successMsg);
      navigation.goBack();
    } catch (err) {
      const msg = typeof err === 'string' ? err : 'Error during scheduling';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Scheduling Error', msg);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Schedule Class" subtitle="Planning & Conflict Check" />

      <View style={styles.content}>
        <Text style={styles.label}>1. Select Module</Text>
        <View style={styles.chipRow}>
          {myModules.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.chip, selectedModule?.id === m.id && styles.chipActive]}
              onPress={() => setSelectedModule(m)}
            >
              <Text style={[styles.chipText, selectedModule?.id === m.id && styles.chipTextActive]}>{m.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>2. Session Type</Text>
        <View style={styles.typeRow}>
          {SESSION_TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.typeChip, sessionType === t.key && styles.typeChipActive]}
              onPress={() => { setSessionType(t.key); setSelectedRoom(null); }}
            >
              <Ionicons name={t.icon} size={20} color={sessionType === t.key ? '#FFF' : theme.colors.textSecondary} />
              <Text style={[styles.typeText, sessionType === t.key && styles.typeTextActive]}>{t.key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>3. Timing & Date</Text>
        <Card style={styles.scheduleCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date (Next 6 Days)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
              {availableDays.map(d => (
                <TouchableOpacity 
                  key={d.date} 
                  style={[styles.dayChip, selectedDayObj?.date === d.date && styles.activeDay]} 
                  onPress={() => setSelectedDayObj(d)}
                >
                  <Text style={[styles.dayText, selectedDayObj?.date === d.date && styles.activeDayText]}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.timeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Start Time</Text>
              {Platform.OS === 'web' ? (
                <TextInput 
                  style={styles.input} 
                  value={startTime.getHours().toString().padStart(2, '0') + ':' + startTime.getMinutes().toString().padStart(2, '0')}
                  onChangeText={(val) => {
                    const [h, m] = val.split(':');
                    if (h && m) {
                      const d = new Date(startTime);
                      d.setHours(parseInt(h), parseInt(m));
                      setStartTime(d);
                    }
                  }}
                  placeholder="HH:mm"
                />
              ) : (
                <>
                  <TouchableOpacity 
                    style={[styles.dateDisplay, showStartTimePicker && styles.dateDisplayActive]}
                    onPress={() => {
                      setShowStartTimePicker(!showStartTimePicker);
                      setShowEndTimePicker(false);
                    }}
                  >
                    <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.dateDisplayText}>{formatTime(startTime)}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>End Time</Text>
              {Platform.OS === 'web' ? (
                <TextInput 
                  style={styles.input} 
                  value={endTime.getHours().toString().padStart(2, '0') + ':' + endTime.getMinutes().toString().padStart(2, '0')}
                  onChangeText={(val) => {
                    const [h, m] = val.split(':');
                    if (h && m) {
                      const d = new Date(endTime);
                      d.setHours(parseInt(h), parseInt(m));
                      setEndTime(d);
                    }
                  }}
                  placeholder="HH:mm"
                />
              ) : (
                <>
                  <TouchableOpacity 
                    style={[styles.dateDisplay, showEndTimePicker && styles.dateDisplayActive]}
                    onPress={() => {
                      setShowEndTimePicker(!showEndTimePicker);
                      setShowStartTimePicker(false);
                    }}
                  >
                    <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.dateDisplayText}>{formatTime(endTime)}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {!Platform.isWeb && showStartTimePicker && (
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerHeader}>Select Start Time</Text>
              <DateTimePicker
                value={startTime}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e, d) => { setShowStartTimePicker(Platform.OS === 'ios'); if(d) setStartTime(d); }}
              />
            </View>
          )}

          {!Platform.isWeb && showEndTimePicker && (
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerHeader}>Select End Time</Text>
              <DateTimePicker
                value={endTime}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e, d) => { setShowEndTimePicker(Platform.OS === 'ios'); if(d) setEndTime(d); }}
              />
            </View>
          )}
        </Card>

        <Text style={styles.label}>4. Choose Compatible Room</Text>
        {filteredRooms.length === 0 ? <Text style={styles.emptyText}>No compatible rooms available for {sessionType}.</Text> :
          filteredRooms.map((r) => (
            <TouchableOpacity key={r.id} onPress={() => setSelectedRoom(r)}>
              <Card style={[styles.roomCard, selectedRoom?.id === r.id && styles.selectedRoomCard]}>
                <View style={styles.roomRow}>
                  <Ionicons name="business" size={20} color={selectedRoom?.id === r.id ? theme.colors.primary : theme.colors.textMuted} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.roomName}>{r.name} ({r.capacity} seats)</Text>
                    <View style={styles.amenitiesRow}>
                      <View style={styles.amenity}>
                        <Ionicons name="wifi" size={12} color={r.has_wifi ? theme.colors.success : theme.colors.textMuted} />
                        <Text style={styles.amenityText}>Wi-Fi</Text>
                      </View>
                      <View style={styles.amenity}>
                        <Ionicons name="videocam" size={12} color={r.has_projector ? theme.colors.primary : theme.colors.textMuted} />
                        <Text style={styles.amenityText}>Projector</Text>
                      </View>
                    </View>
                  </View>
                  {selectedRoom?.id === r.id && <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />}
                </View>
              </Card>
            </TouchableOpacity>
          ))
        }

        <Button title="Schedule Session" loading={creating} onPress={handleCreate} style={styles.submitBtn} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 12, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', marginBottom: 12, marginTop: 24 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
  chipTextActive: { color: '#FFF' },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  typeChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  typeText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  typeTextActive: { color: '#FFF' },
  scheduleCard: { padding: 16 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted, marginBottom: 8 },
  dayScroll: { flexDirection: 'row', marginBottom: 16 },
  dayChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15, backgroundColor: theme.colors.accent, marginRight: 8, borderWidth: 1, borderColor: theme.colors.border },
  activeDay: { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
  dayText: { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary },
  activeDayText: { color: theme.colors.primary },
  timeRow: { flexDirection: 'row', gap: 16 },
  input: { backgroundColor: theme.colors.accent, padding: 12, borderRadius: 8, fontSize: 14, borderWidth: 1, borderColor: theme.colors.border },
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
  roomCard: { marginBottom: 8, padding: 12 },
  selectedRoomCard: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight + '10' },
  roomRow: { flexDirection: 'row', alignItems: 'center' },
  roomName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  amenitiesRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  amenity: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  amenityText: { fontSize: 11, color: theme.colors.textMuted },
  emptyText: { color: theme.colors.textMuted, textAlign: 'center', marginTop: 10, fontSize: 14 },
  submitBtn: { marginTop: 32 },
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
