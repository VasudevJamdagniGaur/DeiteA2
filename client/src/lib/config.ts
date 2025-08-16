
// Configuration for mobile app
const BACKEND_URL = "https://deite-a2-vasudevjamdagnigaur.repl.co";

// Mobile detection
export const isMobileApp = () => {
  return window.location.protocol === 'capacitor:' || 
         window.location.protocol === 'file:' ||
         navigator.userAgent.includes('Capacitor');
};

// API base URL
export const getApiBaseUrl = () => {
  return BACKEND_URL;
};

// API URL builder
export const apiUrl = (endpoint: string) => {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// API call function
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = apiUrl(endpoint);
  console.log(`Making API call to: ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Export mobile config
export const getMobileConfig = () => ({
  backendUrl: BACKEND_URL,
  apiUrl: apiUrl,
  isMobile: isMobileApp()
});

export const debugInfo = {
  isMobile: isMobileApp(),
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'mobile',
  protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown'
};
