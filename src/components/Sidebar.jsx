import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { FileText, LayoutGrid, Package, Users, LogOut, X, PanelLeftClose, PanelLeftOpen, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ROLES } from '../config/constants';

const allNavItems = [
  {
    to: '/tables',
    icon: UtensilsCrossed,
    label: 'စားပွဲဝိုင်းများ',
    roles: [ROLES.ADMIN, ROLES.STAFF],
  },
  {
    to: '/products',
    icon: Package,
    label: 'ကုန်ပစ္စည်းများ',
    roles: [ROLES.ADMIN, ROLES.STAFF],
  },
  {
    to: '/categories',
    icon: LayoutGrid,
    label: 'အမျိုးအစားများ',
    roles: [ROLES.ADMIN],
  },
  {
    to: '/users',
    icon: Users,
    label: 'အသုံးပြုသူများ',
    roles: [ROLES.ADMIN],
  },
  {
    to: '/reports',
    icon: FileText,
    label: 'စာရင်းချုပ်',
    roles: [ROLES.ADMIN],
  },
];

export default function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }) {
  const { signOut, user } = useAuth();
  const userRole = user?.role || ROLES.STAFF;

  const visibleNavItems = useMemo(() => {
    return allNavItems.filter((item) => item.roles.includes(userRole));
  }, [userRole]);

  // logout handler
  const handleLogout = () => {
    signOut();
    toast.info('အကောင့်ထွက်လိုက်ပါပြီ');
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm md:hidden transition-opacity duration-300" onClick={onClose} />}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen border-r border-gray-200 bg-white transition-all duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20 w-64' : 'w-64'}`}
      >
        <div className={`flex h-full flex-col py-6 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          <div className="pb-4 border-b border-gray-200">
            {!isCollapsed ? (
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src="/logo.jpeg"
                    alt="Logo"
                    className="h-9 w-9 rounded-full object-cover border border-primary/20 shadow-sm shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-bold text-gray-900 truncate">သူရစားသောက်ဆိုင်</span>
                    <span className="text-[11px] font-medium text-primary">POS စနစ်</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    title="Menu ကျဉ်းမည်"
                    className="hidden md:flex h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <PanelLeftClose className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden h-8 w-8 text-gray-500">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <img
                  src="/logo.jpeg"
                  alt="Logo"
                  className="h-10 w-10 rounded-full object-cover border border-primary/20 shadow-sm shrink-0"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleCollapse}
                  title="Menu ချဲ့မည်"
                  className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <PanelLeftOpen className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-2 mt-4">
            {visibleNavItems.map((item) => {
              if (isCollapsed) {
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    onClick={() => {
                      if (window.innerWidth < 768) onClose();
                    }}
                    className={({ isActive }) =>
                      `group relative flex h-11 w-11 items-center justify-center rounded-lg mx-auto transition-all ${
                        isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-gray-600'}`} />
                        <div className="pointer-events-none absolute left-full ml-3 z-50 hidden rounded-md bg-gray-900 px-2.5 py-1 text-xs text-white shadow-lg group-hover:block whitespace-nowrap">
                          {item.label}
                        </div>
                      </>
                    )}
                  </NavLink>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-gray-600'}`} />
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-gray-200 pt-5">
            {!isCollapsed ? (
              <>
                <div className="mb-4 px-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-sans">အသုံးပြုသူ</p>
                    <Badge variant={userRole === ROLES.ADMIN ? 'default' : 'warning'} className="text-[10px] py-0 px-1.5 capitalize">
                      {userRole}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
                </div>

                <Button size="sm" variant="destructive" onClick={handleLogout} className="w-full justify-start gap-3">
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">အကောင့်ထွက်မည်</span>
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Badge
                  variant={userRole === ROLES.ADMIN ? 'default' : 'warning'}
                  className="text-[9px] py-0.5 px-1 uppercase tracking-tighter"
                  title={`Role: ${userRole}`}
                >
                  {userRole.slice(0, 3)}
                </Badge>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={handleLogout}
                  title="အကောင့်ထွက်မည်"
                  className="h-10 w-10 rounded-lg group relative"
                >
                  <LogOut className="h-5 w-5" />
                  <div className="pointer-events-none absolute left-full ml-3 z-50 hidden rounded-md bg-gray-900 px-2.5 py-1 text-xs text-white shadow-lg group-hover:block whitespace-nowrap">
                    အကောင့်ထွက်မည်
                  </div>
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
