import React, { useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Database,
  BookOpen,
  BarChart3,
  Globe,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/shared/hooks/use-auth";
import AdminDashboard from "./dashboard";
import AdminCMS from "./cms";
import LearningModule from "./learning";

// Componente de navegación para panel de administrador
const NavItem = ({ href, icon, label, active, onClick, collapsed }: any) => {
  return (
    <a
      href={href}
      className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-md text-sm transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
      onClick={onClick}
      title={collapsed ? label : undefined}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </a>
  );
};

// Componente para grupo de navegación con items colapsables
const NavGroup = ({ 
  icon, 
  label, 
  children, 
  active, 
  defaultOpen = false,
  collapsed = false
}: any) => {
  const [open, setOpen] = useState(defaultOpen || active);

  if (collapsed) {
    return (
      <div className="w-full" title={label}>
        <div className="flex items-center justify-center px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
          {icon}
        </div>
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
        <div className="flex items-center space-x-3">
          {icon}
          <span>{label}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "transform rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-10 space-y-1 pt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

// Componente principal para el panel de administración
export default function AdminModule() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Determinar si algún subitem dentro de un grupo está activo
  const isCmsActive = 
    location === "/admin/cms" ||
    location === "/admin/cms/dashboard" ||
    location === "/admin/cms/pages" || 
    location === "/admin/cms/categories" || 
    location === "/admin/cms/media" ||
    location === "/admin/cms/branding";

  // Navegación principal para el administrador
  const mainNavigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: location === "/admin/dashboard",
    },
    {
      name: "Clientes",
      href: "/admin/clients",
      icon: <Users className="h-5 w-5" />,
      active: location === "/admin/clients",
    },
    {
      name: "Estadísticas",
      href: "/admin/stats",
      icon: <BarChart3 className="h-5 w-5" />,
      active: location === "/admin/stats",
    },
  ];

  // Subitems para el CMS
  const cmsNavItems = [
    {
      name: "Dashboard",
      href: "/admin/cms/dashboard",
      active: location === "/admin/cms/dashboard" || location === "/admin/cms",
    },
    {
      name: "Páginas",
      href: "/cms/paginas", // Corregido para apuntar al módulo de cliente
      active: location === "/admin/cms/pages" || location === "/cms/paginas",
    },
    {
      name: "Categorías",
      href: "/cms/categorias", // Corregido para apuntar al módulo de cliente
      active: location === "/admin/cms/categories" || location === "/cms/categorias",
    },
    {
      name: "Medios",
      href: "/cms/media", // Corregido para apuntar al módulo de cliente
      active: location === "/admin/cms/media" || location === "/cms/media",
    },
    {
      name: "Marca",
      href: "/cms/branding", // Corregido para apuntar al módulo de cliente
      active: location === "/admin/cms/branding" || location === "/cms/branding",
    },
  ];

  // Navegación de configuración
  const configNavigation = [
    {
      name: "Configuración",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
      active: location === "/admin/settings",
    },
    {
      name: "API",
      href: "/admin/api",
      icon: <Database className="h-5 w-5" />,
      active: location === "/admin/api",
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Botón de toggle para móvil */}
      <button
        className="fixed z-50 bottom-4 right-4 md:hidden bg-primary text-white p-3 rounded-full shadow-lg"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar (barra lateral) */}
      <div
        className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-card border-r shadow-sm transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } fixed inset-y-0 left-0 z-20 md:relative md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Encabezado del sidebar */}
          <div className="p-4 border-b flex justify-between items-center">
            <div className={`${sidebarCollapsed ? 'hidden' : 'block'}`}>
              <h2 className="text-xl font-bold">ShieldCuisine</h2>
              <p className="text-sm text-muted-foreground mt-1">Panel de Administración</p>
            </div>
            {sidebarCollapsed && (
              <div className="mx-auto">
                <h2 className="text-xl font-bold">SC</h2>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleCollapse} 
              className="hidden md:flex"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navegación principal */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {mainNavigation.map((item) => (
              <NavItem
                key={item.name}
                href={item.href}
                icon={item.icon}
                label={item.name}
                active={item.active}
                onClick={() => setSidebarOpen(false)}
                collapsed={sidebarCollapsed}
              />
            ))}

            {/* Grupo de CMS */}
            <NavGroup 
              icon={<Globe className="h-5 w-5" />} 
              label="CMS"
              active={isCmsActive}
              defaultOpen={isCmsActive}
              collapsed={sidebarCollapsed}
            >
              {!sidebarCollapsed && cmsNavItems.map((item) => (
                <NavItem
                  key={item.name}
                  href={item.href}
                  label={item.name}
                  active={item.active}
                  onClick={() => setSidebarOpen(false)}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </NavGroup>

            {/* Sección e-Learning */}
            <NavGroup 
              icon={<BookOpen className="h-5 w-5" />} 
              label="E-Learning"
              active={location.startsWith("/admin/learning")}
              collapsed={sidebarCollapsed}
            >
              {!sidebarCollapsed && (
                <>
                  <NavItem
                    href="/admin/learning/courses"
                    label="Cursos"
                    active={location === "/admin/learning/courses"}
                    onClick={() => setSidebarOpen(false)}
                    collapsed={sidebarCollapsed}
                  />
                  <NavItem
                    href="/admin/learning/lessons"
                    label="Lecciones"
                    active={location === "/admin/learning/lessons"}
                    onClick={() => setSidebarOpen(false)}
                    collapsed={sidebarCollapsed}
                  />
                  <NavItem
                    href="/admin/learning/quizzes"
                    label="Cuestionarios"
                    active={location === "/admin/learning/quizzes"}
                    onClick={() => setSidebarOpen(false)}
                    collapsed={sidebarCollapsed}
                  />
                </>
              )}
            </NavGroup>

            {/* Navegación de configuración */}
            <div className="mt-6 pt-6 border-t">
              {configNavigation.map((item) => (
                <NavItem
                  key={item.name}
                  href={item.href}
                  icon={item.icon}
                  label={item.name}
                  active={item.active}
                  onClick={() => setSidebarOpen(false)}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </div>
          </div>

          {/* Usuario y logout */}
          <div className="p-4 border-t">
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-center p-2"
                  onClick={() => logoutMutation.mutate()}
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{user?.name || "Administrador"}</div>
                    <div className="text-xs text-muted-foreground">
                      Administrador del Sistema
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header superior */}
        <header className="h-16 border-b bg-card flex items-center px-6 sticky top-0 z-10">
          <div className="flex items-center md:hidden mr-4">
            <button
              className="p-2 rounded-md"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {location === "/admin/dashboard" && "Dashboard"}
              {location === "/admin/clients" && "Clientes"}
              {location === "/admin/stats" && "Estadísticas"}
              {location === "/admin/cms" && "CMS"}
              {location === "/admin/cms/dashboard" && "CMS - Dashboard"}
              {location === "/admin/cms/pages" && "CMS - Páginas"}
              {location === "/admin/cms/categories" && "CMS - Categorías"}
              {location === "/admin/cms/media" && "CMS - Medios"}
              {location === "/admin/cms/branding" && "CMS - Marca"}
              {location === "/admin/learning/courses" && "E-Learning - Cursos"}
              {location === "/admin/learning/lessons" && "E-Learning - Lecciones"}
              {location === "/admin/learning/quizzes" && "E-Learning - Cuestionarios"}
              {location.startsWith("/admin/learning") && !location.includes("/courses") && !location.includes("/lessons") && !location.includes("/quizzes") && "E-Learning"}
              {location === "/admin/settings" && "Configuración"}
              {location === "/admin/api" && "API"}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="secondary" 
              size="sm" 
              asChild
              className="mr-2 border border-primary/20"
            >
              <a href="/client/dashboard" className="inline-flex items-center">
                <Globe className="h-4 w-4 mr-1 text-primary" />
                <span className="font-medium">Portal Cliente</span>
              </a>
            </Button>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
          </div>
        </header>

        {/* Área de contenido */}
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <Switch>
            <Route path="/admin/dashboard" component={AdminDashboard} />
            <Route path="/admin/cms" component={AdminCMS} />
            <Route path="/admin/cms/:rest*" component={AdminCMS} />
            {/* Agregamos la ruta para el módulo de aprendizaje */}
            <Route path="/admin/learning" component={() => {
              window.location.href = "/admin/learning/courses";
              return <div>Redirigiendo...</div>;
            }} />
            <Route path="/admin/learning/:rest*" component={LearningModule} />
            <Route path="/admin">
              {/* Redirección por defecto al dashboard */}
              {() => {
                window.location.href = "/admin/dashboard";
                return <div>Redirigiendo...</div>;
              }}
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
}