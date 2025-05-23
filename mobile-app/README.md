# CareUnity Mobile App

A React Native mobile application for caregivers in the field, built with Expo.

## Features

- **React Native with Expo**: Cross-platform mobile app development
- **Push Notifications**: Real-time alerts for caregivers
- **Voice Input**: Hands-free operation for field work
- **Accessibility**: WCAG-compliant with multiple accessibility features
- **Multi-language Support**: Available in English, Spanish, and French
- **Offline Mode**: Work without internet connection and sync later

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository
2. Navigate to the mobile-app directory
3. Install dependencies:

```bash
npm install
# or
yarn install
```

### Running the App

Start the development server:

```bash
npm start
# or
yarn start
```

## Implemented Screens

The following screens have been implemented:

- **Login**: User authentication
- **Forgot Password**: Password reset functionality
- **Dashboard**: Overview of daily activities
- **Service Users**: List of service users
- **Service User Details**: Comprehensive view of service user information
- **Visits**: Calendar of upcoming and past visits
- **Visit Details**: Detailed information about a specific visit
- **Profile**: User profile and settings

## Testing

### Unit Tests

Run unit tests with:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

### E2E Tests

First, build the app for testing:

```bash
# For iOS
npm run e2e:build:ios

# For Android
npm run e2e:build:android
```

Then run the E2E tests:

```bash
# For iOS
npm run e2e:test:ios

# For Android
npm run e2e:test:android
```

## Deployment

To prepare the app for deployment:

```bash
# For development environment
npm run prepare:deployment

# For staging environment
npm run prepare:deployment -- --env=staging

# For production environment
npm run prepare:deployment -- --env=production
```

### Launch Instructions

Start the development server:

```bash
npm start
# or
yarn start
```

Then use the Expo Go app on your device to scan the QR code, or run on an emulator/simulator.

## Project Structure

```txt
mobile-app/
├── src/
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── i18n/             # Internationalization files
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # Screen components
│   │   ├── auth/         # Authentication screens
│   │   └── main/         # Main app screens
│   ├── services/         # API and other services
│   ├── config.ts         # App configuration
│   └── theme.ts          # UI theme configuration
├── App.tsx               # Main app component
├── package.json          # Dependencies and scripts
└── README.md             # Project documentation
```

## Key Features

### Push Notifications

The app uses Expo Notifications to provide push notification support. Notifications are managed through the NotificationContext, which handles:

- Registering device tokens with the server
- Managing notification permissions
- Displaying and handling notifications
- Storing notification history

### Voice Input

Voice input is implemented using Expo Voice, allowing caregivers to:

- Use voice commands to navigate the app
- Dictate notes and messages
- Perform hands-free operations in the field

### Accessibility

The app includes comprehensive accessibility features:

- Dynamic font sizing
- High contrast mode
- Reduced motion settings
- Screen reader compatibility
- Keyboard navigation support
- WCAG 2.1 AA compliance

### Multi-language Support

Internationalization is implemented using i18next and react-i18next:

- English (default)
- Spanish
- French
- Support for RTL languages (future)

### Offline Mode

The app includes robust offline support:

- Local data storage using AsyncStorage
- Automatic syncing when online
- Conflict resolution
- Pending changes management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
