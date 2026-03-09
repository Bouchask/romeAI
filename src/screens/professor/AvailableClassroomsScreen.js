import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  // Booking Modal State
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [sessionType, setSessionType] = useState('Cours');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
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

  const handleQuickBook = async () => {
    if (!selectedModuleId || !startTime || !endTime) {
      alert('Please complete the form');
      return;
    }

    setSubmitting(true);
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

      await ApiService.addSession({
        module_id: selectedModuleId,
        room_id: selectedRoom.id,
        type: sessionType,
        date: todayDate,
        day: todayDay,
        start_time: startTime,
        end_time: endTime
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
    // Basic check: if room has any session today, we show "Partial" 
    // Logic: Room is "Available" only if NO sessions exist for it today
    const sessions = todaySessions.filter(s => s.room_id === roomId);
    if (sessions.length === 0) return 'Available';
    return 'Busy';
  };

  if (loading && !bookingModal) return <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Classrooms" subtitle="Real-time today availability" />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} color={theme.colors.primary} />}
      >
        <View style={styles.list}>
          {rooms.map((r) => {
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
                    
                    <Text style={styles.typeText}>{r.type} · Capacity: {r.capacity}</Text>
                    
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
          })}
        </View>
      </ScrollView>

      {/* Booking Modal */}
      <Modal visible={bookingModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
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
                <TextInput style={styles.input} value={startTime} onChangeText={setStartTime} type={Platform.OS === 'web' ? 'time' : 'default'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>End Time</Text>
                <TextInput style={styles.input} value={endTime} onChangeText={setEndTime} type={Platform.OS === 'web' ? 'time' : 'default'} />
              </View>
            </View>

            <Button title="Confirm Booking" loading={submitting} onPress={handleQuickBook} style={{ marginTop: 20 }} />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setBookingModal(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          </View>
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
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  label: { fontSize: 11, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase' },
  chipScroll: { flexDirection: 'row', paddingVertical: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.accent, marginRight: 8, borderWidth: 1, borderColor: theme.colors.border },
  activeChip: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 12, fontWeight: '600' },
  activeChipText: { color: '#FFF' },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, backgroundColor: theme.colors.accent },
  activeType: { backgroundColor: theme.colors.primaryLight },
  typeTextBtn: { fontSize: 13, fontWeight: '700', color: theme.colors.textSecondary },
  activeTypeText: { color: theme.colors.primary },
  timeRow: { flexDirection: 'row', gap: 12 },
  input: { backgroundColor: theme.colors.accent, padding: 12, borderRadius: 10, fontSize: 14 },
  cancelBtn: { alignItems: 'center', marginTop: 10 },
  cancelText: { color: theme.colors.textMuted, fontWeight: '600' }
});
