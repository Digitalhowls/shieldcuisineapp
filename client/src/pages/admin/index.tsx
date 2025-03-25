import { useState } from "react";
import { Route, Switch, useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Users,
  Building2,
  LayoutDashboard,
  Package,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Dashboard from "./dashboard";
import Clientes from "./clientes";
import Detalles from "./cliente-detalles";
import Modulos from "./modulos";
import Facturacion from "./facturacion";
import Configuracion from "./configuracion";

export default function AdminModule() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  // Cerrar sidebar en mobile automáticamente
  useState(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  });

  // Manejo del sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Verifica si la ruta actual es la indicada
  const isActive = (path: string) => {
    return location === path || location.startsWith(`${path}/`);
  };

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`bg-white border-r transition-all duration-300 flex flex-col ${
          isSidebarOpen ? "w-64" : "w-0 md:w-16"
        } ${isMobile && !isSidebarOpen ? "-ml-64" : ""}`}
      >
        {/* Logo y cabecera */}
        <div className="p-4 border-b flex items-center justify-between h-16">
          {isSidebarOpen && (
            <div className="font-semibold text-primary flex items-center">
              <Package className="h-5 w-5 mr-2" />
              <span>ShieldCuisine</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="ml-auto"
          >
            {isSidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Enlaces de navegación */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            <li>
              <Link href="/admin">
                <div className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  isActive("/admin") && !isActive("/admin/clientes") && !isActive("/admin/modulos") 
                  && !isActive("/admin/facturacion") && !isActive("/admin/configuracion")
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-neutral-100"
                }`}>
                  <LayoutDashboard className="h-5 w-5" />
                  {isSidebarOpen && <span className="ml-3">Dashboard</span>}
                </div>
              </Link>
            </li>
            <li>
              <Link href="/admin/clientes">
                <div className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  isActive("/admin/clientes")
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-neutral-100"
                }`}>
                  <Building2 className="h-5 w-5" />
                  {isSidebarOpen && <span className="ml-3">Empresas</span>}
                </div>
              </Link>
            </li>
            <li>
              <Link href="/admin/modulos">
                <div className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  isActive("/admin/modulos")
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-neutral-100"
                }`}>
                  <Package className="h-5 w-5" />
                  {isSidebarOpen && <span className="ml-3">Módulos</span>}
                </div>
              </Link>
            </li>
            <li>
              <Link href="/admin/facturacion">
                <div className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  isActive("/admin/facturacion")
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-neutral-100"
                }`}>
                  <FileBarChart className="h-5 w-5" />
                  {isSidebarOpen && <span className="ml-3">Facturación</span>}
                </div>
              </Link>
            </li>
            <li>
              <Link href="/admin/configuracion">
                <div className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  isActive("/admin/configuracion")
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-neutral-100"
                }`}>
                  <Settings className="h-5 w-5" />
                  {isSidebarOpen && <span className="ml-3">Configuración</span>}
                </div>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Perfil de usuario */}
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            {isSidebarOpen && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium truncate">
                  {user?.name || user?.username}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {user?.role === "admin" ? "Administrador" : user?.role}
                </p>
              </div>
            )}
            {isSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barra superior móvil */}
        {isMobile && (
          <header className="bg-white border-b h-16 flex items-center px-4 md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="font-semibold text-primary mx-auto flex items-center">
              <Package className="h-5 w-5 mr-2" />
              <span>ShieldCuisine Admin</span>
            </div>
          </header>
        )}

        {/* Área de contenido */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Switch>
            <Route path="/admin" component={Dashboard} />
            <Route path="/admin/clientes" component={Clientes} />
            <Route path="/admin/clientes/:clienteId" component={Detalles} />
            <Route path="/admin/modulos" component={Modulos} />
            <Route path="/admin/facturacion" component={Facturacion} />
            <Route path="/admin/configuracion" component={Configuracion} />
          </Switch>
        </main>
      </div>

      {/* Overlay para cerrar el sidebar en mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-10 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}