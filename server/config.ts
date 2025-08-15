// Server configuration
export const SERVER_CONFIG = {
  // RunPod configuration
  RUNPOD_URL: "https://giy3d1ylj8dr8b-11434.proxy.runpod.net:11434/api/generate",
  RUNPOD_MODEL: "llama3:70b",
  RUNPOD_TIMEOUT: 60000,
  
  // Server settings
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // API settings
  REQUEST_TIMEOUT: 60000,
  MAX_RETRIES: 3,
};

// Export specific configuration functions
export const getRunPodConfig = () => ({
  url: SERVER_CONFIG.RUNPOD_URL,
  model: SERVER_CONFIG.RUNPOD_MODEL,
  timeout: SERVER_CONFIG.RUNPOD_TIMEOUT,
});

export const isProduction = () => SERVER_CONFIG.NODE_ENV === 'production';
export const isDevelopment = () => SERVER_CONFIG.NODE_ENV === 'development';
