// app.config.ts or constants/Config.ts

/**
 * API Configuration
 * Update these values based on your environment
 */

// Check if running in development mode
export const IS_DEV = __DEV__ || process.env.NODE_ENV === 'development'

/**
 * Backend API Base URL
 * 
 * For iOS Simulator: Use localhost
 * For Android Emulator: Use 10.0.2.2 (maps to host machine's localhost)
 * For Physical Device: Use your computer's local IP address
 */
export const API_CONFIG = {
  // Development URLs
  IOS_DEV_URL: 'http://localhost:3000/v1',
  ANDROID_DEV_URL: 'http://10.0.2.2:3000/v1',
  PHYSICAL_DEV_URL: 'http://192.168.1.100:3000/v1', // Replace with your local IP
  
  // Production URL
  PROD_URL: 'https://your-production-api.com/v1',
  
  // Timeout settings
  TIMEOUT: 30000, // 30 seconds
}

/**
 * Get the appropriate API base URL based on platform and environment
 */
export const getApiBaseUrl = (): string => {
  if (!IS_DEV) {
    return API_CONFIG.PROD_URL
  }
  
  // In development, choose based on platform
  if (Platform.OS === 'ios') {
    return API_CONFIG.IOS_DEV_URL
  } else if (Platform.OS === 'android') {
    return API_CONFIG.ANDROID_DEV_URL
  }
  
  return API_CONFIG.PHYSICAL_DEV_URL
}

/**
 * App Configuration
 */
export const APP_CONFIG = {
  // App info
  APP_NAME: 'Spotix Booker',
  VERSION: '1.0.0',
  
  // Database
  REALM_PATH: 'spotix-booker.realm',
  REALM_VERSION: 2,
  
  // Storage keys
  AUTH_TOKEN_KEY: 'spotix_auth_token',
  USER_PROFILE_KEY: 'spotix_user_profile',
  
  // Features
  OFFLINE_MODE_ENABLED: true,
  AUTO_SYNC_ENABLED: true,
  SYNC_INTERVAL: 300000, // 5 minutes
}

/**
 * How to find your local IP address:
 * 
 * macOS/Linux:
 * Run: ifconfig | grep "inet " | grep -v 127.0.0.1
 * 
 * Windows:
 * Run: ipconfig
 * Look for "IPv4 Address" under your active network adapter
 * 
 * Example: If your IP is 192.168.1.100, use:
 * PHYSICAL_DEV_URL: 'http://192.168.1.100:3000/v1'
 */

import { Platform } from 'react-native'

export default {
  API_CONFIG,
  APP_CONFIG,
  IS_DEV,
  getApiBaseUrl,
}