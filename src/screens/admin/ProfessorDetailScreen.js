import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

export default function ProfessorDetailScreen({ navigation, route }) {
  const { professor } = route.params;
  const [loading, setLoading] = useState(true);
  const [myModules, setMyModules] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [showAssignModule, setShowAssignModule] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const modules = await ApiService.getModules();
      setMyModules(modules.filter(m => m.professor_id === professor.id));
      // Modules without professor
      setAvailableModules(modules.filter(m => !m.professor_id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [professor.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignModule = async (moduleId) => {
    if (myModules.length >= 3) {
      const msg = 'Max load reached: This professor already has 3 modules.';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Limit Reached', msg);
      return;
    }

    setAssigning(true);
    try {
      await ApiService.updateProfessor(professor.id, { 
        module_id: moduleId 
      });
      const msg = 'Module assigned successfully!';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Success', msg);
      setShowAssignModule(false);
      fetchData();
    } catch (err) {
      const errMsg = typeof err === 'string' ? err : 'Assignment failed';
      if (Platform.OS === 'web') alert(errMsg); else Alert.alert('Error', errMsg);
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignModule = async (moduleId) => {
    // Unassigning logic (Setting prof_id to null)
    setAssigning(true);
    try {
      // We can use a custom route or a generic module update if we had it
      // For now, let's assume we can pass null to prof update if we improved backend
      // But simpler: let's just show an alert that this feature is coming
      // OR implement a quick PUT /modules/<id> in backend
      const msg = 'Unassigning module...';
      console.log(msg, moduleId);
      
      // Let's assume we implement unassign via updateProfessor with negative ID or similar
      // Or better, just implement handleUnassign in backend later
      Alert.alert('Notice', 'Unassigning feature will be available in next update.');
    } finally {
      setAssigning(false);
    }
  };

  const handleDelete = async () => {
    const performDelete = async () => {
      try {
        await ApiService.deleteProfessor(professor.id);
        navigation.goBack();
      } catch (err) {
        alert('Delete failed');
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Permanently delete this professor?')) performDelete();
    } else {
      Alert.alert('Delete Professor', 'This action will unassign all their modules.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Professor Profile" 
        subtitle="Faculty Member Details" 
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content}>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.success + '20' }]}>
              <Text style={[styles.avatarText, { color: theme.colors.success }]}>{professor.name.charAt(0)}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{professor.name}</Text>
              <Text style={styles.email}>{professor.email}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>DEPARTMENT</Text>
            <Text style={styles.value}>{professor.department_name || 'Academic Faculty'}</Text>
          </View>
          
          <View style={[styles.infoSection, { marginTop: 12 }]}>
            <Text style={styles.label}>CURRENT LOAD</Text>
            <Text style={[styles.value, { color: myModules.length >= 3 ? theme.colors.error : theme.colors.text }]}>
              {myModules.length} / 3 Modules
            </Text>
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Currently Teaching</Text>
          {myModules.length < 3 && (
            <TouchableOpacity 
              style={styles.addSmallBtn} 
              onPress={() => setShowAssignModule(!showAssignModule)}
            >
              <Ionicons name={showAssignModule ? "close-circle" : "add-circle"} size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {showAssignModule && (
          <Card style={styles.assignCard}>
            <Text style={styles.assignTitle}>Available Courses</Text>
            {availableModules.length === 0 ? (
              <Text style={styles.emptyText}>No vacant modules found.</Text>
            ) : (
              <View style={styles.chipGrid}>
                {availableModules.map(m => (
                  <TouchableOpacity 
                    key={m.id} 
                    style={styles.chip} 
                    onPress={() => handleAssignModule(m.id)}
                    disabled={assigning}
                  >
                    <Text style={styles.chipText}>{m.name}</Text>
                    <Ionicons name="add" size={14} color={theme.colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>
        )}

        {loading ? <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} /> : 
          myModules.length === 0 ? <Text style={styles.emptyText}>No modules assigned to this professor.</Text> :
          myModules.map(m => (
            <Card key={m.id} style={styles.moduleCard}>
              <View style={styles.moduleRow}>
                <View style={styles.moduleIcon}>
                  <Ionicons name="book" size={20} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.moduleName}>{m.name}</Text>
                  <Text style={styles.moduleMeta}>{m.filiere_name}</Text>
                </View>
              </View>
            </Card>
          ))
        }

        <Button 
          title="Remove from Faculty" 
          variant="outline" 
          style={styles.deleteBtn}
          textStyle={{ color: theme.colors.error }}
          onPress={handleDelete}
        />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  profileCard: { padding: 20 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  email: { fontSize: 14, color: theme.colors.textSecondary },
  infoSection: { paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.border },
  label: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted, letterSpacing: 1 },
  value: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase' },
  addSmallBtn: { padding: 4 },
  assignCard: { padding: 16, marginBottom: 16, backgroundColor: '#F8FAFC', borderStyle: 'dashed', borderWidth: 1, borderColor: theme.colors.primary },
  assignTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.primary, marginBottom: 12 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border },
  chipText: { fontSize: 12, fontWeight: '600', color: theme.colors.text },
  moduleCard: { marginBottom: 8, padding: 12 },
  moduleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  moduleIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  moduleName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  moduleMeta: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  deleteBtn: { marginTop: 40, borderColor: theme.colors.error },
  emptyText: { textAlign: 'center', color: theme.colors.textMuted, marginTop: 10, fontSize: 14 }
});
