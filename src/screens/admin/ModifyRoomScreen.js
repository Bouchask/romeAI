import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export default function ModifyRoomScreen({ navigation, route }) {
  const { room } = route.params || { room: { name: 'New Room', capacity: 30, type: 'Classroom', status: 'active' } };
  const [isActive, setIsActive] = useState(room.status === 'active');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader 
        title="Classroom Assets" 
        subtitle={`Editing: ${room.name}`} 
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      <View style={styles.content}>
        <Text style={styles.label}>Basic Information</Text>
        <Card style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Asset Name</Text>
            <TextInput style={styles.input} defaultValue={room.name} placeholder="e.g. Room 101" />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Asset Type</Text>
            <TouchableOpacity style={styles.picker}>
              <Text style={styles.pickerText}>{room.type || 'Select Type'}</Text>
              <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Max Capacity</Text>
            <TextInput style={styles.input} defaultValue={room.capacity?.toString()} keyboardType="numeric" />
          </View>
        </Card>

        <Text style={styles.label}>Parameters & Status</Text>
        <Card style={styles.formCard}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>Availability Status</Text>
              <Text style={styles.switchSub}>Currently {isActive ? 'Active' : 'Maintenance'}</Text>
            </View>
            <Switch 
              value={isActive} 
              onValueChange={setIsActive}
              trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
              thumbColor={isActive ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.divider} />

          <View style={styles.paramRow}>
            <Ionicons name="wifi" size={20} color={theme.colors.success} />
            <Text style={styles.paramText}>Wi-Fi Infrastructure Ready</Text>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} style={styles.mlAuto} />
          </View>

          <View style={styles.paramRow}>
            <Ionicons name="videocam" size={20} color={theme.colors.primary} />
            <Text style={styles.paramText}>Multimedia Projector</Text>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} style={styles.mlAuto} />
          </View>
        </Card>

        <View style={styles.footer}>
          <Button title="Save Asset Changes" onPress={() => navigation.goBack()} />
          <TouchableOpacity style={styles.deleteBtn}>
            <Text style={styles.deleteText}>Decommission Asset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  label: { fontSize: 13, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: theme.spacing.sm, marginTop: theme.spacing.lg },
  formCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.md },
  inputGroup: { marginBottom: theme.spacing.lg },
  inputLabel: { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 8 },
  input: { backgroundColor: theme.colors.accent, padding: 12, borderRadius: 10, fontSize: 15, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border },
  picker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.accent, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border },
  pickerText: { fontSize: 15, color: theme.colors.text },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  switchTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  switchSub: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.md },
  paramRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  paramText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  mlAuto: { marginLeft: 'auto' },
  footer: { marginTop: theme.spacing.xl, gap: theme.spacing.md },
  deleteBtn: { alignItems: 'center', paddingVertical: 12 },
  deleteText: { color: theme.colors.error, fontWeight: '600', fontSize: 14 },
});
