import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layout/MainLayout';
import { Toaster } from './components/ui/Sonner';
import LoadingState from './components/ui/LoadingState';
import { ROLES } from './config/constants';

const Login = lazy(() => import('./pages/Login'));
const Tables = lazy(() => import('./pages/Tables'));
const POS = lazy(() => import('./pages/POS'));
const Products = lazy(() => import('./pages/Products'));
const Categories = lazy(() => import('./pages/Categories'));
const Users = lazy(() => import('./pages/Users'));
const Reports = lazy(() => import('./pages/Reports'));
const Kitchen = lazy(() => import('./pages/Kitchen'));
const DailyClosing = lazy(() => import('./pages/DailyClosing'));
const Settings = lazy(() => import('./pages/Settings'));

function PageLoader() {
  return <LoadingState type="spinner" className="h-[400px] w-full" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/tables" replace />} />
                
                <Route path="/tables" element={<Tables />} />
                <Route path="/pos/:tableId" element={<POS />} />
                <Route path="/products" element={<Products />} />
                <Route path="/kitchen" element={<Kitchen />} />

                <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/daily-closing" element={<DailyClosing />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
