import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global error handlers for better mobile debugging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Add console log for APK debugging
console.log('📱 APK App starting...');
console.log('🌍 Environment: APK/Capacitor Mobile App');
console.log('📱 User agent:', navigator.userAgent);
console.log('📱 RunPod Mode: Direct connection enabled');

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  console.log('📱 Root element found, creating React root for APK...');
  const root = createRoot(rootElement);
  
  console.log('📱 React root created, rendering APK app...');
  root.render(<App />);
  
  console.log('📱 APK App rendered successfully');
} catch (error) {
  console.error('❌ Failed to start app:', error);
  
  // Fallback UI if React fails to start
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center; background-color: #fee2e2;">
        <h1 style="color: #dc2626; margin-bottom: 16px;">App Failed to Start</h1>
        <p style="color: #7f1d1d; margin-bottom: 16px;">There was an error loading the application.</p>
        <button onclick="location.reload()" style="padding: 12px 24px; background-color: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
          Reload App
        </button>
        <details style="margin-top: 20px; text-align: left;">
          <summary style="cursor: pointer; color: #7f1d1d;">Error Details</summary>
          <pre style="background-color: #fecaca; padding: 10px; border-radius: 4px; font-size: 12px; overflow: auto; max-width: 100%;">${error}</pre>
        </details>
      </div>
    `;
  }
}
