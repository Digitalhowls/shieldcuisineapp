import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  HelpCircle,
  Info,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Trash2
} from "lucide-react";

// Esquema de validación para configuración PSD2
const psd2ConfigSchema = z.object({
  bankName: z.string().min(1, { message: "El nombre del banco es obligatorio" }),
  apiUrl: z.string().url({ message: "La URL de API no es válida" }),
  clientId: z.string().min(1, { message: "El Client ID es obligatorio" }),
  clientSecret: z.string().min(1, { message: "El Client Secret es obligatorio" }),
  redirectUri: z.string().url({ message: "La URL de redirección no es válida" }),
  sandbox: z.boolean().optional(),
  certificatePath: z.string().optional(),
  keyPath: z.string().optional(),
});

// Esquema de validación para categoría
const categorySchema = z.object({
  name: z.string().min(1, { message: "El nombre de la categoría es obligatorio" }),
  color: z.string().optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
});

// Esquema de validación para regla de categorización
const ruleSchema = z.object({
  pattern: z.string().min(1, { message: "El patrón de búsqueda es obligatorio" }),
  categoryId: z.string().min(1, { message: "La categoría es obligatoria" }),
  field: z.enum(["description", "reference", "counterparty"]),
  isRegex: z.boolean().optional(),
  priority: z.number().min(1).max(100).optional(),
});

// Tipos para los datos bancarios
interface BankConnection {
  id: number;
  companyId: number;
  name: string;
  provider: string;
  status: "pending" | "active" | "expired" | "revoked";
  consentId: string;
  lastUpdated: string;
  validUntil: string;
  createdAt: string;
}

interface Category {
  id: number;
  companyId: number;
  name: string;
  color?: string;
  icon?: string;
  description?: string;
}

interface CategoryRule {
  id: number;
  companyId: number;
  pattern: string;
  categoryId: number;
  field: "description" | "reference" | "counterparty";
  isRegex: boolean;
  priority: number;
}

type PSD2ConfigFormValues = z.infer<typeof psd2ConfigSchema>;
type CategoryFormValues = z.infer<typeof categorySchema>;
type RuleFormValues = z.infer<typeof ruleSchema>;

