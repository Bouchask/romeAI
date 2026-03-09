import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

export default function ProfessorDetailScreen({ navigation, route }) {
  const { professor: initialProf } = route.params;
  const [professor, setProfessor] = useState(initialProf);
  const [loading, setLoading] = useState(true);
  const [myModules, setMyModules] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  
  // States
  const [showAssign, setShowAssign] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allModules, allProfs] = await Promise.all([
        ApiService.getModules(),
        ApiService.getProfessors()
      ]);
      const freshProf = allProfs.find(p => p.id === professor.id);
      if (freshProf) setProfessor(freshProf);
      setMyModules(allModules.filter(m => m.professor_id === professor.id));
      setAvailableModules(allModules.filter(m => !m.professor_id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [professor.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLinkModule = async (moduleId) => {
    if (myModules.length >= 3) { alert("Max load reached (3 modules)."); return; }
    setProcessing(true);
    try {
      await ApiService.updateModule(moduleId, { professor_id: professor.id });
      fetchData();
      setShowAssign(false);
    } catch (err) { alert("Linking failed"); }
    finally { setProcessing(false); }
  };

  const handleUnlinkModule = async (moduleId) => {
    setProcessing(true);
    try {
      await ApiService.updateModule(moduleId, { professor_id: null });
      fetchData();
    } catch (err) { alert("Unlinking failed"); }
    finally { setProcessing(false); }
  };

  const handleResetPassword = async () => {
    if (!newPassword) return;
    setProcessing(true);
    try {
      await ApiService.updateProfessor(professor.id, { password: newPassword });
      setNewPassword('');
      setShowPasswordReset(false);
      const msg = "Faculty credentials updated!";
      if (Platform.OS === 'web') alert(msg); else Alert.alert("Success", msg);
    } catch (err) { alert("Reset failed"); }
    finally { setProcessing(false); }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Faculty Profile" subtitle={professor.email} showBack onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.hero}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{professor.name.charAt(0)}</Text></View>
          <Text style={styles.name}>{professor.name}</Text>
          <View style={styles.deptBadge}><Text style={styles.deptText}>{professor.department_name}</Text></View>
        </View>

        <Card style={styles.loadCard}>
          <View style={styles.loadHeader}>
            <Text style={styles.loadTitle}>Teaching Load</Text>
            <Text style={styles.loadCount}>{myModules.length} / 3</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(myModules.length / 3) * 100}%`, backgroundColor: myModules.length >= 3 ? theme.colors.error : theme.colors.primary }]} />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Security & Credentials</Text>
        <Card style={styles.infoCard}>
          <TouchableOpacity style={styles.row} onPress={() => setShowPasswordReset(!showPasswordReset)}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.warning + '15' }]}><Ionicons name="lock-closed" size={20} color={theme.colors.warning} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>PASSWORD RESET</Text>
              <Text style={styles.value}>Update Login Access</Text>
            </View>
            <Ionicons name={showPasswordReset ? "chevron-up" : "chevron-down"} size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
          {showPasswordReset && (
            <View style={styles.resetForm}>
              <TextInput style={styles.input} placeholder="New faculty password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
              <Button title="Save Password" loading={processing} onPress={handleResetPassword} />
            </View>
          )}
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Course Portfolio</Text>
          {myModules.length < 3 && (
            <TouchableOpacity onPress={() => setShowAssign(!showAssign)}>
              <Ionicons name={showAssign ? "close-circle" : "add-circle"} size={26} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {showAssign && (
          <View style={styles.assignArea}>
            {availableModules.length === 0 ? <Text style={styles.empty}>No vacant modules.</Text> :
              availableModules.map(m => (
                <TouchableOpacity key={m.id} style={styles.moduleChip} onPress={() => handleLinkModule(m.id)}>
                  <Text style={styles.moduleChipText}>{m.name}</Text>
                  <Ionicons name="add" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              ))
            }
          </View>
        )}

        {loading ? <ActivityIndicator color={theme.colors.primary} /> :
          myModules.map(m => (
            <Card key={m.id} style={styles.moduleCard}>
              <View style={styles.moduleRow}>
                <View style={styles.moduleIcon}><Ionicons name="book" size={20} color={theme.colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modName}>{m.name}</Text>
                  <Text style={styles.modMeta}>{m.filiere_name}</Text>
                </View>
                <TouchableOpacity onPress={() => handleUnlinkModule(m.id)}>
                  <Ionicons name="remove-circle-outline" size={22} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        }
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  hero: { alignItems: 'center', marginVertical: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  name: { fontSize: 22, fontWeight: '800', color: theme.colors.text },
  deptBadge: { marginTop: 8, backgroundColor: theme.colors.primaryLight + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  deptText: { fontSize: 11, fontWeight: '800', color: theme.colors.primary, textTransform: 'uppercase' },
  content: { padding: 20 },
  loadCard: { padding: 16, marginBottom: 24 },
  loadHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  loadTitle: { fontSize: 13, fontWeight: '800', color: theme.colors.textSecondary },
  loadCount: { fontSize: 13, fontWeight: '800', color: theme.colors.primary },
  progressBar: { height: 8, backgroundColor: theme.colors.accent, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  infoCard: { padding: 16, marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted },
  value: { fontSize: 15, fontWeight: '700', color: theme.colors.text, marginTop: 2 },
  resetForm: { marginTop: 16, gap: 8 },
  input: { backgroundColor: theme.colors.accent, padding: 12, borderRadius: 10, fontSize: 14, borderWidth: 1, borderColor: theme.colors.border },
  assignArea: { marginBottom: 20, padding: 16, backgroundColor: '#F8FAFC', borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: theme.colors.primary, marginTop: 12 },
  moduleChip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
  moduleChipText: { fontSize: 14, fontWeight: '600' },
  moduleCard: { marginBottom: 10, padding: 12 },
  moduleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  moduleIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  modName: { fontSize: 15, fontWeight: '700' },
  modMeta: { fontSize: 12, color: theme.colors.textMuted },
  empty: { textAlign: 'center', color: theme.colors.textMuted, fontSize: 13 }
});
