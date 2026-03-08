import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, TextInput, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

export default function UserManagementScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('student'); // 'student' or 'professor'
  const isFocused = useIsFocused();

  // Create Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [filieres, setFilieres] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedFiliere, setSelectedFiliere] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [creating, setCreating] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = tab === 'student' ? await ApiService.getStudents() : await ApiService.getProfessors();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    if (isFocused) fetchUsers();
  }, [isFocused, fetchUsers]);

  // Fetch meta-data for creation
  useEffect(() => {
    if (modalVisible) {
      const fetchMeta = async () => {
        try {
          const [fData, mData] = await Promise.all([
            ApiService.getFilieres(),
            ApiService.getModules()
          ]);
          setFilieres(fData);
          setModules(mData);
        } catch (err) {
          console.error(err);
        }
      };
      fetchMeta();
    }
  }, [modalVisible]);

  const handleCreate = async () => {
    if (!name || !email || !selectedFiliere) {
      const msg = 'Please fill name, email and select a filiere';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Validation', msg);
      return;
    }

    setCreating(true);
    try {
      if (tab === 'student') {
        await ApiService.addStudent({ name, email, filiere_id: selectedFiliere.id });
      } else {
        await ApiService.addProfessor({ 
          name, 
          email, 
          department_id: selectedFiliere.department_id,
          module_id: selectedModule?.id 
        });
      }
      
      const successMsg = `${tab.toUpperCase()} created successfully!`;
      if (Platform.OS === 'web') alert(successMsg); else Alert.alert('Success', successMsg);
      
      setModalVisible(false);
      setName(''); setEmail(''); setSelectedFiliere(null); setSelectedModule(null);
      fetchUsers();
    } catch (err) {
      const errMsg = typeof err === 'string' ? err : 'Failed to create user';
      if (Platform.OS === 'web') alert(errMsg); else Alert.alert('Error', errMsg);
    } finally {
      setCreating(false);
    }
  };

  const filteredModules = selectedFiliere 
    ? modules.filter(m => m.filiere_id === selectedFiliere.id)
    : [];

  const renderUser = ({ item }) => (
    <Card 
      style={styles.userCard}
      onPress={() => navigation.navigate(tab === 'student' ? 'StudentDetail' : 'ProfessorDetail', { [tab]: item })}
    >
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={styles.userMeta}>
            {tab === 'student' 
              ? `${item.registration_number || 'STU-NEW'} • ${item.filiere_name}`
              : `${item.department_name || 'Academic Faculty'}`
            }
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="User Management" 
        subtitle="University Identity Registry" 
        rightElement={
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="person-add" size={22} color="#FFF" />
          </TouchableOpacity>
        }
      />
      
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, tab === 'student' && styles.activeTab]} onPress={() => setTab('student')}>
          <Text style={[styles.tabText, tab === 'student' && styles.activeTabText]}>Students</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'professor' && styles.activeTab]} onPress={() => setTab('professor')}>
          <Text style={[styles.tabText, tab === 'professor' && styles.activeTabText]}>Professors</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchUsers} color={theme.colors.primary} />}
        ListEmptyComponent={!loading && <Text style={styles.empty}>No {tab}s registered in the system.</Text>}
      />

      {/* Creation Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New {tab === 'student' ? 'Student' : 'Professor'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.form}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter full name" />

                <Text style={styles.label}>Email Address</Text>
                <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@university.edu" keyboardType="email-address" autoCapitalize="none" />

                <Text style={styles.label}>{tab === 'student' ? 'Field of Study' : 'Target Filiere'}</Text>
                <View style={styles.chipGrid}>
                  {filieres.map(f => (
                    <TouchableOpacity 
                      key={f.id} 
                      style={[styles.chip, selectedFiliere?.id === f.id && styles.activeChip]}
                      onPress={() => { setSelectedFiliere(f); setSelectedModule(null); }}
                    >
                      <Text style={[styles.chipText, selectedFiliere?.id === f.id && styles.activeChipText]}>{f.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {tab === 'professor' && selectedFiliere && (
                  <>
                    <Text style={styles.label}>Assign Primary Module (Optional)</Text>
                    <View style={styles.chipGrid}>
                      {filteredModules.map(m => (
                        <TouchableOpacity 
                          key={m.id} 
                          style={[styles.chip, selectedModule?.id === m.id && styles.activeChipSecondary]}
                          onPress={() => setSelectedModule(m)}
                        >
                          <Text style={[styles.chipText, selectedModule?.id === m.id && styles.activeChipText]}>{m.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                <Button title={`Create ${tab.capitalize()}`} onPress={handleCreate} loading={creating} style={styles.submitBtn} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Extension for string capitalization
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  tabBar: { flexDirection: 'row', paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: theme.colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  activeTabText: { color: theme.colors.primary },
  list: { padding: theme.spacing.lg },
  userCard: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm, padding: theme.spacing.md },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: theme.colors.primary },
  userName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  userEmail: { fontSize: 13, color: theme.colors.textSecondary },
  userMeta: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  actionBtn: { padding: 8 },
  empty: { textAlign: 'center', marginTop: 100, color: theme.colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  form: { gap: 16 },
  label: { fontSize: 13, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: theme.colors.accent, padding: 14, borderRadius: 12, fontSize: 16, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  activeChip: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  activeChipSecondary: { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
  chipText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '600' },
  activeChipText: { color: '#FFF' },
  submitBtn: { marginTop: 24 }
});
