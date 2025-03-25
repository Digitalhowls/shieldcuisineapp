import { useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import Dashboard from "./dashboard";
import Cuentas from "./cuentas";
import CuentaDetalle from "./cuenta-detalle";
import Pagos from "./pagos";
import ConfiguracionBancaria from "./configuracion";
import Categorias from "./categorias";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BanknoteIcon, 
  CircleDollarSignIcon, 
  ArrowLeftRight, 
  Settings, 
  PieChart, 
  LayoutDashboard 
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function BancaModule() {
  const [location] = useLocation();

  // Si estamos en una ruta específica del módulo, mostrar esa página
  if (location !== "/banca") {
    return (
      <Switch>
        <Route path="/banca/dashboard" component={Dashboard} />
        <Route path="/banca/cuentas" component={Cuentas} />
        <Route path="/banca/cuenta/:id" component={CuentaDetalle} />
        <Route path="/banca/pagos" component={Pagos} />
        <Route path="/banca/configuracion" component={ConfiguracionBancaria} />
        <Route path="/banca/categorias" component={Categorias} />
      </Switch>
    );
  }

  // Si estamos en la ruta principal, mostrar el panel de navegación
  return <BancaNavigation />;
}

function BancaNavigation() {
  const [_, navigate] = useLocation();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Gestión Bancaria</h1>
      <p className="text-muted-foreground mb-8">
        Gestione sus cuentas bancarias, realice pagos y analice sus transacciones
      </p>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Vista General</TabsTrigger>
          <TabsTrigger value="accounts">Cuentas</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/banca/dashboard")}>
              <div className="flex flex-col items-center text-center">
                <LayoutDashboard className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-medium">Dashboard</h3>
                <p className="text-muted-foreground mt-2">
                  Visualice todas sus cuentas y transacciones en un solo lugar
                </p>
                <Button className="mt-4" variant="outline" onClick={() => navigate("/banca/dashboard")}>
                  Ver Dashboard
                </Button>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/banca/categorias")}>
              <div className="flex flex-col items-center text-center">
                <PieChart className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-medium">Categorías</h3>
                <p className="text-muted-foreground mt-2">
                  Categorice sus transacciones para un mejor análisis
                </p>
                <Button className="mt-4" variant="outline" onClick={() => navigate("/banca/categorias")}>
                  Gestionar Categorías
                </Button>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/banca/configuracion")}>
              <div className="flex flex-col items-center text-center">
                <Settings className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-medium">Configuración</h3>
                <p className="text-muted-foreground mt-2">
                  Configure sus conexiones bancarias y reglas
                </p>
                <Button className="mt-4" variant="outline" onClick={() => navigate("/banca/configuracion")}>
                  Configurar
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/banca/cuentas")}>
              <div className="flex flex-col items-center text-center">
                <BanknoteIcon className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-medium">Cuentas</h3>
                <p className="text-muted-foreground mt-2">
                  Gestione todas sus cuentas bancarias
                </p>
                <Button className="mt-4" variant="outline" onClick={() => navigate("/banca/cuentas")}>
                  Ver Cuentas
                </Button>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/banca/cuentas")}>
              <div className="flex flex-col items-center text-center">
                <CircleDollarSignIcon className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-medium">Saldos</h3>
                <p className="text-muted-foreground mt-2">
                  Visualice los saldos de todas sus cuentas
                </p>
                <Button className="mt-4" variant="outline" onClick={() => navigate("/banca/cuentas")}>
                  Ver Saldos
                </Button>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/banca/cuenta/1")}>
              <div className="flex flex-col items-center text-center">
                <ArrowLeftRight className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-medium">Transacciones</h3>
                <p className="text-muted-foreground mt-2">
                  Visualice todas sus transacciones bancarias
                </p>
                <Button className="mt-4" variant="outline" onClick={() => navigate("/banca/cuenta/1")}>
                  Ver Transacciones
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/banca/pagos")}>
              <div className="flex flex-col items-center text-center">
                <ArrowLeftRight className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-medium">Iniciar Pago</h3>
                <p className="text-muted-foreground mt-2">
                  Realice pagos desde sus cuentas bancarias
                </p>
                <Button className="mt-4" variant="outline" onClick={() => navigate("/banca/pagos")}>
                  Crear Pago
                </Button>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/banca/pagos")}>
              <div className="flex flex-col items-center text-center">
                <CircleDollarSignIcon className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-medium">Historial de Pagos</h3>
                <p className="text-muted-foreground mt-2">
                  Visualice todos sus pagos realizados
                </p>
                <Button className="mt-4" variant="outline" onClick={() => navigate("/banca/pagos")}>
                  Ver Pagos
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/banca/configuracion")}>
              <div className="flex flex-col items-center text-center">
                <Settings className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-medium">Conexiones Bancarias</h3>
                <p className="text-muted-foreground mt-2">
                  Configure sus conexiones con bancos
                </p>
                <Button className="mt-4" variant="outline" onClick={() => navigate("/banca/configuracion")}>
                  Configurar Conexiones
                </Button>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/banca/categorias")}>
              <div className="flex flex-col items-center text-center">
                <PieChart className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-medium">Reglas de Categorización</h3>
                <p className="text-muted-foreground mt-2">
                  Configure reglas para categorizar automáticamente sus transacciones
                </p>
                <Button className="mt-4" variant="outline" onClick={() => navigate("/banca/categorias")}>
                  Configurar Reglas
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}