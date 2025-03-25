import { Switch, Route, useLocation } from "wouter";
import { useState } from "react";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/topbar";
import Dashboard from "./dashboard";
import Templates from "./templates";
import DailyControls from "./daily-controls";
import Records from "./records";
import Reports from "./reports";
import NotFound from "@/pages/not-found";

export default function AppccModule() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  
  // Navigation tabs for the APPCC module
  const tabs = [
    { id: "dashboard", label: "Dashboard", path: "/appcc" },  // Default/index route
    { id: "templates", label: "Plantillas", path: "/appcc/templates" },
    { id: "daily-controls", label: "Controles Diarios", path: "/appcc/daily-controls" },
    { id: "records", label: "Registros", path: "/appcc/records" },
    { id: "reports", label: "Informes", path: "/appcc/reports" },
  ];
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="APPCC y Cumplimiento" 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          tabs={tabs}
        />
        
        <Switch>
          <Route path="/appcc">
            <Dashboard />
          </Route>
          <Route path="/appcc/dashboard">
            <Dashboard />
          </Route>
          <Route path="/appcc/templates">
            <Templates />
          </Route>
          <Route path="/appcc/daily-controls">
            <DailyControls />
          </Route>
          <Route path="/appcc/records">
            <Records />
          </Route>
          <Route path="/appcc/reports">
            <Reports />
          </Route>
          <Route path="/appcc/:rest*">
            <NotFound />
          </Route>
        </Switch>
      </div>
    </div>
  );
}
