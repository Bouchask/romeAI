import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StatCard } from '../../components/StatCard';
import { Card } from '../../components/Card';
import { ApiService } from '../../services/api';

const { width: windowWidth } = Dimensions.get('window');

export default function AdminDashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    professors: 0,
    rooms: 0,
    modules: 0
  });
  const [filieres, setFilieres] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [students, professors, rooms, modules, filiereData] = await Promise.all([
        ApiService.getStudents(),
        ApiService.getProfessors(),
        ApiService.getRooms(),
        ApiService.getModules(),
        ApiService.getFilieres()
      ]);

      setStats({
        students: students.length,
        professors: professors.length,
        rooms: rooms.length,
        modules: modules.length
      });
      
      setFilieres(filiereData);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchData} color={theme.colors.primary} />
      }
    >
      <ScreenHeader 
        title="Admin Control" 
        subtitle="Campus System Overview"
        rightElement={
          <View style={styles.headerAvatar}>
            <Ionicons name="shield-checkmark" size={20} color="#FFF" />
          </View>
        }
      />

      <View style={styles.mainContent}>
        <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <StatCard title="Students" value={stats.students.toString()} icon="people" color="#3B82F6" />
          </View>
          <View style={styles.statBox}>
            <StatCard title="Professors" value={stats.professors.toString()} icon="school" color="#8B5CF6" />
          </View>
          <View style={styles.statBox}>
            <StatCard title="Classrooms" value={stats.rooms.toString()} icon="business" color="#10B981" />
          </View>
          <View style={styles.statBox}>
            <StatCard title="Modules" value={stats.modules.toString()} icon="library" color="#F59E0B" />
          </View>
        </View>

        <View style={styles.layoutGrid}>
          <View style={styles.mainCol}>
            <View style={styles.rowHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Rooms')}>
                <View style={[styles.actionIcon, { backgroundColor: theme.colors.primaryLight }]}>
                  <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.actionLabel}>Add Room</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Users')}>
                <View style={[styles.actionIcon, { backgroundColor: '#F0F9FF' }]}>
                  <Ionicons name="person-add" size={24} color="#0EA5E9" />
                </View>
                <Text style={styles.actionLabel}>New User</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Exams')}>
                <View style={[styles.actionIcon, { backgroundColor: '#FDF2F8' }]}>
                  <Ionicons name="calendar" size={24} color="#DB2777" />
                </View>
                <Text style={styles.actionLabel}>Schedule</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.rowHeader, { marginTop: theme.spacing.xl }]}>
              <Text style={styles.sectionTitle}>Academic Departments (Filieres)</Text>
            </View>
            
            {filieres.length === 0 ? (
              <Text style={styles.emptyText}>No filieres registered.</Text>
            ) : (
              filieres.map((item) => (
                <Card 
                  key={item.id} 
                  style={styles.moduleCard}
                  onPress={() => navigation.navigate('FiliereModules', { filiere: item })}
                >
                  <View style={styles.moduleRow}>
                    <View style={styles.moduleIconBox}>
                      <Ionicons name="business" size={20} color={theme.colors.primary} />
                    </View>
                    <View style={styles.moduleInfo}>
                      <Text style={styles.moduleName}>{item.name}</Text>
                      <Text style={styles.moduleSub}>{item.department_name || 'Faculty Member'}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                  </View>
                </Card>
              ))
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { paddingBottom: theme.spacing.xxl },
  mainContent: { paddingHorizontal: theme.spacing.lg },
  headerAvatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: theme.spacing.md, marginTop: theme.spacing.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  statBox: { width: Platform.OS === 'web' && windowWidth > 800 ? '23%' : '47.5%', flexGrow: 1 },
  layoutGrid: { marginTop: theme.spacing.md },
  mainCol: { width: '100%' },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { fontSize: 14, color: theme.colors.primary, fontWeight: '700' },
  actionGrid: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.sm },
  actionItem: { flex: 1, backgroundColor: '#FFF', padding: theme.spacing.md, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  actionIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  moduleCard: { marginBottom: theme.spacing.sm, padding: theme.spacing.md },
  moduleRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  moduleIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  moduleInfo: { flex: 1 },
  moduleName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  moduleSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  emptyText: { color: theme.colors.textMuted, textAlign: 'center', marginTop: 20 }
});
