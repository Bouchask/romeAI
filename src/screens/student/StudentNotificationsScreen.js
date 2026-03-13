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
      // 1. Fetch data
      const [sessAudits, examAudits, modAudits, allSessions, allExams, allRooms, allModules] = await Promise.all([
        ApiService.getSessionAudits(user.filiere_id),
        ApiService.getExamAudits(user.filiere_id),
        ApiService.getModuleAudits(user.filiere_id),
        ApiService.getSessions(),
        ApiService.getExams(),
        ApiService.getRooms(),
        ApiService.getModules()
      ]);

      const today = new Date().toISOString().split('T')[0];

      // 2. Process Session Audits
      const processedSessions = sessAudits.map(audit => {
        const session = allSessions.find(s => s.id === audit.session_id) || {};
        const roomName = allRooms.find(r => r.id === parseInt(audit.new))?.name || audit.new;
        
        let message = '';
        if (audit.field === 'ROOM') {
          message = `Prof. ${session.professor_name || 'Instructor'} changed the room to "${roomName}" for the session on ${session.date}.`;
        } else if (audit.field === 'DATE') {
          message = `Prof. ${session.professor_name || 'Instructor'} rescheduled the session to ${audit.new}.`;
        } else if (audit.field === 'CREATION') {
          message = `A new session (${session.type}) has been scheduled for ${session.date} at ${session.start_time}.`;
        }

        return { ...audit, type: 'SESSION', message, moduleName: session.module_name };
      });

      // 3. Process Exam Audits
      const processedExams = examAudits.map(audit => {
        const exam = allExams.find(e => e.id === audit.exam_id) || {};
        const roomName = allRooms.find(r => r.id === parseInt(audit.new))?.name || audit.new;

        let message = '';
        if (audit.field === 'ROOM') {
          message = `Exam room relocation: ${exam.module_name} is now in "${roomName}".`;
        } else if (audit.field === 'DATE') {
          message = `Exam reschedule: ${exam.module_name} moved to ${audit.new}.`;
        } else if (audit.field === 'CREATION') {
          message = `New exam scheduled: ${exam.module_name} on ${exam.date} at ${exam.start_time} in ${exam.room_name}.`;
        }

        return { ...audit, type: 'EXAM', message, moduleName: exam.module_name };
      });

      // 4. Process Module Audits
      const processedModules = modAudits.map(audit => {
        const module = allModules.find(m => m.id === audit.module_id) || {};
        
        let message = '';
        if (audit.field === 'CREATION') {
          const profInfo = module.professor_name ? ` with Prof. ${module.professor_name}` : '';
          message = `New module added to your program: ${module.name}${profInfo}.`;
        }

        return { ...audit, type: 'MODULE', message, moduleName: module.name };
      });

      // 5. Combine and Sort
      const combined = [...processedSessions, ...processedExams, ...processedModules].sort((a, b) => b.time.localeCompare(a.time));

      setNotifications(combined.map(n => ({
        ...n,
        isNew: n.time.split('T')[0] === today
      })));
    } catch (err) {
      console.error('Notification Error:', err);
    } finally {
      setLoading(false);
    }
  }, [user.filiere_id]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const renderNotification = ({ item }) => (
    <Card style={[styles.notiCard, item.isNew && styles.newNoti]}>
      <View style={styles.notiRow}>
        <View style={[styles.iconBox, { backgroundColor: item.type === 'EXAM' ? theme.colors.error + '10' : theme.colors.primary + '10' }]}>
          <Ionicons 
            name={item.type === 'EXAM' ? "document-text" : "book"} 
            size={22} 
            color={item.type === 'EXAM' ? theme.colors.error : theme.colors.primary} 
          />
        </View>
        <View style={styles.notiBody}>
          <View style={styles.notiHeader}>
            <Text style={[styles.moduleName, item.type === 'EXAM' && { color: theme.colors.error }]}>
              {item.moduleName || 'Curriculum Update'}
            </Text>
            {item.isNew && <View style={styles.newBadge}><Text style={styles.newText}>NEW</Text></View>}
          </View>
          <Text style={styles.notiText}>{item.message}</Text>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={12} color={theme.colors.textMuted} />
            <Text style={styles.notiTime}>{new Date(item.time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Live Notifications" subtitle="Real-time curriculum adjustments" />
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item, index) => `audit-${item.id}-${index}`}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchNotifications} color={theme.colors.primary} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color={theme.colors.border} />
              <Text style={styles.emptyText}>Your schedule is stable. No new updates.</Text>
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
  notiCard: { marginBottom: 12, padding: 16 },
  newNoti: { borderLeftWidth: 4, borderLeftColor: theme.colors.primary },
  notiRow: { flexDirection: 'row', gap: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  notiBody: { flex: 1 },
  notiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  moduleName: { fontSize: 15, fontWeight: '800', color: theme.colors.text, flex: 1, marginRight: 8 },
  newBadge: { backgroundColor: theme.colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  newText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  notiText: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20, marginBottom: 10 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  notiTime: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, color: theme.colors.textMuted, fontSize: 15, fontWeight: '500' }
});
