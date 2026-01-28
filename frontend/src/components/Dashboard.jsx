import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export default function Dashboard({ token, username, onLogout }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    // Connect to socket.io with JWT authentication
    const newSocket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setMessages([{ 
        type: 'system', 
        message: '✓ Connected to server',
        username: 'System'
      }]);
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('user-connected', (data) => {
      setMessages(prev => [...prev, data]);
    });

    newSocket.on('receive-message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    newSocket.on('user-disconnected', (data) => {
      setMessages(prev => [...prev, data]);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setMessages(prev => [...prev, { 
        type: 'error', 
        message: `Connection error: ${error}`,
        username: 'System'
      }]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !socket) return;

    // Add message to local state (for sender)
    setMessages(prev => [...prev, {
      username: username,
      message: messageInput,
      type: 'user',
      timestamp: new Date().toLocaleTimeString(),
      isSender: true
    }]);

    // Send to server
    socket.emit('send-message', { message: messageInput });
    setMessageInput('');
  };

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    document.cookie = 'username=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    onLogout();
  };

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <h1>DASHBOARD - {username}</h1>
        <p>$ connected to realtime chat system</p>
      </div>

      <div style={{
        backgroundColor: '#111',
        border: '1px solid #00ff00',
        borderRadius: '2px',
        height: '300px',
        overflowY: 'auto',
        padding: '15px',
        marginBottom: '20px',
        fontFamily: "'Courier New', monospace",
        fontSize: '12px'
      }}>
        {messages.map((msg, idx) => (
          <div 
            key={idx}
            style={{
              marginBottom: '10px',
              color: msg.type === 'system' ? '#00aa00' : msg.isSender ? '#00ffff' : '#00ff00',
              borderLeft: msg.type === 'system' ? '2px solid #00aa00' : msg.isSender ? '2px solid #00ffff' : '2px solid #00ff00',
              paddingLeft: '10px'
            }}
          >
            <strong>{msg.username}:</strong> {msg.message}
            {msg.timestamp && <span style={{ fontSize: '10px', marginLeft: '10px', color: '#008800' }}>({msg.timestamp})</span>}
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage}>
        <div className="form-group">
          <label>message:</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="type your message here..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              disabled={!isConnected}
              style={{ flex: 1 }}
            />
            <button 
              type="submit"
              disabled={!isConnected || !messageInput.trim()}
              style={{ flex: 0.2 }}
            >
              SEND
            </button>
          </div>
        </div>
      </form>

      <div style={{
        marginTop: '20px',
        padding: '10px',
        border: '1px solid #00aa00',
        borderRadius: '2px',
        fontSize: '12px'
      }}>
        <p style={{ color: isConnected ? '#00ff00' : '#ff0000' }}>
          Status: {isConnected ? '● CONNECTED' : '● DISCONNECTED'}
        </p>
      </div>

      <div className="button-group" style={{ marginTop: '20px' }}>
        <button onClick={handleLogout}>LOGOUT</button>
      </div>
    </div>
  );
}
