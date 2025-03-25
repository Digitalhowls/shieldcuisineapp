import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, AlertCircle, ShoppingCart, Tag, Package, RefreshCw, Link, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

// Esquema para la configuración de WooCommerce
const wooCommerceConfigSchema = z.object({
  url: z.string().url({ message: "La URL no es válida" }),
  consumerKey: z.string().min(1, { message: "La clave de consumidor es obligatoria" }),
  consumerSecret: z.string().min(1, { message: "El secreto de consumidor es obligatorio" }),
  version: z.string().default("wc/v3"),
});

type WooCommerceConfig = z.infer<typeof wooCommerceConfigSchema>;

// Esquema para la sincronización de productos
const productSyncSchema = z.object({
  companyId: z.number().optional(),
  productIds: z.array(z.number()).optional(),
  autoSync: z.boolean().default(false),
});

type ProductSyncConfig = z.infer<typeof productSyncSchema>;

// Esquema para la sincronización de pedidos
const orderSyncSchema = z.object({
  sinceDate: z.date().optional(),
  autoImport: z.boolean().default(false),
  statusMappings: z.record(z.string()).optional(),
});

type OrderSyncConfig = z.infer<typeof orderSyncSchema>;

export default function WooCommerce() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null);

  // Formulario de configuración WooCommerce
  const configForm = useForm<WooCommerceConfig>({
    resolver: zodResolver(wooCommerceConfigSchema),
    defaultValues: {
      url: "",
      consumerKey: "",
      consumerSecret: "",
      version: "wc/v3",
    },
  });

  // Formulario de sincronización de productos
  const productSyncForm = useForm<ProductSyncConfig>({
    resolver: zodResolver(productSyncSchema),
    defaultValues: {
      autoSync: false,
    },
  });

  // Formulario de sincronización de pedidos
  const orderSyncForm = useForm<OrderSyncConfig>({
    resolver: zodResolver(orderSyncSchema),
    defaultValues: {
      autoImport: false,
    },
  });

  // Consulta para comprobar el estado de conexión
  const { data: statusData, isLoading: isLoadingStatus, refetch: refetchStatus } = useQuery({
    queryKey: ["/api/woocommerce/status"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/woocommerce/status");
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error al verificar estado de WooCommerce:", error);
        return { connected: false };
      }
    },
    enabled: true,
  });

  // Mutation para enviar la configuración
  const configMutation = useMutation({
    mutationFn: async (data: WooCommerceConfig) => {
      const response = await apiRequest("POST", "/api/woocommerce/config", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Conexión exitosa",
        description: "La configuración de WooCommerce se ha guardado correctamente.",
        variant: "success",
      });
      refetchStatus();
    },
    onError: (error: Error) => {
      toast({
        title: "Error de conexión",
        description: `No se pudo conectar con WooCommerce: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation para sincronizar productos
  const syncProductsMutation = useMutation({
    mutationFn: async (data: ProductSyncConfig) => {
      const response = await apiRequest("POST", "/api/woocommerce/sync/products", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sincronización completada",
        description: `Se han sincronizado ${data.created.length} productos nuevos y actualizado ${data.updated.length} productos existentes.`,
        variant: "success",
      });
      setLastSyncDate(new Date());
    },
    onError: (error: Error) => {
      toast({
        title: "Error de sincronización",
        description: `No se pudieron sincronizar los productos: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation para sincronizar pedidos
  const syncOrdersMutation = useMutation({
    mutationFn: async (data: OrderSyncConfig) => {
      const payload: any = {};
      if (data.sinceDate) {
        payload.sinceDate = data.sinceDate.toISOString();
      }
      const response = await apiRequest("POST", "/api/woocommerce/sync/orders", payload);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Pedidos importados",
        description: `Se han importado ${data.total} pedidos desde WooCommerce.`,
        variant: "success",
      });
      setLastSyncDate(new Date());
    },
    onError: (error: Error) => {
      toast({
        title: "Error al importar pedidos",
        description: `No se pudieron importar los pedidos: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Actualizar el estado de conexión
  useEffect(() => {
    if (isLoadingStatus) {
      setConnectionStatus("checking");
    } else if (statusData?.connected) {
      setConnectionStatus("connected");
    } else {
      setConnectionStatus("disconnected");
    }
  }, [statusData, isLoadingStatus]);

  // Enviar configuración
  const onConfigSubmit = (data: WooCommerceConfig) => {
    configMutation.mutate(data);
  };

  // Sincronizar productos
  const onProductSyncSubmit = (data: ProductSyncConfig) => {
    // Usamos el ID de la empresa actual del usuario
    const companyId = 1; // TODO: Obtener el ID de la empresa del usuario
    syncProductsMutation.mutate({ ...data, companyId });
  };

  // Sincronizar pedidos
  const onOrderSyncSubmit = (data: OrderSyncConfig) => {
    syncOrdersMutation.mutate(data);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integración con WooCommerce</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra la sincronización de productos, pedidos e inventario con tu tienda WooCommerce
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {connectionStatus === "checking" && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Verificando conexión...</span>
            </div>
          )}
          
          {connectionStatus === "connected" && (
            <div className="flex items-center gap-2">
              <Badge variant="success" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                <span>Conectado</span>
              </Badge>
              
              {lastSyncDate && (
                <span className="text-xs text-muted-foreground">
                  Última sincronización: {format(lastSyncDate, "dd/MM/yyyy HH:mm")}
                </span>
              )}
            </div>
          )}
          
          {connectionStatus === "disconnected" && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>No conectado</span>
            </Badge>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetchStatus()}
            disabled={isLoadingStatus}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Verificar conexión
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="general" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
        </TabsList>
        
        {/* Tab: Configuración General */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de WooCommerce</CardTitle>
              <CardDescription>
                Introduce los datos de acceso a la API de WooCommerce para conectar con tu tienda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...configForm}>
                <form onSubmit={configForm.handleSubmit(onConfigSubmit)} className="space-y-6">
                  <div className="grid gap-4">
                    <FormField
                      control={configForm.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de la tienda</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Link className="h-4 w-4 text-muted-foreground" />
                              <Input placeholder="https://tu-tienda.com" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={configForm.control}
                        name="consumerKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Clave de consumidor</FormLabel>
                            <FormControl>
                              <Input placeholder="ck_xxxxxxxxxxxx" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={configForm.control}
                        name="consumerSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secreto de consumidor</FormLabel>
                            <FormControl>
                              <Input placeholder="cs_xxxxxxxxxxxx" type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={configForm.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Versión de API</FormLabel>
                          <FormControl>
                            <Input placeholder="wc/v3" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={configMutation.isPending}
                  >
                    {configMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Guardar configuración
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <Alert className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>¿Dónde obtener estas credenciales?</AlertTitle>
                <AlertDescription>
                  Debes crear claves de API en el panel de administración de WooCommerce:
                  <ol className="list-decimal list-inside mt-2">
                    <li>Ve a WooCommerce &gt; Ajustes &gt; Avanzado &gt; API REST</li>
                    <li>Haz clic en "Añadir clave"</li>
                    <li>Establece permisos de "Lectura/Escritura"</li>
                    <li>Copia la clave y el secreto generados</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Tab: Productos */}
        <TabsContent value="productos" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sincronización de productos</CardTitle>
              <CardDescription>
                Sincroniza tus productos entre ShieldCuisine y WooCommerce
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...productSyncForm}>
                <form onSubmit={productSyncForm.handleSubmit(onProductSyncSubmit)} className="space-y-6">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Sincronización automática</Label>
                        <div className="text-sm text-muted-foreground">
                          Sincronizar cambios de productos automáticamente
                        </div>
                      </div>
                      <FormField
                        control={productSyncForm.control}
                        name="autoSync"
                        render={({ field }) => (
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        )}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label>Mapeo de campos</Label>
                      <div className="text-sm text-muted-foreground">
                        Los siguientes campos se sincronizarán entre los sistemas:
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                          <span className="text-sm">Nombre</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                          <span className="text-sm">Descripción</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                          <span className="text-sm">Precio</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                          <span className="text-sm">Inventario</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                          <span className="text-sm">SKU</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                          <span className="text-sm">Imágenes</span>
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={syncProductsMutation.isPending || connectionStatus !== "connected"}
                    >
                      {syncProductsMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      <Tag className="mr-2 h-4 w-4" />
                      Sincronizar todos los productos
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tab: Pedidos */}
        <TabsContent value="pedidos" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sincronización de pedidos</CardTitle>
              <CardDescription>
                Importa pedidos de WooCommerce a ShieldCuisine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...orderSyncForm}>
                <form onSubmit={orderSyncForm.handleSubmit(onOrderSyncSubmit)} className="space-y-6">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Importación automática</Label>
                        <div className="text-sm text-muted-foreground">
                          Importar pedidos nuevos automáticamente
                        </div>
                      </div>
                      <FormField
                        control={orderSyncForm.control}
                        name="autoImport"
                        render={({ field }) => (
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        )}
                      />
                    </div>
                    
                    <Separator />
                    
                    <FormField
                      control={orderSyncForm.control}
                      name="sinceDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Importar pedidos desde</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={`w-[240px] pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy")
                                  ) : (
                                    "Seleccionar fecha"
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={(date) => field.onChange(date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label>Estados de pedidos</Label>
                      <div className="text-sm text-muted-foreground">
                        Mapeo entre estados de pedidos de WooCommerce y ShieldCuisine
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                          <span className="text-sm">pending → pendiente</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                          <span className="text-sm">processing → en proceso</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                          <span className="text-sm">completed → completado</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                          <span className="text-sm">cancelled → cancelado</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={syncOrdersMutation.isPending || connectionStatus !== "connected"}
                  >
                    {syncOrdersMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Importar pedidos
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}