import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const WEEK_SCHEDULE = [
  { id: '1', day: 'Mon', module: 'Algorithms', professor: 'Dr. Jane Smith', room: '101', time: '09:00', duration: '90 min' },
  { id: '2', day: 'Mon', module: 'Database Systems', professor: 'Prof. John Doe', room: '205', time: '14:00', duration: '90 min' },
  { id: '3', day: 'Tue', module: 'Operating Systems', professor: 'Dr. Amy Lee', room: '102', time: '10:00', duration: '90 min' },
  { id: '4', day: 'Wed', module: 'Algorithms', professor: 'Dr. Jane Smith', room: '101', time: '09:00', duration: '90 min' },
  { id: '5', day: 'Thu', module: 'Networks', professor: 'Prof. Bob Wilson', room: '301', time: '11:00', duration: '90 min' },
  { id: '6', day: 'Fri', module: 'Database Systems', professor: 'Prof. John Doe', room: '205', time: '14:00', duration: '90 min' },
];

export default function StudentScheduleScreen({ navigation }) {
  const [selectedDay, setSelectedDay] = useState('Mon');
  const filtered = WEEK_SCHEDULE.filter((s) => s.day === selectedDay);

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Weekly Schedule" 
        subtitle="Manage your academic calendar" 
      />
      
      <View style={styles.tabBar}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.dayRow}
        >
          {DAYS.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.dayChip, selectedDay === d && styles.dayChipActive]}
              onPress={() => setSelectedDay(d)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayText, selectedDay === d && styles.dayTextActive]}>{d}</Text>
              {selectedDay === d && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filtered.length > 0 ? (
          filtered.map((s) => (
            <Card 
              key={s.id} 
              style={styles.scheduleCard}
              onPress={() => navigation?.navigate('SessionDetail', { session: s })}
            >
              <View style={styles.row}>
                <View style={styles.timeBlock}>
                  <Text style={styles.time}>{s.time}</Text>
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{s.duration}</Text>
                  </View>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.body}>
                  <Text style={styles.module}>{s.module}</Text>
                  <Text style={styles.prof}>{s.professor}</Text>
                  <View style={styles.footer}>
                    <View style={styles.infoItem}>
                      <Ionicons name="location-outline" size={14} color={theme.colors.primary} />
                      <Text style={styles.room}>Room {s.room}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="people-outline" size={14} color={theme.colors.textMuted} />
                      <Text style={styles.capacity}>Filière CS</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.moreBtn}>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                </View>
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>No classes scheduled for this day</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  tabBar: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
  },
  dayRow: { 
    flexDirection: 'row', 
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  dayChip: { 
    paddingHorizontal: theme.spacing.lg, 
    paddingVertical: theme.spacing.sm, 
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayChipActive: { 
    backgroundColor: theme.colors.primaryLight, 
  },
  dayText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: theme.colors.textSecondary 
  },
  dayTextActive: { 
    color: theme.colors.primary 
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -theme.spacing.sm,
    width: 20,
    height: 3,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  content: { 
    padding: theme.spacing.lg, 
    paddingBottom: theme.spacing.xxl 
  },
  scheduleCard: { 
    marginBottom: theme.spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  row: { 
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  timeBlock: { 
    width: 70, 
    alignItems: 'center',
  },
  time: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: theme.colors.text 
  },
  durationBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  durationText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  body: { 
    flex: 1,
    gap: 4,
  },
  module: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: theme.colors.text 
  },
  prof: { 
    fontSize: 13, 
    color: theme.colors.textSecondary 
  },
  footer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  room: { 
    fontSize: 12, 
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  capacity: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  moreBtn: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    color: theme.colors.textMuted,
    fontWeight: '500',
  }
});
