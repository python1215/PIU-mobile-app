import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { monitoringAPI, projectAPI } from '../services/api';

export default function MonitoringEvaluationScreen() {
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
    monitoringAPI.getByProject(selectedProject.id)
      .then((res) => setRecords(res.data || []))
      .catch(() => setRecords([]))
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, [selectedProject]);

  const renderItem = ({ item }) => {
    const pct = item.endTargetValue ? Math.min(100, Math.round((item.achievedValue / item.endTargetValue) * 100)) : 0;
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.indicator || item.pdo || 'Monitoring Record'}</Text>
        <View style={styles.valRow}>
          {[['Baseline', item.baselineValue, '#6c757d'], ['Achieved', item.achievedValue, '#0d6efd'], ['Target', item.endTargetValue, '#198754']].map(([lbl, val, clr]) => (
            <View key={lbl} style={styles.valBox}>
              <Text style={[styles.valNum, { color: clr }]}>{val ?? '-'}</Text>
              <Text style={styles.valLabel}>{lbl}</Text>
            </View>
          ))}
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{pct}%</Text>
        {item.year && <Text style={styles.metaText}>{item.year?.year || item.year} {item.quarter ? `• Q${item.quarter?.quarter || item.quarter}` : ''}</Text>}
      </View>
    );
  };

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

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#0d6efd" /></View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); if (selectedProject) monitoringAPI.getByProject(selectedProject.id).then((r) => setRecords(r.data || [])).finally(() => setRefreshing(false)); }} colors={['#0d6efd']} />}
          ListEmptyComponent={<Text style={styles.empty}>{t('common.noData') || 'No monitoring data found.'}</Text>}
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
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#212529', marginBottom: 12 },
  valRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  valBox: { alignItems: 'center' },
  valNum: { fontSize: 18, fontWeight: 'bold' },
  valLabel: { fontSize: 11, color: '#6c757d', marginTop: 2 },
  progressTrack: { height: 6, backgroundColor: '#e9ecef', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#0d6efd', borderRadius: 3 },
  progressLabel: { fontSize: 12, color: '#6c757d', marginTop: 4, textAlign: 'right' },
  metaText: { fontSize: 12, color: '#adb5bd', marginTop: 6 },
  empty: { textAlign: 'center', color: '#6c757d', paddingVertical: 40, fontSize: 15 },
});
