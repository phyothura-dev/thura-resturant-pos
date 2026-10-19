import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, session, loading } = useAuth();
  const unauthorizedAlerted = useRef(false);

  const isAuthorized = !allowedRoles || (user && allowedRoles.includes(user.role));

  useEffect(() => {
    if (session && !isAuthorized && !unauthorizedAlerted.current) {
      unauthorizedAlerted.current = true;
      toast.error('ဤစာမျက်နှာအား ဝင်ရောက်ခွင့် မရှိပါ (Unauthorized Access)');
    }
  }, [session, isAuthorized]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthorized) {
    return <Navigate to="/tables" replace />;
  }

  return <Outlet />;
}
