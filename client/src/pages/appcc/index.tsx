import { Switch, Route, useLocation, useRoute } from "wouter";
import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/topbar";
import Dashboard from "@/pages/appcc/dashboard";
import DailyControls from "@/pages/appcc/daily-controls";
import Records from "@/pages/appcc/records";
import Templates from "@/pages/appcc/templates";
import Reports from "@/pages/appcc/reports";
import ControlDetail from "@/pages/appcc/control-detail";
import NotFound from "@/pages/not-found";

export default function AppccModule() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const [matchAppcc] = useRoute("/appcc");
  const [matchAppccParam] = useRoute("/appcc/:rest*");
  
  // Navigation tabs for the APPCC module
  const tabs = [
    { id: "dashboard", label: "Dashboard", path: "/appcc" },  // Default/index route
    { id: "daily", label: "Controles diarios", path: "/appcc/daily-controls" },
    { id: "records", label: "Registros", path: "/appcc/records" },
    { id: "templates", label: "Plantillas", path: "/appcc/templates" },
    { id: "reports", label: "Informes", path: "/appcc/reports" },
  ];
  
  // Para debug - mostrar la ruta actual en la consola
  useEffect(() => {
    console.log("APPCC Module - Current location:", location);
    console.log("Match /appcc:", matchAppcc);
    console.log("Match /appcc/:rest*:", matchAppccParam);
  }, [location, matchAppcc, matchAppccParam]);
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Sistema APPCC" 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          tabs={tabs}
        />
        
        <div className="flex-grow overflow-y-auto p-4">
          <Switch>
            <Route path="/appcc">
              <Dashboard />
            </Route>
            <Route path="/appcc/dashboard">
              <Dashboard />
            </Route>
            <Route path="/appcc/daily-controls">
              <DailyControls />
            </Route>
            <Route path="/appcc/records">
              <Records />
            </Route>
            <Route path="/appcc/templates">
              <Templates />
            </Route>
            <Route path="/appcc/reports">
              <Reports />
            </Route>
            <Route path="/appcc/control/:id">
              <ControlDetail />
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </div>
      </div>
    </div>
  );
}