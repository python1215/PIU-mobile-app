import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { socialEnvAPI, projectAPI } from '../services/api';

const TABS = [
  { key: 'esia', label: 'ESIA', icon: 'leaf-outline' },
  { key: 'ohs', label: 'OHS', icon: 'medkit-outline' },
  { key: 'grievances', label: 'Grievances', icon: 'chatbubble-ellipses-outline' },
  { key: 'paps', label: 'PAPs', icon: 'people-outline' },
];

export default function SocialEnvironmentalScreen() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    projectAPI.getAll()
      .then((res) => {
        setProjects(res.data || []);
        if (res.data?.length > 0) setSelectedProject(res.data[0]);
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchTabData = (project, tab) => {
    if (!project) return;
    setLoading(true);
    const fetchFn = {
      esia: () => socialEnvAPI.getESIA(project.id),
      ohs: () => socialEnvAPI.getOHS(project.id),
      grievances: () => socialEnvAPI.getGrievances(project.id),
      paps: () => socialEnvAPI.getPAPs(project.id),
    }[tab.key];
    fetchFn()
      .then((res) => setData(res.data || []))
      .catch(() => setData([]))
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetchTabData(selectedProject, activeTab); }, [selectedProject, activeTab]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {Object.entries(item).filter(([k]) => !['id', 'project', 'projectId'].includes(k)).slice(0, 6).map(([key, val]) => (
        val !== null && val !== undefined && typeof val !== 'object' ? (
          <View key={key} style={styles.row}>
            <Text style={styles.rowKey}>{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
            <Text style={styles.rowVal}>{String(val)}</Text>
          </View>
        ) : null
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.projectSelector} onPress={() => setShowPicker(!showPicker)}>
        <Ionicons name="folder-outline" size={16} color="#0d6efd" />
        <Text style={styles.selectorText} numberOfLines={1}>{selectedProject?.project || 'Select Project'}</Text>
        <Ionicons name={showPicker ? 'chevron-up' : 'chevron-down'} size={16} color="#6c757d" />
      </TouchableOpacity>

      {showPicker && (
        <View style={styles.picker}>
          {projects.map((p) => (
            <TouchableOpacity key={p.id} style={styles.pickerItem} onPress={() => { setSelectedProject(p); setShowPicker(false); }}>
              <Text style={[styles.pickerText, selectedProject?.id === p.id && styles.pickerActive]}>{p.project}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

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
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTabData(selectedProject, activeTab); }} colors={['#0d6efd']} />}
          ListEmptyComponent={<Text style={styles.empty}>{t('common.noData') || 'No data found.'}</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  projectSelector: {
    flexDirection: 'row', alignItems: 'center', gap: 8, margin: 16,
    backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#dee2e6',
  },
  selectorText: { flex: 1, fontSize: 14, color: '#212529', fontWeight: '600' },
  picker: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#dee2e6', marginBottom: 8, overflow: 'hidden' },
  pickerItem: { padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f0f0f0' },
  pickerText: { fontSize: 14, color: '#495057' },
  pickerActive: { color: '#0d6efd', fontWeight: '700' },
  tabBar: { maxHeight: 52, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#dee2e6' },
  tabContent: { paddingHorizontal: 12, alignItems: 'center', gap: 4 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, margin: 4 },
  tabActive: { backgroundColor: '#e7f0ff' },
  tabText: { fontSize: 13, color: '#6c757d', fontWeight: '600' },
  tabTextActive: { color: '#0d6efd' },
  list: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f5f5f5' },
  rowKey: { fontSize: 12, color: '#6c757d', textTransform: 'capitalize', flex: 1 },
  rowVal: { fontSize: 13, color: '#212529', fontWeight: '500', flex: 1, textAlign: 'right' },
  empty: { textAlign: 'center', color: '#6c757d', paddingVertical: 40, fontSize: 15 },
});
