import { useState, useEffect } from "react";
import { useAuthContext } from "../components/AuthProvider";

interface SimpleChatScreenProps {
  date: string;
  onBack: () => void;
}

export default function SimpleChatScreen({ date, onBack }: SimpleChatScreenProps) {
  console.log('SimpleChatScreen mounted');
  
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('connected');

  // Simple error handling
  const handleError = (err: any, context: string) => {
    console.error(`${context}:`, err);
    const errorMessage = err?.message || err?.toString() || 'Unknown error';
    setError(`${context}: ${errorMessage}`);
  };

  console.log('📱 SimpleChatScreen state:', { 
    user: !!user, 
    messagesCount: messages.length, 
    loading,
    connectionStatus
  });

  useEffect(() => {
    console.log('SimpleChatScreen useEffect triggered');
    
    // Set initial message
    setMessages([{
      id: "1",
      sender: "deite",
      content: "Hi there! How are you feeling today? I'm here to listen and help you reflect. 💜"
    }]);

    // Set connection as connected by default
    setConnectionStatus('connected');
  }, [user]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading || !user) return;
    
    console.log('📤 Sending message:', input);
    setLoading(true);
    setError(null);
    
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: input.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    try {
      // Simple mock response for now
      console.log('Sending message to AI...');
      
      // Simulate AI response
      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: "deite",
        content: "I received your message! I'm here to help you reflect and feel better. 💜"
      };

      setMessages(prev => [...prev, botMessage]);
      console.log('Mock response added');

    } catch (err: any) {
      console.error('Message sending failed:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Safety check
  if (!user) {
    console.log('❌ SimpleChatScreen: No user found');
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        flexDirection: 'column',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>Please log in</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>You need to be logged in to chat with Deite.</p>
        <button 
          onClick={onBack}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  console.log('✅ SimpleChatScreen: Rendering main component');

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      maxWidth: '400px', 
      margin: '0 auto',
      backgroundColor: '#f9f9f9'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: 'white'
      }}>
        <button 
          onClick={onBack}
          style={{
            padding: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ←
        </button>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Deite</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Your cute AI companion</p>
        </div>
        <div style={{ width: '32px' }}></div>
      </div>

      {/* Connection Status */}
      <div style={{ 
        padding: '8px 16px', 
        backgroundColor: connectionStatus === 'connected' ? '#d4edda' : 
                       connectionStatus === 'failed' ? '#f8d7da' : '#fff3cd',
        color: connectionStatus === 'connected' ? '#155724' : 
               connectionStatus === 'failed' ? '#721c24' : '#856404',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        {connectionStatus === 'checking' && '🔄 Connecting...'}
        {connectionStatus === 'connected' && '✅ Connected to Deite'}
        {connectionStatus === 'failed' && '❌ Connection failed'}
      </div>

      {/* Messages */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ 
            display: 'flex',
            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: '18px',
              backgroundColor: msg.sender === 'user' ? '#6366f1' : 'white',
              color: msg.sender === 'user' ? 'white' : '#333',
              fontSize: '16px',
              lineHeight: '1.4',
              border: msg.sender === 'user' ? 'none' : '1px solid #e5e7eb'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div style={{ 
            display: 'flex',
            justifyContent: 'flex-start'
          }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '18px',
              backgroundColor: 'white',
              color: '#666',
              fontSize: '16px',
              border: '1px solid #e5e7eb'
            }}>
              Deite is thinking...
            </div>
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '8px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ 
        padding: '16px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: 'white',
        display: 'flex',
        gap: '8px'
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Share your thoughts..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '20px',
            fontSize: '16px',
            outline: 'none'
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: '12px 16px',
            backgroundColor: loading || !input.trim() ? '#d1d5db' : '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}
