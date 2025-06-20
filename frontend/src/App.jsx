// src/App.jsx (Refactored for Academic Requirements)

// --- Imports ---
import React, { useState, useEffect } from 'react';

// --- Page & Layout Components ---
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import HomePage from './components/HomePage/HomePage';
import SearchPage from './components/SearchPage/SearchPage';
import UserProfilePage from './components/UserProfilePage/UserProfilePage';
import AuthPage from './components/AuthPage/AuthPage';

// --- Styles ---
import './App.css';

function App() {
  // --- State Hooks ---
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [page, setPage] = useState('login'); // State-based navigation

  // --- Effect to check for existing session on initial load ---
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        const userData = JSON.parse(storedUserInfo);
        setCurrentUser(userData);
        setPage('home'); // Navigate to home if user is logged in
      } catch (error) {
        console.error("Failed to parse user info", error);
        localStorage.clear();
      }
    }
    setAuthChecked(true);
  }, []); // Runs only once

  // --- Handler Functions ---

  // This function will be called by the AuthPage component on success
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setPage('home'); // Navigate to home page after login
  };

  // Logout function
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setPage('login'); // Navigate back to login page
  };

  // Loading state (perfect as is)
  if (!authChecked) {
    return <div>Loading...</div>;
  }

  // --- JSX for Rendering ---
  return (
    <div className="AppContainer">
      <Header user={currentUser} onLogout={handleLogout} setPage={setPage} />

      <div className="content">
        {page === 'login' && <AuthPage onLoginSuccess={handleLoginSuccess} />}
        {page === 'home' && currentUser && <HomePage user={currentUser} setPage={setPage} />}
        {page === 'search' && currentUser && <SearchPage user={currentUser} />}
        {page === 'profile' && currentUser && <UserProfilePage user={currentUser} onLogout={handleLogout} />}
        {!currentUser && page !== 'login' && <AuthPage onLoginSuccess={handleLoginSuccess} />}
      </div>

      <Footer />
    </div>
  );
}

export default App;