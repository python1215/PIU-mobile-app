import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { administrationAPI } from '../services/api';

const TABS = [
  { key: 'roles', label: 'Roles', icon: 'shield-outline' },
  { key: 'users', label: 'Users', icon: 'people-outline' },
  { key: 'connected', label: 'Online Users', icon: 'wifi-outline' },
];

export default function AdministrationScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (tab) => {
    const fns = {
      roles: () => administrationAPI.getRoles(),
      users: () => administrationAPI.getUsers(),
      connected: () => administrationAPI.getConnectedUsers(),
    };
    try {
      const res = await fns[tab.key]();
      setData(res.data || []);
    } catch (e) {
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { setLoading(true); fetchData(activeTab); }, [activeTab]);

  const renderRole = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.roleIcon}><Ionicons name="shield-outline" size={20} color="#0d6efd" /></View>
      <View style={styles.roleInfo}>
        <Text style={styles.roleName}>{item.roleName || item.role}</Text>
        {item.description && <Text style={styles.roleDesc}>{item.description}</Text>}
      </View>
    </View>
  );

  const renderUser = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.userAvatar}>
        <Text style={styles.avatarText}>{(item.username || item.name || '?')[0].toUpperCase()}</Text>
      </View>
      <View style={styles.roleInfo}>
        <Text style={styles.roleName}>{item.username || item.name}</Text>
        <Text style={styles.roleDesc}>{item.email || ''}</Text>
        {item.roleName && <View style={styles.roleBadge}><Text style={styles.roleBadgeText}>{item.roleName}</Text></View>}
      </View>
    </View>
  );

  const renderItem = activeTab.key === 'users' || activeTab.key === 'connected' ? renderUser : renderRole;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabContent}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab.key === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons name={tab.icon} size={15} color={activeTab.key === tab.key ? '#0d6efd' : '#6c757d'} />
            <Text style={[styles.tabText, activeTab.key === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#0d6efd" /></View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id || item.username)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(activeTab); }} colors={['#0d6efd']} />}
          ListEmptyComponent={<Text style={styles.empty}>{t('common.noData') || 'No data found.'}</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabBar: { maxHeight: 56, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#dee2e6' },
  tabContent: { paddingHorizontal: 12, alignItems: 'center', gap: 4 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, margin: 4 },
  tabActive: { backgroundColor: '#e7f0ff' },
  tabText: { fontSize: 13, color: '#6c757d', fontWeight: '600' },
  tabTextActive: { color: '#0d6efd' },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  roleIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e7f0ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0d6efd', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  roleInfo: { flex: 1 },
  roleName: { fontSize: 15, fontWeight: '700', color: '#212529' },
  roleDesc: { fontSize: 12, color: '#6c757d', marginTop: 2 },
  roleBadge: { backgroundColor: '#e7f0ff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4, alignSelf: 'flex-start' },
  roleBadgeText: { fontSize: 11, color: '#0d6efd', fontWeight: '700' },
  empty: { textAlign: 'center', color: '#6c757d', paddingVertical: 40, fontSize: 15 },
});
