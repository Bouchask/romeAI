import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Switch, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

export default function ModifyRoomScreen({ navigation, route }) {
  const { room } = route.params;
  
  const [name, setName] = useState(room.name);
  const [capacity, setCapacity] = useState(room.capacity.toString());
  const [type, setType] = useState(room.type || 'Classroom');
  const [status, setStatus] = useState(room.status || 'active');
  const [hasWifi, setHasWifi] = useState(room.has_wifi ?? true);
  const [hasProjector, setHasProjector] = useState(room.has_projector ?? true);
  const [lienGps, setLienGps] = useState(room.lien_gps || '');
  
  const [saving, setSaving] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const roomTypes = ['Classroom', 'TD', 'TP', 'Presentation', 'Amphi', 'Lab'];

  const handleSave = async () => {
    console.log('Save button clicked');
    if (!name || !capacity) {
      const msg = 'Please fill in required fields (Name, Capacity)';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Error', msg);
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name,
        capacity: parseInt(capacity),
        type,
        status,
        has_wifi: hasWifi,
        has_projector: hasProjector,
        lien_gps: lienGps
      };
      
      await ApiService.updateRoom(room.id, updateData);
      
      const successMsg = 'Room updated successfully';
      if (Platform.OS === 'web') {
        alert(successMsg);
        navigation.goBack();
      } else {
        Alert.alert('Success', successMsg, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err) {
      console.error('Update failed:', err);
      const errMsg = typeof err === 'string' ? err : 'Failed to update room';
      if (Platform.OS === 'web') alert(errMsg);
      else Alert.alert('Error', errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader 
        title="Edit Classroom" 
        subtitle={`Asset ID: #${room.id}`} 
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      <View style={styles.content}>
        <Text style={styles.label}>Basic Information</Text>
        <Card style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Asset Name</Text>
            <TextInput 
              style={styles.input} 
              value={name} 
              onChangeText={setName}
              placeholder="e.g. Room 101" 
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Asset Type</Text>
            <TouchableOpacity 
              style={styles.picker}
              onPress={() => setShowTypePicker(!showTypePicker)}
            >
              <Text style={styles.pickerText}>{type}</Text>
              <Ionicons name={showTypePicker ? "chevron-up" : "chevron-down"} size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            {showTypePicker && (
              <View style={styles.typeList}>
                {roomTypes.map((t) => (
                  <TouchableOpacity 
                    key={t} 
                    style={[styles.typeItem, type === t && styles.activeTypeItem]}
                    onPress={() => { setType(t); setShowTypePicker(false); }}
                  >
                    <Text style={[styles.typeItemText, type === t && styles.activeTypeItemText]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Max Capacity</Text>
            <TextInput 
              style={styles.input} 
              value={capacity} 
              onChangeText={setCapacity}
              keyboardType="numeric" 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>GPS Link (Maps URL)</Text>
            <TextInput 
              style={styles.input} 
              value={lienGps} 
              onChangeText={setLienGps}
              placeholder="https://maps.google.com/..."
              autoCapitalize="none"
            />
          </View>
        </Card>

        <Text style={styles.label}>Parameters & Status</Text>
        <Card style={styles.formCard}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>Availability Status</Text>
              <Text style={styles.switchSub}>Currently {status === 'active' ? 'Active' : 'Maintenance'}</Text>
            </View>
            <Switch 
              value={status === 'active'} 
              onValueChange={(val) => setStatus(val ? 'active' : 'maintenance')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
              thumbColor={status === 'active' ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.paramInfo}>
              <Ionicons name="wifi" size={20} color={hasWifi ? theme.colors.success : theme.colors.textMuted} />
              <Text style={styles.paramText}>Wi-Fi Infrastructure</Text>
            </View>
            <Switch 
              value={hasWifi} 
              onValueChange={setHasWifi}
              trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
            />
          </View>

          <View style={[styles.switchRow, { marginTop: 12 }]}>
            <View style={styles.paramInfo}>
              <Ionicons name="videocam" size={20} color={hasProjector ? theme.colors.primary : theme.colors.textMuted} />
              <Text style={styles.paramText}>Multimedia Projector</Text>
            </View>
            <Switch 
              value={hasProjector} 
              onValueChange={setHasProjector}
              trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
            />
          </View>
        </Card>

        <View style={styles.footer}>
          <Button 
            title="Save Asset Changes" 
            onPress={handleSave} 
            loading={saving}
          />
          <TouchableOpacity style={styles.deleteBtn} disabled={saving}>
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
  typeList: { marginTop: 8, backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  typeItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  activeTypeItem: { backgroundColor: theme.colors.primaryLight },
  typeItemText: { fontSize: 14, color: theme.colors.text },
  activeTypeItemText: { color: theme.colors.primary, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  switchSub: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.md },
  paramInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  paramText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  footer: { marginTop: theme.spacing.xl, gap: theme.spacing.md, paddingBottom: 40 },
  deleteBtn: { alignItems: 'center', paddingVertical: 12 },
  deleteText: { color: theme.colors.error, fontWeight: '600', fontSize: 14 },
});
