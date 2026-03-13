import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

const SESSION_TYPES = ['Cours', 'TD', 'TP'];

export default function AvailableClassroomsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [myModules, setMyModules] = useState([]);
  const [filterType, setFilterType] = useState('All'); // 'All', 'Cours', 'TD', 'TP'

  // Booking Modal State
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [sessionType, setSessionType] = useState('Cours');
  
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
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rData, sData, mData] = await Promise.all([
        ApiService.getRooms(),
        ApiService.getSessions(),
        ApiService.getModules()
      ]);
      
      setRooms(rData);
      
      const today = new Date().toISOString().split('T')[0];
      setTodaySessions(sData.filter(s => s.date === today));
      
      setMyModules(mData.filter(m => m.professor_id === user.id));
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

  const handleQuickBook = async () => {
    if (!selectedModuleId) {
      alert('Please select a module');
      return;
    }

    // Time Validation
    const startTotal = startTime.getHours() * 60 + startTime.getMinutes();
    const endTotal = endTime.getHours() * 60 + endTime.getMinutes();

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

    setSubmitting(true);
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      
      const startTimeString = startTime.getHours().toString().padStart(2, '0') + ':' + 
                              startTime.getMinutes().toString().padStart(2, '0');
      const endTimeString = endTime.getHours().toString().padStart(2, '0') + ':' + 
                            endTime.getMinutes().toString().padStart(2, '0');

      await ApiService.addSession({
        module_id: selectedModuleId,
        room_id: selectedRoom.id,
        type: sessionType,
        date: todayDate,
        day: todayDay,
        start_time: startTimeString,
        end_time: endTimeString
      });

      const msg = 'Room booked successfully for today!';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Success', msg);
      
      setBookingModal(false);
      fetchData(); // Refresh list
    } catch (err) {
      const msg = typeof err === 'string' ? err : 'Booking failed. Check for conflicts.';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isRoomFree = (roomId) => {
    const sessions = todaySessions.filter(s => s.room_id === roomId);
    if (sessions.length === 0) return 'Available';
    return 'Busy';
  };

  const getFilteredRooms = () => {
    if (filterType === 'All') return rooms;
    return rooms.filter(r => {
      const roomType = r.type || 'Classroom';
      if (filterType === 'Cours') return roomType === 'Classroom' || roomType === 'Amphi';
      if (filterType === 'TD') return roomType === 'Classroom' || roomType === 'TD';
      if (filterType === 'TP') return roomType === 'Lab' || roomType === 'TP';
      return true;
    });
  };

  const filteredRooms = getFilteredRooms();

  if (loading && !bookingModal) return <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Classrooms" subtitle="Real-time today availability" />
      
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['All', 'Cours', 'TD', 'TP'].map(type => (
            <TouchableOpacity 
              key={type} 
              style={[styles.filterChip, filterType === type && styles.activeFilterChip]}
              onPress={() => setFilterType(type)}
            >
              <Text style={[styles.filterChipText, filterType === type && styles.activeFilterChipText]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} color={theme.colors.primary} />}
      >
        <View style={styles.list}>
          {filteredRooms.length === 0 ? (
            <Card style={styles.emptyCard}><Text style={styles.emptyText}>No facilities match this criteria.</Text></Card>
          ) : (
            filteredRooms.map((r) => {
              const status = isRoomFree(r.id);
              const isAvailable = status === 'Available';
              
              return (
                <Card key={r.id} style={styles.roomCard}>
                  <View style={styles.row}>
                    <View style={styles.iconWrap}>
                      <Ionicons name="business" size={24} color={theme.colors.primary} />
                    </View>
                    <View style={styles.body}>
                      <View style={styles.headerRow}>
                        <Text style={styles.name}>{r.name}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: isAvailable ? theme.colors.success + '15' : theme.colors.error + '15' }]}>
                          <Text style={[styles.statusText, { color: isAvailable ? theme.colors.success : theme.colors.error }]}>
                            {status}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={styles.typeText}>{(r.type === 'Classroom' || !r.type) ? 'Cours' : r.type} · Capacity: {r.capacity}</Text>
                      
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
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.reserveBtn, !isAvailable && styles.disabledBtn]}
                    onPress={() => { setSelectedRoom(r); setBookingModal(true); }}
                    disabled={!isAvailable}
                  >
                    <Text style={[styles.reserveText, !isAvailable && styles.disabledText]}>
                      {isAvailable ? 'Instant Booking' : 'Room Occupied'}
                    </Text>
                  </TouchableOpacity>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Booking Modal */}
      <Modal visible={bookingModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Quick Reserve: {selectedRoom?.name}</Text>
              
              <Text style={styles.label}>Select Module</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {myModules.map(m => (
                  <TouchableOpacity 
                    key={m.id} 
                    style={[styles.chip, selectedModuleId === m.id && styles.activeChip]}
                    onPress={() => setSelectedModuleId(m.id)}
                  >
                    <Text style={[styles.chipText, selectedModuleId === m.id && styles.activeChipText]}>{m.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Session Type</Text>
              <View style={styles.typeRow}>
                {SESSION_TYPES.map(t => (
                  <TouchableOpacity 
                    key={t} 
                    style={[styles.typeBtn, sessionType === t && styles.activeType]}
                    onPress={() => setSessionType(t)}
                  >
                    <Text style={[styles.typeTextBtn, sessionType === t && styles.activeTypeText]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.timeRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Start Time</Text>
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
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>End Time</Text>
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

              <Button title="Confirm Booking" loading={submitting} onPress={handleQuickBook} style={{ marginTop: 20 }} />
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setBookingModal(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1 },
  list: { padding: theme.spacing.lg, paddingBottom: 40 },
  roomCard: { marginBottom: theme.spacing.md, padding: theme.spacing.md },
  row: { flexDirection: 'row' },
  iconWrap: { width: 48, height: 48, borderRadius: 12, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  body: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  typeText: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  amenitiesRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  amenity: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  amenityText: { fontSize: 11, color: theme.colors.textMuted },
  reserveBtn: { marginTop: 16, paddingVertical: 12, borderRadius: 10, backgroundColor: theme.colors.primaryLight, alignItems: 'center' },
  reserveText: { color: theme.colors.primary, fontSize: 14, fontWeight: '700' },
  disabledBtn: { backgroundColor: theme.colors.accent },
  disabledText: { color: theme.colors.textMuted },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  filterSection: { paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.md },
  filterScroll: { flexDirection: 'row' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.accent, marginRight: 10, borderWidth: 1, borderColor: theme.colors.border },
  activeFilterChip: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterChipText: { fontSize: 13, fontWeight: '700', color: theme.colors.textSecondary },
  activeFilterChipText: { color: '#FFF' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
  modalScroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  label: { fontSize: 11, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase' },
  chipScroll: { flexDirection: 'row', paddingVertical: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.accent, marginRight: 8, borderWidth: 1, borderColor: theme.colors.border },
  activeChip: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  activeChipText: { color: '#FFF' },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, backgroundColor: theme.colors.accent },
  activeType: { backgroundColor: theme.colors.primaryLight },
  typeTextBtn: { fontSize: 13, fontWeight: '700', color: theme.colors.textSecondary },
  activeTypeText: { color: theme.colors.primary },
  timeRow: { flexDirection: 'row', gap: 12 },
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
  cancelBtn: { alignItems: 'center', marginTop: 10 },
  cancelText: { color: theme.colors.textMuted, fontWeight: '600' },
  pickerContainer: { 
    marginTop: 10, 
    padding: 10, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: theme.colors.border,
    ...theme.shadows.md,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pickerHeader: { 
    fontSize: 10, 
    fontWeight: '900', 
    color: theme.colors.primary, 
    marginBottom: 10, 
    textAlign: 'center', 
    textTransform: 'uppercase',
    letterSpacing: 1
  }
});
