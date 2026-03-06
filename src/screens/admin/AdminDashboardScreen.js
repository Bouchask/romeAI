import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StatCard } from '../../components/StatCard';
import { Card } from '../../components/Card';
import { FILIERES, MODULES, PROFESSORS, STUDENTS } from '../../data/mockData';

const { width: windowWidth } = Dimensions.get('window');
const isLargeWeb = Platform.OS === 'web' && windowWidth > 1024;

export default function AdminDashboardScreen({ navigation }) {
  const stats = [
    { id: '1', title: 'Total Students', value: STUDENTS.length.toString(), icon: 'people', color: '#3B82F6', subtitle: '+12% this month' },
    { id: '2', title: 'Professors', value: PROFESSORS.length.toString(), icon: 'school', color: '#8B5CF6', subtitle: 'All active' },
    { id: '3', title: 'Filières', value: FILIERES.length.toString(), icon: 'business', color: '#10B981', subtitle: '3 departments' },
    { id: '4', title: 'Active Modules', value: MODULES.length.toString(), icon: 'library', color: '#F59E0B', subtitle: 'Ongoing' },
  ];

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader 
        title="Admin Dashboard" 
        subtitle="University System Overview"
        rightElement={
          <View style={styles.headerAvatar}><Text style={styles.avatarText}>AD</Text></View>
        }
      />

      <View style={styles.mainContent}>
        {/* KPI Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <TouchableOpacity><Text style={styles.actionText}>View Analytics</Text></TouchableOpacity>
        </View>
        
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.id} style={styles.statWrapper}>
              <StatCard {...stat} />
            </View>
          ))}
        </View>

        {/* Responsive Grid Layout */}
        <View style={[styles.dashboardGrid, !isLargeWeb && styles.columnLayout]}>
          
          {/* Recent Modules Block (Main Column) */}
          <View style={[styles.mainCol, !isLargeWeb && styles.fullWidth]}>
            <View style={styles.blockHeader}>
              <Text style={styles.blockTitle}>Recent Modules</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Exams')}>
                <Text style={styles.blockAction}>See All</Text>
              </TouchableOpacity>
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
                    <View style={styles.statusWrapper}>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Active</Text>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </View>
          
          {/* Side Column (Breakdown) */}
          <View style={[styles.sideCol, !isLargeWeb && styles.fullWidth]}>
            <View style={styles.blockHeader}>
              <Text style={styles.blockTitle}>Filières Allocation</Text>
            </View>
            
            <Card noPadding style={styles.allocationBlock}>
              {FILIERES.map((f, i) => {
                const count = MODULES.filter(m => m.filiereId === f.id).length;
                const palette = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];
                return (
                  <View key={f.id} style={[styles.filiereRow, i === FILIERES.length - 1 && styles.noBorder]}>
                    <View style={styles.filiereLabel}>
                      <View style={[styles.colorDot, { backgroundColor: palette[i % palette.length] }]} />
                      <Text style={styles.filiereNameText} numberOfLines={1}>{f.name}</Text>
                    </View>
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>{count} Mod.</Text>
                    </View>
                  </View>
                );
              })}
            </Card>

            <View style={styles.systemHealth}>
              <View style={styles.healthHeader}>
                <Ionicons name="shield-checkmark" size={18} color={theme.colors.success} />
                <Text style={styles.healthTitle}>System Secure</Text>
              </View>
              <Text style={styles.healthMessage}>All infrastructure operational. No critical maintenance pending.</Text>
            </View>
          </View>

        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1, width: '100%' },
  mainContent: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xxl, width: '100%' },
  
  headerAvatar: { width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md, marginTop: theme.spacing.xl },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5 },
  actionText: { fontSize: 13, fontWeight: '600', color: theme.colors.primary },

  // Stats Grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, width: '100%' },
  statWrapper: { flex: 1, minWidth: 160 },

  // Main Dashboard Grid
  dashboardGrid: { flexDirection: 'row', gap: theme.spacing.xl, marginTop: theme.spacing.lg, width: '100%' },
  columnLayout: { flexDirection: 'column' },
  mainCol: { flex: 2, minWidth: 300 },
  sideCol: { flex: 1, minWidth: 280 },
  fullWidth: { width: '100%', minWidth: '100%' },

  // Blocks
  blockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  blockTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  blockAction: { fontSize: 13, color: theme.colors.primary, fontWeight: '600' },

  // Module Cards
  moduleList: { gap: theme.spacing.sm },
  moduleCard: { width: '100%', borderWidth: 1, borderColor: theme.colors.border },
  moduleCardContent: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, width: '100%' },
  iconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.primaryLight + '40', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  moduleTextInfo: { flex: 1, marginLeft: theme.spacing.md, marginRight: theme.spacing.md },
  moduleTitleText: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 2 },
  moduleSubtitleText: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '500' },
  statusWrapper: { flexShrink: 0 },
  statusBadge: { backgroundColor: theme.colors.success + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800', color: theme.colors.success, textTransform: 'uppercase' },

  // Allocation Block
  allocationBlock: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: theme.colors.border, width: '100%' },
  filiereRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border, width: '100%' },
  noBorder: { borderBottomWidth: 0 },
  filiereLabel: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  colorDot: { width: 10, height: 10, borderRadius: 3, flexShrink: 0 },
  filiereNameText: { fontSize: 14, fontWeight: '600', color: theme.colors.text, flex: 1 },
  countBadge: { backgroundColor: theme.colors.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, flexShrink: 0 },
  countText: { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary },

  // Health Section
  systemHealth: { marginTop: theme.spacing.lg, padding: theme.spacing.lg, backgroundColor: theme.colors.primaryLight + '20', borderRadius: theme.borderRadius.xl, borderWidth: 1, borderColor: theme.colors.primary + '10' },
  healthHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  healthTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  healthMessage: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 }
});
