import { createContext } from 'react';
import type { UserRecord } from '../types';

export interface AuthContextValue {
  session: { user: UserRecord | null; token: string } | null;
  user: UserRecord | null;
  loading: boolean;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
