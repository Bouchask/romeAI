import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { ApiService } from '../../services/api';

export default function FiliereModulesScreen({ navigation, route }) {
  const { filiere } = route.params;
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await ApiService.getModules();
        const filtered = data.filter(m => m.filiere_id === filiere.id);
        setModules(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, [filiere]);

  const renderModule = ({ item }) => (
    <Card 
      style={styles.moduleCard}
      onPress={() => navigation.navigate('ModuleDetail', { module: item })}
    >
      <View style={styles.moduleRow}>
        <View style={styles.iconBox}>
          <Ionicons name="journal" size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>Professor: {item.professor_name || 'TBA'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title={filiere.name} 
        subtitle="Modules Curriculum" 
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>
      ) : (
        <FlatList
          data={modules}
          renderItem={renderModule}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No modules found for this filiere.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  list: { padding: theme.spacing.lg },
  moduleCard: { marginBottom: theme.spacing.sm, padding: 16 },
  moduleRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  sub: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  center: { flex: 1, justifyContent: 'center' },
  empty: { textAlign: 'center', marginTop: 40, color: theme.colors.textMuted }
});
