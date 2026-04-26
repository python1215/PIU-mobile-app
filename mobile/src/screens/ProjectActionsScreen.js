import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const TABS = [
  { key: 'works',              label: 'Works Contracts',     icon: 'document-text-outline' },
  { key: 'goods',              label: 'Goods Contracts',     icon: 'cube-outline' },
  { key: 'design-work',        label: 'Design Work Plan',    icon: 'clipboard-outline' },
  { key: 'boq',                label: 'BOQ',                 icon: 'list-outline' },
  { key: 'supply-progress',    label: 'Supply Progress',     icon: 'cube-outline' },
  { key: 'installation',       label: 'Installation',        icon: 'settings-outline' },
  { key: 'design-monitoring',  label: 'Design Monitoring',   icon: 'trending-up-outline' },
  { key: 'jmc',                label: 'JMC',                 icon: 'checkmark-circle-outline' },
];

export default function ProjectActionsScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabContent}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab.key === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons name={tab.icon} size={14} color={activeTab.key === tab.key ? '#0d6efd' : '#6c757d'} />
            <Text style={[styles.tabText, activeTab.key === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.content}>
        <View style={styles.placeholder}>
          <Ionicons name={activeTab.icon} size={48} color="#dee2e6" />
          <Text style={styles.placeholderTitle}>{activeTab.label}</Text>
          <Text style={styles.placeholderDesc}>
            This section displays {activeTab.label.toLowerCase()} data.{'\n'}
            Connect to the backend API to populate this screen.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  tabBar: { maxHeight: 56, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#dee2e6' },
  tabContent: { paddingHorizontal: 8, alignItems: 'center', gap: 2 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, margin: 4,
  },
  tabActive: { backgroundColor: '#e7f0ff' },
  tabText: { fontSize: 12, color: '#6c757d', fontWeight: '600' },
  tabTextActive: { color: '#0d6efd' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  placeholder: { alignItems: 'center' },
  placeholderTitle: { fontSize: 20, fontWeight: '700', color: '#adb5bd', marginTop: 16, marginBottom: 8 },
  placeholderDesc: { fontSize: 14, color: '#adb5bd', textAlign: 'center', lineHeight: 22 },
});
