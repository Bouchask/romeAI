import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

export default function StudentDetailScreen({ navigation, route }) {
  const { student: initialStudent } = route.params;
  const [student, setStudent] = useState(initialStudent);
  const [loading, setLoading] = useState(true);
  const [filieres, setFilieres] = useState([]);
  
  // States
  const [showPicker, setShowPicker] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allStudents, allFilieres] = await Promise.all([
        ApiService.getStudents(),
        ApiService.getFilieres()
      ]);
      const freshStu = allStudents.find(s => s.id === student.id);
      if (freshStu) setStudent(freshStu);
      setFilieres(allFilieres);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [student.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdateFiliere = async (filiereId) => {
    setProcessing(true);
    try {
      await ApiService.updateStudent(student.id, { filiere_id: filiereId });
      setShowPicker(false);
      fetchData();
    } catch (err) {
      alert("Update failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) return;
    setProcessing(true);
    try {
      await ApiService.updateStudent(student.id, { password: newPassword });
      setNewPassword('');
      setShowPasswordReset(false);
      const msg = "Password reset successfully!";
      if (Platform.OS === 'web') alert(msg); else Alert.alert("Success", msg);
    } catch (err) {
      alert("Reset failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Student Profile" subtitle={student.registration_number || 'STU-NEW'} showBack onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.hero}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primaryLight }]}>
            <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{student.name}</Text>
          <Text style={styles.email}>{student.email}</Text>
        </View>

        <Text style={styles.sectionTitle}>Academic Status</Text>
        <Card style={styles.infoCard}>
          <View style={styles.row}>
            <View style={styles.iconBox}><Ionicons name="school" size={20} color={theme.colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>ASSIGNED PROGRAM</Text>
              <Text style={styles.value}>{student.filiere_name || 'Unassigned'}</Text>
            </View>
            <TouchableOpacity onPress={() => setShowPicker(!showPicker)}>
              <Ionicons name="swap-horizontal" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {showPicker && (
            <View style={styles.pickerArea}>
              <Text style={styles.pickerHint}>Select new program:</Text>
              {filieres.map(f => (
                <TouchableOpacity key={f.id} style={[styles.option, f.id === student.filiere_id && styles.activeOption]} onPress={() => handleUpdateFiliere(f.id)}>
                  <Text style={[styles.optionText, f.id === student.filiere_id && styles.activeOptionText]}>{f.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.iconBox}><Ionicons name="business" size={20} color={theme.colors.success} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>DEPARTMENT</Text>
              <Text style={styles.value}>{student.department_name || 'Academic Faculty'}</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Security Settings</Text>
        <Card style={styles.infoCard}>
          <TouchableOpacity style={styles.row} onPress={() => setShowPasswordReset(!showPasswordReset)}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.warning + '15' }]}><Ionicons name="lock-closed" size={20} color={theme.colors.warning} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>PASSWORD CONTROL</Text>
              <Text style={styles.value}>Click to Reset Credentials</Text>
            </View>
            <Ionicons name={showPasswordReset ? "chevron-up" : "chevron-down"} size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>

          {showPasswordReset && (
            <View style={styles.resetForm}>
              <TextInput 
                style={styles.input} 
                placeholder="Enter new secure password" 
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <Button title="Apply New Password" loading={processing} onPress={handleResetPassword} style={{ marginTop: 10 }} />
            </View>
          )}
        </Card>

        <TouchableOpacity style={styles.deleteBtn}>
          <Text style={styles.deleteText}>Delete Student Account</Text>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  hero: { alignItems: 'center', marginVertical: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: theme.colors.primary },
  name: { fontSize: 22, fontWeight: '800', color: theme.colors.text },
  email: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 24 },
  infoCard: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted },
  value: { fontSize: 15, fontWeight: '700', color: theme.colors.text, marginTop: 2 },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 16 },
  pickerArea: { marginTop: 12, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border },
  pickerHint: { fontSize: 11, fontWeight: '700', color: theme.colors.primary, marginBottom: 8 },
  option: { padding: 12, backgroundColor: '#FFF', borderRadius: 10, marginBottom: 6, borderWidth: 1, borderColor: theme.colors.border },
  activeOption: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight + '10' },
  optionText: { fontSize: 14, color: theme.colors.textSecondary },
  resetForm: { marginTop: 16, gap: 8 },
  input: { backgroundColor: theme.colors.accent, padding: 12, borderRadius: 10, fontSize: 14, borderWidth: 1, borderColor: theme.colors.border },
  deleteBtn: { marginTop: 40, alignItems: 'center', padding: 16 },
  deleteText: { color: theme.colors.error, fontWeight: '700', fontSize: 14 }
});
