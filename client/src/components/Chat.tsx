import { useState, useRef, useEffect } from 'react';

const API_URL = "/api/chat";
const STREAM_URL = "/api/chat/stream";

interface ChatMessage {
  sender: 'user' | 'bot';
  content: string;
  isStreaming?: boolean;
}

export const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading || isStreaming) return;
    
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
          }))
        }),
        signal: abortControllerRef.current.signal
      });

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
        const fallbackResponse = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: [...messages, userMsg].map(msg => ({
              sender: msg.sender === 'user' ? 'user' : 'deite',
              content: msg.content
            }))
          }),
        });
        
        if (!fallbackResponse.ok) throw new Error('Fallback request failed');
        
        const data = await fallbackResponse.json();
        
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
        setError('Failed to get response from server.');
        
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

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100vh' }}>
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
          <div style={{ color: '#888', textAlign: 'center' }}>Deite is thinking...</div>
        )}
        {isStreaming && (
          <div style={{ color: '#888', textAlign: 'center' }}>
            Deite is typing...
            <button 
              onClick={stopStreaming}
              style={{ 
                marginLeft: '8px', 
                padding: '2px 6px', 
                fontSize: '12px',
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
        {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Share your thoughts..."
          style={{ flex: 1, padding: 12, borderRadius: 16, border: '1px solid #ccc' }}
          disabled={loading || isStreaming}
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || isStreaming || !input.trim()}
          style={{ 
            padding: '0 16px', 
            borderRadius: 16, 
            background: loading || isStreaming ? '#ccc' : '#6366f1', 
            color: '#fff', 
            border: 'none',
            cursor: loading || isStreaming ? 'not-allowed' : 'pointer'
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