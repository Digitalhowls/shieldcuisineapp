import { Switch, Route, useLocation } from "wouter";
import { useState } from "react";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/topbar";
import Dashboard from "@/pages/almacen/dashboard";
import Inventory from "@/pages/almacen/inventory";
import Movements from "@/pages/almacen/movements";
import Suppliers from "@/pages/almacen/suppliers";
import NotFound from "@/pages/not-found";

export default function AlmacenModule() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  
  // Navigation tabs for the Almacen module
  const tabs = [
    { id: "dashboard", label: "Dashboard", path: "/almacen" },  // Default/index route
    { id: "inventory", label: "Inventario", path: "/almacen/inventory" },
    { id: "movements", label: "Movimientos", path: "/almacen/movements" },
    { id: "suppliers", label: "Proveedores", path: "/almacen/suppliers" },
  ];
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Almacén y Trazabilidad" 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          tabs={tabs}
        />
        
        <Switch>
          <Route path="/almacen">
            <Dashboard />
          </Route>
          <Route path="/almacen/dashboard">
            <Dashboard />
          </Route>
          <Route path="/almacen/inventory">
            <Inventory />
          </Route>
          <Route path="/almacen/movements">
            <Movements />
          </Route>
          <Route path="/almacen/suppliers">
            <Suppliers />
          </Route>
          <Route path="/almacen/:rest*">
            <NotFound />
          </Route>
        </Switch>
      </div>
    </div>
  );
}