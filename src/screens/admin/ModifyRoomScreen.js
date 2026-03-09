import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

const ROOM_TYPES = ['Classroom', 'Amphi', 'Lab', 'TD', 'TP'];

export default function ModifyRoomScreen({ navigation, route }) {
  const { room } = route.params;
  
  const [name, setName] = useState(room.name);
  const [capacity, setCapacity] = useState(String(room.capacity));
  const [type, setType] = useState(room.type || 'Classroom');
  const [hasWifi, setHasWifi] = useState(!!room.has_wifi);
  const [hasProjector, setHasProjector] = useState(!!room.has_projector);
  const [lienGps, setLienGps] = useState(room.lien_gps || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !capacity) {
      alert("Fields required");
      return;
    }
    setSaving(true);
    try {
      await ApiService.updateRoom(room.id, {
        name,
        capacity: parseInt(capacity),
        type,
        has_wifi: hasWifi,
        has_projector: hasProjector,
        lien_gps: lienGps,
        status: room.status
      });
      if (Platform.OS === 'web') alert("Updated successfully"); else Alert.alert("Success", "Updated");
      navigation.goBack();
    } catch (err) {
      alert("Error saving changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Edit Room" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.card}>
          <Text style={styles.label}>IDENTIFIER</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={styles.label}>CAPACITY (SEATS)</Text>
          <TextInput style={styles.input} value={capacity} onChangeText={setCapacity} keyboardType="numeric" />

          <Text style={styles.label}>CATEGORY</Text>
          <View style={styles.row}>
            {ROOM_TYPES.map(t => (
              <TouchableOpacity key={t} style={[styles.chip, type === t && styles.activeChip]} onPress={() => setType(t)}>
                <Text style={[styles.chipText, type === t && styles.activeChipText]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>EQUIPMENT</Text>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.amenity, hasWifi && styles.activeAmenity]} onPress={() => setHasWifi(!hasWifi)}>
              <Ionicons name="wifi" size={16} color={hasWifi ? "#FFF" : theme.colors.textSecondary} />
              <Text style={[styles.amenityText, hasWifi && styles.activeAmenityText]}>WiFi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.amenity, hasProjector && styles.activeAmenity]} onPress={() => setHasProjector(!hasProjector)}>
              <Ionicons name="videocam" size={16} color={hasProjector ? "#FFF" : theme.colors.textSecondary} />
              <Text style={[styles.amenityText, hasProjector && styles.activeAmenityText]}>Projector</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>GEOLOCATION LINK</Text>
          <TextInput style={styles.input} value={lienGps} onChangeText={setLienGps} placeholder="Google Maps URL" />
        </Card>
        
        <View style={styles.footer}>
          <Button title="Save Changes" loading={saving} onPress={handleSave} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: 20 },
  card: { padding: 20 },
  label: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted, marginBottom: 8, marginTop: 16, letterSpacing: 1 },
  input: { backgroundColor: theme.colors.accent, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, color: theme.colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, backgroundColor: theme.colors.accent, borderWidth: 1, borderColor: theme.colors.border },
  activeChip: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  activeChipText: { color: '#FFF' },
  amenity: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: 10, backgroundColor: theme.colors.accent, borderWidth: 1, borderColor: theme.colors.border },
  activeAmenity: { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
  amenityText: { fontSize: 13, fontWeight: '700', color: theme.colors.textSecondary },
  activeAmenityText: { color: '#FFF' },
  footer: { marginTop: 24, paddingBottom: 40 }
});
