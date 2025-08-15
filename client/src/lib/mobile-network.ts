// Mobile network utilities for better APK connectivity

// Check if we're in a Capacitor mobile app
export const isMobileApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check for Capacitor environment
  const capacitor = (window as any).Capacitor;
  if (capacitor && capacitor.isNativePlatform && capacitor.isNativePlatform()) {
    return true;
  }
  
  // Fallback checks
  if (window.location.protocol === 'capacitor:' || window.location.protocol === 'ionic:') {
    return true;
  }
  
  // Check user agent as last resort
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
};

// Check if Capacitor HTTP plugin is available
export const isCapacitorHttpAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const capacitor = (window as any).Capacitor;
  return !!(capacitor && capacitor.Plugins && capacitor.Plugins.CapacitorHttp);
};

// Enhanced retry configuration for mobile
const MOBILE_RETRY_CONFIG = {
  maxRetries: 5,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  networkErrorRetries: 3,
};

// Sleep function for delays
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// Check if error is network-related
const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  const message = error.message || error.toString();
  const networkKeywords = [
    'network',
    'connection',
    'timeout',
    'fetch',
    'cors',
    'failed to fetch',
    'network request failed',
    'err_network',
    'err_internet_disconnected',
    'err_network_changed'
  ];
  
  return networkKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
};

// Enhanced mobile HTTP request with comprehensive error handling
export const mobileHttpRequest = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  console.log(`📱 Mobile HTTP request to: ${url}`);
  
  const isMobile = isMobileApp();
  const hasCapacitorHttp = isCapacitorHttpAvailable();
  
  console.log(`📱 Mobile app: ${isMobile}, Capacitor HTTP: ${hasCapacitorHttp}`);
  
  let lastError: any = null;
  
  for (let attempt = 0; attempt < MOBILE_RETRY_CONFIG.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(
          MOBILE_RETRY_CONFIG.initialDelay * Math.pow(MOBILE_RETRY_CONFIG.backoffFactor, attempt - 1),
          MOBILE_RETRY_CONFIG.maxDelay
        );
        console.log(`⏳ Retrying in ${delay}ms (attempt ${attempt + 1}/${MOBILE_RETRY_CONFIG.maxRetries})`);
        await sleep(delay);
      }
      
      let response: Response;
      
      // Try Capacitor HTTP first for mobile apps
      if (isMobile && hasCapacitorHttp) {
        console.log('📱 Using Capacitor HTTP');
        const { CapacitorHttp } = (window as any).Capacitor.Plugins;
        
        const capacitorOptions = {
          url: url,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Deite-Mobile-App/1.0',
            ...options.headers,
          },
          method: (options.method || 'GET').toUpperCase(),
          connectTimeout: 30000, // 30 seconds
          readTimeout: 60000, // 60 seconds
        };
        
        if (options.body) {
          try {
            capacitorOptions['data'] = typeof options.body === 'string' 
              ? JSON.parse(options.body) 
              : options.body;
          } catch (e) {
            capacitorOptions['data'] = options.body;
          }
        }
        
        const capacitorResponse = await CapacitorHttp.request(capacitorOptions);
        
        // Convert Capacitor response to fetch Response format
        response = new Response(
          typeof capacitorResponse.data === 'string' 
            ? capacitorResponse.data 
            : JSON.stringify(capacitorResponse.data), 
          {
            status: capacitorResponse.status,
            statusText: capacitorResponse.status >= 200 && capacitorResponse.status < 300 ? 'OK' : 'Error',
            headers: new Headers(capacitorResponse.headers)
          }
        );
      } else {
        // Fallback to regular fetch with enhanced options
        console.log('🌐 Using regular fetch with mobile optimizations');
        
        const fetchOptions: RequestInit = {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': isMobile ? 'Deite-Mobile-App/1.0' : 'Deite-Web-App/1.0',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            ...options.headers,
          },
          // Disable caching for mobile
          cache: 'no-cache',
          // Add credentials for CORS
          credentials: 'omit',
          // Set timeout (note: this doesn't work in all browsers)
          signal: AbortSignal.timeout ? AbortSignal.timeout(60000) : undefined,
        };
        
        response = await fetch(url, fetchOptions);
      }
      
      // Check if response is ok
      if (response.ok) {
        console.log(`✅ Mobile HTTP request successful (attempt ${attempt + 1})`);
        return response;
      } else {
        const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        console.warn(`⚠️ HTTP error: ${errorMsg} (attempt ${attempt + 1})`);
        
        // Don't retry on client errors (4xx), except for specific ones
        if (response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429) {
          throw new Error(errorMsg);
        }
        
        lastError = new Error(errorMsg);
      }
    } catch (error: any) {
      console.error(`❌ Mobile HTTP error (attempt ${attempt + 1}):`, error);
      lastError = error;
      
      // If it's not a network error and we've tried a few times, stop retrying
      if (!isNetworkError(error) && attempt >= 2) {
        break;
      }
    }
  }
  
  // If all retries failed, throw the last error
  throw new Error(`All ${MOBILE_RETRY_CONFIG.maxRetries} attempts failed. Last error: ${lastError?.message || 'Unknown error'}`);
};

// Specialized function for streaming requests in mobile apps
export const mobileStreamRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<ReadableStream<Uint8Array> | null> => {
  console.log(`📱 Mobile stream request to: ${url}`);
  
  // For mobile apps, we'll fall back to regular HTTP and simulate streaming
  // since true streaming might not work reliably in all mobile webviews
  if (isMobileApp()) {
    console.log('📱 Mobile detected: Using regular HTTP request for streaming');
    
    try {
      const response = await mobileHttpRequest(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Return the response body stream if available
      return response.body;
    } catch (error) {
      console.error('Mobile stream request failed:', error);
      return null;
    }
  } else {
    // For web, use regular fetch streaming
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/plain',
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.body;
    } catch (error) {
      console.error('Web stream request failed:', error);
      return null;
    }
  }
};

// Export configuration for debugging
export const mobileNetworkConfig = {
  isMobile: isMobileApp(),
  hasCapacitorHttp: isCapacitorHttpAvailable(),
  retryConfig: MOBILE_RETRY_CONFIG,
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
};

// Health check function specifically for mobile
export const mobileHealthCheck = async (healthUrl: string): Promise<boolean> => {
  try {
    console.log('📱 Performing mobile health check...');
    const response = await mobileHttpRequest(healthUrl, {
      method: 'GET',
    });
    
    const isHealthy = response.ok;
    console.log(`📱 Health check result: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    return isHealthy;
  } catch (error) {
    console.error('📱 Health check failed:', error);
    return false;
  }
};
