import { useEffect, useState } from 'react';
import { pb } from '../services/pocketbase';
import { AuthContext } from './authContextDef';

function formatUserRecord(record) {
  if (!record) return null;
  return {
    ...record,
    role: record.role || 'staff',
    user_metadata: {
      role: record.role || 'staff',
      full_name: record.name || '',
    },
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (pb.authStore.isValid ? formatUserRecord(pb.authStore.record) : null));
  const [session, setSession] = useState(() =>
    pb.authStore.isValid ? { user: formatUserRecord(pb.authStore.record), token: pb.authStore.token } : null
  );
  const [loading] = useState(false);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((token, record) => {
      const formatted = formatUserRecord(record);
      setUser(formatted);
      setSession(token ? { user: formatted, token } : null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signOut = () => {
    pb.authStore.clear();
  };

  const value = {
    session,
    user,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
