import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Dumbbell, 
  Calendar, 
  CreditCard,
  Settings,
  LogOut,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
  { name: 'Membres', href: '/membres', icon: Users },
  { name: 'Activités', href: '/activites', icon: Dumbbell },
  { name: 'Réservations', href: '/reservations', icon: Calendar },
  { name: 'Paiements', href: '/paiements', icon: CreditCard },
];

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <Activity className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-accent-foreground">SportCenter</h1>
            <p className="text-xs text-sidebar-foreground/60">Gestion</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="px-4 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-4">
          Menu principal
        </p>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sidebar-border space-y-1">
        {user && (
          <div className="px-4 py-2 mb-2">
            <p className="text-xs text-sidebar-foreground/50">Connecté en tant que</p>
            <p className="text-sm font-medium text-sidebar-foreground">{user.username}</p>
          </div>
        )}
        <button className="sidebar-nav-item w-full">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Paramètres</span>
        </button>
        <button 
          onClick={logout}
          className="sidebar-nav-item w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
