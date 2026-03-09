import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Linking, Platform, Alert, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

const FILTERS = ['All', 'Cours', 'TD', 'TP', 'Exam'];

export default function ProfessorModuleDetailScreen({ navigation, route }) {
  const { module } = route.params;
  const [loading, setLoading] = useState(true);
  const [combinedData, setCombinedData] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  
  // QR Modal State
  const [qrVisible, setQrVisible] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sessions, exams] = await Promise.all([
        ApiService.getSessions(),
        ApiService.getExams()
      ]);

      // 1. Process Sessions
      const mySessions = sessions
        .filter(s => s.module_id === module.id)
        .map(s => ({ ...s, category: s.type, is_exam: false }));

      // 2. Process Exams
      const myExams = exams
        .filter(e => e.module_id === module.id)
        .map(e => ({ 
          ...e, 
          category: 'Exam',
          is_exam: true,
          type: `Exam (${e.type})`, 
          room_name: e.room_name,
          room_gps: e.room_gps || null,
          day: 'Examination' // Fallback for day field
        }));

      const unified = [...mySessions, ...myExams].sort((a, b) => {
        const dateA = a.date || '2024-01-01';
        const dateB = b.date || '2024-01-01';
        return dateB.localeCompare(dateA);
      });

      setCombinedData(unified);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [module.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openGps = (url) => {
    if (url) {
      Linking.openURL(url).catch(() => Alert.alert("Error", "Could not open map link."));
    } else {
      Alert.alert("Notice", "No GPS coordinates assigned to this room.");
    }
  };

  const showQr = (item) => {
    setActiveRoom({
      name: item.room_name,
      gps: item.room_gps || `Location: ${item.room_name}`
    });
    setQrVisible(true);
  };

  const filteredItems = activeFilter === 'All' 
    ? combinedData 
    : combinedData.filter(item => item.category === activeFilter || (activeFilter === 'Exam' && item.is_exam));

  const renderItem = ({ item }) => {
    const today = new Date().toISOString().split('T')[0];
    const itemDate = item.date || '2024-01-01';
    const isExam = item.is_exam;
    
    // Updated Logic: Show attendance if it's an exam OR if it's a past/today session
    const isPastOrToday = itemDate <= today;
    const showAttendance = isExam || isPastOrToday;

    return (
      <Card style={[styles.card, isExam && styles.examCard]}>
        <View style={styles.sessionHeader}>
          <View style={styles.dateBlock}>
            <Text style={styles.dayText}>{item.day}</Text>
            <Text style={styles.dateText}>{itemDate}</Text>
          </View>
          <View style={[
            styles.statusBadge, 
            itemDate < today ? styles.statusCompleted : (itemDate === today ? styles.statusToday : styles.statusUpcoming)
          ]}>
            <Text style={[
              styles.statusText,
              itemDate < today ? styles.textCompleted : (itemDate === today ? styles.textToday : styles.textUpcoming)
            ]}>
              {itemDate < today ? 'COMPLETED' : (itemDate === today ? 'TODAY' : 'UPCOMING')}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.mainInfo}>
            <View style={styles.typeRow}>
              {isExam && <Ionicons name="document-text" size={16} color={theme.colors.error} />}
              <Text style={[styles.typeText, isExam && { color: theme.colors.error }]}>{item.type}</Text>
            </View>
            <Text style={styles.timeText}>{item.start_time} - {item.end_time}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.roomText}>{item.room_name}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {showAttendance && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: theme.colors.primaryLight + '30' }]}
              onPress={() => navigation.navigate('AttendanceManagement', { 
                session: { ...item, category: isExam ? 'Exam' : item.type } 
              })}
            >
              <Ionicons name="checkbox-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.actionBtnText}>{isExam ? 'Exam Check' : 'Attendance'}</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: theme.colors.accent }]}
            onPress={() => openGps(item.room_gps)}
          >
            <Ionicons name="map-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.actionBtnText, { color: theme.colors.textSecondary }]}>Location</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.qrBtn}
            onPress={() => showQr(item)}
          >
            <Ionicons name="qr-code-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title={module.name} 
        subtitle="Full Academic Timeline" 
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map(f => (
            <TouchableOpacity 
              key={f} 
              style={[styles.filterChip, activeFilter === f && styles.activeFilterChip]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.activeFilterText]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={theme.colors.primary} size="large" /></View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item, idx) => `${item.is_exam ? 'exam' : 'sess'}-${item.id}-${idx}`}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="funnel-outline" size={48} color={theme.colors.border} />
              <Text style={styles.empty}>No {activeFilter.toLowerCase()} items found.</Text>
            </View>
          }
        />
      )}

      {/* QR MODAL */}
      <Modal visible={qrVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hall Digital ID</Text>
              <TouchableOpacity onPress={() => setQrVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.qrContainer}>
              {activeRoom && (
                <>
                  <QRCode value={activeRoom.gps} size={200} color={theme.colors.text} backgroundColor="#FFF" />
                  <Text style={styles.qrRoomName}>{activeRoom.name}</Text>
                  <Text style={styles.qrInstructions}>Scan to reach examination room</Text>
                </>
              )}
            </View>
            
            <Button title="Done" onPress={() => setQrVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  filterBar: { paddingVertical: 12, paddingHorizontal: theme.spacing.lg, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.accent, marginRight: 8, borderWidth: 1, borderColor: theme.colors.border },
  activeFilterChip: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterText: { fontSize: 13, fontWeight: '700', color: theme.colors.textSecondary },
  activeFilterText: { color: '#FFF' },
  list: { padding: theme.spacing.lg },
  card: { marginBottom: 16, padding: 16 },
  examCard: { borderLeftWidth: 4, borderLeftColor: theme.colors.error },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  dateBlock: { flex: 1 },
  dayText: { fontSize: 16, fontWeight: '800', color: theme.colors.text },
  dateText: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusCompleted: { backgroundColor: theme.colors.success + '15' },
  statusToday: { backgroundColor: theme.colors.primary + '15' },
  statusUpcoming: { backgroundColor: theme.colors.warning + '15' },
  statusText: { fontSize: 10, fontWeight: '800' },
  textCompleted: { color: theme.colors.success },
  textToday: { color: theme.colors.primary },
  textUpcoming: { color: theme.colors.warning },
  infoRow: { marginBottom: 16 },
  mainInfo: { gap: 4 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeText: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  timeText: { fontSize: 14, color: theme.colors.textSecondary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  roomText: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 10, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.border },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 10 },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: theme.colors.primary },
  qrBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  empty: { textAlign: 'center', marginTop: 16, color: theme.colors.textMuted, fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  qrContainer: { alignItems: 'center', marginBottom: 24 },
  qrRoomName: { fontSize: 20, fontWeight: '800', color: theme.colors.primary, marginTop: 16 },
  qrInstructions: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4 }
});
