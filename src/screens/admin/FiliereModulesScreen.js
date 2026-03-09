import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Alert, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

export default function FiliereModulesScreen({ navigation, route }) {
  const { filiere } = route.params;
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [professors, setProfessors] = useState([]);
  const isFocused = useIsFocused();

  // Create Module Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [selectedProfId, setSelectedProfId] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [modData, profData] = await Promise.all([
        ApiService.getModules(),
        ApiService.getProfessors()
      ]);
      
      const myModules = modData.filter(m => m.filiere_id === filiere.id);
      setModules(myModules);
      setProfessors(profData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filiere]);

  useEffect(() => { if (isFocused) fetchData(); }, [isFocused, fetchData]);

  const handleCreateModule = async () => {
    if (!name) return;
    setProcessing(true);
    try {
      await ApiService.addModule({
        name,
        filiere_id: filiere.id,
        professor_id: selectedProfId
      });
      
      const msg = 'Module added successfully!';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Success', msg);
      
      setModalVisible(false);
      setName('');
      setSelectedProfId(null);
      fetchData();
    } catch (err) {
      console.error('Add module error:', err);
      const msg = typeof err === 'string' ? err : 'Failed to add module. Check your connection or parameters.';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Error', msg);
    } finally {
      setProcessing(false);
    }
  };

  const renderModule = ({ item }) => (
    <Card 
      style={styles.moduleCard} 
      onPress={() => navigation.navigate('ModuleDetail', { module: item })}
    >
      <View style={styles.moduleRow}>
        <View style={styles.iconBox}><Ionicons name="journal" size={20} color={theme.colors.primary} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.moduleName}>{item.name}</Text>
          <Text style={styles.moduleProf}>{item.professor_name || 'Prof. Unassigned'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title={filiere.name} 
        subtitle="Program Curriculum" 
        showBack={true}
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={24} color="#FFF" />
          </TouchableOpacity>
        }
      />
      
      <FlatList
        data={modules}
        renderItem={renderModule}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} color={theme.colors.primary} />}
        ListEmptyComponent={!loading && <Text style={styles.empty}>No modules registered for this filiere.</Text>}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Module</Text>
            
            <Text style={styles.label}>Module Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Advanced Mathematics" />

            <Text style={styles.label}>Assign Professor (Optional)</Text>
            <ScrollView horizontal style={styles.profPicker} showsHorizontalScrollIndicator={false}>
              <TouchableOpacity 
                style={[styles.profChip, !selectedProfId && styles.activeChip]}
                onPress={() => setSelectedProfId(null)}
              >
                <Text style={[styles.chipText, !selectedProfId && styles.activeChipText]}>None</Text>
              </TouchableOpacity>
              {professors.map(p => (
                <TouchableOpacity 
                  key={p.id} 
                  style={[styles.profChip, selectedProfId === p.id && styles.activeChip]}
                  onPress={() => setSelectedProfId(p.id)}
                >
                  <Text style={[styles.chipText, selectedProfId === p.id && styles.activeChipText]}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Button title="Create Module" onPress={handleCreateModule} loading={processing} style={styles.submitBtn} />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}><Text>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  list: { padding: theme.spacing.lg },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  moduleCard: { marginBottom: 8, padding: 12 },
  moduleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  moduleName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  moduleProf: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 40, color: theme.colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, gap: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase' },
  input: { backgroundColor: theme.colors.accent, padding: 14, borderRadius: 12 },
  profPicker: { flexDirection: 'row', paddingVertical: 10 },
  profChip: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: theme.colors.accent, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: theme.colors.border },
  activeChip: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 12, fontWeight: '600' },
  activeChipText: { color: '#FFF' },
  submitBtn: { marginTop: 8 },
  closeBtn: { alignItems: 'center' }
});
