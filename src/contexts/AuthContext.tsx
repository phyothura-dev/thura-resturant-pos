import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { RecordModel } from 'pocketbase';
import { pb } from '../services/pocketbase';
import { AuthContext } from './authContextDef';
import type { UserRecord } from '../types';

function formatUserRecord(record: RecordModel | null): UserRecord | null {
  if (!record) return null;
  const role = record.role === 'admin' ? 'admin' : 'staff';
  return {
    ...record,
    email: record.email || '',
    role,
    user_metadata: {
      role,
      full_name: record.name || '',
    },
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
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
