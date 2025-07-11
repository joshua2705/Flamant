# FlamingoFood - Food Sharing App

A beautiful React Native app built with Expo for sharing homemade food within communities.

## Features

- 🍽️ Browse and discover homemade food from local cooks
- 👨‍🍳 Post your own food items for sale
- 💬 Chat with buyers and sellers
- 🔐 Secure authentication with Firebase
- 📱 Cross-platform (iOS, Android, Web)

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd flamingo-food
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Enable Storage
   - Copy your Firebase configuration values to the `.env` file

5. Start the development server:
```bash
npm run dev
```

## Environment Variables

The following environment variables are required:

- `EXPO_PUBLIC_FIREBASE_API_KEY` - Your Firebase API key
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- `EXPO_PUBLIC_FIREBASE_APP_ID` - Your Firebase app ID
- `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID` - Your Firebase measurement ID (optional)

## Project Structure

```
app/
├── (tabs)/           # Tab navigation screens
├── auth/            # Authentication screens
├── product/         # Product detail screens
├── _layout.tsx      # Root layout
└── ...

components/          # Reusable components
config/             # Configuration files
contexts/           # React contexts
data/               # Mock data and constants
hooks/              # Custom hooks
services/           # API services
types/              # TypeScript type definitions
```

## Technologies Used

- **React Native** - Mobile app framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Firebase** - Backend services (Auth, Firestore, Storage)
- **Expo Router** - File-based navigation
- **Lucide React Native** - Icons

## Security

- Firebase configuration is stored in environment variables
- Authentication is handled securely through Firebase Auth
- All sensitive data is protected with proper access controls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Copyright held be the team given access to the repo
