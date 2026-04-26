import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { clearAllCache } from '../services/cache';

const MODULES = [
  { name: 'Donors',               label: 'Donors',                  icon: 'people-outline',                color: '#0d6efd' },
  { name: 'SystemSetup',          label: 'System Setup',            icon: 'settings-outline',              color: '#6610f2' },
  { name: 'FinancialManagement',  label: 'Financial Management',    icon: 'cash-outline',                  color: '#198754' },
  { name: 'MonitoringEvaluation', label: 'M&E',                     icon: 'trending-up-outline',           color: '#fd7e14' },
  { name: 'SocialEnvironmental',  label: 'Social & Environmental',  icon: 'shield-checkmark-outline',      color: '#20c997' },
  { name: 'Documentation',        label: 'Documentation',           icon: 'document-text-outline',         color: '#6c757d' },
  { name: 'ProjectMap',           label: 'Project Map',             icon: 'map-outline',                   color: '#0dcaf0' },
  { name: 'RiskAssessment',       label: 'Risk Assessment',         icon: 'warning-outline',               color: '#ffc107' },
  { name: 'ProjectActions',       label: 'Project Actions',         icon: 'briefcase-outline',             color: '#d63384' },
  { name: 'Administration',       label: 'Administration',          icon: 'construct-outline',             color: '#495057' },
  { name: 'ChangePassword',       label: 'Change Password',         icon: 'lock-closed-outline',           color: '#6c757d' },
];

export default function MoreScreen({ navigation }) {
  const { user, logout, hasModuleAccess } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await clearAllCache();
            logout();
          },
        },
      ]
    );
  };

  const visible = MODULES.filter(
    (m) => !m.moduleKey || hasModuleAccess(m.moduleKey)
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.username || 'U')[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.username || 'User'}</Text>
          <Text style={styles.profileRole}>{user?.roleName || 'User'}</Text>
        </View>
        <View style={styles.onlineDot} />
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>All Modules</Text>
        <View style={styles.gridRow}>
          {visible.map((module) => (
            <TouchableOpacity
              key={module.name}
              style={styles.tile}
              onPress={() => navigation.navigate(module.name)}
              activeOpacity={0.75}
            >
              <View style={[styles.tileIcon, { backgroundColor: module.color + '18' }]}>
                <Ionicons name={module.icon} size={22} color={module.color} />
              </View>
              <Text style={styles.tileLabel} numberOfLines={2}>{module.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#dc3545" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0d6efd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700', color: '#212529' },
  profileRole: { fontSize: 13, color: '#6c757d', marginTop: 1 },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#198754',
    borderWidth: 2,
    borderColor: '#fff',
  },
  grid: { paddingHorizontal: 16, paddingBottom: 32 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#adb5bd',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
    lineHeight: 15,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f5c2c7',
  },
  signOutText: { fontSize: 15, fontWeight: '700', color: '#dc3545' },
});
