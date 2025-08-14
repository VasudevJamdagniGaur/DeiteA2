import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('🚨 ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary componentDidCatch:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#fee2e2'
        }}>
          <h1 style={{ color: '#dc2626', marginBottom: '16px' }}>Something went wrong!</h1>
          <p style={{ color: '#7f1d1d', marginBottom: '16px' }}>
            The app encountered an error and couldn't render properly.
          </p>
          <details style={{ marginBottom: '16px', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', color: '#7f1d1d' }}>Error Details</summary>
            <pre style={{ 
              backgroundColor: '#fecaca', 
              padding: '10px', 
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto',
              maxWidth: '100%'
            }}>
              {this.state.error?.message || 'Unknown error'}
              {this.state.error?.stack && '\n\nStack trace:\n' + this.state.error.stack}
            </pre>
          </details>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.reload();
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
