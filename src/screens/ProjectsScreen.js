import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { projectAPI } from '../services/api';
import { getWithCache } from '../services/cache';

export default function ProjectsScreen({ navigation }) {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);

  const fetchProjects = async () => {
    try {
      const { data, offline: isOffline } = await getWithCache(
        'projects:all',
        () => projectAPI.getAll()
      );
      const list = data ?? [];
      setProjects(list);
      setFiltered(list);
      setOffline(isOffline);
    } catch (_) {
      setProjects([]);
      setFiltered([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(projects.filter((p) =>
      p.project?.toLowerCase().includes(q) || p.projectId?.toLowerCase().includes(q)
    ));
  }, [search, projects]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProjectDetail', { id: item.id, project: item })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.idBadge}>
          <Text style={styles.idText}>{item.projectId}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{t('common.active')}</Text>
        </View>
      </View>
      <Text style={styles.projectName}>{item.project}</Text>
      <View style={styles.cardMeta}>
        <Ionicons name="cash-outline" size={13} color="#6c757d" />
        <Text style={styles.metaText}>
          {item.currency?.currency} {item.funding?.toLocaleString()}
        </Text>
      </View>
      {item.effectivenessDate && (
        <View style={styles.cardMeta}>
          <Ionicons name="calendar-outline" size={13} color="#6c757d" />
          <Text style={styles.metaText}>{item.effectivenessDate}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={16} color="#adb5bd" style={styles.chevron} />
    </TouchableOpacity>
  );

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#0d6efd" /></View>;
  }

  return (
    <View style={styles.container}>
      {offline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color="#856404" />
          <Text style={styles.offlineText}>Offline — showing cached projects</Text>
        </View>
      )}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color="#6c757d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('common.search') || 'Search projects...'}
          placeholderTextColor="#adb5bd"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProjects(); }} colors={['#0d6efd']} />}
        ListEmptyComponent={<Text style={styles.empty}>{t('common.noData') || 'No projects found.'}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff3cd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ffc107',
  },
  offlineText: { fontSize: 12, color: '#856404', fontWeight: '500' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 15, color: '#212529' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  idBadge: { backgroundColor: '#e7f0ff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  idText: { fontSize: 11, color: '#0d6efd', fontWeight: '700' },
  statusBadge: { backgroundColor: '#e6f4ee', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, color: '#198754', fontWeight: '700' },
  projectName: { fontSize: 16, fontWeight: '700', color: '#212529', marginBottom: 8 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaText: { fontSize: 13, color: '#6c757d' },
  chevron: { position: 'absolute', right: 16, top: '50%' },
  empty: { textAlign: 'center', color: '#6c757d', paddingVertical: 40, fontSize: 15 },
});
