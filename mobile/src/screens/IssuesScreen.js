import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { issueAPI } from '../services/api';

const STATUS_COLORS = {
  OPEN: { bg: '#fde8ea', text: '#dc3545' },
  IN_PROGRESS: { bg: '#fff3e6', text: '#fd7e14' },
  RESOLVED: { bg: '#e6f4ee', text: '#198754' },
  CLOSED: { bg: '#f0f0f0', text: '#6c757d' },
};

export default function IssuesScreen() {
  const { t } = useTranslation();
  const [issues, setIssues] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  const fetchIssues = async () => {
    try {
      const res = await issueAPI.getAll();
      setIssues(res.data || []);
    } catch (e) {
      setIssues([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchIssues(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    let result = issues;
    if (activeFilter !== 'ALL') result = result.filter((i) => i.status === activeFilter);
    if (q) result = result.filter((i) => i.title?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q));
    setFiltered(result);
  }, [search, issues, activeFilter]);

  const renderItem = ({ item }) => {
    const statusKey = item.status?.toUpperCase() || 'OPEN';
    const colors = STATUS_COLORS[statusKey] || STATUS_COLORS.OPEN;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.issueTitle} numberOfLines={2}>{item.title || item.issue}</Text>
          <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text>
          </View>
        </View>
        {item.description && <Text style={styles.issueDesc} numberOfLines={2}>{item.description}</Text>}
        <View style={styles.cardMeta}>
          <Ionicons name="folder-outline" size={13} color="#6c757d" />
          <Text style={styles.metaText}>{item.project?.project || item.projectId || '-'}</Text>
          {item.createdAt && (
            <>
              <Ionicons name="calendar-outline" size={13} color="#6c757d" style={{ marginLeft: 12 }} />
              <Text style={styles.metaText}>{item.createdAt?.split('T')[0]}</Text>
            </>
          )}
        </View>
      </View>
    );
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#0d6efd" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color="#6c757d" />
        <TextInput
          style={styles.searchInput}
          placeholder={t('common.search') || 'Search issues...'}
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchIssues(); }} colors={['#0d6efd']} />}
        ListHeaderComponent={
          <FlatList
            horizontal
            data={FILTERS}
            keyExtractor={(f) => f}
            renderItem={({ item: f }) => (
              <TouchableOpacity
                style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.filters}
            showsHorizontalScrollIndicator={false}
          />
        }
        ListEmptyComponent={<Text style={styles.empty}>{t('common.noData') || 'No issues found.'}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', margin: 16, marginBottom: 8,
    backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12,
    borderWidth: 1, borderColor: '#dee2e6', gap: 8,
  },
  searchInput: { flex: 1, height: 42, fontSize: 14, color: '#212529' },
  filters: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#dee2e6',
  },
  filterChipActive: { backgroundColor: '#0d6efd', borderColor: '#0d6efd' },
  filterText: { fontSize: 12, color: '#6c757d', fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  issueTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#212529', marginRight: 8 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  statusText: { fontSize: 10, fontWeight: '700' },
  issueDesc: { fontSize: 13, color: '#6c757d', marginBottom: 8, lineHeight: 18 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#6c757d' },
  empty: { textAlign: 'center', color: '#6c757d', paddingVertical: 40, fontSize: 15 },
});
