import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

export default function CreateExamScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  // Data lists
  const [filieres, setFilieres] = useState([]);
  const [modules, setModules] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Form State
  const [selectedFiliere, setSelectedFiliere] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [sessionType, setSessionType] = useState('Normal');
  const [date, setDate] = useState('2024-06-15');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('11:00 AM');

  // Dropdown visibility
  const [showFiliereList, setShowFiliereList] = useState(false);
  const [showModuleList, setShowModuleList] = useState(false);
  const [showRoomList, setShowRoomList] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fData, mData, rData] = await Promise.all([
          ApiService.getFilieres(),
          ApiService.getModules(),
          ApiService.getRooms()
        ]);
        setFilieres(fData);
        setModules(mData);
        setRooms(rData.filter(r => r.status === 'active'));
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreate = async () => {
    // Check exactly what is missing
    const missingFields = [];
    if (!selectedModule) missingFields.push('Module');
    if (!selectedRoom) missingFields.push('Room');
    if (!date) missingFields.push('Date');
    if (!startTime) missingFields.push('Start Time');
    if (!endTime) missingFields.push('End Time');

    if (missingFields.length > 0) {
      const msg = `Missing fields: ${missingFields.join(', ')}`;
      console.warn('Validation failed:', msg);
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Validation Error', msg);
      return;
    }

    setCreating(true);
    try {
      const examData = {
        module_id: selectedModule.id,
        room_id: selectedRoom.id,
        date: date,
        start_time: startTime,
        end_time: endTime,
        type: sessionType,
        status: 'Published'
      };
      
      await ApiService.addExam(examData);
      
      const successMsg = 'Exam session created successfully!';
      if (Platform.OS === 'web') {
        alert(successMsg);
        navigation.goBack();
      } else {
        Alert.alert('Success', successMsg, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err) {
      const errMsg = typeof err === 'string' ? err : (err.message || 'Failed to create exam session');
      if (Platform.OS === 'web') alert('Error: ' + errMsg);
      else Alert.alert('Error', errMsg);
    } finally {
      setCreating(false);
    }
  };

  const filteredModules = selectedFiliere 
    ? modules.filter(m => m.filiere_id === selectedFiliere.id)
    : [];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader 
        title="Schedule Exam" 
        subtitle="Organize a new assessment session" 
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      <View style={styles.content}>
        <Text style={styles.label}>Filière / Department</Text>
        <Card style={styles.pickerCard} noPadding>
          <TouchableOpacity 
            style={styles.picker} 
            onPress={() => setShowFiliereList(!showFiliereList)}
          >
            <Text style={selectedFiliere ? styles.pickerTextSelected : styles.pickerText}>
              {selectedFiliere ? selectedFiliere.name : 'Select Target Filière'}
            </Text>
            <Ionicons name={showFiliereList ? "chevron-up" : "chevron-down"} size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          {showFiliereList && (
            <View style={styles.dropdown}>
              {filieres.map(f => (
                <TouchableOpacity 
                  key={f.id} 
                  style={styles.dropdownItem}
                  onPress={() => { setSelectedFiliere(f); setShowFiliereList(false); setSelectedModule(null); }}
                >
                  <Text style={styles.dropdownItemText}>{f.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        <Text style={styles.label}>Session Mode</Text>
        <View style={styles.toggleRow}>
          {['Normal', 'Rattrapage'].map(mode => (
            <TouchableOpacity 
              key={mode}
              style={[styles.toggleBtn, sessionType === mode && styles.activeToggle]}
              onPress={() => setSessionType(mode)}
            >
              <Text style={[styles.toggleText, sessionType === mode && styles.activeToggleText]}>{mode}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Module Selection</Text>
        <Card style={styles.pickerCard} noPadding>
          <TouchableOpacity 
            style={styles.picker}
            onPress={() => {
              if (!selectedFiliere) Alert.alert('Notice', 'Please select a filiere first');
              else setShowModuleList(!showModuleList);
            }}
          >
            <Text style={selectedModule ? styles.pickerTextSelected : styles.pickerText}>
              {selectedModule ? selectedModule.name : 'Select Module'}
            </Text>
            <Ionicons name={showModuleList ? "chevron-up" : "chevron-down"} size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          {showModuleList && (
            <View style={styles.dropdown}>
              {filteredModules.map(m => (
                <TouchableOpacity 
                  key={m.id} 
                  style={styles.dropdownItem}
                  onPress={() => { setSelectedModule(m); setShowModuleList(false); }}
                >
                  <Text style={styles.dropdownItemText}>{m.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        <Text style={styles.label}>Logistics</Text>
        <Card style={styles.formCard}>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput 
                style={styles.input} 
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
              />
            </View>
          </View>
          <View style={[styles.row, { marginTop: theme.spacing.md }]}>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>Start Time</Text>
              <TextInput 
                style={styles.input} 
                placeholder="09:00 AM"
                value={startTime}
                onChangeText={setStartTime}
              />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>End Time</Text>
              <TextInput 
                style={styles.input} 
                placeholder="11:00 AM"
                value={endTime}
                onChangeText={setEndTime}
              />
            </View>
          </View>
        </Card>

        <Text style={styles.label}>Room Assignment</Text>
        <Card style={styles.pickerCard} noPadding>
          <TouchableOpacity 
            style={styles.picker}
            onPress={() => setShowRoomList(!showRoomList)}
          >
            <View style={styles.roomInfo}>
              <Ionicons name="business" size={18} color={theme.colors.primary} />
              <Text style={selectedRoom ? styles.pickerTextSelected : styles.pickerText}>
                {selectedRoom ? selectedRoom.name : 'Select Examination Hall'}
              </Text>
            </View>
            <Ionicons name={showRoomList ? "chevron-up" : "chevron-down"} size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          {showRoomList && (
            <View style={styles.dropdown}>
              {rooms.map(r => (
                <TouchableOpacity 
                  key={r.id} 
                  style={styles.dropdownItem}
                  onPress={() => { setSelectedRoom(r); setShowRoomList(false); }}
                >
                  <Text style={styles.dropdownItemText}>{r.name} (Cap: {r.capacity})</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        <View style={styles.footer}>
          <Button 
            title="Generate Exam Session" 
            onPress={handleCreate} 
            loading={creating}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  label: { fontSize: 13, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: theme.spacing.sm, marginTop: theme.spacing.lg },
  pickerCard: { padding: 0, marginBottom: theme.spacing.md },
  picker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md },
  pickerText: { fontSize: 15, color: theme.colors.textSecondary, fontWeight: '500' },
  toggleRow: { flexDirection: 'row', gap: theme.spacing.md },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  activeToggle: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  toggleText: { fontSize: 14, fontWeight: '700', color: theme.colors.textSecondary },
  activeToggleText: { color: '#FFF' },
  formCard: { padding: theme.spacing.lg },
  inputGroup: { marginBottom: theme.spacing.lg },
  inputLabel: { fontSize: 11, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', marginBottom: 8 },
  input: { backgroundColor: theme.colors.accent, padding: 12, borderRadius: 10, fontSize: 15, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border },
  row: { flexDirection: 'row', gap: theme.spacing.md },
  flex1: { flex: 1 },
  miniPicker: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.accent, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border },
  miniPickerText: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  roomInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  footer: { marginTop: theme.spacing.xxl, paddingBottom: theme.spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pickerTextSelected: { fontSize: 15, color: theme.colors.text, fontWeight: '600' },
  dropdown: { backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: theme.colors.border },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.accent },
  dropdownItemText: { fontSize: 14, color: theme.colors.text }
});
