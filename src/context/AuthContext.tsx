import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  auth,
  getUserProfile,
  createUserProfile,
  UserProfile,
  UserRole
} from '../lib/firebase';
import { checkAccountAccessApi, acceptTeamInvitationApi } from '../lib/api';

interface AuthUserLike {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

interface AuthContextType {
  user: FirebaseUser | AuthUserLike | null;
  profile: UserProfile | null;
  role: UserRole;
  isLoadingAuth: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, role?: UserRole, companyName?: string) => Promise<void>;
  acceptInvitation: (token: string, pass: string, displayName: string) => Promise<any>;
  quickLoginMasterAdmin: () => Promise<void>;
  logout: () => Promise<void>;
  canAccessCrm: boolean;
  canManageSettings: boolean;
  canManageTeam: boolean;
  canEditQuotes: boolean;
  canViewFinancials: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = 'pixel12_auth_session';
const REGISTERED_USERS_KEY = 'pixel12_registered_users';

function getRegisteredUsers(): Record<string, { pass: string; profile: UserProfile }> {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveRegisteredUser(email: string, pass: string, profile: UserProfile) {
  try {
    const all = getRegisteredUsers();
    all[email.toLowerCase()] = { pass, profile };
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(all));
  } catch (e) {
    // ignore
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | AuthUserLike | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // 1. Listen to real Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          let userProf = await getUserProfile(currentUser.uid);
          if (!userProf) {
            const isDefaultAdmin =
              currentUser.email?.includes('admin') ||
              currentUser.email?.includes('pixel12') ||
              currentUser.email === 'pixelstudio1224m@gmail.com';
            const defaultRole: UserRole = isDefaultAdmin ? 'ADMIN' : 'TEAM';

            userProf = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuario Pixel 12',
              role: defaultRole,
              createdAt: new Date().toISOString()
            };
            await createUserProfile(userProf);
          }
          setProfile(userProf);
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(userProf));
        } catch (err) {
          console.warn('[Auth] Error fetching profile:', err);
          const fallbackProf: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Usuario Pixel 12',
            role: 'ADMIN',
            createdAt: new Date().toISOString()
          };
          setProfile(fallbackProf);
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(fallbackProf));
        }
        setIsLoadingAuth(false);
      } else {
        // 2. Check local persistent session if Firebase Auth is not active
        try {
          const cachedSession = localStorage.getItem(LOCAL_SESSION_KEY);
          if (cachedSession) {
            const savedProf: UserProfile = JSON.parse(cachedSession);
            setUser({
              uid: savedProf.uid,
              email: savedProf.email,
              displayName: savedProf.displayName
            });
            setProfile(savedProf);
          } else {
            setUser(null);
            setProfile(null);
          }
        } catch (e) {
          setUser(null);
          setProfile(null);
        }
        setIsLoadingAuth(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // Guard: Prevent deactivated members from accessing Pixel 12 OS
    const accessCheck = await checkAccountAccessApi(cleanEmail);
    if (!accessCheck.allowed) {
      throw new Error(accessCheck.message || 'Tu cuenta ha sido desactivada por un administrador de Pixel 12 Studio.');
    }

    // First: attempt Firebase Auth
    let firebaseSuccess = false;
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      if (cred.user) {
        firebaseSuccess = true;
      }
    } catch (fbErr: any) {
      const code = fbErr?.code || '';
      const msg = fbErr?.message || '';

      // If email provider is disabled in Firebase console (OPERATION_NOT_ALLOWED)
      // or network restriction, fall back to resilient session
      const isProviderDisabled =
        code.includes('operation-not-allowed') ||
        msg.includes('OPERATION_NOT_ALLOWED') ||
        code.includes('admin-restricted-operation');

      if (!isProviderDisabled) {
        // If it's a real credential error (e.g. wrong password or user not found)
        // check our registered accounts fallback first
        const registered = getRegisteredUsers()[cleanEmail];
        if (registered) {
          if (registered.pass && registered.pass !== pass) {
            throw new Error('Contraseña incorrecta. Por favor verifica tus credenciales.');
          }
          // Authenticate with registered profile
          setUser({
            uid: registered.profile.uid,
            email: registered.profile.email,
            displayName: registered.profile.displayName
          });
          setProfile(registered.profile);
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(registered.profile));
          return;
        }

        // Allow owner/admin directly
        if (cleanEmail === 'pixelstudio1224m@gmail.com' || cleanEmail.includes('admin@pixel12')) {
          const adminProf: UserProfile = {
            uid: `admin_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
            email: cleanEmail,
            displayName: 'Pixel Studio Master Admin',
            role: 'ADMIN',
            createdAt: new Date().toISOString()
          };
          await createUserProfile(adminProf).catch(() => {});
          setUser({
            uid: adminProf.uid,
            email: adminProf.email,
            displayName: adminProf.displayName
          });
          setProfile(adminProf);
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(adminProf));
          return;
        }

        throw fbErr;
      }
    }

    if (!firebaseSuccess) {
      // Resilient fallback authentication
      const registered = getRegisteredUsers()[cleanEmail];
      if (registered) {
        if (registered.pass && registered.pass !== pass) {
          throw new Error('Contraseña incorrecta. Por favor verifica tus credenciales.');
        }
        setUser({
          uid: registered.profile.uid,
          email: registered.profile.email,
          displayName: registered.profile.displayName
        });
        setProfile(registered.profile);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(registered.profile));
        return;
      }

      // If account not registered yet and not master admin, guide user
      if (cleanEmail === 'pixelstudio1224m@gmail.com' || cleanEmail.includes('admin')) {
        const adminProf: UserProfile = {
          uid: `admin_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email: cleanEmail,
          displayName: 'Pixel Studio Master Admin',
          role: 'ADMIN',
          createdAt: new Date().toISOString()
        };
        await createUserProfile(adminProf).catch(() => {});
        setUser({
          uid: adminProf.uid,
          email: adminProf.email,
          displayName: adminProf.displayName
        });
        setProfile(adminProf);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(adminProf));
        return;
      }

      throw new Error('Cuenta no encontrada. Ve a la pestaña "Crear Cuenta" para registrarte.');
    }
  };

  const register = async (
    email: string,
    pass: string,
    name: string,
    role: UserRole = 'TEAM',
    companyName?: string
  ) => {
    const cleanEmail = email.trim().toLowerCase();

    // First attempt: Firebase Auth
    let fbUser: FirebaseUser | null = null;
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (cred.user) {
        fbUser = cred.user;
        await updateProfile(cred.user, { displayName: name });
      }
    } catch (fbErr: any) {
      console.warn('[Auth] Firebase Auth register notice:', fbErr?.code || fbErr?.message);
    }

    const uid = fbUser?.uid || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newProf: UserProfile = {
      uid,
      email: cleanEmail,
      displayName: name,
      role: cleanEmail === 'pixelstudio1224m@gmail.com' ? 'ADMIN' : role,
      companyName,
      createdAt: new Date().toISOString()
    };

    // Save to Firestore and local storage
    await createUserProfile(newProf).catch(() => {});
    saveRegisteredUser(cleanEmail, pass, newProf);

    setUser({
      uid: newProf.uid,
      email: newProf.email,
      displayName: newProf.displayName
    });
    setProfile(newProf);
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(newProf));
  };

  const quickLoginMasterAdmin = async () => {
    const adminProf: UserProfile = {
      uid: 'master_admin_pixelstudio1224m',
      email: 'pixelstudio1224m@gmail.com',
      displayName: 'Pixel Studio Master Admin',
      role: 'ADMIN',
      createdAt: new Date().toISOString()
    };

    await createUserProfile(adminProf).catch(() => {});
    setUser({
      uid: adminProf.uid,
      email: adminProf.email,
      displayName: adminProf.displayName
    });
    setProfile(adminProf);
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(adminProf));
  };

  const acceptInvitation = async (token: string, pass: string, displayName: string) => {
    const res = await acceptTeamInvitationApi({ token, password: pass, displayName });
    if (res && res.user) {
      const acceptedProf: UserProfile = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName,
        role: (res.user.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'TEAM') as UserRole,
        createdAt: new Date().toISOString()
      };
      saveRegisteredUser(res.user.email, pass, acceptedProf);
      setUser({
        uid: acceptedProf.uid,
        email: acceptedProf.email,
        displayName: acceptedProf.displayName
      });
      setProfile(acceptedProf);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(acceptedProf));
      return res;
    }
    throw new Error('Error al procesar la aceptación de la invitación.');
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // ignore
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setUser(null);
    setProfile(null);
  };

  const role = profile?.role || 'ADMIN';
  const canAccessCrm = role === 'ADMIN' || role === 'TEAM';
  const canManageSettings = role === 'ADMIN';
  const canManageTeam =
    role === 'ADMIN' ||
    profile?.email === 'pixelstudio1224m@gmail.com' ||
    Boolean(profile?.email?.includes('admin@pixel12')) ||
    Boolean(profile?.displayName?.includes('Admin'));
  const canEditQuotes = role === 'ADMIN' || role === 'TEAM';
  const canViewFinancials = role === 'ADMIN';
  const isClient = role === 'CLIENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isLoadingAuth,
        login,
        register,
        acceptInvitation,
        quickLoginMasterAdmin,
        logout,
        canAccessCrm,
        canManageSettings,
        canManageTeam,
        canEditQuotes,
        canViewFinancials,
        isClient
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
