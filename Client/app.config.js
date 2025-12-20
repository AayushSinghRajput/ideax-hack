import 'dotenv/config'; 

export default {
  expo: {
    name: 'smart-krishi',
    slug: 'smart-krishi',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'smartkrishi',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "This app needs access to your location to provide location-based services.",
        NSLocationAlwaysUsageDescription: "This app needs access to your location even when the app is in the background.",
        NSMicrophoneUsageDescription: "This app needs access to your microphone for voice search functionality."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "ACCESS_FINE_LOCATION",  
        "ACCESS_COARSE_LOCATION",
        "RECORD_AUDIO"  // Add this for microphone access
      ]
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png'
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff'
        }
      ],
      [  // Add expo-av plugin for microphone permissions
        'expo-av',
        {
          microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone for voice search functionality.'
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
      RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
      API_BASE_URL: process.env.API_BASE_URL,
      FASTAPI_BASE_URL: process.env.FASTAPI_BASE_URL || "http://10.10.255.24:8000",
    }
  }
};