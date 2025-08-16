import { mobileHttpRequest, isMobileApp as isMobileAppUtil } from './mobile-network';

// Mobile-first configuration - optimized for APK deployment
const MOBILE_CONFIG = {
  // Primary RunPod endpoint for all mobile operations
  runpodUrl: "https://g0r8vprssr0m80-11434.proxy.runpod.net/api/generate",
  
  // Backup endpoints (can be added if needed)
  fallbackUrls: [
    "https://g0r8vprssr0m80-11434.proxy.runpod.net/api/generate"
  ],
  
  // Mobile-specific settings
  model: "llama3:70b",
  timeout: 60000,
  retries: 3,
  
  // Health check endpoint
  healthUrl: "https://g0r8vprssr0m80-11434.proxy.runpod.net/"
};

// Force mobile app detection for APK builds
const isMobileApp = () => {
  // Always return true for APK builds - this ensures mobile-optimized behavior
  return true;
};

// Get the appropriate API base URL - mobile-first approach
export const getApiBaseUrl = () => {
  // For APK builds, we don't use a local server - everything goes direct to RunPod
  console.log('📱 APK mode: Using direct RunPod connection');
  return MOBILE_CONFIG.runpodUrl;
};

// Mobile-first API URL construction - bypasses local server entirely
export const apiUrl = (endpoint: string) => {
  // For APK builds, ignore endpoints and go directly to RunPod
  console.log(`📱 APK mode: Ignoring endpoint '${endpoint}', using direct RunPod`);
  return MOBILE_CONFIG.runpodUrl;
};

// Mobile-optimized API call - designed specifically for APK deployment
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  console.log(`📱 APK API call - endpoint '${endpoint}' -> direct RunPod`);
  
  // For APK builds, we bypass traditional endpoints and go straight to RunPod
  const urls = MOBILE_CONFIG.fallbackUrls;
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`📡 Trying RunPod URL ${i + 1}/${urls.length}: ${url}`);
    
    try {
      // Use the enhanced mobile HTTP request
      const response = await mobileHttpRequest(url, options);
      
      if (response.ok) {
        console.log(`✅ RunPod API call successful`);
        return response;
      } else {
        console.warn(`⚠️ RunPod API call failed with status ${response.status}`);
        if (i === urls.length - 1) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error: any) {
      console.error(`❌ RunPod API call error:`, error.message);
      if (i === urls.length - 1) {
        throw error;
      }
    }
  }
  
  throw new Error('All RunPod endpoints failed');
};

// Export mobile configuration for other modules
export const getMobileConfig = () => MOBILE_CONFIG;

// Export for debugging - mobile-optimized
export const debugInfo = {
  isMobile: isMobileApp(),
  runpodUrl: MOBILE_CONFIG.runpodUrl,
  healthUrl: MOBILE_CONFIG.healthUrl,
  model: MOBILE_CONFIG.model,
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'APK-Environment'
};