import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(localStorage.getItem('eventiq_role') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('eventiq_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.profile);
          setRole(res.data.profile.role);
          localStorage.setItem('eventiq_role', res.data.profile.role);
        } catch (err) {
          console.error('Failed restoring auth session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, []);

  const loginUser = async (email, password) => {
    const res = await api.post('/auth/user/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('eventiq_token', token);
    localStorage.setItem('eventiq_role', 'user');
    setUser(userData);
    setRole('user');
    return userData;
  };

  const registerUser = async (name, email, password) => {
    const res = await api.post('/auth/user/register', { name, email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('eventiq_token', token);
    localStorage.setItem('eventiq_role', 'user');
    setUser(userData);
    setRole('user');
    return userData;
  };

  const loginOrganizer = async (email, password) => {
    const res = await api.post('/auth/organizer/login', { email, password });
    const { token, organizer: orgData } = res.data;
    localStorage.setItem('eventiq_token', token);
    localStorage.setItem('eventiq_role', 'organizer');
    setUser(orgData);
    setRole('organizer');
    return orgData;
  };

  const registerOrganizer = async (name, email, password, organizationName) => {
    const res = await api.post('/auth/organizer/register', { name, email, password, organizationName });
    const { token, organizer: orgData } = res.data;
    localStorage.setItem('eventiq_token', token);
    localStorage.setItem('eventiq_role', 'organizer');
    setUser(orgData);
    setRole('organizer');
    return orgData;
  };

  const logout = () => {
    localStorage.removeItem('eventiq_token');
    localStorage.removeItem('eventiq_role');
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        loginUser,
        registerUser,
        loginOrganizer,
        registerOrganizer,
        logout,
        isAuthenticated: !!user,
        isUser: role === 'user',
        isOrganizer: role === 'organizer',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
