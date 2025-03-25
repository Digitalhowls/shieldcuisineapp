import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, 
  PieChart, 
  Pie, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line 
} from "recharts";
import { 
  Calendar,
  ChartBar,
  CircleHelp,
  FileText,
  Filter,
  PieChart as PieChartIcon,
  Settings,
  Download,
  Printer,
  Clock
} from "lucide-react";
import { format, subDays, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange, DateRangePicker } from "@/components/ui/date-range-picker";

// Sample data for charts
const complianceByAreaData = [
  { name: "Cocina", compliance: 94 },
  { name: "Almacén", compliance: 88 },
  { name: "Zonas Comunes", compliance: 98 },
  { name: "Zona Preparación", compliance: 85 },
  { name: "Cámaras", compliance: 92 }
];

const complianceByDayData = [
  { name: "Lun", completed: 12, total: 12, compliance: 100 },
  { name: "Mar", completed: 11, total: 12, compliance: 91.7 },
  { name: "Mié", completed: 10, total: 12, compliance: 83.3 },
  { name: "Jue", completed: 12, total: 12, compliance: 100 },
  { name: "Vie", completed: 11, total: 12, compliance: 91.7 },
  { name: "Sáb", completed: 9, total: 10, compliance: 90 },
  { name: "Dom", completed: 8, total: 8, compliance: 100 }
];

const statusDistributionData = [
  { name: "Completados", value: 342, color: "#2ECC71" },
  { name: "Pendientes", value: 18, color: "#F39C12" },
  { name: "Retrasados", value: 5, color: "#E74C3C" }
];

const complianceTrendData = Array.from({ length: 30 }, (_, i) => {
  const date = subDays(new Date(), 29 - i);
  return {
    date: format(date, "dd/MM"),
    compliance: Math.floor(Math.random() * 15) + 85 // Random value between 85-100
  };
});

