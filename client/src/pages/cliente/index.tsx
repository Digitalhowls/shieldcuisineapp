import { useState, useEffect } from "react";
import { Route, Switch, useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, 
  ChevronRight, 
  Building,
  LayoutDashboard,
  ClipboardCheck,
  Info,
  Loader2
} from "lucide-react";
import Dashboard from "./dashboard";
import Controles from "./controles";
import ControlDetalle from "./control-detalle";
import { useClientAuth, ClientAuthProvider } from "@/hooks/use-client-auth";

// Contenedor con el provider de autenticación
export default function ClientePortalContainer() {
  return (
    <ClientAuthProvider>
      <ClientePortal />
    </ClientAuthProvider>
  );
}

// Interfaz principal del portal de cliente
function ClientePortal() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');
  const empresa = searchParams.get('empresa');
  
  const { 
    isLoading, 
    isAuthenticated, 
    error, 
    validateToken, 
    companyId, 
    companyName 
  } = useClientAuth();
  
  // Verificar acceso en la carga inicial
  useEffect(() => {
    // Si ya está autenticado o en proceso de carga, no hacer nada
    if (isAuthenticated || isLoading === true) return;
    
    if (token && empresa) {
      const companyId = parseInt(empresa);
      if (!isNaN(companyId)) {
        validateToken(token, companyId);
      }
    }
  }, [token, empresa, isAuthenticated, isLoading, validateToken]);
  
  // Mostrar pantalla de carga mientras se verifica
  if (isLoading) {
    return <PantallaCarga />;
  }
  
  // Si no está autenticado, mostrar error
  if (!isAuthenticated) {
    return <AccesoDenegado motivo={error || "Acceso no autorizado"} />;
  }
  
  // Determinar si estamos en una vista hija del cliente
  const isInSubroute = location !== "/cliente" && 
                      !location.includes("?") && 
                      !location.endsWith("/cliente");
  
  // Renderizar interfaz principal
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Barra de navegación superior */}
      <header className="bg-white border-b py-4 px-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Building className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-xl font-semibold">
              {companyName ? `Portal de ${companyName}` : 'Portal de Seguridad Alimentaria'}
            </h1>
          </div>
          
          {/* Mostrar botón de volver en subrutas */}
          {isInSubroute && (
            <Button 
              variant="outline"
              asChild
            >
              <Link href="/cliente">
                Volver al inicio
              </Link>
            </Button>
          )}
        </div>
      </header>
      
      {/* Contenido principal */}
      <main className="container mx-auto py-6 px-4 flex-1">
        <Switch>
          <Route path="/cliente">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 text-sm mb-4">
                    Resumen general del estado de seguridad alimentaria y controles recientes.
                  </p>
                  <Button 
                    className="w-full" 
                    asChild
                  >
                    <Link href="/cliente/dashboard">
                      Acceder <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Controles APPCC</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 text-sm mb-4">
                    Listado completo de controles de seguridad alimentaria realizados.
                  </p>
                  <Button 
                    className="w-full" 
                    asChild
                  >
                    <Link href="/cliente/controles">
                      Acceder <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Información</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 text-sm mb-4">
                    Documentación y certificaciones de seguridad alimentaria.
                  </p>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    asChild
                  >
                    <Link href="/cliente/informacion">
                      Acceder <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </Route>
          
          <Route path="/cliente/dashboard">
            <Dashboard empresaId={companyId || 0} />
          </Route>
          
          <Route path="/cliente/controles">
            <Controles empresaId={companyId || 0} />
          </Route>
          
          <Route path="/cliente/control/:controlId">
            <ControlDetalle />
          </Route>
          
          <Route path="/cliente/informacion">
            <div className="max-w-3xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Información y Certificaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Esta sección contendrá información detallada sobre las certificaciones 
                    y políticas de seguridad alimentaria de la empresa.
                  </p>
                  <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Próximamente disponible.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </Route>
        </Switch>
      </main>
      
      {/* Pie de página */}
      <footer className="bg-white border-t py-4 px-6">
        <div className="container mx-auto text-center text-neutral-500 text-sm">
          <p>Portal de Transparencia ShieldCuisine &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

// Componente de pantalla de carga
function PantallaCarga() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50">
      <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
      <h2 className="text-xl font-medium mb-2">Cargando portal</h2>
      <p className="text-neutral-500">Verificando sus credenciales...</p>
    </div>
  );
}

// Componente de acceso denegado
function AccesoDenegado({ motivo }: { motivo: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="bg-red-100 p-3 rounded-full inline-flex mb-4">
          <AlertCircle className="h-10 w-10 text-error" />
        </div>
        <h2 className="text-xl font-medium mb-2">Acceso denegado</h2>
        <p className="text-neutral-600 mb-6">{motivo}</p>
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}