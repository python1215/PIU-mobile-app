import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { riskAPI, projectAPI } from '../services/api';

const RISK_COLORS = {
  HIGH: { bg: '#fde8ea', text: '#dc3545' },
  MEDIUM: { bg: '#fff3e6', text: '#fd7e14' },
  LOW: { bg: '#e6f4ee', text: '#198754' },
};

export default function RiskAssessmentScreen() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [risks, setRisks] = useState([]);
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
    riskAPI.getByProject(selectedProject.id)
      .then((res) => setRisks(res.data || []))
      .catch(() => setRisks([]))
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, [selectedProject]);

  const renderItem = ({ item }) => {
    const level = item.riskLevel?.toUpperCase() || 'MEDIUM';
    const colors = RISK_COLORS[level] || RISK_COLORS.MEDIUM;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.riskTitle} numberOfLines={2}>{item.riskDescription || item.risk}</Text>
          <View style={[styles.levelBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.levelText, { color: colors.text }]}>{level}</Text>
          </View>
        </View>
        {item.mitigation && (
          <View style={styles.mitigationBox}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#198754" />
            <Text style={styles.mitigationText}>{item.mitigation}</Text>
          </View>
        )}
        <View style={styles.metaRow}>
          {item.probability != null && <Text style={styles.metaChip}>Prob: {item.probability}</Text>}
          {item.impact != null && <Text style={styles.metaChip}>Impact: {item.impact}</Text>}
          {item.riskScore != null && <Text style={styles.metaChip}>Score: {item.riskScore}</Text>}
        </View>
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
          data={risks}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); if (selectedProject) riskAPI.getByProject(selectedProject.id).then((r) => setRisks(r.data || [])).finally(() => setRefreshing(false)); }} colors={['#0d6efd']} />}
          ListEmptyComponent={<Text style={styles.empty}>{t('common.noData') || 'No risk data found.'}</Text>}
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
  list: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 },
  riskTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#212529', marginRight: 8 },
  levelBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  levelText: { fontSize: 11, fontWeight: '700' },
  mitigationBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: '#f0faf5', borderRadius: 8, padding: 8, marginBottom: 8 },
  mitigationText: { flex: 1, fontSize: 13, color: '#198754', lineHeight: 18 },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metaChip: { backgroundColor: '#f0f0f0', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, fontSize: 11, color: '#495057', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#6c757d', paddingVertical: 40, fontSize: 15 },
});
