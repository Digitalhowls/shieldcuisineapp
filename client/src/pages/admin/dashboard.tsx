import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock,
  FileCheck2,
  LogIn,
  ShieldCheck,
  Building2,
  ListChecks,
} from "lucide-react";

// Datos de ejemplo para gráficos (en producción, estos vendrían de la API)
const userActivity = [
  { name: "Lun", activos: 120, logins: 145 },
  { name: "Mar", activos: 132, logins: 167 },
  { name: "Mié", activos: 101, logins: 125 },
  { name: "Jue", activos: 134, logins: 156 },
  { name: "Vie", activos: 90, logins: 107 },
  { name: "Sáb", activos: 30, logins: 42 },
  { name: "Dom", activos: 20, logins: 27 },
];

const moduleUsage = [
  { name: "APPCC", valor: 35 },
  { name: "Almacén", valor: 25 },
  { name: "Banca", valor: 15 },
  { name: "E-Learning", valor: 10 },
  { name: "CMS", valor: 10 },
  { name: "Compras", valor: 5 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const companyStats = [
  { name: "Mar 1", activas: 24 },
  { name: "Mar 7", activas: 28 },
  { name: "Mar 14", activas: 36 },
  { name: "Mar 21", activas: 42 },
  { name: "Mar 28", activas: 47 },
];

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Monitorea el uso de la plataforma y las estadísticas de clientes.
          </p>
        </div>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <TabsList>
            <TabsTrigger value="day">Día</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mes</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Primera fila - KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Activas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <div className="flex items-center text-xs text-green-500">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+12% este mes</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,856</div>
            <div className="flex items-center text-xs text-green-500">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+5.2% esta semana</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inicios de Sesión</CardTitle>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">769</div>
            <div className="flex items-center text-xs text-green-500">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+14% hoy</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Controles Completados</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,428</div>
            <div className="flex items-center text-xs text-green-500">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+5.3% esta semana</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segunda fila - Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Actividad de Usuarios</CardTitle>
            <CardDescription>Usuarios activos y logins durante la última semana</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="activos"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line type="monotone" dataKey="logins" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Uso de Módulos</CardTitle>
            <CardDescription>Distribución de uso por módulo en la plataforma</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moduleUsage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {moduleUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tercera fila - Más datos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Crecimiento de Empresas</CardTitle>
            <CardDescription>Nuevas empresas registradas en el último mes</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="activas" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Últimas Acciones</CardTitle>
            <CardDescription>Actividad reciente en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="mr-2 mt-0.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Restaurante La Marina acaba de completar 5 controles</p>
                  <p className="text-xs text-muted-foreground">Hace 5 minutos</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-2 mt-0.5">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">3 nuevos usuarios registrados en Cafetería Sol</p>
                  <p className="text-xs text-muted-foreground">Hace 12 minutos</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-2 mt-0.5">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Supermercado Fresco actualizó sus plantillas APPCC</p>
                  <p className="text-xs text-muted-foreground">Hace 24 minutos</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-2 mt-0.5">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Nueva empresa registrada: Panadería Dorada</p>
                  <p className="text-xs text-muted-foreground">Hace 1 hora</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Ver todas las actividades</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}