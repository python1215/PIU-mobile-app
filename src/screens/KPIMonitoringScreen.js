import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { kpiAPI, projectAPI } from '../services/api';

export default function KPIMonitoringScreen() {
  const { t } = useTranslation();
  const [kpis, setKpis] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await projectAPI.getAll();
      setProjects(res.data || []);
      if (res.data?.length > 0) setSelectedProject(res.data[0]);
    } catch (e) {}
  };

  const fetchKPIs = async (projectId) => {
    if (!projectId) return;
    try {
      const res = await kpiAPI.getByProject(projectId);
      setKpis(res.data || []);
    } catch (e) {
      setKpis([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => { if (selectedProject) fetchKPIs(selectedProject.id); }, [selectedProject]);

  const progressPercent = (achieved, target) => {
    if (!target || target === 0) return 0;
    return Math.min(100, Math.round((achieved / target) * 100));
  };

  const renderItem = ({ item }) => {
    const pct = progressPercent(item.achievedValue, item.endTargetValue);
    return (
      <View style={styles.card}>
        <Text style={styles.kpiName}>{item.indicator || item.kpiName}</Text>
        <View style={styles.valuesRow}>
          {[['Baseline', item.baselineValue, '#6c757d'], ['Achieved', item.achievedValue, '#0d6efd'], ['Target', item.endTargetValue, '#198754']].map(([label, val, color]) => (
            <View key={label} style={styles.valueBox}>
              <Text style={[styles.valueNum, { color }]}>{val ?? '-'}</Text>
              <Text style={styles.valueLabel}>{label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.progressText}>{pct}% {t('kpi.achieved') || 'achieved'}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.projectSelector} onPress={() => setShowProjectPicker(!showProjectPicker)}>
        <Ionicons name="folder-outline" size={16} color="#0d6efd" />
        <Text style={styles.projectSelectorText} numberOfLines={1}>
          {selectedProject?.project || t('common.selectProject') || 'Select Project'}
        </Text>
        <Ionicons name={showProjectPicker ? 'chevron-up' : 'chevron-down'} size={16} color="#6c757d" />
      </TouchableOpacity>

      {showProjectPicker && (
        <View style={styles.projectPicker}>
          {projects.map((p) => (
            <TouchableOpacity key={p.id} style={styles.pickerItem} onPress={() => { setSelectedProject(p); setShowProjectPicker(false); setLoading(true); }}>
              <Text style={[styles.pickerItemText, selectedProject?.id === p.id && styles.pickerItemTextActive]}>{p.project}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#0d6efd" /></View>
      ) : (
        <FlatList
          data={kpis}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); if (selectedProject) fetchKPIs(selectedProject.id); }} colors={['#0d6efd']} />}
          ListEmptyComponent={<Text style={styles.empty}>{t('common.noData') || 'No KPI data found.'}</Text>}
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
  projectSelectorText: { flex: 1, fontSize: 14, color: '#212529', fontWeight: '600' },
  projectPicker: {
    marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1,
    borderColor: '#dee2e6', overflow: 'hidden', marginBottom: 8,
  },
  pickerItem: { padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f0f0f0' },
  pickerItemText: { fontSize: 14, color: '#495057' },
  pickerItemTextActive: { color: '#0d6efd', fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  kpiName: { fontSize: 15, fontWeight: '700', color: '#212529', marginBottom: 12 },
  valuesRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  valueBox: { alignItems: 'center' },
  valueNum: { fontSize: 20, fontWeight: 'bold' },
  valueLabel: { fontSize: 11, color: '#6c757d', marginTop: 2 },
  progressBar: { height: 6, backgroundColor: '#e9ecef', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#0d6efd', borderRadius: 3 },
  progressText: { fontSize: 12, color: '#6c757d', marginTop: 6, textAlign: 'right' },
  empty: { textAlign: 'center', color: '#6c757d', paddingVertical: 40, fontSize: 15 },
});
