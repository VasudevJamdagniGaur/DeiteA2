// Simple configuration for mobile app
const RUNPOD_URL = "https://g0r8vprssr0m80-11434.proxy.runpod.net/api/generate";

// Simple mobile detection
export const isMobileApp = () => {
  return true; // Always mobile for APK
};

// Simple API base URL
export const getApiBaseUrl = () => {
  return "";
};

// Simple API URL
export const apiUrl = (endpoint: string) => {
  return "";
};

// Simple API call
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  console.log(`Making API call to: ${endpoint}`);
  
  try {
    const response = await fetch(endpoint, options);
    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Export simple config
export const getMobileConfig = () => ({
  runpodUrl: RUNPOD_URL,
  healthUrl: "https://g0r8vprssr0m80-11434.proxy.runpod.net/"
});

export const debugInfo = {
  isMobile: true,
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'mobile'
};