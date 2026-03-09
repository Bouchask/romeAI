import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StatCard } from '../../components/StatCard';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

const { width: windowWidth } = Dimensions.get('window');

export default function AdminDashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ students: 0, professors: 0, rooms: 0, modules: 0 });
  const [filieres, setFilieres] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Modals
  const [depModal, setDepModal] = useState(false);
  const [filModal, setFilModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedDepId, setSelectedDepId] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [students, professors, rooms, modules, filiereData, depData] = await Promise.all([
        ApiService.getStudents(),
        ApiService.getProfessors(),
        ApiService.getRooms(),
        ApiService.getModules(),
        ApiService.getFilieres(),
        ApiService.getDepartments()
      ]);

      setStats({
        students: students.length,
        professors: professors.length,
        rooms: rooms.length,
        modules: modules.length
      });
      
      setFilieres(filiereData);
      setDepartments(depData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateDep = async () => {
    if (!newName) return;
    setProcessing(true);
    try {
      await ApiService.addDepartment({ name: newName });
      setDepModal(false); setNewName(''); fetchData();
    } catch (err) { alert(err); } finally { setProcessing(false); }
  };

  const handleCreateFil = async () => {
    if (!newName || !selectedDepId) {
      alert('Fill name and select a department');
      return;
    }
    setProcessing(true);
    try {
      await ApiService.addFiliere({ name: newName, department_id: selectedDepId });
      setFilModal(false); setNewName(''); setSelectedDepId(null); fetchData();
    } catch (err) { alert(err); } finally { setProcessing(false); }
  };

  if (loading && !depModal && !filModal) {
    return (
      <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} color={theme.colors.primary} />}
    >
      <ScreenHeader title="Admin Control" subtitle="Campus System Overview" />

      <View style={styles.mainContent}>
        <View style={styles.statsGrid}>
          <StatCard title="Students" value={stats.students.toString()} icon="people" color="#3B82F6" />
          <StatCard title="Professors" value={stats.professors.toString()} icon="school" color="#8B5CF6" />
          <StatCard title="Rooms" value={stats.rooms.toString()} icon="business" color="#10B981" />
          <StatCard title="Modules" value={stats.modules.toString()} icon="library" color="#F59E0B" />
        </View>

        <Text style={styles.sectionTitle}>Administrative Actions</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionCard} onPress={() => setDepModal(true)}>
            <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
            <Text style={styles.actionText}>New Dept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => setFilModal(true)}>
            <Ionicons name="school" size={24} color={theme.colors.primary} />
            <Text style={styles.actionText}>New Filiere</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Rooms')}>
            <Ionicons name="business" size={24} color={theme.colors.primary} />
            <Text style={styles.actionText}>New Room</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Academic Departments (Filieres)</Text>
        {filieres.map((item) => (
          <Card key={item.id} style={styles.listCard} onPress={() => navigation.navigate('FiliereModules', { filiere: item })}>
            <View style={styles.row}>
              <View style={styles.iconBox}><Ionicons name="business" size={20} color={theme.colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>{item.department_name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </View>
          </Card>
        ))}
      </View>

      {/* Dept Modal */}
      <Modal visible={depModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Department</Text>
            <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="e.g. Faculty of Arts" />
            <Button title="Create" onPress={handleCreateDep} loading={processing} />
            <TouchableOpacity onPress={() => setDepModal(false)} style={styles.closeBtn}><Text>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filiere Modal */}
      <Modal visible={filModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Filiere</Text>
            <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="e.g. History" />
            <Text style={styles.miniLabel}>Select Parent Department</Text>
            <ScrollView horizontal style={styles.depPicker}>
              {departments.map(d => (
                <TouchableOpacity 
                  key={d.id} 
                  style={[styles.depChip, selectedDepId === d.id && styles.activeChip]}
                  onPress={() => setSelectedDepId(d.id)}
                >
                  <Text style={[styles.chipText, selectedDepId === d.id && styles.activeChipText]}>{d.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button title="Create" onPress={handleCreateFil} loading={processing} />
            <TouchableOpacity onPress={() => setFilModal(false)} style={styles.closeBtn}><Text>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  mainContent: { paddingHorizontal: theme.spacing.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', marginTop: 24, marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, backgroundColor: '#FFF', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  actionText: { fontSize: 12, fontWeight: '700', marginTop: 8 },
  listCard: { marginBottom: 8, padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  sub: { fontSize: 12, color: theme.colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, gap: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  input: { backgroundColor: theme.colors.accent, padding: 14, borderRadius: 12 },
  closeBtn: { alignItems: 'center', marginTop: 8 },
  depPicker: { flexDirection: 'row', paddingVertical: 10 },
  depChip: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: theme.colors.accent, borderRadius: 20, marginRight: 8 },
  activeChip: { backgroundColor: theme.colors.primary },
  miniLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.textMuted },
  chipText: { fontSize: 12 },
  activeChipText: { color: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
