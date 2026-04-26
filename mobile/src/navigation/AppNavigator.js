import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import DonorsScreen from '../screens/DonorsScreen';
import IssuesScreen from '../screens/IssuesScreen';
import KPIMonitoringScreen from '../screens/KPIMonitoringScreen';
import SystemSetupScreen from '../screens/SystemSetupScreen';
import FinancialManagementScreen from '../screens/FinancialManagementScreen';
import MonitoringEvaluationScreen from '../screens/MonitoringEvaluationScreen';
import ProjectActionsScreen from '../screens/ProjectActionsScreen';
import SocialEnvironmentalScreen from '../screens/SocialEnvironmentalScreen';
import DocumentationScreen from '../screens/DocumentationScreen';
import ProjectMapScreen from '../screens/ProjectMapScreen';
import AdministrationScreen from '../screens/AdministrationScreen';
import RiskAssessmentScreen from '../screens/RiskAssessmentScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const DRAWER_ITEMS = [
  { name: 'Dashboard',            labelKey: 'nav.dashboard',            icon: 'home-outline',           moduleKey: null },
  { name: 'Projects',             labelKey: 'nav.projects',             icon: 'folder-outline',         moduleKey: null },
  { name: 'Donors',               labelKey: 'nav.donors',               icon: 'people-outline',         moduleKey: null },
  { name: 'SystemSetup',          labelKey: 'nav.systemSetup',          icon: 'settings-outline',       moduleKey: 'systemSetup' },
  { name: 'FinancialManagement',  labelKey: 'nav.financialManagement',  icon: 'cash-outline',           moduleKey: 'financialManagement' },
  { name: 'MonitoringEvaluation', labelKey: 'nav.monitoring',           icon: 'trending-up-outline',    moduleKey: 'monitoring' },
  { name: 'SocialEnvironmental',  labelKey: 'nav.socialEnvironmental',  icon: 'shield-outline',         moduleKey: 'socialEnvironmental' },
  { name: 'Documentation',        labelKey: 'nav.documentation',        icon: 'document-outline',       moduleKey: 'documentation' },
  { name: 'ProjectMap',           labelKey: 'nav.projectMap',           icon: 'map-outline',            moduleKey: 'projectMap' },
  { name: 'RiskAssessment',       labelKey: 'nav.riskAssessment',       icon: 'warning-outline',        moduleKey: 'riskAssessment' },
  { name: 'Issues',               labelKey: 'nav.issues',               icon: 'alert-circle-outline',   moduleKey: 'issues' },
  { name: 'KPIMonitoring',        labelKey: 'nav.kpi',                  icon: 'bar-chart-outline',      moduleKey: 'kpi' },
  { name: 'ProjectActions',       labelKey: 'nav.projectActions',       icon: 'briefcase-outline',      moduleKey: 'projectActions' },
  { name: 'Administration',       labelKey: 'nav.administration',       icon: 'construct-outline',      moduleKey: 'administration' },
  { name: 'ChangePassword',       labelKey: 'nav.changePassword',       icon: 'lock-closed-outline',    moduleKey: null },
];

function CustomDrawerContent({ navigation }) {
  const { t } = useTranslation();
  const { user, logout, hasModuleAccess } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={28} color="#fff" />
        </View>
        <Text style={styles.drawerUsername}>{user?.username || 'User'}</Text>
        <Text style={styles.drawerRole}>{user?.roleName || ''}</Text>
      </View>

      <ScrollView style={styles.drawerNav} showsVerticalScrollIndicator={false}>
        {DRAWER_ITEMS.map((item) => {
          const hasAccess = !item.moduleKey || hasModuleAccess(item.moduleKey);
          if (!hasAccess) return null;
          return (
            <TouchableOpacity
              key={item.name}
              style={styles.drawerItem}
              onPress={() => navigation.navigate(item.name)}
            >
              <Ionicons name={item.icon} size={20} color="#0d6efd" style={styles.drawerItemIcon} />
              <Text style={styles.drawerItemLabel}>{t(item.labelKey)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#dc3545" />
        <Text style={styles.logoutText}>{t('auth.signOut')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function ProjectStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0d6efd' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="ProjectsList" component={ProjectsScreen} options={{ title: 'Projects' }} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Project Detail' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { t } = useTranslation();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#0d6efd' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        drawerStyle: { width: 280 },
      }}
    >
      <Drawer.Screen name="Dashboard"            component={DashboardScreen}           options={{ title: t('nav.dashboard') }} />
      <Drawer.Screen name="Projects"             component={ProjectStack}              options={{ title: t('nav.projects'), headerShown: false }} />
      <Drawer.Screen name="Donors"               component={DonorsScreen}              options={{ title: t('nav.donors') }} />
      <Drawer.Screen name="SystemSetup"          component={SystemSetupScreen}         options={{ title: t('nav.systemSetup') }} />
      <Drawer.Screen name="FinancialManagement"  component={FinancialManagementScreen} options={{ title: t('nav.financialManagement') }} />
      <Drawer.Screen name="MonitoringEvaluation" component={MonitoringEvaluationScreen} options={{ title: t('nav.monitoring') }} />
      <Drawer.Screen name="SocialEnvironmental"  component={SocialEnvironmentalScreen} options={{ title: t('nav.socialEnvironmental') }} />
      <Drawer.Screen name="Documentation"        component={DocumentationScreen}       options={{ title: t('nav.documentation') }} />
      <Drawer.Screen name="ProjectMap"           component={ProjectMapScreen}          options={{ title: t('nav.projectMap') }} />
      <Drawer.Screen name="RiskAssessment"       component={RiskAssessmentScreen}      options={{ title: t('nav.riskAssessment') }} />
      <Drawer.Screen name="Issues"               component={IssuesScreen}              options={{ title: t('nav.issues') }} />
      <Drawer.Screen name="KPIMonitoring"        component={KPIMonitoringScreen}       options={{ title: t('nav.kpi') }} />
      <Drawer.Screen name="ProjectActions"       component={ProjectActionsScreen}      options={{ title: t('nav.projectActions') }} />
      <Drawer.Screen name="Administration"       component={AdministrationScreen}      options={{ title: t('nav.administration') }} />
      <Drawer.Screen name="ChangePassword"       component={ChangePasswordScreen}      options={{ title: t('nav.changePassword') }} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  drawerHeader: {
    backgroundColor: '#0d6efd',
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  drawerUsername: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  drawerRole: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 2,
  },
  drawerNav: {
    flex: 1,
    paddingVertical: 10,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  drawerItemIcon: {
    marginRight: 14,
  },
  drawerItemLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#dc3545',
    fontWeight: '600',
  },
});
