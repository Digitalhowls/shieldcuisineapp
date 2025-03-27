import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, 
  LineChart, 
  PieChart,
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  AreaChart,
  CalendarRange,
} from "lucide-react";
import { format, subMonths, subDays, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

interface AnalysisRequest {
  analysisType: string;
  timeframe: string;
  companyId: number;
  customStartDate?: string;
  customEndDate?: string;
}

interface AnalysisResponse {
  analysis: string;
  insights: string[];
  recommendations: string[];
  dataPoints?: any;
  charts?: any;
}

function PurchaseAnalysis() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("supplier_performance");
  const [timeframe, setTimeframe] = useState("last_month");
  const [customStartDate, setCustomStartDate] = useState<Date>(subMonths(new Date(), 1));
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const analysisMutation = useMutation({
    mutationFn: async (data: AnalysisRequest) => {
      const response = await apiRequest("POST", "/api/purchase-analysis", data);
      return response.json();
    },
    onSuccess: (data: AnalysisResponse) => {
      setAnalysisData(data);
      setIsLoading(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al obtener análisis",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  const performAnalysis = () => {
    setIsLoading(true);
    setAnalysisData(null);
    
    const request: AnalysisRequest = {
      analysisType: activeTab,
      timeframe: timeframe,
      companyId: 1, // TODO: Get from context or store
    };

    if (timeframe === "custom") {
      request.customStartDate = format(customStartDate, "yyyy-MM-dd");
      request.customEndDate = format(customEndDate, "yyyy-MM-dd");
    }

    analysisMutation.mutate(request);
  };

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case "last_month":
        return "Último mes";
      case "last_quarter":
        return "Último trimestre";
      case "last_year":
        return "Último año";
      case "custom":
        return `${format(customStartDate, "dd/MM/yyyy")} - ${format(customEndDate, "dd/MM/yyyy")}`;
      default:
        return "Período de tiempo";
    }
  };

  const renderInsightIcon = (index: number) => {
    const icons = [
      <TrendingUp key="trend-up" className="text-green-500" />,
      <TrendingDown key="trend-down" className="text-amber-500" />,
      <AlertTriangle key="alert" className="text-red-500" />,
      <CheckCircle key="check" className="text-blue-500" />,
      <AreaChart key="chart" className="text-purple-500" />
    ];
    return icons[index % icons.length];
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Análisis de Compras</h1>
            <p className="text-gray-500 mt-1">
              Analiza tendencias y patrones en tus compras con inteligencia artificial
            </p>
          </div>
          <Button 
            onClick={performAnalysis} 
            disabled={isLoading}
            className="mt-4 md:mt-0"
          >
            {isLoading ? "Analizando..." : "Analizar"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Filtros */}
          <div className="md:col-span-3 space-y-6">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Filtros de Análisis</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Tipo de Análisis</h3>
                  <Tabs 
                    value={activeTab} 
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-2 w-full mb-2">
                      <TabsTrigger value="supplier_performance">Proveedores</TabsTrigger>
                      <TabsTrigger value="expense_trends">Gastos</TabsTrigger>
                    </TabsList>
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="inventory_optimization">Inventario</TabsTrigger>
                      <TabsTrigger value="future_needs">Predicción</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-2">Período de Tiempo</h3>
                  <Tabs 
                    value={timeframe} 
                    onValueChange={setTimeframe}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-2 w-full mb-2">
                      <TabsTrigger value="last_month">Último Mes</TabsTrigger>
                      <TabsTrigger value="last_quarter">Último Trimestre</TabsTrigger>
                    </TabsList>
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="last_year">Último Año</TabsTrigger>
                      <TabsTrigger value="custom">Personalizado</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {timeframe === "custom" && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Fecha Inicio</h3>
                      <DatePicker 
                        date={customStartDate} 
                        onSelect={(date) => date && setCustomStartDate(date)}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Fecha Fin</h3>
                      <DatePicker 
                        date={customEndDate} 
                        onSelect={(date) => date && setCustomEndDate(date)}
                      />
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex items-center">
                  <CalendarRange className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">{getTimeframeLabel()}</span>
                </div>
              </div>
            </Card>

            {analysisData && (
              <Card className="p-4">
                <h2 className="text-xl font-semibold mb-4">Recomendaciones</h2>
                <div className="space-y-3">
                  {analysisData.recommendations.map((recommendation, index) => (
                    <div key={index} className="p-3 bg-muted rounded-md text-sm">
                      {recommendation}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Resultados del análisis */}
          <div className="md:col-span-9">
            {isLoading ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                  <p className="text-lg text-gray-500">Analizando datos de compras...</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Esto puede tardar unos segundos mientras nuestra IA procesa la información
                  </p>
                </div>
              </Card>
            ) : analysisData ? (
              <div className="space-y-6">
                {/* Resumen */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Resumen de Análisis</h2>
                  <p className="text-gray-700 whitespace-pre-line">{analysisData.analysis}</p>
                </Card>

                {/* Insights */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Hallazgos Clave</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {analysisData.insights.map((insight, index) => (
                      <div key={index} className="flex items-start p-3 bg-muted rounded-md">
                        <div className="mr-3 mt-1">{renderInsightIcon(index)}</div>
                        <p className="text-gray-700">{insight}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Visualización según el tipo */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    {activeTab === "supplier_performance" && "Rendimiento de Proveedores"}
                    {activeTab === "expense_trends" && "Tendencias de Gastos"}
                    {activeTab === "inventory_optimization" && "Optimización de Inventario"}
                    {activeTab === "future_needs" && "Predicción de Necesidades Futuras"}
                  </h2>
                  
                  {/* Aquí iría la visualización específica para cada tipo de análisis */}
                  {/* Por ahora, simplemente mostramos iconos ilustrativos */}
                  <div className="bg-muted p-6 rounded-md flex justify-center">
                    {activeTab === "supplier_performance" && (
                      <div className="flex flex-col items-center">
                        <BarChart className="h-24 w-24 text-primary mb-4" />
                        <p className="text-gray-500 text-center">
                          Datos de rendimiento de proveedores visualizados con gráficos de barras
                        </p>
                      </div>
                    )}
                    {activeTab === "expense_trends" && (
                      <div className="flex flex-col items-center">
                        <LineChart className="h-24 w-24 text-primary mb-4" />
                        <p className="text-gray-500 text-center">
                          Tendencias de gastos visualizadas con gráficos de líneas
                        </p>
                      </div>
                    )}
                    {activeTab === "inventory_optimization" && (
                      <div className="flex flex-col items-center">
                        <PieChart className="h-24 w-24 text-primary mb-4" />
                        <p className="text-gray-500 text-center">
                          Oportunidades de optimización visualizadas con gráficos circulares
                        </p>
                      </div>
                    )}
                    {activeTab === "future_needs" && (
                      <div className="flex flex-col items-center">
                        <AreaChart className="h-24 w-24 text-primary mb-4" />
                        <p className="text-gray-500 text-center">
                          Predicciones de necesidades futuras visualizadas con gráficos de área
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center justify-center h-64">
                  <BarChart className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-lg text-gray-500">Selecciona los filtros y haz clic en "Analizar"</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Nuestro sistema de IA analizará los datos según los parámetros seleccionados
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default PurchaseAnalysis;