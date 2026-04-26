import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';

import DashboardScreen          from '../screens/DashboardScreen';
import ProjectsScreen           from '../screens/ProjectsScreen';
import ProjectDetailScreen      from '../screens/ProjectDetailScreen';
import IssuesScreen             from '../screens/IssuesScreen';
import KPIMonitoringScreen      from '../screens/KPIMonitoringScreen';
import MoreScreen               from '../screens/MoreScreen';
import DonorsScreen             from '../screens/DonorsScreen';
import SystemSetupScreen        from '../screens/SystemSetupScreen';
import FinancialManagementScreen  from '../screens/FinancialManagementScreen';
import MonitoringEvaluationScreen from '../screens/MonitoringEvaluationScreen';
import ProjectActionsScreen     from '../screens/ProjectActionsScreen';
import SocialEnvironmentalScreen  from '../screens/SocialEnvironmentalScreen';
import DocumentationScreen      from '../screens/DocumentationScreen';
import ProjectMapScreen         from '../screens/ProjectMapScreen';
import RiskAssessmentScreen     from '../screens/RiskAssessmentScreen';
import AdministrationScreen     from '../screens/AdministrationScreen';
import ChangePasswordScreen     from '../screens/ChangePasswordScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const HEADER_OPTS = {
  headerStyle: { backgroundColor: '#0d6efd' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

function BadgeIcon({ name, color, size, badge }) {
  return (
    <View>
      <Ionicons name={name} size={size} color={color} />
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </View>
  );
}

function ProjectsStack() {
  return (
    <Stack.Navigator screenOptions={HEADER_OPTS}>
      <Stack.Screen name="ProjectsList"  component={ProjectsScreen}      options={{ title: 'Projects' }} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen}  options={{ title: 'Project Detail' }} />
    </Stack.Navigator>
  );
}

function BottomTabs() {
  const issueBadge = useAuthStore((state) => state.openIssueCount);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...HEADER_OPTS,
        tabBarActiveTintColor: '#0d6efd',
        tabBarInactiveTintColor: '#adb5bd',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: -2 },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsStack}
        options={{
          headerShown: false,
          title: 'Projects',
          tabBarIcon: ({ color, size }) => <Ionicons name="folder-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Issues"
        component={IssuesScreen}
        options={{
          title: 'Issues',
          tabBarIcon: ({ color, size }) => (
            <BadgeIcon name="alert-circle-outline" color={color} size={size} badge={issueBadge} />
          ),
        }}
      />
      <Tab.Screen
        name="KPI"
        component={KPIMonitoringScreen}
        options={{
          title: 'KPI',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          title: 'More',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="apps-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={BottomTabs} />
      <Stack.Screen name="Donors"               component={DonorsScreen}              options={{ ...HEADER_OPTS, headerShown: true, title: 'Donors' }} />
      <Stack.Screen name="SystemSetup"          component={SystemSetupScreen}         options={{ ...HEADER_OPTS, headerShown: true, title: 'System Setup' }} />
      <Stack.Screen name="FinancialManagement"  component={FinancialManagementScreen} options={{ ...HEADER_OPTS, headerShown: true, title: 'Financial Management' }} />
      <Stack.Screen name="MonitoringEvaluation" component={MonitoringEvaluationScreen} options={{ ...HEADER_OPTS, headerShown: true, title: 'Monitoring & Evaluation' }} />
      <Stack.Screen name="ProjectActions"       component={ProjectActionsScreen}      options={{ ...HEADER_OPTS, headerShown: true, title: 'Project Actions' }} />
      <Stack.Screen name="SocialEnvironmental"  component={SocialEnvironmentalScreen} options={{ ...HEADER_OPTS, headerShown: true, title: 'Social & Environmental' }} />
      <Stack.Screen name="Documentation"        component={DocumentationScreen}       options={{ ...HEADER_OPTS, headerShown: true, title: 'Documentation' }} />
      <Stack.Screen name="ProjectMap"           component={ProjectMapScreen}          options={{ ...HEADER_OPTS, headerShown: true, title: 'Project Map' }} />
      <Stack.Screen name="RiskAssessment"       component={RiskAssessmentScreen}      options={{ ...HEADER_OPTS, headerShown: true, title: 'Risk Assessment' }} />
      <Stack.Screen name="Administration"       component={AdministrationScreen}      options={{ ...HEADER_OPTS, headerShown: true, title: 'Administration' }} />
      <Stack.Screen name="ChangePassword"       component={ChangePasswordScreen}      options={{ ...HEADER_OPTS, headerShown: true, title: 'Change Password' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#dc3545',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
});
