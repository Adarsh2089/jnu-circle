import { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

const AdminContext = createContext({});

export const useAdmin = () => useContext(AdminContext);

// Super Admin credentials check
const ADMIN_EMAIL = 'admin@jnu.ac.in';

export const AdminProvider = ({ children }) => {
  const { user, userProfile } = useAuth();

  const isAdmin = () => {
    if (!user) return false;
    // Check if super admin by email
    return user.email === ADMIN_EMAIL;
  };

  const isSchoolAdmin = () => {
    if (!userProfile) return false;
    return userProfile.role === 'schoolAdmin';
  };

  const isCentreAdmin = () => {
    if (!userProfile) return false;
    return userProfile.role === 'centreAdmin';
  };

  const getAdminSchool = () => {
    if (!userProfile) return null;
    // Fallback to school field if adminSchool is not set (for backward compatibility)
    return userProfile.adminSchool || userProfile.school || null;
  };

  const getAdminCentre = () => {
    if (!userProfile) return null;
    return userProfile.adminCentre || null;
  };

  // Check if user has any admin privileges
  const hasAdminAccess = () => {
    return isAdmin() || isSchoolAdmin() || isCentreAdmin();
  };

  const adminSchoolValue = getAdminSchool();
  const adminCentreValue = getAdminCentre();
  const isSchoolAdminValue = isSchoolAdmin();
  const isCentreAdminValue = isCentreAdmin();

  // Debug logging
  if (user && userProfile) {
    console.log('🔐 [AdminContext] User profile:', {
      email: user.email,
      role: userProfile.role,
      adminSchool: userProfile.adminSchool,
      adminCentre: userProfile.adminCentre,
      isSchoolAdmin: isSchoolAdminValue,
      isCentreAdmin: isCentreAdminValue
    });
  }

  const value = {
    isAdmin: isAdmin(),
    isSchoolAdmin: isSchoolAdminValue,
    isCentreAdmin: isCentreAdminValue,
    hasAdminAccess: hasAdminAccess(),
    adminSchool: adminSchoolValue,
    adminCentre: adminCentreValue,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
