import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  AlertCircle,
  PlusCircle,
  Settings,
  ChevronLeft,
  Link,
  Lock,
  Building,
  Calendar,
  Check,
  Loader2,
  Eye,
  EyeOff,
  Landmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Interfaces para las conexiones bancarias
interface BankConnection {
  id: number;
  companyId: number;
  bankName: string;
  apiUrl: string;
  status: "received" | "valid" | "rejected" | "revoked" | "expired";
  consentId: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  description?: string;
}

// Esquema de validación para el formulario de conexión
const bankConnectionSchema = z.object({
  bankName: z.string().min(1, "El nombre del banco es requerido"),
  apiUrl: z.string().url("La URL de la API debe ser una URL válida"),
  description: z.string().optional(),
  validUntil: z.string().min(1, "La fecha de expiración es requerida"),
  recurringIndicator: z.boolean().default(true),
  frequencyPerDay: z.number().int().min(1).max(10),
  access: z.object({
    accounts: z.boolean().default(true),
    balances: z.boolean().default(true),
    transactions: z.boolean().default(true),
    availableAccounts: z.enum(["", "allAccounts", "allAccountsWithOwnerName"]).optional(),
  }),
  credentials: z.object({
    clientId: z.string().min(1, "El ID de cliente es requerido"),
    clientSecret: z.string().min(1, "El secreto de cliente es requerido"),
    redirectUri: z.string().url("La URI de redirección debe ser una URL válida"),
  }),
});

type BankConnectionForm = z.infer<typeof bankConnectionSchema>;

