import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { ApiService } from '../../services/api';

export default function StudentNotificationsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch audits for the student's specific filiere
      const [sessAudits, examAudits] = await Promise.all([
        ApiService.getSessionAudits(user.filiere_id),
        ApiService.getExamAudits(user.filiere_id)
      ]);

      const today = new Date().toISOString().split('T')[0];

      // Format and combine
      const combined = [
        ...sessAudits.map(a => ({ ...a, type: 'SESSION' })),
        ...examAudits.map(a => ({ ...a, type: 'EXAM' }))
      ].sort((a, b) => b.time.localeCompare(a.time));

      setNotifications(combined.map(n => ({
        ...n,
        isNew: n.time.split('T')[0] === today
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user.filiere_id]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const renderNotification = ({ item }) => (
    <Card style={[styles.notiCard, item.isNew && styles.newNoti]}>
      <View style={styles.notiRow}>
        <View style={[styles.iconBox, { backgroundColor: item.type === 'EXAM' ? theme.colors.error + '15' : theme.colors.primary + '15' }]}>
          <Ionicons 
            name={item.field === 'ROOM' ? "location" : "calendar"} 
            size={20} 
            color={item.type === 'EXAM' ? theme.colors.error : theme.colors.primary} 
          />
        </View>
        <View style={styles.notiBody}>
          <View style={styles.notiHeader}>
            <Text style={styles.notiTitle}>
              {item.type} {item.field === 'ROOM' ? 'RELOCATION' : 'RESCHEDULE'}
            </Text>
            {item.isNew && <View style={styles.newBadge}><Text style={styles.newText}>NEW</Text></View>}
          </View>
          <Text style={styles.notiText}>
            The {item.field.toLowerCase()} has changed from "{item.old}" to "{item.new}".
          </Text>
          <Text style={styles.notiTime}>{new Date(item.time).toLocaleString()}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Notifications" subtitle="Stay updated with schedule changes" />
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchNotifications} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color={theme.colors.border} />
              <Text style={styles.emptyText}>No new updates for your curriculum.</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  list: { padding: theme.spacing.lg },
  notiCard: { marginBottom: 12, padding: 12 },
  newNoti: { borderColor: theme.colors.primary, borderWidth: 1 },
  notiRow: { flexDirection: 'row', gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  notiBody: { flex: 1 },
  notiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notiTitle: { fontSize: 12, fontWeight: '800', color: theme.colors.textMuted, letterSpacing: 0.5 },
  newBadge: { backgroundColor: theme.colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  newText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  notiText: { fontSize: 14, color: theme.colors.text, lineHeight: 20 },
  notiTime: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, color: theme.colors.textMuted, fontSize: 15 }
});
