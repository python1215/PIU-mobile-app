# PIU Management Mobile App (Expo / React Native)

A React Native mobile app scaffold that mirrors the PIU Management web app.

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- [Expo Go app](https://expo.dev/client) on your Android/iOS device
- OR [Android Studio](https://developer.android.com/studio) for an emulator

---

## Quick Start

### 1. Install dependencies
```bash
cd mobile
npm install
```

### 2. Configure the backend URL
Open `src/services/api.js` and set `BASE_URL` to point to your running backend:

```js
// For a physical device on the same WiFi:
export const BASE_URL = 'http://192.168.1.100:8080/api';

// For an Android emulator (localhost of your machine):
export const BASE_URL = 'http://10.0.2.2:8080/api';

// For production:
export const BASE_URL = 'https://your-deployed-server.com/api';
```

### 3. Start the development server
```bash
npm start
```
Scan the QR code with **Expo Go** on your phone, or press `a` for an Android emulator.

---

## Building an APK (Android)

### Option A — Expo EAS Build (recommended, cloud)
1. Create a free account at [expo.dev](https://expo.dev)
2. Install EAS CLI: `npm install -g eas-cli`
3. Log in: `eas login`
4. Configure your project: `eas build:configure`
5. Update `eas.json` with your project ID from expo.dev
6. Build a preview APK: `eas build --platform android --profile preview`
7. Download the APK from the Expo dashboard and install on your device.

### Option B — Local build (requires Android Studio)
```bash
npm run android   # starts on connected device or emulator
```

---

## Project Structure

```
mobile/
├── App.js                        # Root entry point
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build configuration
├── babel.config.js
├── package.json
└── src/
    ├── navigation/
    │   ├── RootNavigator.js      # Switches between Auth / App
    │   ├── AuthNavigator.js      # Login stack
    │   └── AppNavigator.js       # Drawer navigation (all modules)
    ├── screens/
    │   ├── LoginScreen.js
    │   ├── DashboardScreen.js
    │   ├── ProjectsScreen.js
    │   ├── ProjectDetailScreen.js
    │   ├── DonorsScreen.js
    │   ├── IssuesScreen.js
    │   ├── KPIMonitoringScreen.js
    │   ├── SystemSetupScreen.js
    │   ├── FinancialManagementScreen.js
    │   ├── MonitoringEvaluationScreen.js
    │   ├── ProjectActionsScreen.js
    │   ├── SocialEnvironmentalScreen.js
    │   ├── DocumentationScreen.js
    │   ├── ProjectMapScreen.js
    │   ├── AdministrationScreen.js
    │   ├── RiskAssessmentScreen.js
    │   └── ChangePasswordScreen.js
    ├── store/
    │   └── authStore.js           # Zustand auth store (AsyncStorage-backed)
    ├── services/
    │   └── api.js                 # Axios API client (mirrors web app)
    ├── i18n/
    │   ├── index.js
    │   └── locales/
    │       ├── en.json
    │       ├── fr.json
    │       └── pt.json
    └── components/                # Shared UI components (extend as needed)
```

---

## Maps Setup

`ProjectMapScreen` uses `react-native-maps`. It needs extra native configuration:

**Android** — Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_GOOGLE_MAPS_API_KEY" />
```

**iOS** — After `npx pod-install`, add to `AppDelegate.m`:
```objc
[GMSServices provideAPIKey:@"YOUR_GOOGLE_MAPS_API_KEY"];
```

---

## Module Permissions

Module access uses the same permission model as the web app. Users with `isSuperuser: true` can access all modules. Other users see only modules where `permissions[moduleKey] === true`.

---

## Extending Screens

Every screen follows the same pattern:
1. Fetch data from the API service (`src/services/api.js`)
2. Render with React Native components
3. Use `useTranslation()` for i18n strings

To add new features, follow the existing screen structure.
