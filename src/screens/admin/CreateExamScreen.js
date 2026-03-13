import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  
  // Date and Time State Objects
  const [date, setDate] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

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

  const handleCreate = async () => {
    // 1. Basic empty check
    if (!selectedModule || !selectedRoom || !date || !startTime || !endTime) {
      const msg = 'Please fill in all required fields';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Validation', msg);
      return;
    }

    // 2. Date Validation: date > today + 2 days
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2);
    minDate.setHours(0, 0, 0, 0);

    if (date <= minDate) {
      const msg = 'Exam must be scheduled at least 2 days in advance (Today + 2 days).';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Invalid Date', msg);
      return;
    }

    // 3. Time Validation: start < end and within university intervals
    const startH = startTime.getHours();
    const startM = startTime.getMinutes();
    const endH = endTime.getHours();
    const endM = endTime.getMinutes();
    
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

    setCreating(true);
    try {
      // Format to YYYY-MM-DD
      const dateString = date.toISOString().split('T')[0];
      
      // Format to HH:mm
      const startTimeString = startTime.getHours().toString().padStart(2, '0') + ':' + 
                              startTime.getMinutes().toString().padStart(2, '0');
      const endTimeString = endTime.getHours().toString().padStart(2, '0') + ':' + 
                            endTime.getMinutes().toString().padStart(2, '0');

      const examData = {
        module_id: selectedModule.id,
        room_id: selectedRoom.id,
        date: dateString,
        start_time: startTimeString,
        end_time: endTimeString,
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

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const onStartTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || startTime;
    setShowStartTimePicker(Platform.OS === 'ios');
    setStartTime(currentTime);
  };

  const onEndTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || endTime;
    setShowEndTimePicker(Platform.OS === 'ios');
    setEndTime(currentTime);
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
            {Platform.OS === 'web' ? (
              <TextInput
                style={styles.input}
                value={date.toISOString().split('T')[0]}
                onChangeText={(val) => setDate(new Date(val))}
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
                <Text style={styles.dateDisplayText}>{formatDate(date)}</Text>
              </TouchableOpacity>
            )}
            {!Platform.isWeb && showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)}
              />
            )}
          </View>
          
          <View style={styles.row}>
            <View style={styles.flex1}>
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
                <TouchableOpacity 
                  style={styles.dateDisplay}
                  onPress={() => {
                    setShowStartTimePicker(!showStartTimePicker);
                    setShowDatePicker(false);
                    setShowEndTimePicker(false);
                  }}
                >
                  <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.dateDisplayText}>{formatTime(startTime)}</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.flex1}>
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
                <TouchableOpacity 
                  style={styles.dateDisplay}
                  onPress={() => {
                    setShowEndTimePicker(!showEndTimePicker);
                    setShowDatePicker(false);
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
                onChange={onStartTimeChange}
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
                onChange={onEndTimeChange}
              />
            </View>
          )}
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
  dateDisplayText: { fontSize: 15, color: theme.colors.text, fontWeight: '500' },
  dateDisplayActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight + '10' },
  row: { flexDirection: 'row', gap: theme.spacing.md },
  flex1: { flex: 1 },
  roomInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  footer: { marginTop: theme.spacing.xxl, paddingBottom: theme.spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dropdown: { backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: theme.colors.border },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.accent },
  dropdownItemText: { fontSize: 14, color: theme.colors.text },
  toggleRow: { flexDirection: 'row', gap: theme.spacing.md },
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
