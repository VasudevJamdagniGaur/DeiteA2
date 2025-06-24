import { useState } from 'react';

const API_URL = "/api/chat";

interface ChatMessage {
  sender: 'user' | 'bot';
  content: string;
}

export const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    setError(null);
    setLoading(true);
    const userMsg: ChatMessage = { sender: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    try {
      // You'll need to get the userId from your auth context
      // For now using a placeholder - replace with actual user ID
      const userId = "user123"; // TODO: Replace with actual user ID from auth context
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userId,
          userInput: input 
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const botMsg: ChatMessage = { sender: 'bot', content: data.reply || 'No response' };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setError('Failed to get response from server.');
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSendMessage();
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
            }}>{msg.content}</span>
          </div>
        ))}
        {loading && <div style={{ color: '#888', textAlign: 'center' }}>Bot is typing...</div>}
        {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Share your thoughts..."
          style={{ flex: 1, padding: 12, borderRadius: 16, border: '1px solid #ccc' }}
          disabled={loading}
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !input.trim()}
          style={{ padding: '0 16px', borderRadius: 16, background: '#6366f1', color: '#fff', border: 'none' }}
        >
          &#9658;
        </button>
      </div>
    </div>
  );
}; 