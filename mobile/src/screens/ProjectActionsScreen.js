import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { projectActionsAPI, projectAPI } from '../services/api';

const TABS = [
  { key: 'works',            label: 'Works',          icon: 'document-text-outline',     fetch: (api, pid) => api.getWorks(pid) },
  { key: 'goods',            label: 'Goods',          icon: 'cube-outline',              fetch: (api, pid) => api.getGoods(pid) },
  { key: 'design-work',      label: 'Design Work',    icon: 'clipboard-outline',         fetch: (api, pid) => api.getDesignWork(pid) },
  { key: 'boq',              label: 'BOQ',            icon: 'list-outline',              fetch: (api, pid) => api.getBOQ(pid) },
  { key: 'supply-progress',  label: 'Supply',         icon: 'cube-outline',              fetch: (api, pid) => api.getSupplyProgress(pid) },
  { key: 'installation',     label: 'Installation',   icon: 'settings-outline',          fetch: (api, pid) => api.getInstallation(pid) },
  { key: 'jmc',              label: 'JMC',            icon: 'checkmark-circle-outline',  fetch: (api, pid) => api.getJMC(pid) },
];

function FieldRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function RecordCard({ item, tab }) {
  const fields = [];

  if (tab === 'works' || tab === 'goods') {
    fields.push(
      { label: 'Contract Ref', value: item.contractRefNo },
      { label: 'Contractor',   value: item.contractor },
      { label: 'Contract Sum', value: item.contractSum != null ? item.contractSum.toLocaleString() : null },
      { label: 'Start Date',   value: item.startDate },
      { label: 'End Date',     value: item.endDate },
      { label: 'Status',       value: item.status },
    );
  } else if (tab === 'design-work') {
    fields.push(
      { label: 'Activity',     value: item.activity || item.indicator },
      { label: 'Target',       value: item.targetValue },
      { label: 'Achieved',     value: item.achievedValue },
      { label: 'Period',       value: item.period },
    );
  } else if (tab === 'boq') {
    fields.push(
      { label: 'Description',  value: item.description },
      { label: 'Unit',         value: item.unit },
      { label: 'Quantity',     value: item.quantity },
      { label: 'Unit Price',   value: item.unitPrice != null ? item.unitPrice.toLocaleString() : null },
      { label: 'Total',        value: item.totalAmount != null ? item.totalAmount.toLocaleString() : null },
      { label: 'Contract Ref', value: item.contractRefNo },
    );
  } else if (tab === 'supply-progress') {
    fields.push(
      { label: 'Description',  value: item.description || item.item },
      { label: 'Ordered',      value: item.quantityOrdered },
      { label: 'Delivered',    value: item.quantityDelivered },
      { label: 'Date',         value: item.deliveryDate },
    );
  } else if (tab === 'installation') {
    fields.push(
      { label: 'Contract Ref', value: item.contractRefNo },
      { label: 'Entry Date',   value: item.entryDate },
      { label: 'Contract Type',value: item.contractType },
    );
  } else if (tab === 'jmc') {
    fields.push(
      { label: 'Meeting Date', value: item.meetingDate },
      { label: 'Venue',        value: item.venue },
      { label: 'Agenda',       value: item.agenda },
      { label: 'Attendees',    value: item.numberOfAttendees },
    );
  }

  const title = item.contractRefNo || item.description || item.activity || item.indicator
    || item.agenda || `Record #${item.id}`;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
      {fields.map(({ label, value }) =>
        value != null ? <FieldRow key={label} label={label} value={String(value)} /> : null
      )}
    </View>
  );
}

export default function ProjectActionsScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [projects, setProjects]   = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    projectAPI.getAll()
      .then((res) => {
        const list = res.data || [];
        setProjects(list);
        if (list.length > 0) setSelectedProject(list[0]);
        else setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchTabData = useCallback((project, tab) => {
    if (!project) return;
    setLoading(true);
    tab.fetch(projectActionsAPI, project.projectId)
      .then((res) => setData(res.data || []))
      .catch(() => setData([]))
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => {
    if (selectedProject) fetchTabData(selectedProject, activeTab);
  }, [selectedProject, activeTab]);

  return (
    <View style={styles.container}>
      {/* Project Picker */}
      <TouchableOpacity style={styles.projectSelector} onPress={() => setShowPicker(!showPicker)}>
        <Ionicons name="folder-outline" size={16} color="#0d6efd" />
        <Text style={styles.selectorText} numberOfLines={1}>
          {selectedProject?.project || t('common.selectProject') || 'Select Project'}
        </Text>
        <Ionicons name={showPicker ? 'chevron-up' : 'chevron-down'} size={16} color="#6c757d" />
      </TouchableOpacity>

      {showPicker && (
        <View style={styles.picker}>
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
            {projects.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.pickerItem}
                onPress={() => { setSelectedProject(p); setShowPicker(false); }}
              >
                <Text style={[styles.pickerText, selectedProject?.id === p.id && styles.pickerTextActive]}>
                  {p.project}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabContent}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab.key === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons
              name={tab.icon}
              size={14}
              color={activeTab.key === tab.key ? '#0d6efd' : '#6c757d'}
            />
            <Text style={[styles.tabText, activeTab.key === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0d6efd" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <RecordCard item={item} tab={activeTab.key} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchTabData(selectedProject, activeTab); }}
              colors={['#0d6efd']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name={activeTab.icon} size={48} color="#dee2e6" />
              <Text style={styles.emptyTitle}>{activeTab.label}</Text>
              <Text style={styles.emptyText}>
                {selectedProject
                  ? `No ${activeTab.label.toLowerCase()} records found for this project.`
                  : 'Select a project to view records.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  projectSelector: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: 16, marginBottom: 8,
    backgroundColor: '#fff', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#dee2e6',
  },
  selectorText: { flex: 1, fontSize: 14, color: '#212529', fontWeight: '600' },
  picker: {
    marginHorizontal: 16, marginBottom: 4,
    backgroundColor: '#fff', borderRadius: 10,
    borderWidth: 1, borderColor: '#dee2e6', overflow: 'hidden',
  },
  pickerItem: { padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f0f0f0' },
  pickerText: { fontSize: 14, color: '#495057' },
  pickerTextActive: { color: '#0d6efd', fontWeight: '700' },
  tabBar: {
    maxHeight: 52,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  tabContent: { paddingHorizontal: 8, alignItems: 'center' },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 20, margin: 4,
  },
  tabActive: { backgroundColor: '#e7f0ff' },
  tabText: { fontSize: 12, color: '#6c757d', fontWeight: '600' },
  tabTextActive: { color: '#0d6efd' },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#212529', marginBottom: 10 },
  fieldRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 5, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f5f5f5',
  },
  fieldLabel: { fontSize: 12, color: '#6c757d', flex: 1 },
  fieldValue: { fontSize: 13, color: '#212529', fontWeight: '500', flex: 2, textAlign: 'right' },
  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#adb5bd', marginTop: 14, marginBottom: 6 },
  emptyText: { fontSize: 13, color: '#adb5bd', textAlign: 'center', lineHeight: 20 },
});
