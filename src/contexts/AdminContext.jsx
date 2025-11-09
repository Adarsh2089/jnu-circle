import { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

const AdminContext = createContext({});

export const useAdmin = () => useContext(AdminContext);

// Admin credentials check
const ADMIN_EMAIL = 'admin@jnu.ac.in';

export const AdminProvider = ({ children }) => {
  const { user } = useAuth();

  const isAdmin = () => {
    if (!user) return false;
    // Only check email, not userProfile
    return user.email === ADMIN_EMAIL;
  };

  const value = {
    isAdmin: isAdmin(),
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
