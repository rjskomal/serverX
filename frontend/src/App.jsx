import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'

const getCookie = (name) => {
  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length);
  }
  return null;
};

function App() {
  const [currentView, setCurrentView] = useState('login')
  const [token, setToken] = useState(null)
  const [username, setUsername] = useState(null)

  // Check if user is already logged in on component mount
  useEffect(() => {
    const storedToken = getCookie('token')
    const storedUsername = getCookie('username')
    if (storedToken && storedUsername) {
      setToken(storedToken)
      setUsername(storedUsername)
      setCurrentView('dashboard')
    }
  }, [])

  const handleLoginSuccess = (newToken, newUsername) => {
    setToken(newToken)
    setUsername(newUsername)
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    setToken(null)
    setUsername(null)
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    document.cookie = 'username=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    setCurrentView('login')
  }

  const toggleView = () => {
    setCurrentView(currentView === 'login' ? 'signup' : 'login')
  }

  return (
    <>
      {currentView === 'login' && (
        <Login onLoginSuccess={handleLoginSuccess} onToggle={toggleView} />
      )}
      {currentView === 'signup' && (
        <Signup onToggle={toggleView} />
      )}
      {currentView === 'dashboard' && token && username && (
        <Dashboard token={token} username={username} onLogout={handleLogout} />
      )}
    </>
  )
}

export default App
