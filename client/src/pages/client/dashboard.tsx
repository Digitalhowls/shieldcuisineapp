import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ShieldCheck, 
  Warehouse, 
  ShoppingBag, 
  AlertCircle,
  CheckCircle2, 
  Clock,
  ClipboardList,
  Thermometer,
  Users,
  ArrowUpRight,
  Calendar
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function ClientDashboard() {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  // Datos de ejemplo para el panel de cliente
  const pendingControls = [
    { id: 1, name: "Temperatura Cámaras", deadline: "10:30", priority: "high" },
    { id: 2, name: "Control Recepción", deadline: "13:00", priority: "medium" },
    { id: 3, name: "Limpieza Superficies", deadline: "16:30", priority: "low" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {user?.name}</h1>
          <p className="text-muted-foreground">{today}</p>
        </div>
        <Button className="hidden sm:flex">
          <Calendar className="mr-2 h-4 w-4" />
          Planificar mi día
        </Button>
      </div>

      {/* Primera fila - Alertas y Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-1 md:col-span-2 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>Tu Jornada de Hoy</CardTitle>
            <CardDescription>
              Controles pendientes y tareas programadas
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {pendingControls.map((control) => (
                <div key={control.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className={`w-2 h-2 rounded-full mr-4 ${
                        control.priority === "high" 
                          ? "bg-red-500" 
                          : control.priority === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    />
                    <div>
                      <div className="font-medium">{control.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Realizar antes de {control.deadline}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm">Completar</Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 border-t">
            <div className="text-sm text-muted-foreground w-full flex justify-between items-center">
              <div>
                <span className="font-medium">3</span> controles pendientes hoy
              </div>
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Cumplimiento APPCC</CardTitle>
            <CardDescription>
              Estado actual del sistema de autocontrol
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Thermometer className="h-4 w-4 mr-1 text-blue-500" />
                    <span>Temperaturas</span>
                  </div>
                  <span className="font-medium">93%</span>
                </div>
                <Progress value={93} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <ClipboardList className="h-4 w-4 mr-1 text-green-500" />
                    <span>Registros Diarios</span>
                  </div>
                  <span className="font-medium">87%</span>
                </div>
                <Progress value={87} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-purple-500" />
                    <span>Formación</span>
                  </div>
                  <span className="font-medium">76%</span>
                </div>
                <Progress value={76} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" size="sm">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Ver plan APPCC completo
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Segunda fila - Accesos rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="p-4">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Control APPCC</CardTitle>
                <CardDescription>Gestión de autocontrol</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardFooter className="p-4 pt-0 flex justify-between">
            <div className="text-sm font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-1 text-yellow-500" />
              3 pendientes hoy
            </div>
            <Button variant="ghost" size="sm">
              Acceder
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="p-4">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Warehouse className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Almacén</CardTitle>
                <CardDescription>Control de inventario</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardFooter className="p-4 pt-0 flex justify-between">
            <div className="text-sm font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
              2 productos críticos
            </div>
            <Button variant="ghost" size="sm">
              Acceder
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="p-4">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Compras</CardTitle>
                <CardDescription>Órdenes en curso</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardFooter className="p-4 pt-0 flex justify-between">
            <div className="text-sm font-medium flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
              2 recibidas hoy
            </div>
            <Button variant="ghost" size="sm">
              Acceder
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Tercera fila - Actividad reciente */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas acciones en su negocio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            <div className="flex">
              <Avatar className="h-9 w-9 mr-3">
                <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
                <AvatarFallback>MS</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  María Sánchez completó el control <span className="text-primary">Temperaturas Cámaras</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Hace 35 minutos
                </p>
              </div>
            </div>
            
            <div className="flex">
              <Avatar className="h-9 w-9 mr-3">
                <AvatarImage src="/placeholder-user-2.jpg" alt="Avatar" />
                <AvatarFallback>JR</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  Juan Rodríguez recibió pedido de <span className="text-primary">Productos Lácteos S.L.</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Hace 1 hora
                </p>
              </div>
            </div>
            
            <div className="flex">
              <Avatar className="h-9 w-9 mr-3">
                <AvatarImage src="/placeholder-user-3.jpg" alt="Avatar" />
                <AvatarFallback>CL</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  Carmen López actualizó el inventario de <span className="text-primary">Carnes</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Hace 2 horas
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">Ver todo el historial</Button>
        </CardFooter>
      </Card>
    </div>
  );
}