import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { projectAPI, issueAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { getWithCache } from '../services/cache';
import { scheduleIssueAlert, setBadgeCount } from '../services/notifications';

function StatCard({ icon, label, value, color, bg }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconBg, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.statText}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const setOpenIssueCount = useAuthStore((state) => state.setOpenIssueCount);
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);

  const fetchData = async () => {
    try {
      const [projRes, issueRes] = await Promise.all([
        getWithCache('projects:all', () => projectAPI.getAll()),
        getWithCache('issues:all', () => issueAPI.getAll()),
      ]);

      const projs  = projRes.data  ?? [];
      const iss    = issueRes.data ?? [];

      setProjects(projs);
      setIssues(iss);
      setOffline(projRes.offline || issueRes.offline);

      const openCount = iss.filter(
        (i) => (i.status?.toUpperCase() === 'OPEN')
      ).length;
      setOpenIssueCount(openCount);
      setBadgeCount(openCount);
      if (!projRes.offline && openCount > 0) {
        scheduleIssueAlert(openCount);
      }
    } catch (_) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const openIssues    = issues.filter((i) => i.status?.toUpperCase() === 'OPEN').length;
  const resolvedIssues = issues.filter((i) => i.status?.toUpperCase() === 'RESOLVED').length;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0d6efd" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d6efd']} />}
    >
      {offline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color="#856404" />
          <Text style={styles.offlineText}>Showing cached data — you are offline</Text>
        </View>
      )}

      <View style={styles.welcomeBanner}>
        <Text style={styles.welcomeGreeting}>
          {t('auth.welcomeBack') || 'Welcome back'}, {user?.username || 'User'}
        </Text>
        <Text style={styles.welcomeTitle}>{t('dashboard.title') || 'Dashboard'}</Text>
        <Text style={styles.welcomeSubtitle}>ROMEOT Digital M&E System</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.overview') || 'Overview'}</Text>
        <View style={styles.statsGrid}>
          <StatCard icon="folder-outline"          label={t('dashboard.totalProjects')  || 'Total Projects'}  value={projects.length}  color="#0d6efd" bg="#e7f0ff" />
          <StatCard icon="alert-circle-outline"    label={t('dashboard.openIssues')     || 'Open Issues'}     value={openIssues}       color="#dc3545" bg="#fde8ea" />
          <StatCard icon="checkmark-circle-outline" label={t('dashboard.resolvedIssues') || 'Resolved'}        value={resolvedIssues}   color="#198754" bg="#e6f4ee" />
          <StatCard icon="time-outline"            label={t('dashboard.totalIssues')    || 'Total Issues'}    value={issues.length}    color="#fd7e14" bg="#fff3e6" />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('projects.title') || 'Projects'}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
            <Text style={styles.seeAll}>{t('common.seeAll') || 'See All'}</Text>
          </TouchableOpacity>
        </View>
        {projects.slice(0, 5).map((project) => (
          <TouchableOpacity
            key={project.id}
            style={styles.projectRow}
            onPress={() => navigation.navigate('Projects', { screen: 'ProjectDetail', params: { id: project.id } })}
          >
            <View style={styles.projectIdBadge}>
              <Text style={styles.projectIdText}>{project.projectId}</Text>
            </View>
            <View style={styles.projectInfo}>
              <Text style={styles.projectName} numberOfLines={1}>{project.project}</Text>
              <Text style={styles.projectFunding}>
                {project.currency?.currency} {project.funding?.toLocaleString()}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#adb5bd" />
          </TouchableOpacity>
        ))}
        {projects.length === 0 && (
          <Text style={styles.emptyText}>{t('common.noData') || 'No projects found.'}</Text>
        )}
      </View>
    </ScrollView>
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
  welcomeBanner: {
    backgroundColor: '#0d6efd',
    padding: 24,
    paddingBottom: 32,
  },
  welcomeGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  welcomeTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  welcomeSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  section: { margin: 16, marginTop: 0, marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#212529', marginBottom: 12, marginTop: 16 },
  seeAll: { fontSize: 13, color: '#0d6efd', fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconBg: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  statText: { flex: 1 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#212529' },
  statLabel: { fontSize: 11, color: '#6c757d', marginTop: 2 },
  projectRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  projectIdBadge: {
    backgroundColor: '#e7f0ff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  projectIdText: { fontSize: 11, color: '#0d6efd', fontWeight: '700' },
  projectInfo: { flex: 1 },
  projectName: { fontSize: 14, fontWeight: '600', color: '#212529' },
  projectFunding: { fontSize: 12, color: '#6c757d', marginTop: 2 },
  emptyText: { color: '#6c757d', textAlign: 'center', paddingVertical: 20, fontSize: 14 },
});
