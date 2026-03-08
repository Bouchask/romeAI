import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { ApiService } from '../../services/api';

export default function ModuleDetailScreen({ navigation, route }) {
  const { module } = route.params;
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const sessions = await ApiService.getSessions();
        const moduleSessions = sessions.filter(s => s.module_id === module.id);
        
        // Extract unique rooms with their last used date
        const roomsMap = {};
        moduleSessions.forEach(s => {
          roomsMap[s.room_name] = s.day; // Simplification: using day as "last seen"
        });
        
        setHistory(Object.entries(roomsMap).map(([name, last]) => ({ name, last })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [module]);

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title={module.name} 
        subtitle="Detailed Insights" 
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Assigned Faculty</Text>
        <Card style={styles.profCard}>
          <View style={styles.profRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.profInfo}>
              <Text style={styles.profName}>{module.professor_name || 'No Professor Assigned'}</Text>
              <Text style={styles.profRole}>Lead Instructor</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Room Usage History</Text>
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : history.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No historical room assignments found.</Text>
          </Card>
        ) : (
          history.map((item, idx) => (
            <Card key={idx} style={styles.historyCard}>
              <View style={styles.historyRow}>
                <View style={styles.roomIcon}>
                  <Ionicons name="location" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.roomName}>{item.name}</Text>
                  <Text style={styles.usageDate}>Used on: {item.last}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>VERIFIED</Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: theme.spacing.lg },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: theme.colors.textMuted, marginTop: 24, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  profCard: { padding: 16 },
  profRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  profName: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  profRole: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  historyCard: { marginBottom: 8, padding: 12 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roomIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  historyInfo: { flex: 1 },
  roomName: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  usageDate: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  statusBadge: { backgroundColor: theme.colors.success + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 9, fontWeight: '800', color: theme.colors.success },
  emptyCard: { padding: 30, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: theme.colors.border },
  emptyText: { color: theme.colors.textMuted, fontSize: 14 }
});
