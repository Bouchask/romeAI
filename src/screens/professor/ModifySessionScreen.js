import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

export default function ModifySessionScreen({ navigation, route }) {
  const { session } = route.params;
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [allRooms, setAllRooms] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  
  // Form State
  const [changeType, setChangeType] = useState('time'); // 'time' or 'room'
  const [newStartTime, setNewStartTime] = useState(() => {
    const d = new Date();
    const [h, m] = session.start_time.split(':');
    d.setHours(parseInt(h), parseInt(m), 0, 0);
    return d;
  });
  const [newEndTime, setNewEndTime] = useState(() => {
    const d = new Date();
    const [h, m] = session.end_time.split(':');
    d.setHours(parseInt(h), parseInt(m), 0, 0);
    return d;
  });
  const [selectedRoomId, setSelectedRoomId] = useState(session.room_id);

  // Picker visibility
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rData, sData] = await Promise.all([
        ApiService.getRooms(),
        ApiService.getSessions()
      ]);
      setAllRooms(rData.filter(r => r.status === 'active'));
      setAllSessions(sData.filter(s => s.id !== session.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [session.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatTime = (time) => {
    return time.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  // Logic to find free rooms matching session type
  const getAvailableRooms = () => {
    const startTimeStr = newStartTime.getHours().toString().padStart(2, '0') + ':' + newStartTime.getMinutes().toString().padStart(2, '0');
    const endTimeStr = newEndTime.getHours().toString().padStart(2, '0') + ':' + newEndTime.getMinutes().toString().padStart(2, '0');

    return allRooms.filter(room => {
      // 1. Type Match
      if (session.type === 'TP' && room.type !== 'Lab') return false;
      if ((session.type === 'Cours' || session.type === 'TD') && room.type === 'Lab') return false;

      // 2. Availability Check at the (potentially new) time
      const hasConflict = allSessions.some(s => 
        s.room_id === room.id && 
        s.date === session.date && 
        !(endTimeStr <= s.start_time || startTimeStr >= s.end_time)
      );
      
      return !hasConflict;
    });
  };

  const handleUpdate = async () => {
    const startTotal = newStartTime.getHours() * 60 + newStartTime.getMinutes();
    const endTotal = newEndTime.getHours() * 60 + newEndTime.getMinutes();

    if (startTotal >= endTotal) {
      alert('End time must be after start time');
      return;
    }

    const isMorning = (startTotal >= 8 * 60 && endTotal <= 12 * 60);
    const isAfternoon = (startTotal >= 14 * 60 && endTotal <= 18 * 60);

    if (!isMorning && !isAfternoon) {
      const msg = 'Classes must be scheduled within standard intervals:\nMorning: 08:00 - 12:00\nAfternoon: 14:00 - 18:00';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Outside Hours', msg);
      return;
    }

    setUpdating(true);
    try {
      const startTimeString = newStartTime.getHours().toString().padStart(2, '0') + ':' + 
                              newStartTime.getMinutes().toString().padStart(2, '0');
      const endTimeString = newEndTime.getHours().toString().padStart(2, '0') + ':' + 
                            newEndTime.getMinutes().toString().padStart(2, '0');

      await ApiService.updateSession(session.id, {
        start_time: startTimeString,
        end_time: endTimeString,
        room_id: selectedRoomId,
        date: session.date,
        day: session.day,
        type: session.type,
        module_id: session.module_id
      });
      
      const msg = 'Session adjusted successfully!';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Success', msg);
      navigation.goBack();
    } catch (err) {
      alert('Could not update session. Conflict detected.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    const performDelete = async () => {
      try {
        await ApiService.deleteSession(session.id);
        navigation.goBack();
      } catch (err) {
        alert('Delete failed');
      }
    };
    if (Platform.OS === 'web') {
      if (confirm('Permanently cancel this session?')) performDelete();
    } else {
      Alert.alert('Cancel Session', 'Delete this entry?', [
        { text: 'Keep', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>;

  const availableRooms = getAvailableRooms();

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Modify Session" 
        subtitle={session.module_name} 
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Select Modification Type</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity 
            style={[styles.typeBtn, changeType === 'time' && styles.activeTypeBtn]}
            onPress={() => setChangeType('time')}
          >
            <Ionicons name="time" size={22} color={changeType === 'time' ? '#FFF' : theme.colors.primary} />
            <Text style={[styles.typeBtnText, changeType === 'time' && styles.activeTypeBtnText]}>Reschedule</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.typeBtn, changeType === 'room' && styles.activeTypeBtn]}
            onPress={() => setChangeType('room')}
          >
            <Ionicons name="business" size={22} color={changeType === 'room' ? '#FFF' : theme.colors.primary} />
            <Text style={[styles.typeBtnText, changeType === 'room' && styles.activeTypeBtnText]}>Relocate</Text>
          </TouchableOpacity>
        </View>

        {/* TIME CHANGE MODE */}
        {changeType === 'time' && (
          <>
            <Text style={styles.label}>Rescheduling ({session.date})</Text>
            <Card style={styles.formCard}>
              <View style={styles.timeRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>New Start</Text>
                  {Platform.OS === 'web' ? (
                    <TextInput 
                      style={styles.input} 
                      value={newStartTime.getHours().toString().padStart(2, '0') + ':' + newStartTime.getMinutes().toString().padStart(2, '0')} 
                      onChangeText={(val) => {
                        const [h, m] = val.split(':');
                        if (h && m) {
                          const d = new Date(newStartTime);
                          d.setHours(parseInt(h), parseInt(m));
                          setNewStartTime(d);
                        }
                      }} 
                      placeholder="HH:mm"
                    />
                  ) : (
                    <TouchableOpacity 
                      style={[styles.dateDisplay, showStartTimePicker && styles.dateDisplayActive]}
                      onPress={() => {
                        setShowStartTimePicker(!showStartTimePicker);
                        setShowEndTimePicker(false);
                      }}
                    >
                      <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                      <Text style={styles.dateDisplayText}>{formatTime(newStartTime)}</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>New End</Text>
                  {Platform.OS === 'web' ? (
                    <TextInput 
                      style={styles.input} 
                      value={newEndTime.getHours().toString().padStart(2, '0') + ':' + newEndTime.getMinutes().toString().padStart(2, '0')} 
                      onChangeText={(val) => {
                        const [h, m] = val.split(':');
                        if (h && m) {
                          const d = new Date(newEndTime);
                          d.setHours(parseInt(h), parseInt(m));
                          setNewEndTime(d);
                        }
                      }} 
                      placeholder="HH:mm"
                    />
                  ) : (
                    <TouchableOpacity 
                      style={[styles.dateDisplay, showEndTimePicker && styles.dateDisplayActive]}
                      onPress={() => {
                        setShowEndTimePicker(!showEndTimePicker);
                        setShowStartTimePicker(false);
                      }}
                    >
                      <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                      <Text style={styles.dateDisplayText}>{formatTime(newEndTime)}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {!Platform.isWeb && showStartTimePicker && (
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerHeader}>Select New Start Time</Text>
                  <DateTimePicker
                    value={newStartTime}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(e, d) => { setShowStartTimePicker(Platform.OS === 'ios'); if(d) setNewStartTime(d); }}
                  />
                </View>
              )}

              {!Platform.isWeb && showEndTimePicker && (
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerHeader}>Select New End Time</Text>
                  <DateTimePicker
                    value={newEndTime}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(e, d) => { setShowEndTimePicker(Platform.OS === 'ios'); if(d) setNewEndTime(d); }}
                  />
                </View>
              )}

              <Text style={styles.hint}>Changing time will automatically re-verify room availability.</Text>
            </Card>
          </>
        )}

        {/* RELOCATE MODE */}
        {changeType === 'room' && (
          <>
            <Text style={styles.label}>Choose Compatible Hall ({session.type})</Text>
            {availableRooms.length === 0 ? (
              <Card style={styles.emptyCard}><Text style={styles.emptyText}>No available rooms of type {session.type} for this slot.</Text></Card>
            ) : (
              availableRooms.map(room => (
                <TouchableOpacity key={room.id} onPress={() => setSelectedRoomId(room.id)}>
                  <Card style={[styles.roomOption, selectedRoomId === room.id && styles.activeRoomOption]}>
                    <View style={styles.roomInfo}>
                      <Text style={styles.roomName}>{room.name}</Text>
                      <Text style={styles.roomMeta}>{room.type} · Capacity: {room.capacity}</Text>
                    </View>
                    {selectedRoomId === room.id && <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />}
                  </Card>
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        <View style={styles.footer}>
          <Button title="Apply Changes" onPress={handleUpdate} loading={updating} />
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete Session</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 12, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 24 },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeBtn: { flex: 1, backgroundColor: theme.colors.card, padding: 16, borderRadius: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: theme.colors.border },
  activeTypeBtn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  typeBtnText: { fontSize: 13, fontWeight: '700', color: theme.colors.textSecondary },
  activeTypeBtnText: { color: '#FFF' },
  formCard: { padding: 16 },
  inputLabel: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted, marginBottom: 8 },
  timeRow: { flexDirection: 'row', gap: 16 },
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
  hint: { fontSize: 11, color: theme.colors.textMuted, marginTop: 12, fontStyle: 'italic' },
  roomOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: 12 },
  activeRoomOption: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight + '05' },
  roomName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  roomMeta: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  footer: { marginTop: 32, gap: 16, paddingBottom: 40 },
  deleteBtn: { alignItems: 'center', paddingVertical: 12 },
  deleteText: { color: theme.colors.error, fontWeight: '700', fontSize: 14 },
  emptyCard: { borderStyle: 'dashed', borderWidth: 1, borderColor: theme.colors.border, padding: 20, alignItems: 'center' },
  emptyText: { color: theme.colors.textMuted, textAlign: 'center', fontSize: 13 },
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
