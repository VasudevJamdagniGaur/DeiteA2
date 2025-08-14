import { useAuthContext } from './AuthProvider';
import { apiUrl, apiCall, debugInfo } from '../lib/config';
import { useState, useEffect } from 'react';

export const DebugInfo = () => {
  const { user, profile, loading } = useAuthContext();
  const [apiStatus, setApiStatus] = useState<string>('checking');
  const [apiResponse, setApiResponse] = useState<any>(null);

  useEffect(() => {
    // Test API connectivity
    apiCall('/api/health')
      .then(response => response.json())
      .then(data => {
        setApiStatus('connected');
        setApiResponse(data);
      })
      .catch(error => {
        setApiStatus('failed');
        setApiResponse({ error: error.message });
      });
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      background: 'rgba(0,0,0,0.9)', 
      color: 'white', 
      padding: '10px', 
      fontSize: '12px',
      zIndex: 9999,
      maxHeight: '50vh',
      overflowY: 'auto'
    }}>
      <h3>🔍 Debug Info</h3>
      <div><strong>Auth Loading:</strong> {loading ? 'Yes' : 'No'}</div>
      <div><strong>User:</strong> {user ? `✅ ${user.email}` : '❌ Not logged in'}</div>
      <div><strong>Profile:</strong> {profile ? `✅ ${profile.name}` : '❌ No profile'}</div>
      <div><strong>API Status:</strong> {apiStatus === 'connected' ? '✅' : apiStatus === 'failed' ? '❌' : '🔄'} {apiStatus}</div>
      <div><strong>API URL:</strong> {apiUrl('/api/health')}</div>
      <div><strong>Is Mobile:</strong> {debugInfo.isMobile ? 'Yes' : 'No'}</div>
      <div><strong>Base URL:</strong> {debugInfo.apiBaseUrl}</div>
      {apiResponse && (
        <div><strong>API Response:</strong> {JSON.stringify(apiResponse, null, 2)}</div>
      )}
      <div><strong>User Agent:</strong> {navigator.userAgent}</div>
      <div><strong>Location:</strong> {window.location.href}</div>
    </div>
  );
};
