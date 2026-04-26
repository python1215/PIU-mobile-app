import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { setupAPI } from '../services/api';

const TABS = [
  { key: 'regions',     label: 'Regions',     icon: 'map-outline',        fetch: (api) => api.getRegions(),         nameKey: 'region' },
  { key: 'lgas',        label: 'LGAs',        icon: 'location-outline',   fetch: (api) => api.getLGAs(),            nameKey: 'lga' },
  { key: 'districts',   label: 'Districts',   icon: 'business-outline',   fetch: (api) => api.getDistricts(),       nameKey: 'district' },
  { key: 'currencies',  label: 'Currencies',  icon: 'cash-outline',       fetch: (api) => api.getCurrencies(),      nameKey: 'currency' },
  { key: 'categories',  label: 'Categories',  icon: 'layers-outline',     fetch: (api) => api.getProjectCategories(), nameKey: 'category' },
];

export default function SystemSetupScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (tab) => {
    try {
      const res = await tab.fetch(setupAPI);
      setData(res.data || []);
    } catch (e) {
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { setLoading(true); fetchData(activeTab); }, [activeTab]);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabBarContent}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab.key === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons name={tab.icon} size={16} color={activeTab.key === tab.key ? '#0d6efd' : '#6c757d'} />
            <Text style={[styles.tabText, activeTab.key === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#0d6efd" /></View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Ionicons name={activeTab.icon} size={18} color="#0d6efd" style={styles.itemIcon} />
              <Text style={styles.itemText}>{item[activeTab.nameKey] || item.name || JSON.stringify(item)}</Text>
            </View>
          )}
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
  tabBarContent: { paddingHorizontal: 12, alignItems: 'center', gap: 4 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20, margin: 4,
  },
  tabActive: { backgroundColor: '#e7f0ff' },
  tabText: { fontSize: 13, color: '#6c757d', fontWeight: '600' },
  tabTextActive: { color: '#0d6efd' },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  item: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  itemIcon: { marginRight: 12 },
  itemText: { fontSize: 14, color: '#212529', fontWeight: '500' },
  empty: { textAlign: 'center', color: '#6c757d', paddingVertical: 40, fontSize: 15 },
});
