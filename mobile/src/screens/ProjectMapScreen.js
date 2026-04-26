import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { projectAPI } from '../services/api';

/**
 * ProjectMapScreen
 *
 * Note: react-native-maps requires additional native setup.
 * On Android, add your Google Maps API key to AndroidManifest.xml:
 *   <meta-data android:name="com.google.android.geo.API_KEY" android:value="YOUR_KEY"/>
 *
 * On iOS, run `npx pod-install` after installing.
 */

let MapView, Marker;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
} catch (e) {
  MapView = null;
  Marker = null;
}

export default function ProjectMapScreen() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectAPI.getAll()
      .then((res) => setProjects((res.data || []).filter((p) => p.latitude && p.longitude)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#0d6efd" /></View>;
  }

  if (!MapView) {
    return (
      <View style={styles.centered}>
        <Text style={styles.note}>Map view requires react-native-maps to be installed and linked natively.</Text>
        <Text style={styles.note}>Run: npx expo install react-native-maps</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: projects[0]?.latitude || 10,
          longitude: projects[0]?.longitude || 10,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
      >
        {projects.map((project) => (
          <Marker
            key={project.id}
            coordinate={{ latitude: project.latitude, longitude: project.longitude }}
            title={project.project}
            description={`${project.currency?.currency || ''} ${project.funding?.toLocaleString() || ''}`}
          />
        ))}
      </MapView>
      <View style={styles.legend}>
        <Text style={styles.legendText}>{projects.length} {t('nav.projects') || 'Projects'} on map</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  map: { flex: 1 },
  legend: {
    position: 'absolute', bottom: 20, left: 20, right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  legendText: { textAlign: 'center', fontSize: 14, color: '#212529', fontWeight: '600' },
  note: { fontSize: 14, color: '#6c757d', textAlign: 'center', marginBottom: 8, lineHeight: 22 },
});
