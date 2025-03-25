import { Switch, Route, useLocation } from "wouter";
import { useState } from "react";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/topbar";
import Dashboard from "./dashboard";
import Inventory from "./inventory";
import Movements from "./movements";
import Suppliers from "./suppliers";
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
          <Route path="/almacen" component={Dashboard} />
          <Route path="/almacen/dashboard" component={Dashboard} />
          <Route path="/almacen/inventory" component={Inventory} />
          <Route path="/almacen/movements" component={Movements} />
          <Route path="/almacen/suppliers" component={Suppliers} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}