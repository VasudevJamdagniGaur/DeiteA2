// Server configuration
export const SERVER_CONFIG = {
  // RunPod configuration - Direct connection with authentication
  RUNPOD_URL: "https://vbpxyhouli5bmjw6cve0:40u3src5k8wrj4vf8b0u@giy3d1ylj8dr8b-19123-vbpxyhouli5bmjw6cve0.proxy.runpod.net/api/generate",
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
