import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  RefreshControl, TouchableOpacity, Linking, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { documentationAPI, projectAPI } from '../services/api';
import { BASE_URL } from '../services/api';

function getFileIcon(filename) {
  if (!filename) return 'document-outline';
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['pdf'].includes(ext)) return 'document-text-outline';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'grid-outline';
  if (['doc', 'docx'].includes(ext)) return 'document-outline';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image-outline';
  return 'attach-outline';
}

export default function DocumentationScreen() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [docs, setDocs] = useState([]);
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
    documentationAPI.getByProject(selectedProject.id)
      .then((res) => setDocs(res.data || []))
      .catch(() => setDocs([]))
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, [selectedProject]);

  const handleOpenDoc = (doc) => {
    const url = `${BASE_URL.replace('/api', '')}/uploads/${doc.fileName || doc.filename}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open document.'));
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleOpenDoc(item)}>
      <View style={styles.fileIconContainer}>
        <Ionicons name={getFileIcon(item.fileName || item.filename)} size={24} color="#0d6efd" />
      </View>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>{item.originalFileName || item.fileName || 'Document'}</Text>
        <Text style={styles.fileMeta}>{item.uploadedAt?.split('T')[0] || ''}</Text>
        {item.documentType && <Text style={styles.docType}>{item.documentType}</Text>}
      </View>
      <Ionicons name="download-outline" size={20} color="#0d6efd" />
    </TouchableOpacity>
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

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#0d6efd" /></View>
      ) : (
        <FlatList
          data={docs}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); if (selectedProject) documentationAPI.getByProject(selectedProject.id).then((r) => setDocs(r.data || [])).finally(() => setRefreshing(false)); }} colors={['#0d6efd']} />}
          ListEmptyComponent={<Text style={styles.empty}>{t('common.noData') || 'No documents found.'}</Text>}
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
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  fileIconContainer: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: '#e7f0ff',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 14, fontWeight: '700', color: '#212529' },
  fileMeta: { fontSize: 12, color: '#6c757d', marginTop: 2 },
  docType: { fontSize: 11, color: '#0d6efd', marginTop: 3, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#6c757d', paddingVertical: 40, fontSize: 15 },
});
