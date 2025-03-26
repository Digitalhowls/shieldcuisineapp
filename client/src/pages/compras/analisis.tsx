import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Loader2, AlertTriangle, LineChart, TrendingUp, ShoppingBag, FileBarChart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

// Esquema de validación para el formulario
const analysisFormSchema = z.object({
  analysisType: z.enum(['supplier_performance', 'expense_trends', 'inventory_optimization', 'future_needs'], {
    required_error: 'Por favor selecciona un tipo de análisis.',
  }),
  timeframe: z.enum(['last_month', 'last_quarter', 'last_year', 'custom'], {
    required_error: 'Por favor selecciona un período de tiempo.',
  }),
  customStartDate: z.date().optional(),
  customEndDate: z.date().optional(),
  supplierId: z.string().optional(),
  warehouseId: z.string().optional(),
});

// Colores para gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalisisCompras() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('supplier_performance');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Consulta para obtener proveedores
  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  // Consulta para obtener almacenes
  const { data: warehouses, isLoading: isLoadingWarehouses } = useQuery({
    queryKey: ['/api/warehouses'],
  });

  // Configurar el formulario
  const form = useForm<z.infer<typeof analysisFormSchema>>({
    resolver: zodResolver(analysisFormSchema),
    defaultValues: {
      analysisType: 'supplier_performance',
      timeframe: 'last_month',
    },
    mode: 'onChange',
  });

  // Observar cambios en el tipo de análisis para actualizar la pestaña activa
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'analysisType' && value.analysisType) {
        setActiveTab(value.analysisType as string);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Mutación para enviar la solicitud de análisis
  const analysisMutation = useMutation({
    mutationFn: async (data: z.infer<typeof analysisFormSchema>) => {
      // Convertir IDs de string a number donde sea necesario
      const formattedData = {
        ...data,
        supplierId: data.supplierId ? parseInt(data.supplierId, 10) : undefined,
        warehouseId: data.warehouseId ? parseInt(data.warehouseId, 10) : undefined,
        // Formatear fechas para envío a la API
        customStartDate: data.customStartDate ? data.customStartDate.toISOString().split('T')[0] : undefined,
        customEndDate: data.customEndDate ? data.customEndDate.toISOString().split('T')[0] : undefined,
      };
      
      const response = await apiRequest('POST', '/api/purchase-analysis', formattedData);
      return await response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast({
        title: 'Análisis completado',
        description: 'El análisis de compras ha sido generado correctamente.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error en el análisis',
        description: `No se pudo completar el análisis: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Manejar envío del formulario
  function onSubmit(values: z.infer<typeof analysisFormSchema>) {
    // Validar fechas personalizadas si el período es personalizado
    if (values.timeframe === 'custom') {
      if (!values.customStartDate || !values.customEndDate) {
        toast({
          title: 'Fechas requeridas',
          description: 'Para análisis personalizados, debes seleccionar fechas de inicio y fin.',
          variant: 'destructive',
        });
        return;
      }
    }
    
    analysisMutation.mutate(values);
  }

  // Renderizar gráficos según el tipo de análisis y los datos disponibles
  const renderCharts = () => {
    if (!analysisResult || !analysisResult.dataPoints) return null;
    
    switch (activeTab) {
      case 'supplier_performance':
        if (!Array.isArray(analysisResult.dataPoints)) return null;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Monto Total por Proveedor</CardTitle>
                <CardDescription>Comparación de gasto total por proveedor</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysisResult.dataPoints}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalAmount" fill="#8884d8" name="Monto Total" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Cantidad de Órdenes por Proveedor</CardTitle>
                <CardDescription>Distribución de órdenes por proveedor</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analysisResult.dataPoints}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="ordersCount"
                    >
                      {analysisResult.dataPoints.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'expense_trends':
        if (!analysisResult.dataPoints.monthlyExpenses) return null;
        
        // Convertir datos de objeto a array para gráficos
        const monthlyData = Object.entries(analysisResult.dataPoints.monthlyExpenses).map(([month, amount]) => ({
          month,
          amount,
        }));
        
        const categoryData = Object.entries(analysisResult.dataPoints.categoryExpenses || {}).map(([category, amount]) => ({
          category,
          amount,
        }));
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gastos Mensuales</CardTitle>
                <CardDescription>Evolución de gastos a lo largo del tiempo</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="amount" stroke="#8884d8" fill="#8884d8" name="Monto" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoría</CardTitle>
                <CardDescription>Distribución de gastos por categoría de producto</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                      nameKey="category"
                    >
                      {categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'inventory_optimization':
      case 'future_needs':
        if (!Array.isArray(analysisResult.dataPoints)) return null;
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Rotación de Inventario</CardTitle>
                <CardDescription>Tasa de rotación por producto</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysisResult.dataPoints}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="turnoverRate" fill="#82ca9d" name="Tasa de Rotación" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Stock Actual vs. Promedio de Compra</CardTitle>
                <CardDescription>Comparación de niveles actuales y demanda</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysisResult.dataPoints}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="currentStock" fill="#8884d8" name="Stock Actual" />
                    <Bar dataKey="averageMonthlyQuantity" fill="#82ca9d" name="Promedio Mensual" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Renderizar sección de resultados del análisis
  const renderAnalysisResults = () => {
    if (analysisMutation.isPending) {
      return (
        <div className="mt-8">
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Generando análisis con IA...</h3>
              <p className="text-muted-foreground mt-2">
                Estamos procesando los datos y generando insights inteligentes.
                <br />Esto puede tomar unos momentos.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (analysisMutation.isError) {
      return (
        <Alert variant="destructive" className="mt-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error en el análisis</AlertTitle>
          <AlertDescription>
            No se pudo completar el análisis. {analysisMutation.error.message}
          </AlertDescription>
        </Alert>
      );
    }

    if (!analysisResult) return null;

    return (
      <div className="mt-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Datos</CardTitle>
            <CardDescription>
              Resultados generados mediante IA basados en datos de compras
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Resumen del análisis</h3>
              <p className="text-muted-foreground whitespace-pre-line">{analysisResult.analysis}</p>
            </div>

            {analysisResult.insights && analysisResult.insights.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Insights clave</h3>
                <ul className="space-y-2 list-disc list-inside">
                  {analysisResult.insights.map((insight: string, index: number) => (
                    <li key={index} className="text-muted-foreground">{insight}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Recomendaciones</h3>
                <ul className="space-y-2 list-disc list-inside">
                  {analysisResult.recommendations.map((recommendation: string, index: number) => (
                    <li key={index} className="text-muted-foreground">{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {renderCharts()}
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Análisis de Compras</h1>
            <p className="text-muted-foreground">
              Analiza tendencias, optimiza inventario y mejora decisiones de compra con inteligencia artificial
            </p>
          </div>
          <FileBarChart className="h-10 w-10 text-primary" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuración del Análisis</CardTitle>
            <CardDescription>
              Selecciona el tipo de análisis y período de tiempo para generar insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
                <TabsTrigger value="supplier_performance" onClick={() => form.setValue('analysisType', 'supplier_performance')}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Rendimiento de Proveedores</span>
                  <span className="sm:hidden">Proveedores</span>
                </TabsTrigger>
                <TabsTrigger value="expense_trends" onClick={() => form.setValue('analysisType', 'expense_trends')}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Tendencias de Gastos</span>
                  <span className="sm:hidden">Gastos</span>
                </TabsTrigger>
                <TabsTrigger value="inventory_optimization" onClick={() => form.setValue('analysisType', 'inventory_optimization')}>
                  <LineChart className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Optimización de Inventario</span>
                  <span className="sm:hidden">Inventario</span>
                </TabsTrigger>
                <TabsTrigger value="future_needs" onClick={() => form.setValue('analysisType', 'future_needs')}>
                  <FileBarChart className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Predicción de Necesidades</span>
                  <span className="sm:hidden">Predicción</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="supplier_performance" className="mt-0">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="timeframe"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Período de Análisis</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar período" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="last_month">Último mes</SelectItem>
                                <SelectItem value="last_quarter">Último trimestre</SelectItem>
                                <SelectItem value="last_year">Último año</SelectItem>
                                <SelectItem value="custom">Personalizado</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Período de tiempo para el análisis
                            </FormDescription>
                          </FormItem>
                        )}
                      />

                      {form.watch('timeframe') === 'custom' && (
                        <>
                          <FormField
                            control={form.control}
                            name="customStartDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Fecha Inicio</FormLabel>
                                <DatePicker 
                                  date={field.value} 
                                  setDate={field.onChange}
                                  disabled={(date) => date > new Date()}
                                />
                                <FormDescription>
                                  Inicio del período de análisis
                                </FormDescription>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="customEndDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Fecha Fin</FormLabel>
                                <DatePicker 
                                  date={field.value} 
                                  setDate={field.onChange}
                                  disabled={(date) => {
                                    const startDate = form.getValues('customStartDate');
                                    return date > new Date() || (startDate && date < startDate);
                                  }}
                                />
                                <FormDescription>
                                  Fin del período de análisis
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <FormField
                        control={form.control}
                        name="supplierId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Proveedor (Opcional)</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Todos los proveedores" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">Todos los proveedores</SelectItem>
                                {isLoadingSuppliers ? (
                                  <SelectItem value="" disabled>Cargando proveedores...</SelectItem>
                                ) : (
                                  suppliers?.map((supplier: any) => (
                                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                      {supplier.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Filtrar análisis por proveedor específico
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full md:w-auto"
                      disabled={analysisMutation.isPending || !form.formState.isValid}
                    >
                      {analysisMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Generar Análisis
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="expense_trends" className="mt-0">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="timeframe"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Período de Análisis</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar período" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="last_month">Último mes</SelectItem>
                                <SelectItem value="last_quarter">Último trimestre</SelectItem>
                                <SelectItem value="last_year">Último año</SelectItem>
                                <SelectItem value="custom">Personalizado</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Período de tiempo para el análisis
                            </FormDescription>
                          </FormItem>
                        )}
                      />

                      {form.watch('timeframe') === 'custom' && (
                        <>
                          <FormField
                            control={form.control}
                            name="customStartDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Fecha Inicio</FormLabel>
                                <DatePicker 
                                  date={field.value} 
                                  setDate={field.onChange}
                                  disabled={(date) => date > new Date()}
                                />
                                <FormDescription>
                                  Inicio del período de análisis
                                </FormDescription>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="customEndDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Fecha Fin</FormLabel>
                                <DatePicker 
                                  date={field.value} 
                                  setDate={field.onChange}
                                  disabled={(date) => {
                                    const startDate = form.getValues('customStartDate');
                                    return date > new Date() || (startDate && date < startDate);
                                  }}
                                />
                                <FormDescription>
                                  Fin del período de análisis
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full md:w-auto"
                      disabled={analysisMutation.isPending || !form.formState.isValid}
                    >
                      {analysisMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Generar Análisis
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="inventory_optimization" className="mt-0">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="timeframe"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Período de Análisis</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar período" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="last_month">Último mes</SelectItem>
                                <SelectItem value="last_quarter">Último trimestre</SelectItem>
                                <SelectItem value="last_year">Último año</SelectItem>
                                <SelectItem value="custom">Personalizado</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Período de tiempo para el análisis
                            </FormDescription>
                          </FormItem>
                        )}
                      />

                      {form.watch('timeframe') === 'custom' && (
                        <>
                          <FormField
                            control={form.control}
                            name="customStartDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Fecha Inicio</FormLabel>
                                <DatePicker 
                                  date={field.value} 
                                  setDate={field.onChange}
                                  disabled={(date) => date > new Date()}
                                />
                                <FormDescription>
                                  Inicio del período de análisis
                                </FormDescription>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="customEndDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Fecha Fin</FormLabel>
                                <DatePicker 
                                  date={field.value} 
                                  setDate={field.onChange}
                                  disabled={(date) => {
                                    const startDate = form.getValues('customStartDate');
                                    return date > new Date() || (startDate && date < startDate);
                                  }}
                                />
                                <FormDescription>
                                  Fin del período de análisis
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <FormField
                        control={form.control}
                        name="warehouseId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Almacén (Opcional)</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Todos los almacenes" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">Todos los almacenes</SelectItem>
                                {isLoadingWarehouses ? (
                                  <SelectItem value="" disabled>Cargando almacenes...</SelectItem>
                                ) : (
                                  warehouses?.map((warehouse: any) => (
                                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                      {warehouse.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Filtrar análisis por almacén específico
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full md:w-auto"
                      disabled={analysisMutation.isPending || !form.formState.isValid}
                    >
                      {analysisMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Generar Análisis
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="future_needs" className="mt-0">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="timeframe"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Período de Análisis</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar período" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="last_month">Último mes</SelectItem>
                                <SelectItem value="last_quarter">Último trimestre</SelectItem>
                                <SelectItem value="last_year">Último año</SelectItem>
                                <SelectItem value="custom">Personalizado</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Período histórico para basar las predicciones
                            </FormDescription>
                          </FormItem>
                        )}
                      />

                      {form.watch('timeframe') === 'custom' && (
                        <>
                          <FormField
                            control={form.control}
                            name="customStartDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Fecha Inicio</FormLabel>
                                <DatePicker 
                                  date={field.value} 
                                  setDate={field.onChange}
                                  disabled={(date) => date > new Date()}
                                />
                                <FormDescription>
                                  Inicio del período de análisis
                                </FormDescription>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="customEndDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Fecha Fin</FormLabel>
                                <DatePicker 
                                  date={field.value} 
                                  setDate={field.onChange}
                                  disabled={(date) => {
                                    const startDate = form.getValues('customStartDate');
                                    return date > new Date() || (startDate && date < startDate);
                                  }}
                                />
                                <FormDescription>
                                  Fin del período de análisis
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <FormField
                        control={form.control}
                        name="warehouseId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Almacén (Opcional)</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Todos los almacenes" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">Todos los almacenes</SelectItem>
                                {isLoadingWarehouses ? (
                                  <SelectItem value="" disabled>Cargando almacenes...</SelectItem>
                                ) : (
                                  warehouses?.map((warehouse: any) => (
                                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                      {warehouse.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Filtrar predicciones por almacén específico
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full md:w-auto"
                      disabled={analysisMutation.isPending || !form.formState.isValid}
                    >
                      {analysisMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Generar Análisis
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {renderAnalysisResults()}
      </div>
    </Layout>
  );
}