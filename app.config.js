export default {
  "expo": {
    "name": "Flamant Food App",
    "slug": "flamant-food-app",
    "owner": "bendingforks",
    "scheme": "flamant",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "android": {
      "package": "com.bendingforks.flamant",
      "googleServicesFile": process.env.GOOGLE_SERVICES_JSON,
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.bendingforks.flamant",
      "googleServicesFile": process.env.GOOGLE_SERVICE_INFOPLIST,
    },
    "web": {
      "bundler": "metro",
      "output": "single",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-font",
      "expo-web-browser",
      "@react-native-google-signin/google-signin"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "androidClientId": "579362285246-h8hrh7ttvgssgjp5rolmrg486ngajvtl.apps.googleusercontent.com",
      "expoClientId": "579362285246-cepqbvdpp5pqvtm3aja5n6ofuh60p9je.apps.googleusercontent.com",
      "webClientId": "579362285246-cepqbvdpp5pqvtm3aja5n6ofuh60p9je.apps.googleusercontent.com",
      "iosClientId": "579362285246-1stuina2peo6u42vop7ilh6e9l28iidv.apps.googleusercontent.com",
      "router": {},
      "eas": {
        "project_id": "ecc20900-d226-4170-b4b5-de80c8db7a4c",
        "projectId": "ecc20900-d226-4170-b4b5-de80c8db7a4c"
      }
    }
  }
}