export default function Reports() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [reportType, setReportType] = useState<string>("monthly");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  
  const handleGenerateReport = () => {
    toast({
      title: "Generando informe",
      description: "El informe se está generando. Estará disponible en breve.",
    });
  };
  
  const handleExportReport = (format: string) => {
    toast({
      title: `Exportando a ${format}`,
      description: `El informe está siendo exportado a ${format}.`,
    });
  };
  
  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with title and actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-800">Informes APPCC</h2>
            <p className="text-neutral-500">
              Análisis y estadísticas de cumplimiento normativo
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
            <Button variant="outline" className="flex items-center" onClick={() => handleExportReport("PDF")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>PDF</span>
            </Button>
            <Button variant="outline" className="flex items-center" onClick={() => handleExportReport("Excel")}>
              <Download className="mr-2 h-4 w-4" />
              <span>Excel</span>
            </Button>
            <Button variant="outline" className="flex items-center" onClick={() => handleExportReport("Impresión")}>
              <Printer className="mr-2 h-4 w-4" />
              <span>Imprimir</span>
            </Button>
          </div>
        </div>
        
        {/* Report configuration */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="report-type" className="text-xs mb-2 block">Tipo de Informe</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Seleccione tipo de informe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs mb-2 block">Rango de fechas</Label>
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  locale={es}
                  placeholder="Seleccionar rango"
                  align="start"
                  className="w-full"
                />
              </div>
              
              <div className="flex items-end">
                <Button className="w-full" onClick={handleGenerateReport}>
                  Generar Informe
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Report content */}
        <div>
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Vista General</TabsTrigger>
              <TabsTrigger value="compliance">Cumplimiento</TabsTrigger>
              <TabsTrigger value="areas">Por Áreas</TabsTrigger>
              <TabsTrigger value="trends">Tendencias</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Tasa de Cumplimiento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="text-3xl font-bold text-success">93.7%</div>
                      <div className="ml-2 px-2 py-1 text-xs bg-success bg-opacity-10 text-success rounded-full">
                        <i className="fas fa-arrow-up mr-1"></i>2.4%
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">vs. período anterior</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Controles Completados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="text-3xl font-bold">342</div>
                      <div className="ml-2 px-2 py-1 text-xs bg-neutral-100 text-neutral-700 rounded-full">
                        de 365
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">en el período seleccionado</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Tiempo Promedio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="text-3xl font-bold">12.5</div>
                      <div className="ml-2 px-2 py-1 text-xs bg-info bg-opacity-10 text-info rounded-full">
                        minutos
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">por control completado</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Status Distribution Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Distribución de Estados</CardTitle>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Distribución de controles por estado en el período seleccionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} controles`, ""]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Compliance by Day of Week */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Cumplimiento por Día de la Semana</CardTitle>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Tasa de cumplimiento diario en el período seleccionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={complianceByDayData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis 
                          yAxisId="left"
                          orientation="left"
                          label={{ value: "Controles", angle: -90, position: "insideLeft" }}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          label={{ value: "Cumplimiento (%)", angle: 90, position: "insideRight" }}
                          domain={[0, 100]}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="completed" name="Completados" fill="#4D94DB" />
                        <Bar yAxisId="left" dataKey="total" name="Total" fill="#CBD5E1" />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="compliance"
                          name="% Cumplimiento"
                          stroke="#0066CC"
                          strokeWidth={2}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Compliance Tab */}
            <TabsContent value="compliance" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Evolución del Cumplimiento</CardTitle>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Tendencia de la tasa de cumplimiento durante el período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={complianceTrendData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[80, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="compliance"
                          name="% Cumplimiento"
                          stroke="#0066CC"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cumplimiento por Tipo de Control</CardTitle>
                    <CardDescription>
                      Comparativa por tipo de control
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={[
                            { name: "Temperatura", compliance: 98 },
                            { name: "Limpieza", compliance: 92 },
                            { name: "Recepción", compliance: 87 },
                            { name: "Verificación", compliance: 95 },
                            { name: "Documentación", compliance: 91 },
                          ]}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 80,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip formatter={(value) => [`${value}%`, "Cumplimiento"]} />
                          <Bar dataKey="compliance" fill="#0066CC" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Estado de Cumplimiento</CardTitle>
                    <CardDescription>
                      Distribución por nivel de cumplimiento
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Cumplimiento total", value: 285, color: "#2ECC71" },
                              { name: "Cumplimiento parcial", value: 57, color: "#F39C12" },
                              { name: "Incumplimiento", value: 23, color: "#E74C3C" },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              { name: "Cumplimiento total", value: 285, color: "#2ECC71" },
                              { name: "Cumplimiento parcial", value: 57, color: "#F39C12" },
                              { name: "Incumplimiento", value: 23, color: "#E74C3C" },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} controles`, ""]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Areas Tab */}
            <TabsContent value="areas" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Cumplimiento por Área</CardTitle>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Análisis de cumplimiento por área del establecimiento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={complianceByAreaData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => [`${value}%`, "Cumplimiento"]} />
                        <Bar dataKey="compliance" fill="#0066CC">
                          {complianceByAreaData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.compliance >= 90 ? "#2ECC71" : entry.compliance >= 85 ? "#F39C12" : "#E74C3C"} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Incidencias por Área</CardTitle>
                    <CardDescription>
                      Número de incidencias registradas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={[
                            { name: "Cocina", incidencias: 5 },
                            { name: "Almacén", incidencias: 8 },
                            { name: "Zonas Comunes", incidencias: 2 },
                            { name: "Zona Preparación", incidencias: 12 },
                            { name: "Cámaras", incidencias: 7 },
                          ]}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 80,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip />
                          <Bar dataKey="incidencias" fill="#E74C3C" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Tiempos de Resolución</CardTitle>
                    <CardDescription>
                      Tiempo promedio para resolver incidencias (horas)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={[
                            { name: "Cocina", tiempo: 3.2 },
                            { name: "Almacén", tiempo: 5.7 },
                            { name: "Zonas Comunes", tiempo: 2.1 },
                            { name: "Zona Preparación", tiempo: 4.3 },
                            { name: "Cámaras", tiempo: 1.8 },
                          ]}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 80,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip formatter={(value) => [`${value} horas`, "Tiempo"]} />
                          <Bar dataKey="tiempo" fill="#3498DB" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Evolución Histórica del Cumplimiento</CardTitle>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Tendencia mensual de la tasa de cumplimiento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { mes: "Ene", cumplimiento: 87.3 },
                          { mes: "Feb", cumplimiento: 88.9 },
                          { mes: "Mar", cumplimiento: 90.1 },
                          { mes: "Abr", cumplimiento: 89.5 },
                          { mes: "May", cumplimiento: 91.2 },
                          { mes: "Jun", cumplimiento: 92.8 },
                          { mes: "Jul", cumplimiento: 91.9 },
                          { mes: "Ago", cumplimiento: 92.2 },
                          { mes: "Sep", cumplimiento: 93.5 },
                          { mes: "Oct", cumplimiento: 93.7 },
                          { mes: "Nov", cumplimiento: 94.1 },
                          { mes: "Dic", cumplimiento: 94.8 },
                        ]}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis domain={[85, 100]} />
                        <Tooltip formatter={(value) => [`${value}%`, "Cumplimiento"]} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="cumplimiento"
                          name="% Cumplimiento"
                          stroke="#0066CC"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Análisis de Tiempos</CardTitle>
                    <CardDescription>
                      Evolución del tiempo promedio por tipo de control
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { mes: "Ene", temperatura: 8.3, limpieza: 15.2, recepcion: 22.4 },
                            { mes: "Feb", temperatura: 7.9, limpieza: 14.8, recepcion: 21.9 },
                            { mes: "Mar", temperatura: 8.1, limpieza: 13.9, recepcion: 20.5 },
                            { mes: "Abr", temperatura: 7.7, limpieza: 14.2, recepcion: 19.8 },
                            { mes: "May", temperatura: 7.5, limpieza: 13.5, recepcion: 19.2 },
                            { mes: "Jun", temperatura: 7.2, limpieza: 13.0, recepcion: 18.7 },
                          ]}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="mes" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value} min`, ""]} />
                          <Legend />
                          <Line type="monotone" dataKey="temperatura" name="Temperatura" stroke="#0066CC" />
                          <Line type="monotone" dataKey="limpieza" name="Limpieza" stroke="#00A389" />
                          <Line type="monotone" dataKey="recepcion" name="Recepción" stroke="#FF6B35" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Evolución de Incidencias</CardTitle>
                    <CardDescription>
                      Tendencia mensual de incidencias registradas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { mes: "Ene", criticas: 8, leves: 15 },
                            { mes: "Feb", criticas: 6, leves: 12 },
                            { mes: "Mar", criticas: 7, leves: 10 },
                            { mes: "Abr", criticas: 5, leves: 11 },
                            { mes: "May", criticas: 4, leves: 9 },
                            { mes: "Jun", criticas: 3, leves: 8 },
                          ]}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="mes" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="criticas" name="Incidencias críticas" fill="#E74C3C" />
                          <Bar dataKey="leves" name="Incidencias leves" fill="#F39C12" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Análisis Predictivo</CardTitle>
                  <CardDescription>
                    Estimación de tendencias futuras basadas en datos históricos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4">
                    <CircleHelp className="h-4 w-4" />
                    <AlertDescription>
                      El análisis predictivo se basa en los datos históricos y puede variar según las condiciones reales.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { mes: "Jul", real: 91.9, prediccion: null },
                          { mes: "Ago", real: 92.2, prediccion: null },
                          { mes: "Sep", real: 93.5, prediccion: null },
                          { mes: "Oct", real: 93.7, prediccion: null },
                          { mes: "Nov", real: 94.1, prediccion: null },
                          { mes: "Dic", real: 94.8, prediccion: null },
                          { mes: "Ene", real: null, prediccion: 95.1 },
                          { mes: "Feb", real: null, prediccion: 95.3 },
                          { mes: "Mar", real: null, prediccion: 95.5 },
                          { mes: "Abr", real: null, prediccion: 95.7 },
                          { mes: "May", real: null, prediccion: 95.9 },
                          { mes: "Jun", real: null, prediccion: 96.2 },
                        ]}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis domain={[90, 100]} />
                        <Tooltip formatter={(value) => value ? [`${value}%`, ""] : ["-", ""]} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="real"
                          name="Cumplimiento real"
                          stroke="#0066CC"
                          strokeWidth={2}
                          connectNulls
                        />
                        <Line
                          type="monotone"
                          dataKey="prediccion"
                          name="Cumplimiento predicho"
                          stroke="#0066CC"
                          strokeWidth={2}
                          strokeDasharray="3 3"
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
