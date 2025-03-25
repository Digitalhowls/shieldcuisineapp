import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { NavigationItem } from "@/types";
import { ShieldCheck } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  // Sample navigation items (would normally come from a context/state)
  const [selectedLocation, setSelectedLocation] = useState("Restaurante El Jardín - Sede Central");
  
  const mainModules: NavigationItem[] = [
    {
      path: "/appcc",
      label: "APPCC y Cumplimiento",
      icon: "fas fa-clipboard-check",
      isActive: location.startsWith("/appcc"),
      children: [
        { 
          path: "/appcc/dashboard", 
          label: "Dashboard", 
          icon: "",
          isActive: location === "/appcc" || location === "/appcc/dashboard"
        },
        { 
          path: "/appcc/templates", 
          label: "Plantillas", 
          icon: "",
          isActive: location === "/appcc/templates"
        },
        { 
          path: "/appcc/daily-controls", 
          label: "Controles Diarios", 
          icon: "",
          isActive: location === "/appcc/daily-controls"
        },
        { 
          path: "/appcc/records", 
          label: "Registros", 
          icon: "",
          isActive: location === "/appcc/records"
        },
        { 
          path: "/appcc/reports", 
          label: "Informes", 
          icon: "",
          isActive: location === "/appcc/reports"
        }
      ]
    },
    {
      path: "/almacen",
      label: "Almacén y Trazabilidad",
      icon: "fas fa-warehouse",
      isActive: location.startsWith("/almacen"),
      children: [
        { 
          path: "/almacen", 
          label: "Dashboard", 
          icon: "",
          isActive: location === "/almacen" || location === "/almacen/dashboard"
        },
        { 
          path: "/almacen/inventory", 
          label: "Inventario", 
          icon: "",
          isActive: location === "/almacen/inventory"
        },
        { 
          path: "/almacen/movements", 
          label: "Movimientos", 
          icon: "",
          isActive: location === "/almacen/movements"
        },
        { 
          path: "/almacen/suppliers", 
          label: "Proveedores", 
          icon: "",
          isActive: location === "/almacen/suppliers"
        }
      ]
    },
    {
      path: "/tpv",
      label: "TPV",
      icon: "fas fa-cash-register",
      isActive: location.startsWith("/tpv")
    },
    {
      path: "/facturas",
      label: "Facturación",
      icon: "fas fa-file-invoice-dollar",
      isActive: location.startsWith("/facturas")
    },
    {
      path: "/escandallos",
      label: "Escandallos y Fichas",
      icon: "fas fa-utensils",
      isActive: location.startsWith("/escandallos")
    }
  ];
  
  const configModules: NavigationItem[] = [
    {
      path: "/settings",
      label: "Ajustes",
      icon: "fas fa-cog",
      isActive: location.startsWith("/settings")
    },
    {
      path: "/users",
      label: "Usuarios y Permisos",
      icon: "fas fa-users",
      isActive: location.startsWith("/users")
    }
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={cn(
          "lg:hidden fixed inset-0 bg-neutral-800 bg-opacity-50 z-10 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )} 
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div 
        className={cn(
          "bg-white w-64 h-full shadow-md flex-shrink-0 fixed lg:static z-20 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center mr-2">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-neutral-800">ShieldCuisine</span>
            </div>
            <button onClick={onClose} className="lg:hidden text-neutral-500">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          {/* Company/Location Selector */}
          <div className="px-4 py-3 border-b border-neutral-100">
            <div className="relative">
              <select 
                className="block w-full p-2 border border-neutral-200 rounded-md text-sm bg-neutral-50"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option>Restaurante El Jardín - Sede Central</option>
                <option>Restaurante El Jardín - Sucursal Norte</option>
                <option>Catering Eventos S.L.</option>
              </select>
            </div>
          </div>
          
          {/* Navigation Items */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <h3 className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Módulos Principales</h3>
            
            {mainModules.map((module) => (
              <div key={module.path}>
                <Link href={module.path}>
                  <a
                    className={cn(
                      "flex items-center pl-4 pr-4 py-3 text-neutral-700 hover:bg-neutral-50 cursor-pointer",
                      module.isActive && "sidebar-item active"
                    )}
                  >
                    <i className={cn(module.icon, "w-5 mr-3", module.isActive ? "text-primary" : "text-neutral-500")}></i>
                    <span>{module.label}</span>
                  </a>
                </Link>
                
                {/* Submenu items */}
                {module.children && module.isActive && (
                  <div>
                    {module.children.map((child) => (
                      <Link key={child.path} href={child.path}>
                        <a
                          className={cn(
                            "flex items-center pl-8 pr-4 py-2 text-neutral-600 hover:bg-neutral-50 cursor-pointer",
                            child.isActive && "bg-neutral-50 text-primary"
                          )}
                        >
                          {child.icon && <i className={cn(child.icon, "w-5 text-neutral-500 mr-3")}></i>}
                          <span>{child.label}</span>
                        </a>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            <h3 className="px-4 mt-6 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Configuración</h3>
            
            {configModules.map((module) => (
              <Link key={module.path} href={module.path}>
                <a
                  className={cn(
                    "flex items-center pl-4 pr-4 py-3 text-neutral-600 hover:bg-neutral-50 cursor-pointer",
                    module.isActive && "sidebar-item active"
                  )}
                >
                  <i className={cn(module.icon, "w-5 mr-3", module.isActive ? "text-primary" : "text-neutral-500")}></i>
                  <span>{module.label}</span>
                </a>
              </Link>
            ))}
          </nav>
          
          {/* User Profile */}
          <div className="border-t border-neutral-100 p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                <i className="fas fa-user text-neutral-500"></i>
              </div>
              <div className="ml-3 truncate">
                <p className="text-sm font-medium text-neutral-800">{user?.name || "Usuario"}</p>
                <p className="text-xs text-neutral-500">{user?.role || "Empleado"}</p>
              </div>
              <div className="ml-auto">
                <button 
                  className="text-neutral-500 hover:text-neutral-700"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
