import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { AnimatedStatCard } from '../../components/AnimatedStatCard';
import { StatCarousel } from '../../components/StatCarousel';
import { Card } from '../../components/Card';
import { FILIERES, MODULES, PROFESSORS, STUDENTS } from '../../data/mockData';

const { width: windowWidth } = Dimensions.get('window');
const isLargeWeb = Platform.OS === 'web' && windowWidth > 1024;
const isMobile = windowWidth < 768;

export default function AdminDashboardScreen({ navigation }) {
  const stats = [
    { id: '1', title: 'Total Students', value: STUDENTS.length.toString(), icon: 'people', color: '#3B82F6', subtitle: '+12% this month' },
    { id: '2', title: 'Professors', value: PROFESSORS.length.toString(), icon: 'school', color: '#8B5CF6', subtitle: 'All active' },
    { id: '3', title: 'Filières', value: FILIERES.length.toString(), icon: 'business', color: '#10B981', subtitle: '3 departments' },
    { id: '4', title: 'Active Modules', value: MODULES.length.toString(), icon: 'library', color: '#F59E0B', subtitle: 'Ongoing' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ScreenHeader 
        title="Admin Dashboard" 
        subtitle="University System Overview"
        rightElement={
          <View style={styles.headerAvatar}><Text style={styles.avatarText}>AD</Text></View>
        }
      />

      <View style={styles.mainContent}>
        {/* KPI Row */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <TouchableOpacity><Text style={styles.actionText}>View Analytics</Text></TouchableOpacity>
        </View>
        
        {isMobile ? (
          <StatCarousel data={stats} />
        ) : (
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={stat.id} style={styles.statWrapper}>
                <AnimatedStatCard {...stat} delay={index * 150} />
              </View>
            ))}
          </View>
        )}

        {/* Main Grid */}
        <View style={[styles.mainGrid, isLargeWeb ? styles.rowLayout : styles.columnLayout]}>
          
          {/* Recent Modules List */}
          <View style={styles.leftCol}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Modules</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Exams')}><Text style={styles.actionText}>See All</Text></TouchableOpacity>
            </View>
            <View style={styles.moduleList}>
              {MODULES.map((item) => (
                <Card key={item.id} style={styles.moduleCard} noPadding>
                  <View style={styles.moduleCardContent}>
                    <View style={styles.iconContainer}>
                      <Ionicons name="book" size={20} color={theme.colors.primary} />
                    </View>
                    <View style={styles.moduleTextInfo}>
                      <Text style={styles.moduleTitleText} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.moduleSubtitleText} numberOfLines={1}>
                        {FILIERES.find(f => f.id === item.filiereId)?.name}
                      </Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>Active</Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </View>
          
          {/* Filières Breakdown */}
          <View style={styles.rightCol}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Filières Allocation</Text>
            </View>
            <Card noPadding style={styles.breakdownCard}>
              {FILIERES.map((f, i) => (
                <View key={f.id} style={[styles.filiereRow, i === FILIERES.length - 1 && styles.noBorder]}>
                  <View style={styles.filiereInfo}>
                    <View style={[styles.indicator, { backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981'][i % 3] }]} />
                    <Text style={styles.filiereNameText} numberOfLines={1}>{f.name}</Text>
                  </View>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{MODULES.filter(m => m.filiereId === f.id).length} Modules</Text>
                  </View>
                </View>
              ))}
            </Card>

            <View style={styles.healthCard}>
              <Ionicons name="shield-checkmark" size={18} color={theme.colors.success} />
              <Text style={styles.healthText}>All system nodes are operational.</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1 },
  mainContent: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  headerAvatar: { width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md, marginTop: theme.spacing.xl },
  sectionTitle: { ...theme.typography.section, color: theme.colors.textMuted },
  actionText: { ...theme.typography.bodySmall, fontWeight: '700', color: theme.colors.primary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, justifyContent: 'space-between' },
  statWrapper: { width: Platform.OS === 'web' ? '23.5%' : '47.5%', marginBottom: 4 },
  mainGrid: { marginTop: theme.spacing.sm, gap: theme.spacing.xl },
  rowLayout: { flexDirection: 'row' },
  columnLayout: { flexDirection: 'column' },
  leftCol: { flex: 2 },
  rightCol: { flex: 1, minWidth: 300 },
  moduleList: { gap: theme.spacing.sm },
  moduleCard: { borderWidth: 1, borderColor: theme.colors.border },
  moduleCardContent: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md },
  iconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.primaryLight + '40', alignItems: 'center', justifyContent: 'center' },
  moduleTextInfo: { flex: 1, marginHorizontal: theme.spacing.md },
  moduleTitleText: { ...theme.typography.h3, color: theme.colors.text },
  moduleSubtitleText: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginTop: 2 },
  statusBadge: { backgroundColor: theme.colors.success + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800', color: theme.colors.success, textTransform: 'uppercase' },
  breakdownCard: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: theme.colors.border },
  filiereRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  noBorder: { borderBottomWidth: 0 },
  filiereInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  indicator: { width: 10, height: 10, borderRadius: 3 },
  filiereNameText: { ...theme.typography.body, color: theme.colors.text, flex: 1 },
  countBadge: { backgroundColor: theme.colors.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  countText: { ...theme.typography.caption, color: theme.colors.textSecondary },
  healthCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: theme.spacing.lg, padding: theme.spacing.md, backgroundColor: theme.colors.success + '10', borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.success + '20' },
  healthText: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, fontWeight: '600' }
});