export default function ConfiguracionBancaria() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [showSecret, setShowSecret] = useState(false);

  // Consulta para obtener las conexiones bancarias
  const { data: connections, isLoading, error } = useQuery<BankConnection[]>({
    queryKey: ["/api/banking/connections/1"],
    enabled: true,
  });

  // Configurar el formulario con validación
  const form = useForm<BankConnectionForm>({
    resolver: zodResolver(bankConnectionSchema),
    defaultValues: {
      bankName: "",
      apiUrl: "",
      description: "",
      validUntil: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split("T")[0],
      recurringIndicator: true,
      frequencyPerDay: 4,
      access: {
        accounts: true,
        balances: true,
        transactions: true,
        availableAccounts: "allAccounts",
      },
      credentials: {
        clientId: "",
        clientSecret: "",
        redirectUri: `${window.location.origin}/banca/callback`,
      },
    },
  });

  // Mutación para crear una nueva conexión bancaria
  const createConnectionMutation = useMutation({
    mutationFn: async (data: BankConnectionForm) => {
      // Transformar los datos del formulario a la estructura esperada por la API
      const apiData = {
        bankName: data.bankName,
        apiUrl: data.apiUrl,
        description: data.description,
        consentRequest: {
          validUntil: new Date(data.validUntil),
          recurringIndicator: data.recurringIndicator,
          frequencyPerDay: data.frequencyPerDay,
          access: {
            accounts: data.access.accounts ? ["*"] : [],
            balances: data.access.balances ? ["*"] : [],
            transactions: data.access.transactions ? ["*"] : [],
            availableAccounts: data.access.availableAccounts || undefined,
          },
        },
        config: {
          clientId: data.credentials.clientId,
          clientSecret: data.credentials.clientSecret,
          redirectUri: data.credentials.redirectUri,
        },
      };

      const response = await apiRequest("POST", "/api/banking/consents", apiData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banking/connections/1"] });
      toast({
        title: "Conexión bancaria creada",
        description: "Se ha creado la conexión bancaria correctamente",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear la conexión bancaria",
        description: error.message || "Ha ocurrido un error al crear la conexión bancaria",
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar el estado de una conexión
  const updateConnectionStatusMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      const response = await apiRequest("PUT", `/api/banking/connections/${connectionId}/status`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banking/connections/1"] });
      toast({
        title: "Estado actualizado",
        description: "Se ha actualizado el estado de la conexión correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar el estado",
        description: error.message || "Ha ocurrido un error al actualizar el estado de la conexión",
        variant: "destructive",
      });
    },
  });

  // Manejar envío del formulario
  const onSubmit = (data: BankConnectionForm) => {
    createConnectionMutation.mutate(data);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  // Datos de ejemplo si no hay conexión a la API
  const bankConnections: BankConnection[] = connections || [
    {
      id: 1,
      companyId: 1,
      bankName: "BBVA",
      apiUrl: "https://api.bbva.com/psd2",
      status: "valid",
      consentId: "consent-12345-bbva",
      createdAt: "2025-03-01T10:00:00Z",
      updatedAt: "2025-03-01T10:00:00Z",
      expiresAt: "2025-06-01T10:00:00Z",
      description: "Conexión principal para cuentas corporativas"
    },
    {
      id: 2,
      companyId: 1,
      bankName: "Santander",
      apiUrl: "https://api.santander.com/psd2",
      status: "valid",
      consentId: "consent-67890-santander",
      createdAt: "2025-03-05T15:30:00Z",
      updatedAt: "2025-03-05T15:30:00Z",
      expiresAt: "2025-06-05T15:30:00Z",
      description: "Conexión para cuentas de gastos"
    },
    {
      id: 3,
      companyId: 1,
      bankName: "CaixaBank",
      apiUrl: "https://api.caixabank.com/psd2",
      status: "expired",
      consentId: "consent-24680-caixa",
      createdAt: "2025-02-15T09:45:00Z",
      updatedAt: "2025-02-15T09:45:00Z",
      expiresAt: "2025-03-15T09:45:00Z"
    }
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex mb-6">
        <Button variant="outline" onClick={() => navigate("/banca")} className="mr-2">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Volver a Banca
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración Bancaria</h1>
          <p className="text-muted-foreground">
            Gestione sus conexiones bancarias mediante PSD2/Open Banking
          </p>
        </div>
      </div>

      {/* Lista de Conexiones Existentes */}
      <h2 className="text-xl font-bold mb-4">Conexiones Bancarias</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {bankConnections.map(connection => (
          <Card key={connection.id} className={`hover:shadow-md transition-shadow 
            ${connection.status === "expired" || connection.status === "rejected" || connection.status === "revoked" 
              ? "border-destructive/50" 
              : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <Landmark className="h-5 w-5 mr-2 text-primary" />
                  {connection.bankName}
                </CardTitle>
                <span className={`text-xs px-2 py-1 rounded-full 
                  ${connection.status === "valid" ? "bg-success/20 text-success" : ""}
                  ${connection.status === "expired" ? "bg-destructive/20 text-destructive" : ""}
                  ${connection.status === "rejected" ? "bg-destructive/20 text-destructive" : ""}
                  ${connection.status === "revoked" ? "bg-destructive/20 text-destructive" : ""}
                  ${connection.status === "received" ? "bg-warning/20 text-warning" : ""}
                `}>
                  {connection.status === "valid" && "Válida"}
                  {connection.status === "expired" && "Expirada"}
                  {connection.status === "rejected" && "Rechazada"}
                  {connection.status === "revoked" && "Revocada"}
                  {connection.status === "received" && "Pendiente"}
                </span>
              </div>
              <CardDescription className="flex flex-col">
                <span className="truncate">{connection.apiUrl}</span>
                <span className="text-xs mt-1">ID: {connection.consentId}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                <div>
                  <span className="text-muted-foreground">Creada:</span><br />
                  <span>{formatDate(connection.createdAt)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Expira:</span><br />
                  <span className={new Date(connection.expiresAt) < new Date() ? "text-destructive" : ""}>
                    {formatDate(connection.expiresAt)}
                  </span>
                </div>
              </div>
              {connection.description && (
                <div className="text-sm text-muted-foreground mt-2">
                  {connection.description}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              {connection.status === "expired" && (
                <Button 
                  className="w-full" 
                  onClick={() => updateConnectionStatusMutation.mutate(connection.id)}
                  disabled={updateConnectionStatusMutation.isPending}
                >
                  {updateConnectionStatusMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <></>
                  )}
                  Renovar Consentimiento
                </Button>
              )}
              {connection.status === "valid" && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/banca/cuentas`)}
                >
                  Ver Cuentas
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}

        {/* Tarjeta para añadir nueva conexión */}
        <Card className="hover:shadow-md transition-shadow border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <PlusCircle className="h-5 w-5 mr-2 text-primary" />
              Añadir Nueva Conexión
            </CardTitle>
            <CardDescription>
              Configure una nueva conexión bancaria PSD2/Open Banking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Para conectar con su banco, necesitará las credenciales de la API y configurar los permisos de acceso.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => document.getElementById("new-connection")?.scrollIntoView({ behavior: "smooth" })}
            >
              Configurar Nueva Conexión
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Formulario de Nueva Conexión */}
      <div id="new-connection" className="mt-12 mb-6">
        <h2 className="text-xl font-bold mb-4">Nueva Conexión Bancaria</h2>
        <Card>
          <CardHeader>
            <CardTitle>Configurar Conexión PSD2/Open Banking</CardTitle>
            <CardDescription>
              Complete los datos para establecer una nueva conexión con su banco mediante PSD2/Open Banking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Información del Banco */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Building className="h-5 w-5 mr-2 text-primary" />
                      Información del Banco
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Banco</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. BBVA, Santander, CaixaBank..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="apiUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de la API</FormLabel>
                          <FormControl>
                            <Input placeholder="https://api.banco.com/psd2" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL base de la API PSD2/Open Banking del banco
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción (opcional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Ej. Conexión para cuentas corporativas..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Credenciales de la API */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Lock className="h-5 w-5 mr-2 text-primary" />
                      Credenciales de la API
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="credentials.clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Cliente ID proporcionado por el banco" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="credentials.clientSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Secret</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showSecret ? "text" : "password"} 
                                placeholder="Secreto proporcionado por el banco" 
                                {...field} 
                              />
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-0 top-0" 
                                onClick={() => setShowSecret(!showSecret)}
                              >
                                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="credentials.redirectUri"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URI de Redirección</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            URI a la que el banco redirigirá después del consentimiento
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Configuración de Consentimiento */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      Configuración de Consentimiento
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="validUntil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Válido Hasta</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            Fecha de expiración del consentimiento
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recurringIndicator"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Indicador Recurrente
                            </FormLabel>
                            <FormDescription>
                              Indica si el consentimiento es para acceso recurrente
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
                      control={form.control}
                      name="frequencyPerDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frecuencia Por Día</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione frecuencia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1 vez al día</SelectItem>
                              <SelectItem value="2">2 veces al día</SelectItem>
                              <SelectItem value="4">4 veces al día</SelectItem>
                              <SelectItem value="6">6 veces al día</SelectItem>
                              <SelectItem value="10">10 veces al día</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Número de veces que se puede acceder a las cuentas por día
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Permisos de Acceso */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Link className="h-5 w-5 mr-2 text-primary" />
                      Permisos de Acceso
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="access.accounts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Acceso a Cuentas
                            </FormLabel>
                            <FormDescription>
                              Permite ver las cuentas y sus detalles
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
                      control={form.control}
                      name="access.balances"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Acceso a Saldos
                            </FormLabel>
                            <FormDescription>
                              Permite ver los saldos de las cuentas
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
                      control={form.control}
                      name="access.transactions"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Acceso a Transacciones
                            </FormLabel>
                            <FormDescription>
                              Permite ver las transacciones de las cuentas
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
                      control={form.control}
                      name="access.availableAccounts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Acceso a Cuentas</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione el tipo de acceso" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Específico (definido por el banco)</SelectItem>
                              <SelectItem value="allAccounts">Todas las cuentas</SelectItem>
                              <SelectItem value="allAccountsWithOwnerName">Todas las cuentas con nombres de titulares</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Tipo de acceso a las cuentas disponibles
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto"
                    disabled={createConnectionMutation.isPending}
                  >
                    {createConnectionMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creando Conexión...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Crear Conexión Bancaria
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}