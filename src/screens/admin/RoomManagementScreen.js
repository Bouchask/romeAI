import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

const ROOMS = [
  { id: '1', name: 'Room 101', capacity: 40, status: 'active', type: 'Lecture Hall' },
  { id: '2', name: 'Room 102', capacity: 35, status: 'active', type: 'Classroom' },
  { id: '3', name: 'Room 203', capacity: 30, status: 'maintenance', type: 'Lab' },
];

export default function RoomManagementScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader 
        title="Classroom Assets" 
        subtitle="Inventory and facility management" 
        rightElement={
          <TouchableOpacity style={styles.addBtnCircle}>
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        }
      />
      <View style={styles.content}>
        <View style={styles.summaryRow}>
          <Text style={styles.countText}>{ROOMS.length} Total Classrooms</Text>
          <TouchableOpacity><Text style={styles.filterText}>Filter by Status</Text></TouchableOpacity>
        </View>

        {ROOMS.map((r) => (
          <Card key={r.id} style={styles.roomCard}>
            <View style={styles.row}>
              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <Text style={styles.name}>{r.name}</Text>
                  <View style={[styles.statusBadge, r.status === 'maintenance' && styles.statusMaintenance]}>
                    <Text style={styles.statusText}>{r.status === 'maintenance' ? 'Maintenance' : 'Active'}</Text>
                  </View>
                </View>
                <Text style={styles.typeText}>{r.type} · Capacity: {r.capacity}</Text>
              </View>
              
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => navigation.navigate('ModifyRoom', { room: r })}
                >
                  <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="settings-outline" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.footer}>
              <View style={styles.usageBar}>
                <View style={[styles.usageFill, { width: r.status === 'active' ? '65%' : '0%' }]} />
              </View>
              <Text style={styles.usageText}>Usage: {r.status === 'active' ? '65%' : 'N/A'}</Text>
            </View>
          </Card>
        ))}
        
        <Button title="Export Inventory Report" variant="outline" style={styles.exportBtn} />
      </View>
    </ScrollView>
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
  statusText: { fontSize: 10, fontWeight: '700', color: theme.colors.text, textTransform: 'uppercase' },
  actions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 8, borderRadius: 8, backgroundColor: theme.colors.accent },
  footer: { marginTop: theme.spacing.md, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  usageBar: { flex: 1, height: 6, backgroundColor: theme.colors.accent, borderRadius: 3, overflow: 'hidden' },
  usageFill: { height: '100%', backgroundColor: theme.colors.primary },
  usageText: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '600' },
  exportBtn: { marginTop: theme.spacing.lg },
});
