
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
}

interface AdminContextType {
  admin: AdminUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('admin_user');
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, this would be an API call
    if (email === 'admin@ecomart.com' && password === 'admin123') {
      const adminUser: AdminUser = {
        id: '1',
        email: 'admin@ecomart.com',
        name: 'Admin User',
        role: 'admin'
      };
      setAdmin(adminUser);
      localStorage.setItem('admin_user', JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin_user');
  };

  return (
    <AdminContext.Provider value={{ admin, login, logout, isLoading }}>
      {children}
    </AdminContext.Provider>
  );
};
