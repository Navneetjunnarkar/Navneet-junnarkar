import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { AuthState, User, Language } from './types';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  const [language, setLanguage] = useState<Language>('en');

  // Check for existing session on mount (Simulated)
  useEffect(() => {
    const storedToken = localStorage.getItem('legal_sathi_token');
    const storedUser = localStorage.getItem('legal_sathi_user');
    
    if (storedToken && storedUser) {
      setAuthState({
        isAuthenticated: true,
        user: JSON.parse(storedUser),
        token: storedToken
      });
    }
  }, []);

  const handleLogin = (user: User, token: string) => {
    // Save to local storage (Simulating session persistence)
    localStorage.setItem('legal_sathi_token', token);
    localStorage.setItem('legal_sathi_user', JSON.stringify(user));
    
    setAuthState({
      isAuthenticated: true,
      user,
      token
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('legal_sathi_token');
    localStorage.removeItem('legal_sathi_user');
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {authState.isAuthenticated && authState.user ? (
        <Dashboard 
          user={authState.user} 
          onLogout={handleLogout} 
          language={language}
          setLanguage={setLanguage}
        />
      ) : (
        <Auth 
          onLogin={handleLogin} 
          language={language}
          setLanguage={setLanguage}
        />
      )}
    </div>
  );
};

export default App;