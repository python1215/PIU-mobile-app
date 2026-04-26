import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { financialAPI, projectAPI } from '../services/api';

export default function FinancialManagementScreen() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [records, setRecords] = useState([]);
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

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    financialAPI.getByProject(selectedProject.id)
      .then((res) => setRecords(res.data || []))
      .catch(() => setRecords([]))
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, [selectedProject]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle}>{item.description || item.category || 'Financial Record'}</Text>
        <Text style={styles.amount}>
          {item.currency?.currency || ''} {item.amount?.toLocaleString() || '0'}
        </Text>
      </View>
      <View style={styles.metaRow}>
        {item.year && <Text style={styles.meta}>{item.year?.year || item.year}</Text>}
        {item.quarter && <Text style={styles.meta}>Q{item.quarter?.quarter || item.quarter}</Text>}
        {item.type && <Text style={[styles.meta, styles.typeBadge]}>{item.type}</Text>}
      </View>
    </View>
  );

  const total = records.reduce((sum, r) => sum + (r.amount || 0), 0);

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
              <Text style={[styles.pickerText, selectedProject?.id === p.id && styles.pickerTextActive]}>{p.project}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!loading && records.length > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t('financial.totalFunding') || 'Total Amount'}</Text>
          <Text style={styles.summaryValue}>
            {selectedProject?.currency?.currency || ''} {total.toLocaleString()}
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#0d6efd" /></View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); if (selectedProject) financialAPI.getByProject(selectedProject.id).then((r) => setRecords(r.data || [])).finally(() => setRefreshing(false)); }} colors={['#0d6efd']} />}
          ListEmptyComponent={<Text style={styles.empty}>{t('common.noData') || 'No financial records found.'}</Text>}
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
  pickerTextActive: { color: '#0d6efd', fontWeight: '700' },
  summaryCard: {
    marginHorizontal: 16, backgroundColor: '#0d6efd', borderRadius: 12,
    padding: 16, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  summaryValue: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#212529', marginRight: 8 },
  amount: { fontSize: 16, fontWeight: 'bold', color: '#0d6efd' },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  meta: { fontSize: 12, color: '#6c757d' },
  typeBadge: {
    backgroundColor: '#e7f0ff', color: '#0d6efd', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2, fontWeight: '700',
  },
  empty: { textAlign: 'center', color: '#6c757d', paddingVertical: 40, fontSize: 15 },
});
