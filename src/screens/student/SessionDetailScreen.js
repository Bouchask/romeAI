import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export default function SessionDetailScreen({ navigation, route }) {
  const { session } = route.params;
  const [qrVisible, setQrVisible] = useState(false);

  const openMaps = () => {
    if (session.room_gps) {
      Linking.openURL(session.room_gps).catch(() => Alert.alert("Error", "Could not open map."));
    } else {
      Alert.alert("Notice", "No GPS coordinates assigned to this room.");
    }
  };

  const showRoomQr = () => {
    setQrVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader 
          title={session.module_name || session.module} 
          subtitle={`${session.type} Control Panel`} 
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
                  <Text style={styles.infoLabel}>Instructor</Text>
                  <Text style={styles.infoValue}>{session.professor_name || 'Faculty Member'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoItem}>
                <View style={[styles.iconWrap, { backgroundColor: theme.colors.success + '15' }]}>
                  <Ionicons name="location" size={20} color={theme.colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{session.room_name}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoItem}>
                <View style={[styles.iconWrap, { backgroundColor: theme.colors.warning + '15' }]}>
                  <Ionicons name="time" size={20} color={theme.colors.warning} />
                </View>
                <View>
                  <Text style={styles.infoLabel}>Schedule</Text>
                  <Text style={styles.infoValue}>{session.start_time} - {session.end_time}</Text>
                  <Text style={styles.dateSub}>{session.date} ({session.day || 'Scheduled'})</Text>
                </View>
              </View>
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Verification & Navigation</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={showRoomQr}>
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary + '10' }]}>
                <Ionicons name="qr-code" size={28} color={theme.colors.primary} />
              </View>
              <Text style={styles.actionTitle}>Room Digital ID</Text>
              <Text style={styles.actionDesc}>Show room QR identifier</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={openMaps}>
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.success + '10' }]}>
                <Ionicons name="map" size={28} color={theme.colors.success} />
              </View>
              <Text style={styles.actionTitle}>Get Directions</Text>
              <Text style={styles.actionDesc}>Open in Google Maps</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Session Status</Text>
          <Card>
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: session.is_cancelled ? theme.colors.error : theme.colors.success }]} />
              <Text style={styles.statusText}>Status: {session.is_cancelled ? 'Cancelled' : 'Active and Confirmed'}</Text>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* QR MODAL */}
      <Modal visible={qrVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Room Identifier</Text>
              <TouchableOpacity onPress={() => setQrVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.qrContainer}>
              <QRCode value={session.room_gps || session.room_name} size={200} color={theme.colors.text} backgroundColor="#FFF" />
              <Text style={styles.qrRoomName}>{session.room_name}</Text>
              <Text style={styles.qrHint}>Assigned Location</Text>
            </View>
            <Button title="Close" onPress={() => setQrVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  infoCard: { padding: theme.spacing.lg, marginBottom: 20 },
  mainInfo: { gap: theme.spacing.md },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 11, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginTop: 2 },
  dateSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 20 },
  
  // Action Grid
  actionGrid: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, backgroundColor: '#FFF', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  actionIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  actionTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  actionDesc: { fontSize: 11, color: theme.colors.textMuted, marginTop: 4, textAlign: 'center' },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 14, color: theme.colors.text, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  qrContainer: { alignItems: 'center', marginBottom: 24 },
  qrRoomName: { fontSize: 20, fontWeight: '800', color: theme.colors.primary, marginTop: 16 },
  qrHint: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4 }
});
