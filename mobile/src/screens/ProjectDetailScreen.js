import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { projectAPI } from '../services/api';

function DetailRow({ label, value, icon }) {
  if (!value && value !== 0) return null;
  return (
    <View style={styles.detailRow}>
      {icon && <Ionicons name={icon} size={16} color="#0d6efd" style={styles.detailIcon} />}
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function SectionCard({ title, children }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function ProjectDetailScreen({ route }) {
  const { t } = useTranslation();
  const { id, project: passedProject } = route.params || {};
  const [project, setProject] = useState(passedProject || null);
  const [loading, setLoading] = useState(!passedProject);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await projectAPI.getById(id);
      setProject(res.data);
    } catch (e) {
      // keep passed project if fetch fails
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (id && !passedProject) fetchProject(); }, [id]);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#0d6efd" /></View>;
  }

  if (!project) {
    return <View style={styles.centered}><Text>{t('common.noData') || 'Project not found.'}</Text></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProject(); }} colors={['#0d6efd']} />}
    >
      <View style={styles.header}>
        <View style={styles.idBadge}>
          <Text style={styles.idText}>{project.projectId}</Text>
        </View>
        <Text style={styles.projectName}>{project.project}</Text>
        <View style={styles.activeBadge}>
          <Text style={styles.activeText}>{t('common.active')}</Text>
        </View>
      </View>

      <SectionCard title={t('projects.basicInfo') || 'Basic Information'}>
        <DetailRow icon="cash-outline" label={t('projects.funding') || 'Funding'} value={`${project.currency?.currency || ''} ${project.funding?.toLocaleString() || ''}`} />
        <DetailRow icon="calendar-outline" label={t('projects.effectivenessDate') || 'Effectiveness Date'} value={project.effectivenessDate} />
        <DetailRow icon="calendar-outline" label={t('projects.closureDate') || 'Closure Date'} value={project.closureDate} />
        <DetailRow icon="business-outline" label={t('projects.category') || 'Category'} value={project.projectCategory?.category} />
      </SectionCard>

      <SectionCard title={t('projects.funding') || 'Funding & Donors'}>
        {(project.donors || []).map((donor, i) => (
          <DetailRow key={i} icon="people-outline" label={t('donors.donor') || 'Donor'} value={donor.donor} />
        ))}
        {(project.contributors || []).map((c, i) => (
          <DetailRow key={i} icon="people-circle-outline" label={t('donors.contributor') || 'Contributor'} value={c.contributor} />
        ))}
      </SectionCard>

      {project.description && (
        <SectionCard title={t('projects.description') || 'Description'}>
          <Text style={styles.description}>{project.description}</Text>
        </SectionCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: '#0d6efd',
    padding: 24,
    paddingBottom: 28,
  },
  idBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  idText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  projectName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  activeBadge: {
    backgroundColor: '#198754',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  activeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  sectionCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0d6efd', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f0f0f0' },
  detailIcon: { marginRight: 10, marginTop: 2 },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#6c757d', marginBottom: 2 },
  detailValue: { fontSize: 14, color: '#212529', fontWeight: '500' },
  description: { fontSize: 14, color: '#495057', lineHeight: 22 },
});
