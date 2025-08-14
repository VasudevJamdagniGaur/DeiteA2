import { useState, useRef, useEffect } from 'react';
import { apiUrl } from '../lib/config';
import { useAuthContext } from './AuthProvider';

const API_URL = apiUrl("/api/chat");
const STREAM_URL = apiUrl("/api/chat/stream");

interface ChatMessage {
  sender: 'user' | 'bot';
  content: string;
  isStreaming?: boolean;
}

export const Chat = () => {
  const { user } = useAuthContext();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Test API connectivity on component mount
  useEffect(() => {
    if (user) {
      console.log('=== CHAT COMPONENT MOUNTED ===');
      console.log('Testing API connectivity...');
      console.log('API URL:', API_URL);
      console.log('Stream URL:', STREAM_URL);
      console.log('User ID:', user.uid);
      console.log('Config debug info:', apiUrl('/api/health'));
      
      // Test the health endpoint
      fetch(apiUrl('/api/health'))
        .then(response => {
          console.log('Health check response status:', response.status);
          if (response.ok) {
            setConnectionStatus('connected');
          } else {
            setConnectionStatus('failed');
          }
          return response.json();
        })
        .then(data => {
          console.log('Health check response data:', data);
        })
        .catch(error => {
          console.error('Health check failed:', error);
          setConnectionStatus('failed');
        });
    } else {
      console.log('No user found in Chat component');
    }
  }, [user]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading || isStreaming) return;
    
    // Check if user is authenticated
    if (!user || !user.uid) {
      setError('Please log in to send messages.');
      return;
    }
    
    setError(null);
    setLoading(true);
    setIsStreaming(true);
    
    const userMsg: ChatMessage = { sender: 'user', content: input.trim() };
    const currentInput = input.trim();
    setInput('');
    
    // Add user message
    setMessages((prev) => [...prev, userMsg]);
    
    // Create bot message placeholder for streaming
    const botMessageId = Date.now();
    const botMsg: ChatMessage = { sender: 'bot', content: '', isStreaming: true };
    setMessages((prev) => [...prev, botMsg]);

    try {
      // Debug logging
      console.log('=== SENDING MESSAGE ===');
      console.log('Sending message to:', STREAM_URL);
      console.log('User ID:', user.uid);
      console.log('Message payload:', { 
        messages: [...messages, userMsg].map(msg => ({
          sender: msg.sender === 'user' ? 'user' : 'deite',
          content: msg.content
        })),
        userId: user.uid
      });
      
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();
      
      const response = await fetch(STREAM_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'text/plain'
        },
        body: JSON.stringify({ 
          messages: [...messages, userMsg].map(msg => ({
            sender: msg.sender === 'user' ? 'user' : 'deite',
            content: msg.content
          })),
          userId: user.uid
        }),
        signal: abortControllerRef.current.signal
      });

      console.log('Stream response status:', response.status);
      console.log('Stream response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;

          // Update the bot message with accumulated content
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.sender === 'bot') {
              lastMessage.content = accumulatedContent;
              lastMessage.isStreaming = true;
            }
            return newMessages;
          });
        }
      }

      // Mark streaming as complete
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.sender === 'bot') {
          lastMessage.isStreaming = false;
        }
        return newMessages;
      });

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted');
        return;
      }
      
      console.error('Streaming error:', err);
      
      // Fallback to regular API
      try {
        console.log('=== FALLBACK TO REGULAR API ===');
        console.log('Streaming failed, trying fallback API:', API_URL);
        
        const fallbackResponse = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: [...messages, userMsg].map(msg => ({
              sender: msg.sender === 'user' ? 'user' : 'deite',
              content: msg.content
            })),
            userId: user.uid
          }),
        });
        
        console.log('Fallback response status:', fallbackResponse.status);
        
        if (!fallbackResponse.ok) throw new Error('Fallback request failed');
        
        const data = await fallbackResponse.json();
        console.log('Fallback response data:', data);
        
        // Update the bot message with fallback response
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.sender === 'bot') {
            lastMessage.content = data.reply || 'No response';
            lastMessage.isStreaming = false;
          }
          return newMessages;
        });
        
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        setError('Failed to get response from server. Please check your internet connection and try again.');
        
        // Remove the empty bot message
        setMessages((prev) => prev.slice(0, -1));
      }
    } finally {
      setLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setLoading(false);
    }
  };

  // Show authentication message if no user
  if (!user) {
    return (
      <div style={{ 
        maxWidth: 400, 
        margin: '0 auto', 
        padding: 20, 
        textAlign: 'center',
        background: '#f9f9f9',
        borderRadius: 8
      }}>
        <div style={{ color: '#666', marginBottom: 16 }}>
          Please log in to start chatting with Deite
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Connection Status */}
      <div style={{ 
        padding: '8px 16px', 
        background: connectionStatus === 'connected' ? '#d4edda' : 
                   connectionStatus === 'failed' ? '#f8d7da' : '#fff3cd',
        color: connectionStatus === 'connected' ? '#155724' : 
               connectionStatus === 'failed' ? '#721c24' : '#856404',
        fontSize: '12px',
        textAlign: 'center',
        borderRadius: '4px',
        marginBottom: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>
          {connectionStatus === 'checking' && 'Checking connection...'}
          {connectionStatus === 'connected' && '✅ Connected to Deite'}
          {connectionStatus === 'failed' && '❌ Connection failed'}
        </span>
        {connectionStatus === 'failed' && (
          <button
            onClick={() => {
              setConnectionStatus('checking');
              // Retry connection
              fetch(apiUrl('/api/health'))
                .then(response => {
                  if (response.ok) {
                    setConnectionStatus('connected');
                  } else {
                    setConnectionStatus('failed');
                  }
                })
                .catch(() => setConnectionStatus('failed'));
            }}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '10px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#f9f9f9', borderRadius: 8, marginBottom: 8 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '8px 0' }}>
            <span style={{
              display: 'inline-block',
              background: msg.sender === 'user' ? '#e0e7ff' : '#fff',
              color: '#222',
              padding: '8px 12px',
              borderRadius: 16,
              maxWidth: '80%',
              wordBreak: 'break-word',
              fontSize: '16px', // Increased font size for better readability
              lineHeight: '1.4', // Better line spacing for readability
            }}>
              {msg.content}
              {msg.isStreaming && (
                <span style={{ 
                  display: 'inline-block',
                  width: '8px',
                  height: '12px',
                  backgroundColor: '#6366f1',
                  marginLeft: '2px',
                  animation: 'blink 1s infinite'
                }}>|</span>
              )}
            </span>
          </div>
        ))}
        {loading && !isStreaming && (
          <div style={{ color: '#888', textAlign: 'center', fontSize: '16px' }}>Deite is thinking...</div>
        )}
        {isStreaming && (
          <div style={{ color: '#888', textAlign: 'center', fontSize: '16px' }}>
            Deite is typing...
            <button 
              onClick={stopStreaming}
              style={{ 
                marginLeft: '8px', 
                padding: '2px 6px', 
                fontSize: '14px', // Increased font size for button
                background: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Stop
            </button>
          </div>
        )}
        {error && (
          <div style={{ 
            color: 'red', 
            textAlign: 'center', 
            background: '#ffe6e6',
            padding: '8px',
            borderRadius: '4px',
            margin: '8px 0',
            fontSize: '16px' // Increased font size for error messages
          }}>
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Share your thoughts..."
          style={{ 
            flex: 1, 
            padding: 12, 
            borderRadius: 16, 
            border: '1px solid #ccc',
            fontSize: '16px', // Increased font size for better readability
            lineHeight: '1.4'
          }}
          disabled={loading || isStreaming}
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || isStreaming || !input.trim() || !user}
          style={{ 
            padding: '0 16px', 
            borderRadius: 16, 
            background: loading || isStreaming || !user ? '#ccc' : '#6366f1', 
            color: '#fff', 
            border: 'none',
            cursor: loading || isStreaming || !user ? 'not-allowed' : 'pointer'
          }}
        >
          &#9658;
        </button>
      </div>
      
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}; 