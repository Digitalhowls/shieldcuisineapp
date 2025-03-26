import React, { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import {
  FileText,
  LayoutDashboard,
  Menu,
  Settings,
  PlayCircle,
  Image,
  PenTool,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-card border-r border-border transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-border">
          {sidebarOpen ? (
            <Link href="/">
              <span className="text-xl font-bold cursor-pointer">
                ShieldCuisine
              </span>
            </Link>
          ) : (
            <Link href="/">
              <span className="text-xl font-bold cursor-pointer">SC</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            <nav className="space-y-1">
              <NavItem
                href="/cms"
                icon={<LayoutDashboard className="w-5 h-5" />}
                label="Dashboard"
                active={location === '/cms'}
                collapsed={!sidebarOpen}
              />
              <NavItem
                href="/cms/pages"
                icon={<FileText className="w-5 h-5" />}
                label="Páginas"
                active={location.startsWith('/cms/pages')}
                collapsed={!sidebarOpen}
              />
              <NavItem
                href="/cms/media"
                icon={<Image className="w-5 h-5" />}
                label="Multimedia"
                active={location.startsWith('/cms/media')}
                collapsed={!sidebarOpen}
              />
              <NavItem
                href="/cms/settings"
                icon={<Settings className="w-5 h-5" />}
                label="Configuración"
                active={location.startsWith('/cms/settings')}
                collapsed={!sidebarOpen}
              />
              
              <Separator className="my-4" />
              
              <div className={`px-3 mb-2 ${!sidebarOpen && 'sr-only'}`}>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Animaciones
                </h4>
              </div>
              
              <NavItem
                href="/cms/animation-playground"
                icon={<PlayCircle className="w-5 h-5" />}
                label="Galería de Animaciones"
                active={location === '/cms/animation-playground'}
                collapsed={!sidebarOpen}
              />
              <NavItem
                href="/cms/animated-blocks-demo"
                icon={<PenTool className="w-5 h-5" />}
                label="Bloques Animados"
                active={location === '/cms/animated-blocks-demo'}
                collapsed={!sidebarOpen}
              />
            </nav>
          </div>
        </ScrollArea>

        {/* User */}
        <div className="p-3 border-t border-border flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user?.username ? getInitials(user.username) : 'U'}
            </AvatarFallback>
          </Avatar>
          {sidebarOpen && (
            <div className="ml-3 flex-1 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">{user?.username || 'Usuario'}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || 'admin@example.com'}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
};

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  href,
  icon,
  label,
  active = false,
  collapsed = false,
}) => {
  return (
    <Link href={href}>
      <a
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          active
            ? 'bg-primary/10 text-primary'
            : 'text-foreground hover:bg-muted/50'
        }`}
      >
        <span className="flex-shrink-0">{icon}</span>
        {!collapsed && <span className="ml-3">{label}</span>}
      </a>
    </Link>
  );
};

export default Layout;