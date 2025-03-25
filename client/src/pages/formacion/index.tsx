import { Switch, Route, useLocation } from "wouter";
import { useState } from "react";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/topbar";
import Dashboard from "./dashboard";
import Cursos from "./cursos";
import CursoDetalle from "./curso-detalle";
import MisCursos from "./mis-cursos";
import CursoProgreso from "./curso-progreso";
import NotFound from "@/pages/not-found";
import { Award, GraduationCap, BookOpen, ListChecks, Users } from "lucide-react";

export default function FormacionModule() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  
  // Pestañas de navegación para el módulo de formación
  const tabs = [
    { id: "dashboard", label: "Dashboard", path: "/formacion" },
    { id: "cursos", label: "Catálogo de cursos", path: "/formacion/cursos" },
    { id: "mis-cursos", label: "Mis cursos", path: "/formacion/mis-cursos" },
  ];
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Plataforma de formación" 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          tabs={tabs}
        />
        
        <div className="flex-grow overflow-y-auto p-4">
          <Switch>
            <Route path="/formacion">
              <Dashboard />
            </Route>
            <Route path="/formacion/dashboard">
              <Dashboard />
            </Route>
            <Route path="/formacion/cursos">
              <Cursos />
            </Route>
            <Route path="/formacion/curso/:id">
              <CursoDetalle />
            </Route>
            <Route path="/formacion/mis-cursos">
              <MisCursos />
            </Route>
            <Route path="/formacion/progreso/:id">
              <CursoProgreso />
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