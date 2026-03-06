import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';

const NOTIFICATIONS = [
  { id: '1', type: 'room_change', title: 'Room change', body: 'Algorithms (Mon 09:00) moved from Room 101 to Room 203.', time: '2 hours ago', unread: true },
  { id: '2', type: 'schedule', title: 'Schedule update', body: 'Database Systems TD session added on Thu 14:00, Room 205.', time: '1 day ago', unread: false },
  { id: '3', type: 'room_change', title: 'Room change', body: 'Operating Systems TP now in Lab B instead of Lab A.', time: '2 days ago', unread: false },
];

export default function StudentNotificationsScreen() {
  const iconFor = (type) => (type === 'room_change' ? 'swap-horizontal' : 'calendar-outline');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader 
        title="Notifications" 
        subtitle="Stay updated with campus changes" 
      />
      <View style={styles.content}>
        {NOTIFICATIONS.map((n) => (
          <Card key={n.id} style={[styles.notifCard, n.unread && styles.unreadCard]}>
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: n.unread ? theme.colors.primaryLight : theme.colors.accent }]}>
                <Ionicons name={iconFor(n.type)} size={20} color={n.unread ? theme.colors.primary : theme.colors.textSecondary} />
              </View>
              <View style={styles.body}>
                <View style={styles.headerRow}>
                  <Text style={[styles.title, n.unread && styles.unreadTitle]}>{n.title}</Text>
                  {n.unread && <View style={styles.dot} />}
                </View>
                <Text style={styles.bodyText}>{n.body}</Text>
                <Text style={styles.time}>{n.time}</Text>
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
  notifCard: { marginBottom: theme.spacing.md, padding: theme.spacing.md },
  unreadCard: { borderColor: theme.colors.primary + '30', backgroundColor: theme.colors.primaryLight + '20' },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md },
  body: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  unreadTitle: { color: theme.colors.primary },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary },
  bodyText: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4, lineHeight: 20 },
  time: { fontSize: 12, color: theme.colors.textMuted, marginTop: 8 },
});
