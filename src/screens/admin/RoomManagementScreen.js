import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert, Modal, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

export default function RoomManagementScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const isFocused = useIsFocused();
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newCapacity, setNewCapacity] = useState('');
  const [newLienGps, setNewLienGps] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ApiService.getRooms();
      setRooms(data);
    } catch (err) {
      console.error('Fetch rooms error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data whenever screen comes into focus
  useEffect(() => {
    if (isFocused) {
      fetchRooms();
    }
  }, [isFocused, fetchRooms]);

  const handleAddRoom = async () => {
    if (!newName || !newCapacity) {
      Alert.alert('Validation', 'Please fill in required fields (Name, Capacity)');
      return;
    }

    setCreating(true);
    try {
      await ApiService.addRoom({
        name: newName,
        capacity: parseInt(newCapacity),
        lien_gps: newLienGps
      });
      setNewName('');
      setNewCapacity('');
      setNewLienGps('');
      setModalVisible(false);
      fetchRooms();
      Alert.alert('Success', 'Room created successfully');
    } catch (err) {
      Alert.alert('Error', err);
    } finally {
      setCreating(false);
    }
  };

  if (loading && !modalVisible) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader 
          title="Classroom Assets" 
          subtitle="Inventory and facility management" 
          rightElement={
            <TouchableOpacity 
              style={styles.addBtnCircle}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          }
        />
        <View style={styles.content}>
          <View style={styles.summaryRow}>
            <Text style={styles.countText}>{rooms.length} Total Classrooms</Text>
          </View>

          {rooms.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No classrooms registered yet.</Text>
            </Card>
          ) : (
            rooms.map((r) => (
              <Card key={r.id} style={styles.roomCard}>
                <View style={styles.row}>
                  <View style={styles.body}>
                    <View style={styles.titleRow}>
                      <Text style={styles.name}>{r.name}</Text>
                      <View style={[
                        styles.statusBadge, 
                        r.status !== 'active' && styles.statusMaintenance
                      ]}>
                        <Text style={[
                          styles.statusText,
                          r.status !== 'active' && styles.statusTextMaintenance
                        ]}>
                          {r.status === 'active' ? 'Active' : 'Maintenance'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.typeText}>{r.type || 'Standard'} · Capacity: {r.capacity}</Text>
                    
                    <View style={styles.amenitiesRow}>
                      <View style={styles.amenity}>
                        <Ionicons 
                          name="wifi" 
                          size={14} 
                          color={r.has_wifi ? theme.colors.success : theme.colors.textMuted} 
                        />
                        <Text style={[styles.amenityText, !r.has_wifi && styles.disabledText]}>Wi-Fi</Text>
                      </View>
                      <View style={styles.amenity}>
                        <Ionicons 
                          name="videocam" 
                          size={14} 
                          color={r.has_projector ? theme.colors.primary : theme.colors.textMuted} 
                        />
                        <Text style={[styles.amenityText, !r.has_projector && styles.disabledText]}>Projector</Text>
                      </View>
                      {r.lien_gps && (
                        <View style={styles.amenity}>
                          <Ionicons name="map" size={14} color={theme.colors.primary} />
                          <Text style={styles.amenityText}>GPS Linked</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.actions}>
                    <TouchableOpacity 
                      style={styles.actionBtn}
                      onPress={() => navigation.navigate('ModifyRoom', { room: r })}
                    >
                      <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Room Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Classroom</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.form}>
                <Text style={styles.label}>Room Name</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="e.g. Room 101 or Amphi A"
                  value={newName}
                  onChangeText={setNewName}
                />

                <Text style={styles.label}>Capacity</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="e.g. 30"
                  keyboardType="numeric"
                  value={newCapacity}
                  onChangeText={setNewCapacity}
                />

                <Text style={styles.label}>GPS Link (Maps URL)</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="https://maps.google.com/..."
                  value={newLienGps}
                  onChangeText={setNewLienGps}
                  autoCapitalize="none"
                />

                <Button 
                  title="Create Classroom"
                  onPress={handleAddRoom}
                  loading={creating}
                  style={styles.createBtn}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  addBtnCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  countText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  filterText: { fontSize: 14, color: theme.colors.primary, fontWeight: '600' },
  roomCard: { marginBottom: theme.spacing.md, padding: theme.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  body: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: 4 },
  name: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  typeText: { fontSize: 13, color: theme.colors.textSecondary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: theme.colors.success + '15' },
  statusMaintenance: { backgroundColor: theme.colors.warning + '15' },
  statusText: { fontSize: 10, fontWeight: '700', color: theme.colors.success, textTransform: 'uppercase' },
  statusTextMaintenance: { color: theme.colors.warning },
  amenitiesRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  amenity: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  amenityText: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '600' },
  disabledText: { color: theme.colors.textMuted, textDecorationLine: 'line-through' },
  actions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 8, borderRadius: 8, backgroundColor: theme.colors.accent },
  footer: { marginTop: theme.spacing.md, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  usageBar: { flex: 1, height: 6, backgroundColor: theme.colors.accent, borderRadius: 3, overflow: 'hidden' },
  usageFill: { height: '100%', backgroundColor: theme.colors.primary },
  usageText: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '600' },
  exportBtn: { marginTop: theme.spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  emptyCard: { padding: theme.spacing.xl, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: theme.colors.border },
  emptyText: { color: theme.colors.textMuted, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: theme.spacing.xl, minHeight: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xl },
  modalTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  form: { gap: theme.spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  input: { backgroundColor: theme.colors.accent, padding: 14, borderRadius: 12, fontSize: 16, color: theme.colors.text, marginBottom: 10 },
  createBtn: { marginTop: theme.spacing.lg }
});
