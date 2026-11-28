import { createContext, useContext, useEffect, useState } from 'react';

export const DEMO_STUDENT = {
  id: 'student-riya',
  name: 'Riya Sharma',
  firstName: 'Riya',
  rollNo: '22CS1042',
  department: 'Computer Science',
  email: 'riya.sharma@msit.in',
  phone: '+91 98765 43210',
  collegeCode: 'MSIT',
  collegeName: 'Maharaja Surajmal Institute of Technology',
  role: 'student',
  initials: 'RS',
};

export const DEMO_ADMIN = {
  id: 'admin-rajesh',
  name: 'Dr. Rajesh Verma',
  firstName: 'Dr. Verma',
  rollNo: 'MSIT-ADM-042',
  empId: 'MSIT-ADM-042',
  designation: 'Chief Grievance Officer',
  department: 'Facilities & Campus Administration',
  email: 'admin.grievance@msit.in',
  phone: '+91 98111 22334',
  collegeCode: 'MSIT',
  collegeName: 'Maharaja Surajmal Institute of Technology',
  role: 'admin',
  initials: 'RV',
};

export const AFFILIATED_COLLEGES = [
  {
    code: 'MSIT',
    name: 'Maharaja Surajmal Institute of Technology',
    shortName: 'MSIT',
    city: 'Janakpuri, New Delhi',
    state: 'Delhi',
    domain: 'msit.in',
    status: 'Active',
  },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = window.localStorage.getItem('campusconnect:auth_user:v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEMO_STUDENT; // default to student for initial render
  });

  const [isTestMode, setIsTestMode] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const hasUrlTest =
          window.location.pathname.startsWith('/test') ||
          window.location.search.includes('test=true');
        if (hasUrlTest) return true;
        return window.localStorage.getItem('campusconnect:test_mode') === 'true';
      }
    } catch {
      // ignore
    }
    return false;
  });

  useEffect(() => {
    try {
      if (isTestMode) {
        window.localStorage.setItem('campusconnect:test_mode', 'true');
      } else {
        window.localStorage.removeItem('campusconnect:test_mode');
      }
    } catch {
      // ignore
    }
  }, [isTestMode]);

  const enableTestMode = () => setIsTestMode(true);
  const disableTestMode = () => setIsTestMode(false);
  const toggleTestMode = () => setIsTestMode((prev) => !prev);

  useEffect(() => {
    try {
      if (user) {
        window.localStorage.setItem('campusconnect:auth_user:v1', JSON.stringify(user));
      } else {
        window.localStorage.removeItem('campusconnect:auth_user:v1');
      }
    } catch {
      // ignore
    }
  }, [user]);

  const loginAsStudent = () => setUser(DEMO_STUDENT);
  const loginAsAdmin = () => setUser(DEMO_ADMIN);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = () => {
    if (user?.role === 'admin') {
      loginAsStudent();
    } else {
      loginAsAdmin();
    }
  };

  const value = {
    user,
    role: user?.role || 'student',
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    isAuthenticated: Boolean(user),
    colleges: AFFILIATED_COLLEGES,
    activeCollege: AFFILIATED_COLLEGES[0],
    isTestMode,
    enableTestMode,
    disableTestMode,
    toggleTestMode,
    loginAsStudent,
    loginAsAdmin,
    login,
    logout,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
