import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Download,
  Filter,
  Maximize2,
  RefreshCw,
} from "lucide-react";

// Datos de ejemplo para las estadísticas
const userActivityMonthly = [
  { name: "Ene", activos: 1250, nuevos: 350, bajas: 50 },
  { name: "Feb", activos: 1450, nuevos: 400, bajas: 60 },
  { name: "Mar", activos: 1600, nuevos: 450, bajas: 70 },
  { name: "Abr", activos: 1800, nuevos: 500, bajas: 80 },
  { name: "May", activos: 2000, nuevos: 550, bajas: 90 },
  { name: "Jun", activos: 2200, nuevos: 600, bajas: 100 },
  { name: "Jul", activos: 2400, nuevos: 650, bajas: 110 },
  { name: "Ago", activos: 2600, nuevos: 700, bajas: 120 },
  { name: "Sep", activos: 2800, nuevos: 750, bajas: 130 },
  { name: "Oct", activos: 3000, nuevos: 800, bajas: 140 },
  { name: "Nov", activos: 3200, nuevos: 850, bajas: 150 },
  { name: "Dic", activos: 3400, nuevos: 900, bajas: 160 },
];

const userActivityWeekly = [
  { name: "Lun", activos: 2200, nuevos: 120, bajas: 25 },
  { name: "Mar", activos: 2300, nuevos: 150, bajas: 30 },
  { name: "Mié", activos: 2100, nuevos: 130, bajas: 20 },
  { name: "Jue", activos: 2400, nuevos: 160, bajas: 35 },
  { name: "Vie", activos: 2500, nuevos: 170, bajas: 40 },
  { name: "Sáb", activos: 1800, nuevos: 90, bajas: 15 },
  { name: "Dom", activos: 1500, nuevos: 60, bajas: 10 },
];

