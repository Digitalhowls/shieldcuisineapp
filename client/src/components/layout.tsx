import React, { ReactNode, useState } from "react";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import { useLocation } from "wouter";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  tabs?: { id: string; label: string; path: string }[];
}

export function Layout({ children, title = "ShieldCuisine", tabs = [] }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();
  
  // Determinar el título de la página según la ruta actual
  const getModuleTitle = () => {
    if (location.startsWith('/compras')) return 'Gestión de Compras';
    if (location.startsWith('/appcc')) return 'APPCC y Cumplimiento';
    if (location.startsWith('/almacen')) return 'Almacén y Trazabilidad';
    if (location.startsWith('/formacion')) return 'Formación y E-Learning';
    if (location.startsWith('/banca')) return 'Integración Bancaria';
    if (location.startsWith('/transparencia')) return 'Portal de Transparencia';
    return title;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar 
        title={getModuleTitle()} 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        tabs={tabs}
      />
      <div className="flex flex-1">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        <main className="flex-1 bg-background overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}