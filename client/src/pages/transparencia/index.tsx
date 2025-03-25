import { useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import Topbar from "@/components/topbar";
import Sidebar from "@/components/sidebar";
import Dashboard from "./dashboard";
import Empresas from "./empresas";
import Controles from "./controles";
import ControlDetalle from "./control-detalle";

export default function TransparenciaModule() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();
  
  const tabs = [
    { id: "dashboard", label: "Dashboard", path: "/transparencia" },
    { id: "empresas", label: "Empresas", path: "/transparencia/empresas" },
    { id: "controles", label: "Controles", path: "/transparencia/controles" }
  ];
  
  // Determine current tab based on location
  const getCurrentTab = () => {
    if (location === "/transparencia") return "dashboard";
    if (location.startsWith("/transparencia/empresas")) return "empresas";
    if (location.startsWith("/transparencia/controles") || location.startsWith("/transparencia/control/")) return "controles";
    return "dashboard";
  };
  
  const currentTab = getCurrentTab();
  
  return (
    <div className="flex h-screen w-full flex-col">
      <Topbar 
        title="Portal de Transparencia" 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        tabs={tabs}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto">
          <Switch>
            <Route path="/transparencia" component={Dashboard} />
            <Route path="/transparencia/empresas" component={Empresas} />
            <Route path="/transparencia/controles" component={Controles} />
            <Route path="/transparencia/control/:id" component={ControlDetalle} />
            <Route>
              <Dashboard />
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
}