# PIU Management Mobile App

PIU Management is a React Native mobile app built with Expo for project monitoring, delivery tracking, issue management, KPI reporting, documentation access, and social and environmental follow-up.

## Highlights

- Expo SDK 55 mobile app at the repository root
- React Navigation based multi-screen flow
- Zustand auth state with persisted storage
- Multi-language support with English, French, and Portuguese
- Android preview APK builds through EAS

## Tech Stack

- Expo
- React Native
- React Navigation
- React Native Paper
- Zustand
- Axios
- i18next

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- Expo Go on a device or Android Studio for an emulator
- An accessible backend API configured in `src/services/api.js`

## Local Development

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm start
```

Useful commands:

```bash
npm run android
npm run doctor
npm run config:check
```

## Backend Configuration

Set `BASE_URL` in `src/services/api.js` to your running API.

Examples:

```js
// Physical device on the same Wi-Fi
export const BASE_URL = 'http://192.168.1.100:8080/api';

// Android emulator
export const BASE_URL = 'http://10.0.2.2:8080/api';

// Hosted environment
export const BASE_URL = 'https://your-deployed-server.com/api';
```

## Release Configuration

This repository is prepared for Android release builds with EAS.

Current release settings:

- Android package: `com.piu.management`
- Android versionCode: `1`
- iOS bundle identifier: `com.piu.management`
- iOS buildNumber: `1`
- Runtime version policy: `appVersion`

Before the first production build:

1. Run `npx eas-cli login`
2. Run `npx eas-cli init` or `npx eas-cli build:configure`
3. Let EAS write the real project ID into `app.json`
4. If you are publishing an update, bump `expo.version` and the native build numbers as needed

## Android Builds

Preview APK for testers:

```bash
npm run build:android:preview
```

Production Android build:

```bash
npm run build:android:production
```

Notes:

- `preview` produces an APK for internal distribution
- `production` produces an Android App Bundle for Play Store submission
- `production` is configured to auto-increment remote app versions in EAS

## GitHub Actions

The repository includes an Expo validation workflow that runs on pushes and pull requests. It checks:

- dependency installation with `npm ci`
- Expo health with `expo-doctor`
- public config generation with `expo config --type public`
- Android bundle export with `expo export --platform android`

## Project Layout

```text
.
|-- App.js
|-- app.json
|-- assets/
|-- eas.json
|-- src/
|   |-- i18n/
|   |-- navigation/
|   |-- screens/
|   |-- services/
|   `-- store/
`-- package.json
```

## Maps

`ProjectMapScreen` uses `react-native-maps`. For production map usage, configure your Google Maps API key in the native project once prebuild/native setup is introduced.

## Permissions Model

Users with `isSuperuser: true` can access all modules. Other users only see modules enabled by their assigned permissions.
