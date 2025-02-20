import React, { createContext, useContext } from 'react';

interface AuthContextType {
  user: {
    id: string;
    email: string;
    role: string;
  } | null;
}

export const AuthContext = createContext<AuthContextType>({ user: null });

export const useAuth = () => useContext(AuthContext); 