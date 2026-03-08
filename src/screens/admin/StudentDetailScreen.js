import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

export default function StudentDetailScreen({ navigation, route }) {
  const { student } = route.params;
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [showFilierePicker, setShowFilierePicker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessions, fData] = await Promise.all([
          ApiService.getSessions(),
          ApiService.getFilieres()
        ]);
        setFilieres(fData);
        
        // Today's schedule for this student's filiere
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const todayName = dayNames[new Date().getDay()];
        
        const filtered = sessions.filter(s => s.day === todayName && s.module_ref?.filiere_id === student.filiere_id);
        setSchedule(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [student]);

  const handleUpdateFiliere = async (filiereId) => {
    try {
      await ApiService.updateStudent(student.id, { filiere_id: filiereId });
      if (Platform.OS === 'web') alert('Student updated!'); else Alert.alert('Success', 'Department assignment updated.');
      setShowFilierePicker(false);
      navigation.goBack(); // Refresh list
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDelete = async () => {
    const performDelete = async () => {
      try {
        await ApiService.deleteStudent(student.id);
        navigation.goBack();
      } catch (err) {
        alert('Delete failed');
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Permanently delete this student?')) performDelete();
    } else {
      Alert.alert('Delete Student', 'This action cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Student Profile" 
        subtitle={`ID: ${student.registration_number || 'PENDING'}`} 
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content}>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{student.name}</Text>
              <Text style={styles.email}>{student.email}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>CURRENT FILIERE</Text>
              <Text style={styles.metaValue}>{student.filiere_name}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => setShowFilierePicker(!showFilierePicker)}>
              <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {showFilierePicker && (
            <View style={styles.pickerList}>
              {filieres.map(f => (
                <TouchableOpacity key={f.id} style={styles.pickerItem} onPress={() => handleUpdateFiliere(f.id)}>
                  <Text style={[styles.pickerItemText, f.id === student.filiere_id && styles.activeItem]}>{f.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        {loading ? <ActivityIndicator color={theme.colors.primary} /> : 
          schedule.length === 0 ? <Text style={styles.emptyText}>No classes for this student today.</Text> :
          schedule.map(s => (
            <Card key={s.id} style={styles.scheduleCard}>
              <Text style={styles.moduleName}>{s.module_name}</Text>
              <Text style={styles.timeText}>{s.start_time} - {s.end_time} • Room {s.room_name}</Text>
            </Card>
          ))
        }

        <Button 
          title="Delete Account" 
          variant="outline" 
          style={styles.deleteBtn}
          textStyle={{ color: theme.colors.error }}
          onPress={handleDelete}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  profileCard: { padding: 20 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '800', color: theme.colors.primary },
  name: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  email: { fontSize: 14, color: theme.colors.textSecondary },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.border },
  metaLabel: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted },
  metaValue: { fontSize: 15, fontWeight: '700', color: theme.colors.text, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.textMuted, marginTop: 24, marginBottom: 12, textTransform: 'uppercase' },
  scheduleCard: { marginBottom: 8, padding: 12 },
  moduleName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  timeText: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
  deleteBtn: { marginTop: 40, borderColor: theme.colors.error },
  pickerList: { marginTop: 12, backgroundColor: theme.colors.accent, borderRadius: 10, overflow: 'hidden' },
  pickerItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  pickerItemText: { fontSize: 14, color: theme.colors.text },
  activeItem: { color: theme.colors.primary, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: theme.colors.textMuted, marginTop: 10 }
});