const moduleUsageData = [
  { name: "APPCC", valor: 35, trend: "+8%" },
  { name: "Almacén", valor: 25, trend: "+5%" },
  { name: "Banca", valor: 15, trend: "+12%" },
  { name: "E-Learning", valor: 10, trend: "+20%" },
  { name: "CMS", valor: 10, trend: "+15%" },
  { name: "Compras", valor: 5, trend: "+3%" },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const businessTypesData = [
  { name: "Restaurantes", value: 45 },
  { name: "Cafeterías", value: 20 },
  { name: "Panaderías", value: 15 },
  { name: "Hoteles", value: 10 },
  { name: "Supermercados", value: 8 },
  { name: "Otros", value: 2 },
];

const complianceOverTimeData = [
  { month: "Ene", appcc: 75, inventory: 82, banking: 65, elearning: 50 },
  { month: "Feb", appcc: 78, inventory: 85, banking: 68, elearning: 55 },
  { month: "Mar", appcc: 80, inventory: 87, banking: 72, elearning: 60 },
  { month: "Abr", appcc: 82, inventory: 88, banking: 75, elearning: 65 },
  { month: "May", appcc: 85, inventory: 90, banking: 78, elearning: 70 },
  { month: "Jun", appcc: 87, inventory: 92, banking: 82, elearning: 75 },
  { month: "Jul", appcc: 90, inventory: 94, banking: 85, elearning: 80 },
  { month: "Ago", appcc: 92, inventory: 95, banking: 87, elearning: 82 },
  { month: "Sep", appcc: 94, inventory: 96, banking: 90, elearning: 85 },
  { month: "Oct", appcc: 95, inventory: 97, banking: 92, elearning: 87 },
  { month: "Nov", appcc: 97, inventory: 98, banking: 94, elearning: 90 },
  { month: "Dic", appcc: 98, inventory: 99, banking: 95, elearning: 92 },
];

const radarData = [
  { subject: "Usabilidad", A: 120, B: 110, fullMark: 150 },
  { subject: "Funcionalidad", A: 98, B: 130, fullMark: 150 },
  { subject: "Rendimiento", A: 86, B: 130, fullMark: 150 },
  { subject: "Fiabilidad", A: 99, B: 100, fullMark: 150 },
  { subject: "Soporte", A: 85, B: 90, fullMark: 150 },
  { subject: "Satisfacción", A: 65, B: 85, fullMark: 150 },
];

const regionUsersData = [
  { name: "Madrid", usuarios: 850 },
  { name: "Barcelona", usuarios: 750 },
  { name: "Valencia", usuarios: 450 },
  { name: "Sevilla", usuarios: 380 },
  { name: "Bilbao", usuarios: 320 },
  { name: "Málaga", usuarios: 310 },
  { name: "Zaragoza", usuarios: 290 },
  { name: "Otros", usuarios: 560 },
];

export default function StatsPage() {
  const [periodFilter, setPeriodFilter] = useState("month");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [currentTab, setCurrentTab] = useState("usuarios");

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estadísticas</h1>
          <p className="text-muted-foreground">
            Análisis detallado del rendimiento y uso de la plataforma.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Periodo</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="flex items-center gap-1">
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
          
          <Button variant="outline" className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Tabs para diferentes categorías de estadísticas */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:w-auto">
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="modulos">Módulos</TabsTrigger>
          <TabsTrigger value="empresas">Empresas</TabsTrigger>
          <TabsTrigger value="rendimiento">Rendimiento</TabsTrigger>
          <TabsTrigger value="geografico">Geográfico</TabsTrigger>
        </TabsList>

        {/* Panel de Usuarios */}
        <TabsContent value="usuarios" className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Evolución de Usuarios</CardTitle>
                <CardDescription>
                  Detalle mensual de usuarios activos, nuevos registros y bajas
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={periodFilter === "week" ? userActivityWeekly : userActivityMonthly}
                  >
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
                    <Line type="monotone" dataKey="nuevos" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="bajas" stroke="#ff7300" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Métricas Clave</CardTitle>
                <CardDescription>Indicadores actuales de usuarios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Usuarios Activos
                  </div>
                  <div className="text-3xl font-bold">3,428</div>
                  <div className="flex items-center text-sm text-green-500 mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>+8.2% vs mes anterior</span>
                  </div>
                  <div className="h-2 w-full bg-muted mt-2 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "82%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Nuevos Registros
                  </div>
                  <div className="text-3xl font-bold">863</div>
                  <div className="flex items-center text-sm text-green-500 mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>+12.5% vs mes anterior</span>
                  </div>
                  <div className="h-2 w-full bg-muted mt-2 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Tasa de Retención
                  </div>
                  <div className="text-3xl font-bold">94.8%</div>
                  <div className="flex items-center text-sm text-red-500 mt-1">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    <span>-1.2% vs mes anterior</span>
                  </div>
                  <div className="h-2 w-full bg-muted mt-2 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: "94.8%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Panel de Módulos */}
        <TabsContent value="modulos" className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Uso de Módulos</CardTitle>
                <CardDescription>Distribución del uso por módulo</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moduleUsageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="valor"
                    >
                      {moduleUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Cumplimiento por Módulo</CardTitle>
                <CardDescription>
                  Porcentaje de cumplimiento de tareas por módulo a lo largo del tiempo
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={complianceOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="appcc"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="inventory"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="banking"
                      stroke="#ffc658"
                      fill="#ffc658"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="elearning"
                      stroke="#ff7300"
                      fill="#ff7300"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalles por Módulo</CardTitle>
                <CardDescription>Métricas específicas por módulo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {moduleUsageData.map((module, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{module.name}</div>
                        <Badge
                          variant="outline"
                          className={
                            module.trend.startsWith("+")
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }
                        >
                          {module.trend}
                        </Badge>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${module.valor * 2}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {module.valor}% del uso total de la plataforma
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análisis de Tendencias</CardTitle>
                <CardDescription>
                  Comparativa de uso actual vs mes anterior
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={moduleUsageData}
                    margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="valor" fill="#8884d8" name="% de uso" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Panel de Empresas */}
        <TabsContent value="empresas" className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Tipos de Negocios</CardTitle>
                <CardDescription>Distribución por tipo de negocio</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={businessTypesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {businessTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Crecimiento de Empresas</CardTitle>
                <CardDescription>
                  Evolución mensual de empresas activas en la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={complianceOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="appcc"
                      name="Empresas activas"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Tamaño de Empresas</CardTitle>
                <CardDescription>Por número de empleados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>1-10 empleados</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "45%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>11-50 empleados</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "30%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>51-200 empleados</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "15%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>201-500 empleados</span>
                    <span className="font-medium">7%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "7%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>+500 empleados</span>
                    <span className="font-medium">3%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "3%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Adquisición y Retención</CardTitle>
                <CardDescription>
                  Tasa de adquisición y retención de empresas
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={complianceOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="appcc"
                      name="Adquisición"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="inventory"
                      name="Retención"
                      stroke="#82ca9d"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Panel de Rendimiento */}
        <TabsContent value="rendimiento" className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Satisfacción del Usuario</CardTitle>
                <CardDescription>Comparativa de satisfacción actual vs año anterior</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} />
                    <Radar
                      name="2024"
                      dataKey="A"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="2023"
                      dataKey="B"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.6}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tiempos de Respuesta</CardTitle>
                <CardDescription>Rendimiento de la plataforma en milisegundos</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={complianceOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="appcc"
                      name="API"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="inventory"
                      name="Frontend"
                      stroke="#82ca9d"
                    />
                    <Line
                      type="monotone"
                      dataKey="banking"
                      name="Database"
                      stroke="#ffc658"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle>Uso por Dispositivo</CardTitle>
                <CardDescription>
                  Distribución de accesos por tipo de dispositivo y navegador
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userActivityMonthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="activos" name="Desktop" fill="#8884d8" />
                    <Bar dataKey="nuevos" name="Mobile" fill="#82ca9d" />
                    <Bar dataKey="bajas" name="Tablet" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Panel Geográfico */}
        <TabsContent value="geografico" className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Distribución Geográfica</CardTitle>
                <CardDescription>
                  Usuarios por región en España
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={regionUsersData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="usuarios" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Top Ciudades</CardTitle>
                <CardDescription>Por número de usuarios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {regionUsersData.map((region, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{region.name}</div>
                      <Badge variant="outline">{region.usuarios}</Badge>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(region.usuarios / Math.max(...regionUsersData.map(r => r.usuarios))) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Accesos Internacionales</CardTitle>
                <CardDescription>
                  Usuarios accediendo desde fuera de España
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "España", value: 85 },
                        { name: "Francia", value: 5 },
                        { name: "Portugal", value: 3 },
                        { name: "Italia", value: 2 },
                        { name: "Alemania", value: 2 },
                        { name: "Otros", value: 3 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {businessTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horarios de Actividad</CardTitle>
                <CardDescription>
                  Distribución de actividad por hora del día
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { hour: "00:00", users: 120 },
                      { hour: "02:00", users: 80 },
                      { hour: "04:00", users: 40 },
                      { hour: "06:00", users: 90 },
                      { hour: "08:00", users: 280 },
                      { hour: "10:00", users: 520 },
                      { hour: "12:00", users: 680 },
                      { hour: "14:00", users: 520 },
                      { hour: "16:00", users: 480 },
                      { hour: "18:00", users: 380 },
                      { hour: "20:00", users: 320 },
                      { hour: "22:00", users: 240 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}