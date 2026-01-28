import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

export default function Signup({ onToggle }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!username || !password || !confirmPassword) {
      setMessageType('error');
      setMessage('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setMessageType('error');
      setMessage('Passwords do not match');
      return;
    }

    if (password.length < 4) {
      setMessageType('error');
      setMessage('Password must be at least 4 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        username,
        password,
      });

      setMessageType('success');
      setMessage('Account created successfully! Redirecting to login...');
      setUsername('');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => onToggle(), 2000);
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <h1> SIGNUP</h1>
        <p>$ create a new account to access the system</p>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {messageType === 'error' ? '✗ ' : '✓ '}
          {message}
        </div>
      )}

      <form onSubmit={handleSignup}>
        <div className="form-group">
          <label>username@system:</label>
          <input
            type="text"
            placeholder="choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>password:</label>
          <input
            type="password"
            placeholder="enter a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>confirm_password:</label>
          <input
            type="password"
            placeholder="confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="button-group">
          <button type="submit" disabled={loading}>
            {loading ? <span className="loading">PROCESSING</span> : 'CREATE ACCOUNT'}
          </button>
        </div>
      </form>

      <div className="toggle-link">
        <p>
          already have an account?{' '}
          <button type="button" onClick={onToggle}>
            login here
          </button>
        </p>
      </div>
    </div>
  );
}
