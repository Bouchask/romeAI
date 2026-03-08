import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { ApiService } from '../../services/api';

export default function ExamDetailScreen({ navigation, route }) {
  const { exam } = route.params;
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [moduleInfo, setModuleInfo] = useState(null);

  useEffect(() => {
    const fetchExamDetails = async () => {
      setLoading(true);
      try {
        const [allStudents, allModules] = await Promise.all([
          ApiService.getStudents(),
          ApiService.getModules()
        ]);

        const currentModule = allModules.find(m => m.id === exam.module_id);
        setModuleInfo(currentModule);

        const enrolled = allStudents.filter(s => s.filiere_id === currentModule?.filiere_id);
        setStudents(enrolled);
      } catch (err) {
        console.error('Error fetching exam details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExamDetails();
  }, [exam]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Exam Session Control" 
        subtitle="Detailed session supervision" 
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.headerCard}>
          <View style={styles.statusRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{exam.type}</Text>
            </View>
            <View style={styles.dateBadge}>
              <Ionicons name="calendar" size={14} color={theme.colors.primary} />
              <Text style={styles.dateText}>{exam.date}</Text>
            </View>
          </View>
          
          <Text style={styles.moduleName}>{exam.module_name}</Text>
          <Text style={styles.profName}>Professor: {exam.professor_name || moduleInfo?.professor_name || 'Assigned soon'}</Text>

          <View style={styles.detailsList}>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="location" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={styles.detailLabel}>LOCALISATION</Text>
                <Text style={styles.detailValue}>{exam.room_name}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="time" size={20} color="#10B981" />
              </View>
              <View>
                <Text style={styles.detailLabel}>START TIME (DÉBUT)</Text>
                <Text style={styles.detailValue}>{exam.start_time}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="stopwatch" size={20} color="#EF4444" />
              </View>
              <View>
                <Text style={styles.detailLabel}>END TIME (FIN)</Text>
                <Text style={styles.detailValue}>{exam.end_time || 'Not set'}</Text>
              </View>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Enrolled Candidates ({students.length})</Text>
        {students.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No students enrolled in this department yet.</Text>
          </Card>
        ) : (
          students.map((stu) => (
            <Card key={stu.id} style={styles.stuCard}>
              <View style={styles.stuRow}>
                <View style={styles.stuAvatar}>
                  <Text style={styles.stuAvatarText}>{stu.name.charAt(0)}</Text>
                </View>
                <View style={styles.stuInfo}>
                  <Text style={styles.stuName}>{stu.name}</Text>
                  <Text style={styles.stuMeta}>{stu.registration_number || 'STU-REG-000'}</Text>
                </View>
                <View style={styles.presenceBadge}>
                  <Text style={styles.presenceText}>Eligible</Text>
                </View>
              </View>
            </Card>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: theme.spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: { padding: theme.spacing.xl, marginTop: theme.spacing.md, backgroundColor: '#FFF' },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  badge: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: theme.colors.primary, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  moduleName: { fontSize: 24, fontWeight: '800', color: theme.colors.text, marginBottom: 4 },
  profName: { fontSize: 15, color: theme.colors.textMuted, marginBottom: 24 },
  detailsList: { gap: 16, paddingTop: 20, borderTopWidth: 1, borderTopColor: theme.colors.border },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  detailIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  detailLabel: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted, letterSpacing: 1 },
  detailValue: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.textMuted, marginTop: 24, marginBottom: 12, textTransform: 'uppercase' },
  stuCard: { marginBottom: 8, padding: 12 },
  stuRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stuAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  stuAvatarText: { color: theme.colors.primary, fontWeight: '700' },
  stuInfo: { flex: 1 },
  stuName: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  stuMeta: { fontSize: 12, color: theme.colors.textMuted },
  presenceBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: theme.colors.success + '15' },
  presenceText: { fontSize: 10, fontWeight: '700', color: theme.colors.success },
  emptyCard: { padding: 30, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: theme.colors.border },
  emptyText: { color: theme.colors.textMuted, fontSize: 14 }
});
