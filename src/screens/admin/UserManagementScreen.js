import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { PROFESSORS, STUDENTS, FILIERES } from '../../data/mockData';

export default function UserManagementScreen() {
  const [activeTab, setActiveTab] = useState('Professors');

  const renderUser = ({ item }) => {
    const isProfessor = activeTab === 'Professors';
    const subtext = isProfessor 
      ? `${item.modules.length} Modules taught` 
      : FILIERES.find(f => f.id === item.filiereId)?.name;

    return (
      <Card style={styles.userCard}>
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>{item.name.substring(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userSub}>{subtext}</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="User Management" 
        subtitle={`Directory of all ${activeTab.toLowerCase()}`}
      />
      
      <View style={styles.tabs}>
        {['Professors', 'Students'].map((tab) => (
          <TouchableOpacity 
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={activeTab === 'Professors' ? PROFESSORS : STUDENTS}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: theme.colors.accent,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: '#FFF',
  },
  list: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  userSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  actionBtn: {
    padding: 8,
  }
});
