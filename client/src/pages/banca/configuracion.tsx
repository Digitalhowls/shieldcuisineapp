import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Settings, 
  RefreshCw, 
  PlusCircle,
  Trash,
  ExternalLink,
  Power
} from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Tipos
interface BankConnection {
  id: number;
  companyId: number;
  name: string;
  status: string;
  consentId: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Psd2Config {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  certificatePath?: string;
  keyPath?: string;
}

interface ConsentRequest {
  validUntil: Date;
  recurringIndicator: boolean;
  frequencyPerDay: number;
  combinedServiceIndicator?: boolean;
  access: {
    accounts?: string[];
    balances?: string[];
    transactions?: string[];
    availableAccounts?: 'allAccounts' | 'allAccountsWithOwnerName';
  };
}

// Esquema para la configuración de PSD2
const psd2ConfigSchema = z.object({
  apiUrl: z.string().url({ message: "URL de API inválida" }),
  clientId: z.string().min(1, { message: "Client ID requerido" }),
  clientSecret: z.string().min(1, { message: "Client Secret requerido" }),
  redirectUri: z.string().url({ message: "URL de redirección inválida" }),
  certificatePath: z.string().optional(),
  keyPath: z.string().optional(),
});

// Esquema para la conexión bancaria
const connectionSchema = z.object({
  name: z.string().min(1, { message: "Nombre requerido" }),
  validUntil: z.date().min(new Date(), { message: "La fecha debe ser futura" }),
  recurringIndicator: z.boolean(),
  frequencyPerDay: z.number().int().min(1, { message: "Mínimo 1" }).max(100, { message: "Máximo 100" }),
  accessAllAccounts: z.boolean(),
  accessBalances: z.boolean(),
  accessTransactions: z.boolean(),
});

type Psd2ConfigFormValues = z.infer<typeof psd2ConfigSchema>;
type ConnectionFormValues = z.infer<typeof connectionSchema>;

export default function ConfiguracionBancaria() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isConnectionOpen, setIsConnectionOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(1); // Hardcodeado para demo
  const [apiConfigured, setApiConfigured] = useState(false);
  
  // Consulta para obtener las conexiones bancarias
  const connectionsQuery = useQuery<BankConnection[]>({
    queryKey: ['/api/banking/connections', selectedCompanyId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/banking/connections/${selectedCompanyId}`);
        if (!response.ok) {
          if (response.status === 404) {
            return []; // No hay conexiones todavía
          }
          throw new Error('Error al cargar las conexiones bancarias');
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching connections:", error);
        return [];
      }
    }
  });
  
  // Mutación para configurar la API bancaria
  const configureApiMutation = useMutation({
    mutationFn: async (config: Psd2ConfigFormValues) => {
      const response = await fetch('/api/banking/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        throw new Error('Error al configurar la API bancaria');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "La configuración de la API bancaria se ha guardado correctamente",
      });
      setIsConfigOpen(false);
      setApiConfigured(true);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo guardar la configuración: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    },
  });
  
  // Mutación para crear una conexión bancaria
  const createConnectionMutation = useMutation({
    mutationFn: async (values: ConnectionFormValues) => {
      // Crear el objeto de solicitud de consentimiento
      const consentRequest: ConsentRequest = {
        validUntil: values.validUntil,
        recurringIndicator: values.recurringIndicator,
        frequencyPerDay: values.frequencyPerDay,
        access: {
          availableAccounts: values.accessAllAccounts ? 'allAccounts' : undefined,
          balances: values.accessBalances ? [] : undefined,
          transactions: values.accessTransactions ? [] : undefined,
        },
      };
      
      const response = await fetch(`/api/banking/consents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          companyId: selectedCompanyId,
          ...consentRequest,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al crear la conexión bancaria');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/banking/connections', selectedCompanyId] });
      
      toast({
        title: "Conexión creada",
        description: "La conexión bancaria se ha creado correctamente",
      });
      
