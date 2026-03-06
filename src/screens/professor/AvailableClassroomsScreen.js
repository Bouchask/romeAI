import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';

const ROOMS = [
  { id: '1', name: 'Room 101', capacity: 40, status: 'Available', type: 'Lecture Hall' },
  { id: '2', name: 'Room 102', capacity: 35, status: 'Available', type: 'Classroom' },
  { id: '3', name: 'Room 203', capacity: 30, status: 'Occupied', type: 'Lab' },
  { id: '4', name: 'Room 205', capacity: 50, status: 'Available', type: 'Conference' },
  { id: '5', name: 'Room 301', capacity: 60, status: 'Maintenance', type: 'Hall' },
];

export default function AvailableClassroomsScreen() {
  const getStatusColor = (s) => {
    switch(s) {
      case 'Available': return theme.colors.success;
      case 'Occupied': return theme.colors.error;
      case 'Maintenance': return theme.colors.warning;
      default: return theme.colors.textMuted;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader 
        title="Classrooms" 
        subtitle="Real-time availability & capacity" 
      />
      
      <View style={styles.content}>
        {ROOMS.map((r) => {
          const color = getStatusColor(r.status);
          return (
            <Card key={r.id} style={styles.roomCard}>
              <View style={styles.row}>
                <View style={[styles.iconWrap, { backgroundColor: theme.colors.accent }]}>
                  <Ionicons name="business" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.body}>
                  <View style={styles.headerRow}>
                    <Text style={styles.name}>{r.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: color + '15' }]}>
                      <Text style={[styles.statusText, { color }]}>{r.status}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.typeText}>{r.type}</Text>
                  
                  <View style={styles.footerRow}>
                    <View style={styles.infoItem}>
                      <Ionicons name="people-outline" size={14} color={theme.colors.textSecondary} />
                      <Text style={styles.infoText}>{r.capacity} Seats</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="wifi-outline" size={14} color={theme.colors.textSecondary} />
                      <Text style={styles.infoText}>Wi-Fi Ready</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity 
                style={[styles.reserveBtn, r.status !== 'Available' && styles.disabledBtn]}
                disabled={r.status !== 'Available'}
              >
                <Text style={[styles.reserveText, r.status !== 'Available' && styles.disabledText]}>
                  Request Booking
                </Text>
              </TouchableOpacity>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  roomCard: { marginBottom: theme.spacing.md, padding: theme.spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  iconWrap: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md },
  body: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  typeText: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg, marginTop: theme.spacing.md },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '500' },
  reserveBtn: { marginTop: theme.spacing.lg, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.colors.primaryLight, alignItems: 'center' },
  reserveText: { color: theme.colors.primary, fontSize: 14, fontWeight: '600' },
  disabledBtn: { backgroundColor: theme.colors.accent },
  disabledText: { color: theme.colors.textMuted },
});
