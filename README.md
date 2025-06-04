# LeCoursier Mobile App 📱

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app) for the LeCoursier delivery service.

## Prerequisites

Before getting started, make sure you have:

- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- Xcode (for iOS development on macOS)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment Variables

Copy the `.env.example` file to `.env` and configure the following variables:

```bash
cp .env.example .env
```

Update the `.env` file with your actual values:

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://your-api-url:port

# Pusher Configuration (for real-time updates)
EXPO_PUBLIC_PUSHER_HOST=http://your-pusher-host
EXPO_PUBLIC_PUSHER_APP_KEY=your-pusher-app-key
EXPO_PUBLIC_PUSHER_APP_SECRET=your-pusher-app-secret
EXPO_PUBLIC_PUSHER_APP_ID=your-pusher-app-id
EXPO_PUBLIC_PUSHER_APP_CLUSTER=mt1
EXPO_PUBLIC_PUSHER_PORT=6001

# Google Maps API Key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 3. Firebase Setup for Push Notifications (FCM)

#### 3.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Cloud Messaging (FCM) in the project settings

#### 3.2 Add Android App

1. In Firebase Console, add an Android app
2. Use your package name (check `app.config.js` for the package identifier)
3. Download `google-services.json`
4. Place the `google-services.json` file in the **root directory** of your project

#### 3.3 Add iOS App (if targeting iOS)

1. In Firebase Console, add an iOS app
2. Use your bundle identifier (check `app.config.js`)
3. Download `GoogleService-Info.plist`
4. Place the `GoogleService-Info.plist` file in the **root directory** of your project

### 4. Generate SHA-1 Certificate for Android

To authorize your Android app with Firebase, you need to add the SHA-1 certificate:

```bash
# Clean and prebuild the project
npx expo prebuild --clean

# Generate SHA-1 certificate
cd android && ./gradlew signingReport
```

Copy the SHA-1 fingerprint from the output and add it to your Firebase Android app settings.

## Development

### Start the development server

```bash
npx expo start
```

In the output, you'll find options to open the app in:

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

### Using Expo Go

1. Install Expo Go on your mobile device from App Store or Google Play
2. Scan the QR code displayed in your terminal after running `npx expo start`
3. The app will load directly on your device

**Note:** Some features like push notifications may not work in Expo Go due to sandbox limitations.

## Building the App

### Development Build

For full feature testing (including push notifications):

```bash
# Build for Android
npx expo run:android

# Build for iOS (macOS only)
npx expo run:ios
```

### Production Builds

#### Local Build (Release Bundle)

```bash
# Android Release Bundle
npx expo build:android --type app-bundle

# iOS Release Build (macOS only)
npx expo build:ios --type archive
```

#### Using EAS Build (Recommended)

EAS (Expo Application Services) provides cloud-based builds:

1. Install EAS CLI:

```bash
npm install -g eas-cli
```

2. Login to your Expo account:

```bash
eas login
```

3. Configure EAS:

```bash
eas build:configure
```

4. Build for production:

```bash
# Build for both platforms
eas build --platform all

# Build for Android only
eas build --platform android

# Build for iOS only
eas build --platform ios
```

5. Submit to app stores:

```bash
# Submit to Google Play Store
eas submit --platform android

# Submit to Apple App Store
eas submit --platform ios
```

## Project Structure

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

### Key Directories:

- `app/` - Main application screens and navigation
- `components/` - Reusable UI components
- `services/` - API and external service integrations
- `context/` - React Context providers (Auth, Badges, FCM)
- `types/` - TypeScript type definitions
- `assets/` - Images, fonts, and other static resources

## Troubleshooting

### Common Issues:

1. **FCM not working**: Ensure `google-services.json` and `GoogleService-Info.plist` are in the root directory
2. **Build failures**: Try running `npx expo prebuild --clean` to regenerate native code
3. **SHA-1 certificate issues**: Make sure to add all SHA-1 fingerprints (debug and release) to Firebase
4. **Environment variables not loaded**: Restart the development server after adding/modifying `.env`
5. **Google Maps not working**: Verify your `GOOGLE_MAPS_API_KEY` is valid and has the necessary APIs enabled
6. **Pusher connection issues**: Check your Pusher configuration and network connectivity

## Support

For project-specific issues or questions about LeCoursier, please contact the development team.
