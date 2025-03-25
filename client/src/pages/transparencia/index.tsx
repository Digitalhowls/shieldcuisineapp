import { useState } from "react";
import { Route, Switch, useLocation, useParams } from "wouter";
import Topbar from "@/components/topbar";
import Sidebar from "@/components/sidebar";
import Dashboard from "./dashboard";
import Empresas from "./empresas";
import Controles from "./controles";
import ControlDetalle from "./control-detalle";
import PortalSelector from "./portal-selector";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AlertCircle, MailOpen } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Componente principal que muestra la selección de portal o el portal específico
export default function TransparenciaModule() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();
  
  // Verificar si estamos en una ruta de empresa específica
  const companyParam = location.match(/^\/transparencia\/portal\/(\d+)/);
  const companyId = companyParam ? companyParam[1] : null;
  
  if (!companyId) {
    // Si no hay companyId, mostrar el selector de portal
    return <TransparenciaSelector isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />;
  }
  
  // Si hay companyId, mostrar el portal específico de la empresa
  return <CompanyPortal 
    companyId={parseInt(companyId)} 
    isSidebarOpen={isSidebarOpen} 
    setIsSidebarOpen={setIsSidebarOpen} 
  />;
}

// Componente para seleccionar un portal de empresa
function TransparenciaSelector({ isSidebarOpen, setIsSidebarOpen }: { 
  isSidebarOpen: boolean; 
  setIsSidebarOpen: (open: boolean) => void
}) {
  return (
    <div className="flex h-screen w-full flex-col">
      <Topbar 
        title="Selector de Portal de Transparencia" 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto">
          <PortalSelector />
        </main>
      </div>
    </div>
  );
}

// Componente para mostrar el portal específico de una empresa
function CompanyPortal({ 
  companyId, 
  isSidebarOpen, 
  setIsSidebarOpen 
}: { 
  companyId: number;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}) {
  const [location] = useLocation();
  
  // Obtener información de la empresa
  const { data: company, isLoading, isError } = useQuery({
    queryKey: [`/api/companies/${companyId}`],
    queryFn: async () => {
      // Simulamos que estamos obteniendo datos reales (se reemplazará con la llamada API real)
      return {
        id: companyId,
        name: companyId === 1 ? "Restaurante La Huerta" : "Empresa",
        businessType: "restaurant",
        isAuthorized: true // Indica si el usuario actual está autorizado para ver este portal
      };
    }
  });
  
  // Tabs para el portal específico de la empresa
  const tabs = [
    { id: "dashboard", label: "Dashboard", path: `/transparencia/portal/${companyId}` },
    { id: "controles", label: "Controles", path: `/transparencia/portal/${companyId}/controles` }
  ];
  
  // Determine current tab based on location
  const getCurrentTab = () => {
    if (location === `/transparencia/portal/${companyId}`) return "dashboard";
    if (location.startsWith(`/transparencia/portal/${companyId}/controles`) || 
        location.startsWith(`/transparencia/portal/${companyId}/control/`)) return "controles";
    return "dashboard";
  };
  
  const currentTab = getCurrentTab();
  
  // Si está cargando, mostrar indicador
  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col">
        <Topbar 
          title="Portal de Transparencia" 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <main className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
          </main>
        </div>
      </div>
    );
  }
  
  // Si hay un error o el usuario no está autorizado
  if (isError || (company && !company.isAuthorized)) {
    return (
      <div className="flex h-screen w-full flex-col">
        <Topbar 
          title="Portal de Transparencia" 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <main className="flex-1 overflow-y-auto p-8">
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {isError 
                  ? "Error al cargar el portal de transparencia. Por favor, inténtelo de nuevo."
                  : "No tiene acceso a este portal de transparencia. Contacte con la empresa para obtener acceso."}
              </AlertDescription>
            </Alert>
            <div className="text-center mt-8">
              <Button asChild>
                <div onClick={() => window.location.href = "/transparencia"} className="cursor-pointer">
                  <MailOpen className="mr-2 h-4 w-4" />
                  Volver al selector de portales
                </div>
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen w-full flex-col">
      <Topbar 
        title={`Portal de Transparencia - ${company?.name}`} 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        tabs={tabs}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto">
          <Switch>
            <Route path={`/transparencia/portal/${companyId}`} component={() => <Dashboard companyId={companyId} />} />
            <Route path={`/transparencia/portal/${companyId}/controles`} component={() => <Controles companyId={companyId} />} />
            <Route path={`/transparencia/portal/${companyId}/control/:controlId`} component={ControlDetalle} />
            <Route>
              <Dashboard companyId={companyId} />
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
}