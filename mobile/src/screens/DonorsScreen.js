import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Modal,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { donorAPI } from '../services/api';
import Toast from 'react-native-toast-message';

export default function DonorsScreen() {
  const { t } = useTranslation();
  const [donors, setDonors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({ donor: '', country: '', email: '' });
  const [saving, setSaving] = useState(false);

  const fetchDonors = async () => {
    try {
      const res = await donorAPI.getAll();
      setDonors(res.data || []);
      setFiltered(res.data || []);
    } catch (e) {
      setDonors([]);
      setFiltered([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDonors(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(donors.filter((d) => d.donor?.toLowerCase().includes(q) || d.country?.toLowerCase().includes(q)));
  }, [search, donors]);

  const handleSave = async () => {
    if (!formData.donor.trim()) return;
    setSaving(true);
    try {
      await donorAPI.create(formData);
      Toast.show({ type: 'success', text1: t('common.saved') || 'Donor saved.' });
      setModalVisible(false);
      setFormData({ donor: '', country: '', email: '' });
      fetchDonors();
    } catch (e) {
      Toast.show({ type: 'error', text1: t('common.error') || 'Error saving donor.' });
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardIcon}>
        <Ionicons name="people-outline" size={22} color="#0d6efd" />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.donor}</Text>
        {item.country && <Text style={styles.cardSub}>{item.country}</Text>}
        {item.email && <Text style={styles.cardSub}>{item.email}</Text>}
      </View>
    </View>
  );

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#0d6efd" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={16} color="#6c757d" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search') || 'Search...'}
            placeholderTextColor="#adb5bd"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDonors(); }} colors={['#0d6efd']} />}
        ListEmptyComponent={<Text style={styles.empty}>{t('common.noData') || 'No donors found.'}</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('donors.addDonor') || 'Add Donor'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#6c757d" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {[['donor', t('donors.donorName') || 'Donor Name', 'people-outline'],
                ['country', t('donors.country') || 'Country', 'globe-outline'],
                ['email', t('donors.email') || 'Email', 'mail-outline']].map(([key, label, icon]) => (
                <View key={key} style={styles.formGroup}>
                  <Text style={styles.formLabel}>{label}</Text>
                  <View style={styles.inputRow}>
                    <Ionicons name={icon} size={16} color="#6c757d" style={styles.inputIcon} />
                    <TextInput
                      style={styles.formInput}
                      value={formData[key]}
                      onChangeText={(v) => setFormData({ ...formData, [key]: v })}
                      placeholder={label}
                      placeholderTextColor="#adb5bd"
                      keyboardType={key === 'email' ? 'email-address' : 'default'}
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{t('common.save') || 'Save'}</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', margin: 16, gap: 10 },
  searchWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#dee2e6', gap: 8,
  },
  searchInput: { flex: 1, height: 42, fontSize: 14, color: '#212529' },
  addBtn: { backgroundColor: '#0d6efd', width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  cardIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e7f0ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#212529' },
  cardSub: { fontSize: 12, color: '#6c757d', marginTop: 2 },
  empty: { textAlign: 'center', color: '#6c757d', paddingVertical: 40, fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#212529' },
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: '600', color: '#495057', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#dee2e6', borderRadius: 10, paddingHorizontal: 12, backgroundColor: '#f8f9fa' },
  inputIcon: { marginRight: 8 },
  formInput: { flex: 1, height: 44, fontSize: 14, color: '#212529' },
  saveBtn: { backgroundColor: '#0d6efd', borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
