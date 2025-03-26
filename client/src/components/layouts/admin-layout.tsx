import React, { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Store, 
  Eye, 
  GanttChart, 
  Building2, 
  Landmark, 
  GraduationCap, 
  Settings,
  FileText,
  Menu,
  X,
  LogOut
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5 mr-2" /> },
    { path: '/appcc', label: 'APPCC', icon: <ShieldAlert className="h-5 w-5 mr-2" /> },
    { path: '/almacen', label: 'Almacén', icon: <Store className="h-5 w-5 mr-2" /> },
    { path: '/transparencia', label: 'Transparencia', icon: <Eye className="h-5 w-5 mr-2" /> },
    { path: '/compras', label: 'Compras', icon: <GanttChart className="h-5 w-5 mr-2" /> },
    { path: '/admin', label: 'Administración', icon: <Building2 className="h-5 w-5 mr-2" /> },
    { path: '/banca', label: 'Banca', icon: <Landmark className="h-5 w-5 mr-2" /> },
    { path: '/formacion', label: 'Formación', icon: <GraduationCap className="h-5 w-5 mr-2" /> },
    { path: '/cms', label: 'CMS', icon: <FileText className="h-5 w-5 mr-2" /> },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar para pantallas medianas y grandes */}
      <aside className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out bg-card border-r w-64 md:sticky top-0 h-screen overflow-y-auto`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-xl font-bold cursor-pointer">ShieldCuisine</h1>
            </Link>
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <nav className="p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.startsWith(item.path);
              return (
                <li key={item.path}>
                  <Link href={item.path}>
                    <a className={`flex items-center px-3 py-2 rounded-md text-sm ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                      {item.icon}
                      {item.label}
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {user && (
          <div className="mt-auto p-4 border-t">
            <div className="flex items-center mb-4">
              <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center mr-3">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        )}
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Barra superior para móviles */}
        <header className="md:hidden bg-card p-4 border-b sticky top-0 z-40 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-xl font-bold cursor-pointer">ShieldCuisine</h1>
          </Link>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        {/* Contenido de la página */}
        <div className="flex-1">
          {children}
        </div>
      </main>

      {/* Overlay para cerrar el sidebar en móviles */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;