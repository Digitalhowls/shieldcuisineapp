import React, { useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Warehouse, 
  ShoppingBag, 
  Book, 
  Receipt, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/shared/hooks/use-auth";
import ClientDashboard from "./dashboard";

// NavItem componente simplificado para la barra lateral del cliente
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

// Componente principal para la vista de cliente
export default function ClientModule() {
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

  // Navegación específica para clientes
  const navigation = [
    {
      name: "Dashboard",
      href: "/client/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: location === "/client/dashboard",
    },
    {
      name: "APPCC",
      href: "/client/appcc",
      icon: <ShieldCheck className="h-5 w-5" />,
      active: location === "/client/appcc",
    },
    {
      name: "Almacén",
      href: "/client/almacen",
      icon: <Warehouse className="h-5 w-5" />,
      active: location === "/client/almacen",
    },
    {
      name: "Compras",
      href: "/client/compras",
      icon: <ShoppingBag className="h-5 w-5" />,
      active: location === "/client/compras",
    },
    {
      name: "Formación",
      href: "/client/formacion",
      icon: <Book className="h-5 w-5" />,
      active: location === "/client/formacion",
    },
    {
      name: "Documentos",
      href: "/client/documentos",
      icon: <Receipt className="h-5 w-5" />,
      active: location === "/client/documentos",
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
              <p className="text-sm text-muted-foreground mt-1">Portal de Cliente</p>
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

          {/* Navegación */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navigation.map((item) => (
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
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {user?.role === "admin" 
                        ? "Administrador del Sistema" 
                        : user?.role === "company_admin" 
                          ? "Administrador" 
                          : "Usuario"}
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
              {location === "/client/dashboard" && "Dashboard"}
              {location === "/client/appcc" && "APPCC"}
              {location === "/client/almacen" && "Almacén"}
              {location === "/client/compras" && "Compras"}
              {location === "/client/formacion" && "Formación"}
              {location === "/client/documentos" && "Documentos"}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Botón para volver a la interfaz de administración (solo visible para administradores) */}
            {user && user.role === 'admin' && (
              <Button 
                variant="secondary" 
                size="sm"
                asChild
                className="mr-2 border border-primary/20"
              >
                <a href="/admin/dashboard" className="inline-flex items-center">
                  <User className="h-4 w-4 mr-1 text-primary" />
                  <span className="font-medium">Panel Admin</span>
                </a>
              </Button>
            )}
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
          </div>
        </header>

        {/* Área de contenido */}
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <Switch>
            <Route path="/client/dashboard" component={ClientDashboard} />
            <Route path="/client">
              {/* Redirección por defecto al dashboard */}
              {() => {
                window.location.href = "/client/dashboard";
                return <div>Redirigiendo...</div>;
              }}
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
}