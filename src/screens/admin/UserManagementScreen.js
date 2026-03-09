import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

export default function UserManagementScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('students');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [modules, setModules] = useState([]);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Yahya2004@'); // Default password
  const [selectedFiliereId, setSelectedFiliereId] = useState(null);
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [students, professors, filiereList, deptList, moduleList] = await Promise.all([
        ApiService.getStudents(),
        ApiService.getProfessors(),
        ApiService.getFilieres(),
        ApiService.getDepartments(),
        ApiService.getModules()
      ]);
      setUsers(activeTab === 'students' ? students : professors);
      setFilieres(filiereList);
      setDepartments(deptList);
      setModules(moduleList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateUser = async () => {
    if (!name || !email) {
      alert('Please fill name and email');
      return;
    }

    setSubmitting(true);
    try {
      if (activeTab === 'students') {
        await ApiService.addStudent({ name, email, password, filiere_id: selectedFiliereId });
      } else {
        await ApiService.addProfessor({ 
          name, 
          email, 
          password,
          department_id: selectedDeptId, 
          module_id: selectedModuleId 
        });
      }
      setModalVisible(false);
      setName(''); setEmail(''); setPassword('Yahya2004@');
      fetchData();
    } catch (err) {
      alert('Creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const perform = async () => {
      try {
        if (activeTab === 'students') await ApiService.deleteStudent(id);
        else await ApiService.deleteProfessor(id);
        fetchData();
      } catch (err) { alert('Delete failed'); }
    };
    if (Platform.OS === 'web') { if (confirm('Delete user?')) perform(); }
    else { Alert.alert('Delete', 'Confirm removal?', [{text: 'No'}, {text: 'Yes', onPress: perform}]); }
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity 
      onPress={() => {
        if (activeTab === 'students') {
          navigation.navigate('StudentDetail', { student: item });
        } else {
          navigation.navigate('ProfessorDetail', { professor: item });
        }
      }}
    >
      <Card style={styles.userCard}>
        <View style={styles.userRow}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{item.name.charAt(0)}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userMeta}>{activeTab === 'students' ? item.filiere_name : item.department_name}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id)}><Ionicons name="trash-outline" size={20} color={theme.colors.error} /></TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="User Control" subtitle="Register and manage accounts" />
      
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, activeTab === 'students' && styles.activeTab]} onPress={() => setActiveTab('students')}>
          <Text style={[styles.tabText, activeTab === 'students' && styles.activeTabText]}>Students</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'professors' && styles.activeTab]} onPress={() => setActiveTab('professors')}>
          <Text style={[styles.tabText, activeTab === 'professors' && styles.activeTabText]}>Professors</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Button title={`Add New ${activeTab === 'students' ? 'Student' : 'Professor'}`} icon="add" onPress={() => setModalVisible(true)} style={styles.addBtn} />
        
        {loading ? <ActivityIndicator size="large" color={theme.colors.primary} /> :
          <FlatList data={users} renderItem={renderUser} keyExtractor={item => item.id.toString()} contentContainerStyle={{ paddingBottom: 20 }} />
        }
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Account</Text>
            
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter name" />
            
            <Text style={styles.label}>Email Address</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@test.com" autoCapitalize="none" />

            <Text style={styles.label}>Login Password</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Yahya2004@" secureTextEntry />
            <Text style={styles.hint}>Default: Yahya2004@</Text>

            {activeTab === 'students' ? (
              <>
                <Text style={styles.label}>Filiere (Optional)</Text>
                {filieres.map(f => (
                  <TouchableOpacity key={f.id} style={[styles.option, selectedFiliereId === f.id && styles.activeOption]} onPress={() => setSelectedFiliereId(f.id)}>
                    <Text style={[styles.optionText, selectedFiliereId === f.id && styles.activeOptionText]}>{f.name}</Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <>
                <Text style={styles.label}>Department</Text>
                {departments.map(d => (
                  <TouchableOpacity key={d.id} style={[styles.option, selectedDeptId === d.id && styles.activeOption]} onPress={() => setSelectedDeptId(d.id)}>
                    <Text style={[styles.optionText, selectedDeptId === d.id && styles.activeOptionText]}>{d.name}</Text>
                  </TouchableOpacity>
                ))}
                <Text style={styles.label}>Assign to Vacant Module</Text>
                {modules.filter(m => !m.professor_id).map(m => (
                  <TouchableOpacity key={m.id} style={[styles.option, selectedModuleId === m.id && styles.activeOption]} onPress={() => setSelectedModuleId(m.id)}>
                    <Text style={[styles.optionText, selectedModuleId === m.id && styles.activeOptionText]}>{m.name}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            <Button title="Create Account" loading={submitting} onPress={handleCreateUser} style={{ marginTop: 20 }} />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: theme.colors.primary },
  tabText: { fontSize: 14, fontWeight: '700', color: theme.colors.textSecondary },
  activeTabText: { color: theme.colors.primary },
  content: { flex: 1, padding: 20 },
  addBtn: { marginBottom: 20 },
  userCard: { marginBottom: 10, padding: 12 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: 'bold', color: theme.colors.textSecondary },
  userName: { fontSize: 15, fontWeight: '700' },
  userEmail: { fontSize: 12, color: theme.colors.textMuted },
  userMeta: { fontSize: 11, color: theme.colors.primary, fontWeight: '600', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, gap: 10 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  label: { fontSize: 12, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', marginTop: 10 },
  input: { backgroundColor: theme.colors.accent, padding: 12, borderRadius: 10, fontSize: 14 },
  option: { padding: 10, borderRadius: 8, backgroundColor: theme.colors.accent, marginBottom: 5 },
  activeOption: { backgroundColor: theme.colors.primaryLight },
  optionText: { fontSize: 13, color: theme.colors.textSecondary },
  activeOptionText: { color: theme.colors.primary, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', marginTop: 15 },
  cancelText: { color: theme.colors.textMuted, fontWeight: '600' },
  hint: { fontSize: 10, color: theme.colors.textMuted, fontStyle: 'italic' }
});
