import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { FILIERES } from '../../data/mockData';

export default function CreateExamScreen({ navigation }) {
  const [sessionType, setSessionType] = useState('Normal'); // 'Normal' or 'Rattrapage'

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
        <Card style={styles.pickerCard}>
          <TouchableOpacity style={styles.picker}>
            <Text style={styles.pickerText}>Select Target Filière</Text>
            <Ionicons name="chevron-down" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
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

        <Text style={styles.label}>Module & Logistics</Text>
        <Card style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Module Name</Text>
            <TextInput style={styles.input} placeholder="e.g. Database Systems" />
          </View>
          
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>Date</Text>
              <TouchableOpacity style={styles.miniPicker}>
                <Ionicons name="calendar" size={16} color={theme.colors.primary} />
                <Text style={styles.miniPickerText}>Select Date</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>Start Time</Text>
              <TouchableOpacity style={styles.miniPicker}>
                <Ionicons name="time" size={16} color={theme.colors.primary} />
                <Text style={styles.miniPickerText}>09:00 AM</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        <Text style={styles.label}>Room Assignment</Text>
        <Card style={styles.pickerCard}>
          <TouchableOpacity style={styles.picker}>
            <View style={styles.roomInfo}>
              <Ionicons name="business" size={18} color={theme.colors.primary} />
              <Text style={styles.pickerText}>Select Examination Hall</Text>
            </View>
            <Ionicons name="chevron-down" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        <View style={styles.footer}>
          <Button title="Generate Exam Session" onPress={() => navigation.goBack()} />
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
});
