import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function SessionManagementScreen({ navigation }) {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTodaySessions = useCallback(async () => {
    setLoading(true);
    try {
      const allSessions = await ApiService.getSessions();
      
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });

      console.log('--- SESSION MANAGEMENT DEBUG ---');
      console.log('User ID:', user.id);
      console.log('Target Date:', todayStr);
      console.log('Total Raw Sessions:', allSessions.length);

      const filtered = allSessions.filter(s => {
        const isMine = s.professor_id === user.id;
        const matchesDate = s.date === todayStr;
        const matchesDayFallback = !s.date && s.day === dayName;
        
        const ok = isMine && (matchesDate || matchesDayFallback);
        if (isMine) {
           console.log(`Checking session ${s.id}: matchesDate=${matchesDate}, matchesDay=${matchesDayFallback} -> Result: ${ok}`);
        }
        return ok;
      });
      
      setSessions(filtered);
      console.log('Filtered Sessions Count:', filtered.length);
    } catch (err) {
      console.error('Fetch sessions error:', err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (isFocused) fetchTodaySessions();
  }, [isFocused, fetchTodaySessions]);

  const handleDeleteSession = async (id) => {
    const performDelete = async () => {
      try {
        await ApiService.deleteSession(id);
        fetchTodaySessions();
      } catch (err) {
        alert('Failed to delete session');
      }
    };
    if (Platform.OS === 'web') {
      if (confirm('Cancel this session?')) performDelete();
    } else {
      Alert.alert('Cancel Session', 'Delete this session?', [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Today's Control" subtitle="Daily teaching schedule" />
      
      <ScrollView 
        style={styles.content} 
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTodaySessions} color={theme.colors.primary} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : sessions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.border} />
            <Text style={styles.emptyText}>No sessions found for today.</Text>
            <TouchableOpacity style={styles.scheduleBtn} onPress={() => navigation.navigate('NewSession')}>
              <Text style={styles.scheduleBtnText}>Schedule New Class</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          sessions.map((s) => (
            <Card key={s.id} style={styles.sessionCard}>
              <View style={styles.row}>
                <View style={styles.body}>
                  <Text style={styles.module}>{s.module_name}</Text>
                  <View style={styles.infoRow}>
                    <View style={styles.typeBadge}><Text style={styles.typeText}>{s.type}</Text></View>
                    <Text style={styles.meta}>{s.room_name} · {s.start_time}</Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('ModifySession', { session: s })}>
                    <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.iconBtn, styles.deleteBtn]} onPress={() => handleDeleteSession(s.id)}>
                    <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
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
  content: { padding: theme.spacing.lg },
  sessionCard: { marginBottom: theme.spacing.md, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  body: { flex: 1 },
  module: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeBadge: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  typeText: { fontSize: 11, fontWeight: '700', color: theme.colors.primary },
  meta: { fontSize: 13, color: theme.colors.textSecondary },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 8, borderRadius: 8, backgroundColor: theme.colors.accent },
  deleteBtn: { backgroundColor: theme.colors.error + '10' },
  emptyCard: { padding: 40, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: theme.colors.border },
  emptyText: { color: theme.colors.textMuted, marginTop: 16, textAlign: 'center' },
  scheduleBtn: { marginTop: 20, backgroundColor: theme.colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  scheduleBtnText: { color: '#FFF', fontWeight: '700' }
});