export default function Configuracion() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("bancos");

  // Consultas para obtener datos
  const { data: connections, isLoading: isLoadingConnections } = useQuery<BankConnection[]>({
    queryKey: ['/api/banking/connections'],
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/banking/categories'],
  });

  const { data: rules, isLoading: isLoadingRules } = useQuery<CategoryRule[]>({
    queryKey: ['/api/banking/category-rules'],
  });

  // Estado para el formulario de configuración PSD2
  const psd2Form = useForm<PSD2ConfigFormValues>({
    resolver: zodResolver(psd2ConfigSchema),
    defaultValues: {
      bankName: "",
      apiUrl: "",
      clientId: "",
      clientSecret: "",
      redirectUri: window.location.origin + "/banca/auth-callback",
      sandbox: true,
      certificatePath: "",
      keyPath: "",
    }
  });

  // Estado para el formulario de categoría
  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      color: "#3b82f6",
      icon: "tag",
      description: "",
    }
  });

  // Estado para el formulario de regla
  const ruleForm = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      pattern: "",
      categoryId: "",
      field: "description",
      isRegex: false,
      priority: 50,
    }
  });

  // Mutación para crear conexión bancaria
  const createConnectionMutation = useMutation({
    mutationFn: async (data: PSD2ConfigFormValues) => {
      const res = await apiRequest("POST", "/api/banking/config", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "La configuración bancaria se ha guardado con éxito",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/banking/connections'] });
      psd2Form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo guardar la configuración: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutación para crear categoría
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const res = await apiRequest("POST", "/api/banking/categories", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Categoría creada",
        description: "La categoría se ha creado con éxito",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/banking/categories'] });
      categoryForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo crear la categoría: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutación para crear regla
  const createRuleMutation = useMutation({
    mutationFn: async (data: RuleFormValues) => {
      const res = await apiRequest("POST", "/api/banking/category-rules", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Regla creada",
        description: "La regla se ha creado con éxito",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/banking/category-rules'] });
      ruleForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo crear la regla: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Manejo de envío de formulario de configuración PSD2
  const onSubmitPSD2Config = (data: PSD2ConfigFormValues) => {
    createConnectionMutation.mutate(data);
  };

  // Manejo de envío de formulario de categoría
  const onSubmitCategory = (data: CategoryFormValues) => {
    createCategoryMutation.mutate(data);
  };

  // Manejo de envío de formulario de regla
  const onSubmitRule = (data: RuleFormValues) => {
    createRuleMutation.mutate(data);
  };

  // Datos de ejemplo si no hay conexión a la API
  const connectionsData: BankConnection[] = connections || [
    {
      id: 1,
      companyId: 1,
      name: "BBVA",
      provider: "BBVA API Market",
      status: "active",
      consentId: "consent-12345-bbva",
      lastUpdated: "2025-03-22T10:30:00Z",
      validUntil: "2025-06-22T10:30:00Z",
      createdAt: "2025-01-22T10:30:00Z"
    },
    {
      id: 2,
      companyId: 1,
      name: "Santander",
      provider: "Santander PSD2",
      status: "active",
      consentId: "consent-67890-santander",
      lastUpdated: "2025-03-20T14:45:00Z",
      validUntil: "2025-06-20T14:45:00Z",
      createdAt: "2025-01-20T14:45:00Z"
    },
    {
      id: 3,
      companyId: 1,
      name: "CaixaBank",
      provider: "CaixaBank OpenBanking",
      status: "expired",
      consentId: "consent-24680-caixabank",
      lastUpdated: "2025-02-15T09:20:00Z",
      validUntil: "2025-03-15T09:20:00Z",
      createdAt: "2024-12-15T09:20:00Z"
    }
  ];

  const categoriesData: Category[] = categories || [
    {
      id: 1,
      companyId: 1,
      name: "Alimentación",
      color: "#16a34a",
      icon: "utensils",
      description: "Gastos relacionados con alimentos y bebidas"
    },
    {
      id: 2,
      companyId: 1,
      name: "Transporte",
      color: "#3b82f6",
      icon: "car",
      description: "Gastos de desplazamiento, combustible, etc."
    },
    {
      id: 3,
      companyId: 1,
      name: "Servicios",
      color: "#f59e0b",
      icon: "lightbulb",
      description: "Gastos en servicios como luz, agua, gas, internet"
    },
    {
      id: 4,
      companyId: 1,
      name: "Personal",
      color: "#8b5cf6",
      icon: "user",
      description: "Gastos personales"
    },
    {
      id: 5,
      companyId: 1,
      name: "Ingresos",
      color: "#10b981",
      icon: "arrow-up",
      description: "Todos los ingresos recibidos"
    }
  ];

  const rulesData: CategoryRule[] = rules || [
    {
      id: 1,
      companyId: 1,
      pattern: "supermercado",
      categoryId: 1,
      field: "description",
      isRegex: false,
      priority: 80
    },
    {
      id: 2,
      companyId: 1,
      pattern: "gasolinera|combustible",
      categoryId: 2,
      field: "description",
      isRegex: true,
      priority: 70
    },
    {
      id: 3,
      companyId: 1,
      pattern: "luz|agua|gas|telefon",
      categoryId: 3,
      field: "description",
      isRegex: true,
      priority: 75
    },
    {
      id: 4,
      companyId: 1,
      pattern: "nomina|salario",
      categoryId: 5,
      field: "description",
      isRegex: true,
      priority: 90
    }
  ];

  // Estado de carga
  const isLoading = isLoadingConnections || isLoadingCategories || isLoadingRules;
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Formateo de fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  // Obtener estado de conexión
  const getConnectionStatusBadge = (status: BankConnection['status']) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Activa</Badge>;
      case "expired":
        return <Badge variant="destructive">Expirada</Badge>;
      case "pending":
        return <Badge variant="outline">Pendiente</Badge>;
      case "revoked":
        return <Badge variant="destructive">Revocada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Configuración Bancaria</h1>
        <div>
          <Button variant="outline" className="mr-2" onClick={() => navigate("/banca")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bancos">Conexiones Bancarias</TabsTrigger>
          <TabsTrigger value="categorias">Categorías</TabsTrigger>
          <TabsTrigger value="reglas">Reglas de Categorización</TabsTrigger>
          <TabsTrigger value="ajustes">Ajustes</TabsTrigger>
        </TabsList>

        {/* Pestaña de Conexiones Bancarias */}
        <TabsContent value="bancos">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conexiones API Bancarias Activas</CardTitle>
                <CardDescription>Configuraciones PSD2/Open Banking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connectionsData.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      No hay conexiones bancarias configuradas
                    </div>
                  ) : (
                    connectionsData.map((connection) => (
                      <div key={connection.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <div className="font-medium text-lg">{connection.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Proveedor: {connection.provider}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID de consentimiento: {connection.consentId}
                          </div>
                          <div className="flex items-center mt-2 space-x-4">
                            <div className="text-xs flex items-center">
                              <span className="mr-1">Estado:</span>
                              {getConnectionStatusBadge(connection.status)}
                            </div>
                            <div className="text-xs">
                              Válido hasta: {formatDate(connection.validUntil)}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Renovar consentimiento
                              toast({
                                title: "Consentimiento renovado",
                                description: "Se ha enviado la solicitud de renovación de consentimiento"
                              });
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Renovar
                          </Button>
                          <Button
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Mostrar detalles
                              navigate(`/banca/configuracion/conexion/${connection.id}`);
                            }}
                          >
                            <Info className="h-4 w-4 mr-2" />
                            Detalles
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Añadir Nueva Conexión Bancaria</CardTitle>
                <CardDescription>Configure el acceso a la API PSD2/Open Banking</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...psd2Form}>
                  <form onSubmit={psd2Form.handleSubmit(onSubmitPSD2Config)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={psd2Form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del Banco</FormLabel>
                            <FormControl>
                              <Input placeholder="BBVA, Santander, CaixaBank..." {...field} />
                            </FormControl>
                            <FormDescription>
                              Nombre identificativo para esta conexión
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={psd2Form.control}
                        name="apiUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL de API</FormLabel>
                            <FormControl>
                              <Input placeholder="https://api.banco.com/psd2/v1/" {...field} />
                            </FormControl>
                            <FormDescription>
                              Endpoint base de la API bancaria
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={psd2Form.control}
                        name="clientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client ID</FormLabel>
                            <FormControl>
                              <Input placeholder="client_id" {...field} />
                            </FormControl>
                            <FormDescription>
                              Identificador de cliente proporcionado por el banco
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={psd2Form.control}
                        name="clientSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Secret</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="client_secret" {...field} />
                            </FormControl>
                            <FormDescription>
                              Secreto de cliente proporcionado por el banco
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={psd2Form.control}
                      name="redirectUri"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de Redirección</FormLabel>
                          <FormControl>
                            <Input placeholder="https://su-dominio.com/auth-callback" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL a la que redirigirá el banco tras la autenticación (debe coincidir con la configurada en el portal del banco)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={psd2Form.control}
                      name="sandbox"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-0.5">
                            <FormLabel>Modo Sandbox</FormLabel>
                            <FormDescription>
                              Utilizar entorno de pruebas del banco
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Accordion type="single" collapsible>
                      <AccordionItem value="advanced">
                        <AccordionTrigger>Configuración Avanzada</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <FormField
                              control={psd2Form.control}
                              name="certificatePath"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Ruta del Certificado</FormLabel>
                                  <FormControl>
                                    <Input placeholder="/path/to/certificate.pem" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Ruta al certificado para autenticación mutua TLS (opcional)
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={psd2Form.control}
                              name="keyPath"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Ruta de la Clave Privada</FormLabel>
                                  <FormControl>
                                    <Input placeholder="/path/to/private.key" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Ruta a la clave privada para autenticación mutua TLS (opcional)
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <Button type="submit" disabled={createConnectionMutation.isPending}>
                      {createConnectionMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar Configuración
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Categorías */}
        <TabsContent value="categorias">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Categorías</CardTitle>
                  <CardDescription>Categorías para clasificar transacciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoriesData.map((category) => (
                      <div 
                        key={category.id} 
                        className="p-4 border rounded-lg"
                        style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
                      >
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">{category.description}</div>
                        <div className="flex justify-end mt-2">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Nueva Categoría</CardTitle>
                  <CardDescription>Crear categoría para transacciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...categoryForm}>
                    <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)} className="space-y-4">
                      <FormField
                        control={categoryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                              <Input placeholder="Alimentación, Transporte, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={categoryForm.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-6 h-6 rounded-full border"
                                style={{ backgroundColor: field.value || '#3b82f6' }}
                              ></div>
                              <FormControl>
                                <Input type="color" {...field} />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={categoryForm.control}
                        name="icon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icono</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar icono" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="tag">Etiqueta</SelectItem>
                                <SelectItem value="utensils">Alimentación</SelectItem>
                                <SelectItem value="car">Transporte</SelectItem>
                                <SelectItem value="home">Hogar</SelectItem>
                                <SelectItem value="lightbulb">Servicios</SelectItem>
                                <SelectItem value="creditCard">Pagos</SelectItem>
                                <SelectItem value="user">Personal</SelectItem>
                                <SelectItem value="building">Oficina</SelectItem>
                                <SelectItem value="shoppingCart">Compras</SelectItem>
                                <SelectItem value="gift">Regalos</SelectItem>
                                <SelectItem value="heart">Salud</SelectItem>
                                <SelectItem value="briefcase">Negocios</SelectItem>
                                <SelectItem value="dollarSign">Ingresos</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={categoryForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Breve descripción de la categoría"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={createCategoryMutation.isPending}>
                        {createCategoryMutation.isPending ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Crear Categoría
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Pestaña de Reglas */}
        <TabsContent value="reglas">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Reglas de Categorización</CardTitle>
                  <CardDescription>Reglas para categorizar automáticamente las transacciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {rulesData.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                          No hay reglas configuradas
                        </div>
                      ) : (
                        rulesData.map((rule) => {
                          const category = categoriesData.find(c => c.id === rule.categoryId);
                          return (
                            <div 
                              key={rule.id} 
                              className="p-4 border rounded-lg"
                              style={{ borderLeftColor: category?.color, borderLeftWidth: '4px' }}
                            >
                              <div className="flex justify-between">
                                <div className="font-medium">
                                  {rule.pattern}
                                  {rule.isRegex && <Badge variant="outline" className="ml-2">RegEx</Badge>}
                                </div>
                                <Badge>Prioridad: {rule.priority}</Badge>
                              </div>
                              <div className="flex justify-between mt-2">
                                <div className="text-sm text-muted-foreground">
                                  Campo: <span className="font-medium">
                                    {rule.field === "description" ? "Descripción" : 
                                     rule.field === "reference" ? "Referencia" : "Contraparte"}
                                  </span>
                                </div>
                                <div className="text-sm">
                                  Categoría: <span className="font-medium">{category?.name}</span>
                                </div>
                              </div>
                              <div className="flex justify-end mt-2">
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Nueva Regla</CardTitle>
                  <CardDescription>Crear regla de categorización</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...ruleForm}>
                    <form onSubmit={ruleForm.handleSubmit(onSubmitRule)} className="space-y-4">
                      <FormField
                        control={ruleForm.control}
                        name="pattern"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Patrón de búsqueda</FormLabel>
                            <FormControl>
                              <Input placeholder="supermercado, gasolinera, etc." {...field} />
                            </FormControl>
                            <FormDescription>
                              Texto a buscar en las transacciones
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={ruleForm.control}
                        name="field"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campo</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar campo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="description">Descripción</SelectItem>
                                <SelectItem value="reference">Referencia</SelectItem>
                                <SelectItem value="counterparty">Contraparte</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Campo de la transacción donde buscar el patrón
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={ruleForm.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoría</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar categoría" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categoriesData.map(category => (
                                  <SelectItem key={category.id} value={String(category.id)}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Categoría a asignar cuando se cumpla la regla
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={ruleForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prioridad ({field.value})</FormLabel>
                            <FormControl>
                              <Input 
                                type="range" 
                                min="1" 
                                max="100" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Prioridad de aplicación (mayor número = mayor prioridad)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={ruleForm.control}
                        name="isRegex"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Usar expresión regular</FormLabel>
                              <FormDescription>
                                Interpretar el patrón como una expresión regular
                              </FormDescription>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={createRuleMutation.isPending}>
                        {createRuleMutation.isPending ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Crear Regla
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Pestaña de Ajustes */}
        <TabsContent value="ajustes">
          <Card>
            <CardHeader>
              <CardTitle>Ajustes Generales</CardTitle>
              <CardDescription>Configuración general del módulo bancario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Sincronización Automática</div>
                    <div className="text-sm text-muted-foreground">
                      Actualizar automáticamente las transacciones cada día
                    </div>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Notificaciones de Transacciones</div>
                    <div className="text-sm text-muted-foreground">
                      Recibir notificaciones de nuevas transacciones
                    </div>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Alertas de Saldo Bajo</div>
                    <div className="text-sm text-muted-foreground">
                      Alertar cuando el saldo sea inferior a un umbral
                    </div>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Categorización Automática</div>
                    <div className="text-sm text-muted-foreground">
                      Categorizar automáticamente las transacciones según reglas
                    </div>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Modo de Pruebas</div>
                    <div className="text-sm text-muted-foreground">
                      Usar datos de prueba en lugar de conectarse a bancos reales
                    </div>
                    <div className="text-xs text-amber-500 flex items-center mt-1">
                      <HelpCircle className="h-3 w-3 mr-1" />
                      Solo para desarrollo y pruebas
                    </div>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Restaurar Valores</Button>
              <Button>Guardar Cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}