import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

const setCookie = (name, value, days = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

export default function Login({ onLoginSuccess, onToggle }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setMessageType('error');
      setMessage('Username and password are required');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });

      setMessageType('success');
      setMessage('Login successful!');
      setUsername('');
      setPassword('');

      // Store token in cookie and call callback
      setCookie('token', response.data.token);
      setCookie('username', username);
      setTimeout(() => onLoginSuccess(response.data.token, username), 1500);
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <h1> LOGIN</h1>
        <p>$ enter your credentials to access the system</p>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {messageType === 'error' ? '✗ ' : '✓ '}
          {message}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>username@system:</label>
          <input
            type="text"
            placeholder="enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>password:</label>
          <input
            type="password"
            placeholder="enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="button-group">
          <button type="submit" disabled={loading}>
            {loading ? <span className="loading">PROCESSING</span> : 'LOGIN'}
          </button>
        </div>
      </form>

      <div className="toggle-link">
        <p>
          don't have an account?{' '}
          <button type="button" onClick={onToggle}>
            signup here
          </button>
        </p>
      </div>
    </div>
  );
}
