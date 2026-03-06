import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export default function RequestBookingScreen({ navigation }) {
  const [reason, setNotes] = useState('');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader 
        title="Room Booking" 
        subtitle="Request a classroom for extra activities" 
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      <View style={styles.content}>
        <Text style={styles.label}>Select Date</Text>
        <Card style={styles.inputCard}>
          <TouchableOpacity style={styles.datePicker}>
            <Ionicons name="calendar" size={20} color={theme.colors.primary} />
            <Text style={styles.dateText}>Thursday, March 12, 2025</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.label}>Time Slot</Text>
        <View style={styles.timeGrid}>
          {['08:30 - 10:00', '10:30 - 12:00', '14:00 - 15:30', '16:00 - 17:30'].map((slot) => (
            <TouchableOpacity key={slot} style={styles.timeSlot}>
              <Text style={styles.timeSlotText}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Activity Description</Text>
        <Card style={styles.notesCard}>
          <TextInput
            placeholder="What is this booking for? (e.g., Exam preparation, Project meeting)"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setNotes}
            style={styles.textArea}
          />
        </Card>

        <View style={styles.warningBox}>
          <Ionicons name="information-circle" size={20} color={theme.colors.info} />
          <Text style={styles.warningText}>
            Room assignment will be confirmed by the administration within 24 hours.
          </Text>
        </View>

        <Button 
          title="Submit Booking Request" 
          onPress={() => alert('Request Submitted!')}
          style={styles.submitBtn}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  label: { fontSize: 13, fontWeight: '700', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: theme.spacing.sm, marginTop: theme.spacing.lg },
  inputCard: { padding: 0 },
  datePicker: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.md },
  dateText: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  timeSlot: { flexBasis: '48%', backgroundColor: theme.colors.card, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
  timeSlotText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
  notesCard: { padding: theme.spacing.md },
  textArea: { fontSize: 15, color: theme.colors.text, textAlignVertical: 'top', height: 100 },
  warningBox: { flexDirection: 'row', gap: theme.spacing.md, backgroundColor: theme.colors.primaryLight + '30', padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginTop: theme.spacing.xl, alignItems: 'center' },
  warningText: { flex: 1, fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 },
  submitBtn: { marginTop: theme.spacing.xxl },
});
