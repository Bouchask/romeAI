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
  
  // Default values
  const tomorrowPlusOne = new Date();
  tomorrowPlusOne.setDate(tomorrowPlusOne.getDate() + 3); // Today + 3 days to be safe
  const defaultDate = tomorrowPlusOne.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');

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
    // 1. Basic empty check
    if (!selectedModule || !selectedRoom || !date || !startTime || !endTime) {
      const msg = 'Please fill in all required fields';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Validation', msg);
      return;
    }

    // 2. Date Validation: date > today + 2 days
    const selectedDate = new Date(date);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2);
    minDate.setHours(0, 0, 0, 0);

    if (selectedDate <= minDate) {
      const msg = 'Exam must be scheduled at least 2 days in advance (Today + 2 days).';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Invalid Date', msg);
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
      const errMsg = typeof err === 'string' ? err : 'Failed to create exam';
      if (Platform.OS === 'web') alert(errMsg); else Alert.alert('Error', errMsg);
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
        subtitle="Enforce 2-day advance scheduling" 
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

        <Text style={styles.label}>Logistics (Date & Time)</Text>
        <Card style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Exam Date (Today + 2 Days Min)</Text>
            <TextInput 
              style={styles.input} 
              type={Platform.OS === 'web' ? 'date' : 'default'}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>Start Time</Text>
              <TextInput 
                style={styles.input} 
                type={Platform.OS === 'web' ? 'time' : 'default'}
                value={startTime}
                onChangeText={setStartTime}
              />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>End Time</Text>
              <TextInput 
                style={styles.input} 
                type={Platform.OS === 'web' ? 'time' : 'default'}
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
  pickerTextSelected: { fontSize: 15, color: theme.colors.text, fontWeight: '600' },
  formCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.md },
  inputGroup: { marginBottom: theme.spacing.md },
  inputLabel: { fontSize: 11, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', marginBottom: 8 },
  input: { backgroundColor: theme.colors.accent, padding: 12, borderRadius: 10, fontSize: 15, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border },
  row: { flexDirection: 'row', gap: theme.spacing.md },
  flex1: { flex: 1 },
  roomInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  footer: { marginTop: theme.spacing.xxl, paddingBottom: theme.spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dropdown: { backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: theme.colors.border },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.accent },
  dropdownItemText: { fontSize: 14, color: theme.colors.text },
  toggleRow: { flexDirection: 'row', gap: theme.spacing.md }
});
