import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { ApiService } from '../../services/api';

export default function ModuleSessionsScreen({ navigation, route }) {
  const { filiere } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myModules, setMyModules] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const modules = await ApiService.getModules();
      const filtered = modules.filter(m => m.professor_id === user.id && m.filiere_id === filiere.id);
      setMyModules(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user.id, filiere.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const renderModule = ({ item }) => (
    <Card 
      style={styles.card}
      onPress={() => navigation.navigate('ProfessorModuleDetail', { module: item })}
    >
      <View style={styles.row}>
        <View style={styles.iconBox}><Ionicons name="journal" size={22} color={theme.colors.primary} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>Academic Course Module</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title={filiere.name} 
        subtitle="Your Modules" 
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>
      ) : (
        <FlatList
          data={myModules}
          renderItem={renderModule}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
          ListEmptyComponent={<Text style={styles.empty}>No modules assigned to you in this filiere.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  list: { padding: theme.spacing.lg },
  card: { marginBottom: 10, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  sub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  center: { flex: 1, justifyContent: 'center' },
  empty: { textAlign: 'center', marginTop: 40, color: theme.colors.textMuted }
});
