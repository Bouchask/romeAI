import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export default function ModifySessionScreen({ navigation, route }) {
  const { session } = route.params || { session: { module: 'Session', time: '--:--', room: '---' } };
  const [changeType, setChangeType] = useState('time'); 

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader 
        title="Modify Session" 
        subtitle={`Adjusting: ${session.module}`} 
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      <View style={styles.content}>
        <Text style={styles.label}>Requested Change</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity 
            style={[styles.typeBtn, changeType === 'time' && styles.activeTypeBtn]}
            onPress={() => setChangeType('time')}
          >
            <Ionicons name="time" size={24} color={changeType === 'time' ? '#FFF' : theme.colors.primary} />
            <Text style={[styles.typeBtnText, changeType === 'time' && styles.activeTypeBtnText]}>Reschedule</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.typeBtn, changeType === 'room' && styles.activeTypeBtn]}
            onPress={() => setChangeType('room')}
          >
            <Ionicons name="business" size={24} color={changeType === 'room' ? '#FFF' : theme.colors.primary} />
            <Text style={[styles.typeBtnText, changeType === 'room' && styles.activeTypeBtnText]}>Change Room</Text>
          </TouchableOpacity>
        </View>

        {changeType === 'time' ? (
          <>
            <Text style={styles.label}>Current Timing</Text>
            <Card style={styles.infoCard}>
              <Text style={styles.infoText}>{session.date || 'Today'} · {session.time}</Text>
            </Card>
            <Text style={styles.label}>New Preferred Time</Text>
            <Card style={styles.inputCard}>
              <TouchableOpacity style={styles.pickerBtn}>
                <Text style={styles.pickerText}>Select New Slot</Text>
                <Ionicons name="chevron-down" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </Card>
          </>
        ) : (
          <>
            <Text style={styles.label}>Current Location</Text>
            <Card style={styles.infoCard}>
              <Text style={styles.infoText}>Room {session.room}</Text>
            </Card>
            <Text style={styles.label}>Available Alternatives</Text>
            {['Room 203', 'Room 205'].map(room => (
              <Card key={room} style={styles.roomOption}>
                <Text style={styles.roomName}>{room}</Text>
                <TouchableOpacity style={styles.selectBtn}>
                  <Text style={styles.selectBtnText}>Switch</Text>
                </TouchableOpacity>
              </Card>
            ))}
          </>
        )}

        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            Note: Changing session details will notify all enrolled students immediately via push notification.
          </Text>
        </View>

        <Button 
          title="Update Session" 
          onPress={() => alert('Session Updated!')}
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
  typeRow: { flexDirection: 'row', gap: theme.spacing.md },
  typeBtn: { flex: 1, backgroundColor: theme.colors.card, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: theme.colors.border },
  activeTypeBtn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  typeBtnText: { fontSize: 14, fontWeight: '700', color: theme.colors.textSecondary },
  activeTypeBtnText: { color: '#FFF' },
  infoCard: { backgroundColor: theme.colors.accent, borderWidth: 0 },
  infoText: { fontSize: 15, fontWeight: '600', color: theme.colors.textSecondary },
  inputCard: { padding: 0 },
  pickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md },
  pickerText: { fontSize: 15, color: theme.colors.textMuted },
  roomOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
  roomName: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  selectBtn: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  selectBtnText: { fontSize: 12, fontWeight: '700', color: theme.colors.primary },
  notice: { marginTop: theme.spacing.xl, padding: theme.spacing.md, backgroundColor: theme.colors.warning + '10', borderRadius: theme.borderRadius.md },
  noticeText: { fontSize: 13, color: theme.colors.warning, lineHeight: 18, textAlign: 'center', fontStyle: 'italic' },
  submitBtn: { marginTop: theme.spacing.xl },
});
