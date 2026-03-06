import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export default function SessionDetailScreen({ navigation, route }) {
  const { session } = route.params || { session: { module: 'Module Details', professor: 'TBA', room: '---', time: '--:--' } };

  const resources = [
    { id: '1', name: 'Lecture Slides.pdf', size: '2.4 MB', type: 'pdf' },
    { id: '2', name: 'Exercise Sheet 1.docx', size: '1.1 MB', type: 'doc' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader 
        title={session.module} 
        subtitle="Course details and resources" 
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      <View style={styles.content}>
        <Card style={styles.infoCard}>
          <View style={styles.mainInfo}>
            <View style={styles.infoItem}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.primaryLight }]}>
                <Ionicons name="person" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Professor</Text>
                <Text style={styles.infoValue}>{session.professor || 'Dr. Jane Smith'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.success + '15' }]}>
                <Ionicons name="location" size={20} color={theme.colors.success} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>Room {session.room}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.warning + '15' }]}>
                <Ionicons name="time" size={20} color={theme.colors.warning} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Schedule</Text>
                <Text style={styles.infoValue}>{session.time || '09:00 - 10:30'}</Text>
              </View>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Course Syllabus</Text>
        <Card>
          <View style={styles.syllabusRow}>
            <View style={styles.dotActive} />
            <Text style={styles.syllabusText}>Introduction to core concepts</Text>
          </View>
          <View style={styles.syllabusRow}>
            <View style={styles.dotActive} />
            <Text style={styles.syllabusText}>Hands-on practical session</Text>
          </View>
          <View style={styles.syllabusRow}>
            <View style={styles.dot} />
            <Text style={[styles.syllabusText, { color: theme.colors.textMuted }]}>Weekly evaluation (Upcoming)</Text>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Learning Materials</Text>
        {resources.map((res) => (
          <TouchableOpacity key={res.id} activeOpacity={0.7}>
            <Card style={styles.resourceCard}>
              <View style={styles.resourceInfo}>
                <Ionicons name="document-text" size={24} color={theme.colors.primary} />
                <View>
                  <Text style={styles.resourceName}>{res.name}</Text>
                  <Text style={styles.resourceMeta}>{res.size} · PDF Document</Text>
                </View>
              </View>
              <Ionicons name="download-outline" size={20} color={theme.colors.textMuted} />
            </Card>
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Button 
            title="Mark Attendance (QR Code)" 
            icon="qr-code" 
            style={styles.qrBtn}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  infoCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.xl },
  mainInfo: { gap: theme.spacing.md },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 11, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, fontWeight: '700', color: theme.colors.text, marginTop: 2 },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: theme.spacing.sm, marginTop: theme.spacing.lg },
  syllabusRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  dotActive: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.border },
  syllabusText: { fontSize: 14, color: theme.colors.text, fontWeight: '500' },
  resourceCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.sm, padding: theme.spacing.md },
  resourceInfo: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  resourceName: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  resourceMeta: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  footer: { marginTop: theme.spacing.xxl, marginBottom: theme.spacing.xl },
  qrBtn: { ...theme.shadows.md },
});
