import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';

const SESSIONS = [
  { id: '1', module: 'Algorithms', type: 'Lecture', room: '101', date: 'Mar 10', time: '09:00', status: 'Scheduled' },
  { id: '2', module: 'Database Systems', type: 'Lab', room: '205', date: 'Mar 11', time: '14:00', status: 'Scheduled' },
  { id: '3', module: 'Web Development', type: 'Workshop', room: 'Lab A', date: 'Mar 12', time: '10:00', status: 'Draft' },
];

export default function SessionManagementScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader 
        title="Session Control" 
        subtitle="Manage your upcoming academic sessions" 
      />
      <View style={styles.content}>
        {SESSIONS.map((s) => (
          <Card key={s.id} style={styles.sessionCard}>
            <View style={styles.row}>
              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <Text style={styles.module}>{s.module}</Text>
                  <View style={[styles.statusBadge, s.status === 'Draft' && styles.statusDraft]}>
                    <Text style={[styles.statusText, s.status === 'Draft' && styles.statusTextDraft]}>{s.status}</Text>
                  </View>
                </View>
                
                <View style={styles.infoRow}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{s.type}</Text>
                  </View>
                  <Text style={styles.meta}>Room {s.room} · {s.date}, {s.time}</Text>
                </View>
              </View>
              
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.iconBtn}
                  onPress={() => navigation.navigate('ModifySession', { session: s })}
                >
                  <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.iconBtn, styles.deleteBtn]}>
                  <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  sessionCard: { marginBottom: theme.spacing.md, padding: theme.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  body: { flex: 1, marginRight: theme.spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  module: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  statusBadge: { backgroundColor: theme.colors.success + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusDraft: { backgroundColor: theme.colors.accent },
  statusText: { fontSize: 10, fontWeight: '700', color: theme.colors.success, textTransform: 'uppercase' },
  statusTextDraft: { color: theme.colors.textSecondary },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeBadge: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeText: { fontSize: 11, fontWeight: '600', color: theme.colors.primary },
  meta: { fontSize: 13, color: theme.colors.textSecondary },
  actions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 8, borderRadius: 8, backgroundColor: theme.colors.accent },
  deleteBtn: { backgroundColor: theme.colors.error + '10' },
});
