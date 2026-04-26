import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { userAPI } from '../services/api';
import Toast from 'react-native-toast-message';

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({ current: false, new: false, confirm: false });

  const handleSubmit = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      Toast.show({ type: 'error', text1: 'Please fill in all fields.' });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      Toast.show({ type: 'error', text1: t('auth.passwordMismatch') || 'Passwords do not match.' });
      return;
    }
    if (form.newPassword.length < 6) {
      Toast.show({ type: 'error', text1: 'Password must be at least 6 characters.' });
      return;
    }
    setLoading(true);
    try {
      await userAPI.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      Toast.show({ type: 'success', text1: t('auth.passwordChanged') || 'Password changed successfully.' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      Toast.show({ type: 'error', text1: e.response?.data?.message || 'Error changing password.' });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'currentPassword', label: t('auth.currentPassword') || 'Current Password', showKey: 'current' },
    { key: 'newPassword',     label: t('auth.newPassword')     || 'New Password',     showKey: 'new' },
    { key: 'confirmPassword', label: t('auth.confirmPassword') || 'Confirm Password', showKey: 'confirm' },
  ];

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={32} color="#0d6efd" />
          </View>
          <Text style={styles.title}>{t('auth.changePassword') || 'Change Password'}</Text>
          <Text style={styles.subtitle}>Choose a strong password to keep your account secure.</Text>

          {fields.map(({ key, label, showKey }) => (
            <View key={key} style={styles.formGroup}>
              <Text style={styles.label}>{label}</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={16} color="#6c757d" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  value={form[key]}
                  onChangeText={(v) => setForm({ ...form, [key]: v })}
                  secureTextEntry={!show[showKey]}
                  placeholder={label}
                  placeholderTextColor="#adb5bd"
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShow({ ...show, [showKey]: !show[showKey] })}>
                  <Ionicons name={show[showKey] ? 'eye-off-outline' : 'eye-outline'} size={16} color="#6c757d" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity style={[styles.submitBtn, loading && styles.disabled]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{t('auth.changePassword') || 'Change Password'}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1 },
  content: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  iconContainer: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#e7f0ff', alignItems: 'center', justifyContent: 'center', marginBottom: 16, alignSelf: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#212529', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#6c757d', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#495057', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#dee2e6',
    borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#f8f9fa',
  },
  icon: { marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 14, color: '#212529' },
  submitBtn: {
    backgroundColor: '#0d6efd', borderRadius: 12, height: 52,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  disabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