      setIsConnectionOpen(false);
      
      // Si hay una URL de redirección, redirigir al usuario
      if (data._links?.scaRedirect?.href) {
        // En un entorno real, redirigiríamos al usuario a esta URL para la autenticación
        // window.location.href = data._links.scaRedirect.href;
        
        // En este caso, mostramos un toast informativo
        toast({
          title: "Autenticación requerida",
          description: "Será redirigido al banco para completar la autenticación",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo crear la conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    },
  });
  
  // Mutación para actualizar el estado de una conexión
  const updateConnectionStatusMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      const response = await fetch(`/api/banking/connections/${connectionId}/status`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el estado de la conexión');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banking/connections', selectedCompanyId] });
      
      toast({
        title: "Estado actualizado",
        description: "El estado de la conexión se ha actualizado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el estado: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    },
  });
  
  // Formulario para la configuración de la API
  const configForm = useForm<Psd2ConfigFormValues>({
    resolver: zodResolver(psd2ConfigSchema),
    defaultValues: {
      apiUrl: "",
      clientId: "",
      clientSecret: "",
      redirectUri: window.location.origin + "/banking/auth-callback",
      certificatePath: "",
      keyPath: "",
    },
  });
  
  // Formulario para la conexión bancaria
  const connectionForm = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      name: "",
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días en el futuro
      recurringIndicator: true,
      frequencyPerDay: 4,
      accessAllAccounts: true,
      accessBalances: true,
      accessTransactions: true,
    },
  });
  
  // Manejar envío del formulario de configuración
  const onConfigSubmit = (values: Psd2ConfigFormValues) => {
    configureApiMutation.mutate(values);
  };
  
  // Manejar envío del formulario de conexión
  const onConnectionSubmit = (values: ConnectionFormValues) => {
    createConnectionMutation.mutate(values);
  };
  
  // Formatear fecha
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Obtener el color del badge según el estado
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'received':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'revoked':
        return 'bg-orange-100 text-orange-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => navigate("/banca")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle>Configuración Bancaria</CardTitle>
              <CardDescription>Configure sus conexiones con bancos mediante PSD2</CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsConfigOpen(true)}
              >
                <Settings className="mr-2 h-4 w-4" /> Configurar API
              </Button>
              
              <Button 
                onClick={() => setIsConnectionOpen(true)} 
                disabled={!apiConfigured && connectionsQuery.data?.length === 0}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Nueva Conexión
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="connections" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="connections">Conexiones</TabsTrigger>
              <TabsTrigger value="accounts">Cuentas Sincronizadas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="connections">
              {connectionsQuery.isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="border border-muted">
                      <CardHeader className="pb-2">
                        <Skeleton className="h-5 w-40 mb-1" />
                        <Skeleton className="h-4 w-60" />
                      </CardHeader>
                      <CardContent className="pb-2">
                        <Skeleton className="h-4 w-24" />
                      </CardContent>
                      <CardFooter>
                        <Skeleton className="h-9 w-32" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : connectionsQuery.error ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p className="mb-4">Error al cargar las conexiones bancarias.</p>
                  <Button onClick={() => connectionsQuery.refetch()}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
                  </Button>
                </div>
              ) : !connectionsQuery.data || connectionsQuery.data.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p className="mb-4">No se encontraron conexiones bancarias. Cree una nueva conexión para comenzar.</p>
                  <Button 
                    onClick={() => setIsConnectionOpen(true)} 
                    disabled={!apiConfigured}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Nueva Conexión
                  </Button>
                  {!apiConfigured && (
                    <p className="mt-4 text-sm">
                      Primero debe configurar la API bancaria.{" "}
                      <Button variant="link" className="p-0 h-auto" onClick={() => setIsConfigOpen(true)}>
                        Configurar API
                      </Button>
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {connectionsQuery.data.map((connection) => (
                    <Card key={connection.id} className="border border-muted">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{connection.name}</CardTitle>
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(connection.status)}
                          >
                            {connection.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          ID: {connection.consentId.slice(0, 8)}...
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Creado:</span>
                            <span>{formatDate(connection.createdAt)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Expira:</span>
                            <span>{formatDate(connection.expiresAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateConnectionStatusMutation.mutate(connection.id)}
                          disabled={updateConnectionStatusMutation.isPending}
                        >
                          <RefreshCw className={`mr-2 h-4 w-4 ${updateConnectionStatusMutation.isPending ? 'animate-spin' : ''}`} />
                          Actualizar Estado
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/banca/cuentas`)}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ver Cuentas
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="accounts">
              <div className="text-center py-10 text-muted-foreground">
                <p>Vaya a la sección de cuentas para gestionar sus cuentas sincronizadas.</p>
                <Button variant="outline" onClick={() => navigate("/banca/cuentas")} className="mt-4">
                  Ver cuentas
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Diálogo de configuración de API */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configuración de API Bancaria</DialogTitle>
            <DialogDescription>
              Configure las credenciales para conectarse a la API bancaria PSD2
            </DialogDescription>
          </DialogHeader>
          
          <Form {...configForm}>
            <form onSubmit={configForm.handleSubmit(onConfigSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={configForm.control}
                  name="apiUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de API</FormLabel>
                      <FormControl>
                        <Input placeholder="https://api.banco.com/psd2" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL base de la API bancaria
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={configForm.control}
                  name="redirectUri"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de Redirección</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        URL de redirección tras autenticación
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={configForm.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client ID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        ID de cliente proporcionado por el banco
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={configForm.control}
                  name="clientSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Secret</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Secret proporcionado por el banco
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={configForm.control}
                  name="certificatePath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ruta del Certificado (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Ruta al certificado en el servidor
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={configForm.control}
                  name="keyPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ruta de la Clave (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Ruta a la clave privada en el servidor
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={configureApiMutation.isPending}
                >
                  {configureApiMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Configuración"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de nueva conexión */}
      <Dialog open={isConnectionOpen} onOpenChange={setIsConnectionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Conexión Bancaria</DialogTitle>
            <DialogDescription>
              Cree una nueva conexión con su banco mediante PSD2
            </DialogDescription>
          </DialogHeader>
          
          <Form {...connectionForm}>
            <form onSubmit={connectionForm.handleSubmit(onConnectionSubmit)} className="space-y-6">
              <FormField
                control={connectionForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Conexión</FormLabel>
                    <FormControl>
                      <Input placeholder="Mi Banco Principal" {...field} />
                    </FormControl>
                    <FormDescription>
                      Un nombre descriptivo para identificar esta conexión
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={connectionForm.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Válido Hasta</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          min={new Date().toISOString().split('T')[0]}
                          value={field.value ? field.value.toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : null;
                            if (date) {
                              field.onChange(date);
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Fecha hasta la que será válido el consentimiento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={connectionForm.control}
                  name="frequencyPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frecuencia Diaria</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="100" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Número máximo de accesos por día
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={connectionForm.control}
                  name="recurringIndicator"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Acceso Recurrente</FormLabel>
                        <FormDescription>
                          Permitir acceso recurrente a los datos
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={connectionForm.control}
                  name="accessAllAccounts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Acceso a Todas las Cuentas</FormLabel>
                        <FormDescription>
                          Acceder a todas las cuentas disponibles
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={connectionForm.control}
                  name="accessBalances"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Acceso a Saldos</FormLabel>
                        <FormDescription>
                          Acceder a los saldos de las cuentas
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={connectionForm.control}
                  name="accessTransactions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Acceso a Transacciones</FormLabel>
                        <FormDescription>
                          Acceder al historial de transacciones
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createConnectionMutation.isPending}
                >
                  {createConnectionMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Conexión"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}