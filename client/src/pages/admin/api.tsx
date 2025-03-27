import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  RefreshCw,
  Copy,
  Key,
  Lock,
  Settings,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock,
  Database,
  Eye,
  EyeOff,
  Filter,
  ListFilter,
  RotateCcw,
  Search,
  Trash2,
  Undo2,
} from "lucide-react";

// Tipo para las claves API
type ApiKey = {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string | null;
  status: "active" | "revoked";
  permissions: string[];
  requests: number;
  ipRestrictions: string[] | null;
};

// Datos de ejemplo para claves API
const mockApiKeys: ApiKey[] = [
  {
    id: "key_1",
    name: "Integración con WooCommerce",
    key: "sk_live_wc_123456789abcdefghijklmnopqrst",
    created: "2025-01-15",
    lastUsed: "2025-03-26",
    status: "active",
    permissions: ["read", "write"],
    requests: 15280,
    ipRestrictions: null,
  },
  {
    id: "key_2",
    name: "API Portal de Transparencia",
    key: "sk_live_tp_abcdefghijklmnopqrst123456789",
    created: "2025-02-01",
    lastUsed: "2025-03-25",
    status: "active",
    permissions: ["read"],
    requests: 8750,
    ipRestrictions: ["195.53.23.4", "195.53.23.5"],
  },
  {
    id: "key_3",
    name: "Integración con Sistema Contable",
    key: "sk_live_ac_zyxwvutsrqponmlkjihgfedcba9876",
    created: "2025-02-20",
    lastUsed: null,
    status: "revoked",
    permissions: ["read", "write", "delete"],
    requests: 352,
    ipRestrictions: null,
  },
  {
    id: "key_4",
    name: "App Móvil",
    key: "sk_live_ma_mnbvcxzasdfghjklqwertyuiop7890",
    created: "2025-03-10",
    lastUsed: "2025-03-26",
    status: "active",
    permissions: ["read", "write"],
    requests: 5621,
    ipRestrictions: null,
  },
];

// Tipo para los endpoints API
type ApiEndpoint = {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  description: string;
  authenticated: boolean;
  rateLimit: number;
  lastHourUsage: number;
};

// Datos de ejemplo para endpoints API
const mockApiEndpoints: ApiEndpoint[] = [
  {
    path: "/api/appcc/controls",
    method: "GET",
    description: "Obtener controles APPCC",
    authenticated: true,
    rateLimit: 1000,
    lastHourUsage: 342,
  },
  {
    path: "/api/appcc/controls",
    method: "POST",
    description: "Crear nuevo control APPCC",
    authenticated: true,
    rateLimit: 100,
    lastHourUsage: 25,
  },
  {
    path: "/api/appcc/controls/:id",
    method: "GET",
    description: "Obtener detalles de un control específico",
    authenticated: true,
    rateLimit: 1000,
    lastHourUsage: 156,
  },
  {
    path: "/api/appcc/controls/:id",
    method: "PUT",
    description: "Actualizar un control existente",
    authenticated: true,
    rateLimit: 100,
    lastHourUsage: 18,
  },
  {
    path: "/api/inventory/items",
    method: "GET",
    description: "Listar inventario",
    authenticated: true,
    rateLimit: 1000,
    lastHourUsage: 256,
  },
  {
    path: "/api/inventory/items/:id",
    method: "GET",
    description: "Obtener detalles de un artículo",
    authenticated: true,
    rateLimit: 1000,
    lastHourUsage: 123,
  },
  {
    path: "/api/transparency/public",
    method: "GET",
    description: "Obtener información pública sobre controles",
    authenticated: false,
    rateLimit: 5000,
    lastHourUsage: 1240,
  },
  {
    path: "/api/user",
    method: "GET",
    description: "Obtener información del usuario actual",
    authenticated: true,
    rateLimit: 1000,
    lastHourUsage: 452,
  },
];

// Tipo para los eventos de webhook
type WebhookEvent = {
  id: string;
  name: string;
  description: string;
  category: string;
};

// Datos de ejemplo para eventos de webhook
const mockWebhookEvents: WebhookEvent[] = [
  {
    id: "appcc.control.created",
    name: "Control APPCC creado",
    description: "Se ha creado un nuevo control APPCC",
    category: "appcc",
  },
  {
    id: "appcc.control.updated",
    name: "Control APPCC actualizado",
    description: "Se ha actualizado un control APPCC existente",
    category: "appcc",
  },
  {
    id: "appcc.control.completed",
    name: "Control APPCC completado",
    description: "Se ha completado un control APPCC",
    category: "appcc",
  },
  {
    id: "inventory.item.created",
    name: "Artículo creado",
    description: "Se ha añadido un nuevo artículo al inventario",
    category: "inventory",
  },
  {
    id: "inventory.item.updated",
    name: "Artículo actualizado",
    description: "Se ha actualizado un artículo del inventario",
    category: "inventory",
  },
  {
    id: "inventory.item.deleted",
    name: "Artículo eliminado",
    description: "Se ha eliminado un artículo del inventario",
    category: "inventory",
  },
  {
    id: "user.created",
    name: "Usuario creado",
    description: "Se ha creado un nuevo usuario",
    category: "user",
  },
  {
    id: "user.updated",
    name: "Usuario actualizado",
    description: "Se ha actualizado un usuario",
    category: "user",
  },
];

// Tipo para webhooks
type Webhook = {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: string;
  lastTriggered: string | null;
};

// Datos de ejemplo para webhooks
const mockWebhooks: Webhook[] = [
  {
    id: "wh_1",
    name: "Integración con WooCommerce",
    url: "https://mitienda.com/api/webhook/shieldcuisine",
    events: ["appcc.control.created", "appcc.control.updated", "appcc.control.completed"],
    secret: "whsec_abcdefghijklmnopqrstuvwxyz123456",
    active: true,
    createdAt: "2025-01-20",
    lastTriggered: "2025-03-26",
  },
  {
    id: "wh_2",
    name: "Notificaciones de inventario",
    url: "https://miempresa.com/api/notifications/inventory",
    events: ["inventory.item.created", "inventory.item.updated", "inventory.item.deleted"],
    secret: "whsec_123456abcdefghijklmnopqrstuvwxyz",
    active: true,
    createdAt: "2025-02-05",
    lastTriggered: "2025-03-25",
  },
  {
    id: "wh_3",
    name: "Sincronización de usuarios",
    url: "https://sistema.miempresa.com/api/sync/users",
    events: ["user.created", "user.updated"],
    secret: "whsec_zyxwvutsrqponmlkjihgfedcba123456",
    active: false,
    createdAt: "2025-02-28",
    lastTriggered: null,
  },
];

// Patrón de ejemplo para el formato JSON de la API
const exampleJsonResponse = `{
  "data": {
    "id": 123,
    "name": "Control de temperatura en frigorífico",
    "value": 4.2,
    "unit": "°C",
    "status": "completed",
    "notes": "Dentro de los parámetros normales",
    "created_at": "2025-03-26T14:32:15Z",
    "updated_at": "2025-03-26T14:32:15Z"
  },
  "meta": {
    "request_id": "req_abcdefghijklmnopqrstuvwxyz"
  }
}`;

export default function ApiPage() {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("keys");
  const [showKeyValue, setShowKeyValue] = useState<Record<string, boolean>>({});
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [webhooks, setWebhooks] = useState<Webhook[]>(mockWebhooks);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);
  const [newApiKey, setNewApiKey] = useState<Partial<ApiKey>>({
    name: "",
    permissions: ["read"],
    ipRestrictions: null,
  });
  const [newWebhook, setNewWebhook] = useState<Partial<Webhook>>({
    name: "",
    url: "",
    events: [],
    active: true,
  });

  // Filtrar claves API por búsqueda
  const filteredApiKeys = apiKeys.filter((key) =>
    key.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtrar webhooks por búsqueda
  const filteredWebhooks = webhooks.filter((webhook) =>
    webhook.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtrar endpoints API por búsqueda
  const filteredApiEndpoints = mockApiEndpoints.filter((endpoint) =>
    endpoint.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generar una clave API aleatoria (solo para demo)
  const generateApiKey = () => {
    return "sk_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Generar un secreto de webhook aleatorio (solo para demo)
  const generateWebhookSecret = () => {
    return "whsec_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Mostrar u ocultar una clave API
  const toggleKeyVisibility = (keyId: string) => {
    setShowKeyValue({
      ...showKeyValue,
      [keyId]: !showKeyValue[keyId],
    });
  };

  // Copiar clave API al portapapeles
  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Clave copiada",
      description: "La clave API ha sido copiada al portapapeles",
    });
  };

  // Crear una nueva clave API
  const handleCreateApiKey = () => {
    const newKey: ApiKey = {
      id: `key_${apiKeys.length + 1}`,
      name: newApiKey.name || "Nueva Clave API",
      key: generateApiKey(),
      created: new Date().toISOString().split("T")[0],
      lastUsed: null,
      status: "active",
      permissions: newApiKey.permissions || ["read"],
      requests: 0,
      ipRestrictions: newApiKey.ipRestrictions,
    };

    setApiKeys([newKey, ...apiKeys]);
    setNewApiKey({
      name: "",
      permissions: ["read"],
      ipRestrictions: null,
    });
    setIsCreatingKey(false);

    toast({
      title: "Clave API creada",
      description: `La clave "${newKey.name}" ha sido creada exitosamente`,
    });
  };

  // Crear un nuevo webhook
  const handleCreateWebhook = () => {
    const newHook: Webhook = {
      id: `wh_${webhooks.length + 1}`,
      name: newWebhook.name || "Nuevo Webhook",
      url: newWebhook.url || "https://example.com/webhook",
      events: newWebhook.events || [],
      secret: generateWebhookSecret(),
      active: newWebhook.active ?? true,
      createdAt: new Date().toISOString().split("T")[0],
      lastTriggered: null,
    };

    setWebhooks([newHook, ...webhooks]);
    setNewWebhook({
      name: "",
      url: "",
      events: [],
      active: true,
    });
    setIsCreatingWebhook(false);

    toast({
      title: "Webhook creado",
      description: `El webhook "${newHook.name}" ha sido creado exitosamente`,
    });
  };

  // Revocar una clave API
  const revokeApiKey = (keyId: string) => {
    setApiKeys(
      apiKeys.map((key) =>
        key.id === keyId ? { ...key, status: "revoked" } : key
      )
    );

    toast({
      title: "Clave API revocada",
      description: "La clave ha sido revocada exitosamente",
      variant: "destructive",
    });
  };

  // Regenerar una clave API
  const regenerateApiKey = (keyId: string) => {
    setApiKeys(
      apiKeys.map((key) =>
        key.id === keyId
          ? { ...key, key: generateApiKey(), status: "active" }
          : key
      )
    );

    toast({
      title: "Clave API regenerada",
      description: "La clave ha sido regenerada exitosamente",
    });
  };

  // Eliminar un webhook
  const deleteWebhook = (webhookId: string) => {
    setWebhooks(webhooks.filter((webhook) => webhook.id !== webhookId));

    toast({
      title: "Webhook eliminado",
      description: "El webhook ha sido eliminado exitosamente",
      variant: "destructive",
    });
  };

  // Cambiar estado de webhook (activo/inactivo)
  const toggleWebhookStatus = (webhookId: string) => {
    setWebhooks(
      webhooks.map((webhook) =>
        webhook.id === webhookId
          ? { ...webhook, active: !webhook.active }
          : webhook
      )
    );

    const webhook = webhooks.find((w) => w.id === webhookId);
    if (webhook) {
      toast({
        title: webhook.active
          ? "Webhook desactivado"
          : "Webhook activado",
        description: `El webhook "${webhook.name}" ha sido ${
          webhook.active ? "desactivado" : "activado"
        } exitosamente`,
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API</h1>
          <p className="text-muted-foreground">
            Gestione las claves API, webhooks y explore la documentación de la API
          </p>
        </div>
        <div className="flex space-x-2">
          <div className="w-full md:w-auto relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="pl-8 w-full md:w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid grid-cols-1 md:grid-cols-4 lg:w-auto">
          <TabsTrigger value="keys">Claves API</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="docs">Documentación</TabsTrigger>
        </TabsList>

        {/* Sección Claves API */}
        <TabsContent value="keys" className="pt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Claves API</CardTitle>
                  <CardDescription>
                    Gestione las claves API para integraciones con terceros
                  </CardDescription>
                </div>
                <Button onClick={() => setIsCreatingKey(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Clave
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Nombre</TableHead>
                    <TableHead>Clave</TableHead>
                    <TableHead>Permisos</TableHead>
                    <TableHead>Creada</TableHead>
                    <TableHead>Último Uso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Peticiones</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell className="font-medium">{apiKey.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                            {showKeyValue[apiKey.id]
                              ? apiKey.key
                              : apiKey.key.substring(0, 10) + "..." + apiKey.key.substring(apiKey.key.length - 4)}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                          >
                            {showKeyValue[apiKey.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showKeyValue[apiKey.id] ? "Ocultar" : "Mostrar"}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyApiKey(apiKey.key)}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copiar</span>
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {apiKey.permissions.map((permission) => (
                            <Badge
                              key={permission}
                              variant="outline"
                              className={
                                permission === "read"
                                  ? "bg-blue-50 text-blue-700 hover:bg-blue-50"
                                  : permission === "write"
                                  ? "bg-amber-50 text-amber-700 hover:bg-amber-50"
                                  : "bg-red-50 text-red-700 hover:bg-red-50"
                              }
                            >
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{apiKey.created}</TableCell>
                      <TableCell>
                        {apiKey.lastUsed || "Nunca utilizada"}
                      </TableCell>
                      <TableCell>
                        {apiKey.status === "active" ? (
                          <Badge className="bg-green-50 text-green-700 hover:bg-green-50">
                            Activa
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Revocada</Badge>
                        )}
                      </TableCell>
                      <TableCell>{apiKey.requests.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        {apiKey.status === "active" ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                              >
                                <Lock className="h-4 w-4" />
                                <span className="sr-only">Revocar</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Está seguro de revocar esta clave?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Al revocar esta clave API, cualquier integración
                                  que la esté utilizando dejará de funcionar
                                  inmediatamente. Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => revokeApiKey(apiKey.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Revocar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => regenerateApiKey(apiKey.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span className="sr-only">Regenerar</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredApiKeys.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No se encontraron claves API
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Uso</CardTitle>
              <CardDescription>
                Análisis del uso de las claves API en los últimos 30 días
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Total de Peticiones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">128,756</div>
                    <div className="flex items-center text-sm text-green-500">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span>+12.5% vs mes anterior</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Tasa de Error</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0.4%</div>
                    <div className="flex items-center text-sm text-green-500">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      <span>-0.2% vs mes anterior</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Tiempo de Respuesta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">87ms</div>
                    <div className="flex items-center text-sm text-green-500">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      <span>-15ms vs mes anterior</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Claves Activas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {apiKeys.filter((key) => key.status === "active").length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      De {apiKeys.length} totales
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="border rounded-lg p-4 bg-card">
                <h3 className="text-lg font-medium mb-4">Peticiones por día</h3>
                <div className="h-48 w-full bg-muted rounded-lg flex items-end">
                  {Array(30)
                    .fill(0)
                    .map((_, i) => {
                      const height = Math.floor(Math.random() * 60) + 20;
                      return (
                        <div
                          key={i}
                          className="w-full h-full flex items-end mx-[1px]"
                          title={`Día ${i + 1}: ${Math.floor(height * 100)} peticiones`}
                        >
                          <div
                            className="w-full bg-primary rounded-sm opacity-80 hover:opacity-100 transition-opacity"
                            style={{ height: `${height}%` }}
                          ></div>
                        </div>
                      );
                    })}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>26 Feb</span>
                  <span>26 Mar</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sección Endpoints */}
        <TabsContent value="endpoints" className="pt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Endpoints API</CardTitle>
              <CardDescription>
                Lista de todos los endpoints disponibles en la API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Método</TableHead>
                    <TableHead className="w-[300px]">Ruta</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Autenticación</TableHead>
                    <TableHead>Límite</TableHead>
                    <TableHead>Uso (última hora)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApiEndpoints.map((endpoint, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            endpoint.method === "GET"
                              ? "bg-blue-50 text-blue-700 hover:bg-blue-50"
                              : endpoint.method === "POST"
                              ? "bg-green-50 text-green-700 hover:bg-green-50"
                              : endpoint.method === "PUT"
                              ? "bg-amber-50 text-amber-700 hover:bg-amber-50"
                              : endpoint.method === "DELETE"
                              ? "bg-red-50 text-red-700 hover:bg-red-50"
                              : "bg-purple-50 text-purple-700 hover:bg-purple-50"
                          }
                        >
                          {endpoint.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                          {endpoint.path}
                        </code>
                      </TableCell>
                      <TableCell>{endpoint.description}</TableCell>
                      <TableCell>
                        {endpoint.authenticated ? (
                          <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                            Requerida
                          </Badge>
                        ) : (
                          <Badge className="bg-green-50 text-green-700 hover:bg-green-50">
                            Pública
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{endpoint.rateLimit}/hora</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-full bg-muted h-2 rounded-full mr-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${(endpoint.lastHourUsage / endpoint.rateLimit) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {endpoint.lastHourUsage}/{endpoint.rateLimit}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Códigos de Estado</CardTitle>
              <CardDescription>
                Códigos de estado HTTP utilizados por la API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-4">Éxito</h3>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <Badge className="bg-green-50 text-green-700 h-6 min-w-[3rem] flex items-center justify-center mr-2">
                        200
                      </Badge>
                      <div>
                        <div className="font-medium">OK</div>
                        <div className="text-sm text-muted-foreground">
                          La solicitud se ha procesado correctamente.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Badge className="bg-green-50 text-green-700 h-6 min-w-[3rem] flex items-center justify-center mr-2">
                        201
                      </Badge>
                      <div>
                        <div className="font-medium">Created</div>
                        <div className="text-sm text-muted-foreground">
                          El recurso se ha creado correctamente.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Badge className="bg-green-50 text-green-700 h-6 min-w-[3rem] flex items-center justify-center mr-2">
                        204
                      </Badge>
                      <div>
                        <div className="font-medium">No Content</div>
                        <div className="text-sm text-muted-foreground">
                          La solicitud se ha procesado correctamente, pero no hay contenido que devolver.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Error</h3>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <Badge className="bg-amber-50 text-amber-700 h-6 min-w-[3rem] flex items-center justify-center mr-2">
                        400
                      </Badge>
                      <div>
                        <div className="font-medium">Bad Request</div>
                        <div className="text-sm text-muted-foreground">
                          La solicitud no es válida o está malformada.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Badge className="bg-amber-50 text-amber-700 h-6 min-w-[3rem] flex items-center justify-center mr-2">
                        401
                      </Badge>
                      <div>
                        <div className="font-medium">Unauthorized</div>
                        <div className="text-sm text-muted-foreground">
                          La autenticación ha fallado o no se ha proporcionado.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Badge className="bg-amber-50 text-amber-700 h-6 min-w-[3rem] flex items-center justify-center mr-2">
                        403
                      </Badge>
                      <div>
                        <div className="font-medium">Forbidden</div>
                        <div className="text-sm text-muted-foreground">
                          No tiene permisos para acceder al recurso.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Badge className="bg-amber-50 text-amber-700 h-6 min-w-[3rem] flex items-center justify-center mr-2">
                        404
                      </Badge>
                      <div>
                        <div className="font-medium">Not Found</div>
                        <div className="text-sm text-muted-foreground">
                          El recurso solicitado no existe.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Badge className="bg-red-50 text-red-700 h-6 min-w-[3rem] flex items-center justify-center mr-2">
                        429
                      </Badge>
                      <div>
                        <div className="font-medium">Too Many Requests</div>
                        <div className="text-sm text-muted-foreground">
                          Se ha superado el límite de peticiones.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Badge className="bg-red-50 text-red-700 h-6 min-w-[3rem] flex items-center justify-center mr-2">
                        500
                      </Badge>
                      <div>
                        <div className="font-medium">Internal Server Error</div>
                        <div className="text-sm text-muted-foreground">
                          Ha ocurrido un error en el servidor.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sección Webhooks */}
        <TabsContent value="webhooks" className="pt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Webhooks</CardTitle>
                  <CardDescription>
                    Gestione la entrega de eventos a sus sistemas externos
                  </CardDescription>
                </div>
                <Button onClick={() => setIsCreatingWebhook(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Nombre</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Eventos</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead>Último Uso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWebhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell className="font-medium">{webhook.name}</TableCell>
                      <TableCell>
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                          {webhook.url}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.length > 2 ? (
                            <>
                              {webhook.events.slice(0, 2).map((event) => (
                                <Badge
                                  key={event}
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 hover:bg-blue-50"
                                >
                                  {event.split(".").slice(-1)[0]}
                                </Badge>
                              ))}
                              <Badge
                                variant="outline"
                                className="bg-muted hover:bg-muted"
                              >
                                +{webhook.events.length - 2} más
                              </Badge>
                            </>
                          ) : (
                            webhook.events.map((event) => (
                              <Badge
                                key={event}
                                variant="outline"
                                className="bg-blue-50 text-blue-700 hover:bg-blue-50"
                              >
                                {event.split(".").slice(-1)[0]}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{webhook.createdAt}</TableCell>
                      <TableCell>{webhook.lastTriggered || "Nunca utilizado"}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Switch
                            checked={webhook.active}
                            onCheckedChange={() => toggleWebhookStatus(webhook.id)}
                            className="mr-2"
                          />
                          <span>{webhook.active ? "Activo" : "Inactivo"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="icon">
                            <Settings className="h-4 w-4" />
                            <span className="sr-only">Configurar</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Está seguro de eliminar este webhook?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Al eliminar este webhook, no recibirá más
                                  notificaciones de eventos en la URL configurada.
                                  Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteWebhook(webhook.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredWebhooks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No se encontraron webhooks
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Eventos Disponibles</CardTitle>
              <CardDescription>
                Lista de todos los eventos que pueden ser enviados a los webhooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["appcc", "inventory", "user"].map((category) => (
                  <div key={category}>
                    <h3 className="text-lg font-medium mb-4 capitalize">
                      {category === "appcc" ? "APPCC" : category}
                    </h3>
                    <div className="space-y-2">
                      {mockWebhookEvents
                        .filter((event) => event.category === category)
                        .map((event) => (
                          <div
                            key={event.id}
                            className="flex items-start rounded-lg border p-3"
                          >
                            <div>
                              <div className="font-medium">{event.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {event.description}
                              </div>
                              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs mt-1">
                                {event.id}
                              </code>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sección Documentación */}
        <TabsContent value="docs" className="pt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentación de la API</CardTitle>
              <CardDescription>
                Guía para comenzar a utilizar la API de ShieldCuisine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Autenticación</h3>
                  <p className="mb-4">
                    Todas las peticiones a la API deben ser autenticadas
                    utilizando una clave API. Para autenticar, añada la clave en
                    el encabezado HTTP:
                  </p>
                  <pre className="bg-muted p-4 rounded-lg font-mono text-sm whitespace-pre overflow-x-auto">
                    Authorization: Bearer su_clave_api
                  </pre>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Formato de Respuesta</h3>
                  <p className="mb-4">
                    Todas las respuestas son devueltas en formato JSON con la
                    siguiente estructura:
                  </p>
                  <pre className="bg-muted p-4 rounded-lg font-mono text-sm whitespace-pre overflow-x-auto">
                    {exampleJsonResponse}
                  </pre>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Ejemplos de Uso</h3>
                  <p className="mb-4">
                    A continuación se muestra un ejemplo de cómo listar todos los
                    controles APPCC:
                  </p>
                  <pre className="bg-muted p-4 rounded-lg font-mono text-sm whitespace-pre overflow-x-auto">
                    {`curl https://api.shieldcuisine.com/api/appcc/controls \\
  -H "Authorization: Bearer su_clave_api" \\
  -H "Content-Type: application/json"`}
                  </pre>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Paginación</h3>
                  <p className="mb-4">
                    Para los endpoints que devuelven listas de recursos, se
                    utiliza paginación. Puede controlar la paginación con los
                    siguientes parámetros:
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        page
                      </code>{" "}
                      - Número de página (predeterminado: 1)
                    </li>
                    <li>
                      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        limit
                      </code>{" "}
                      - Número de resultados por página (predeterminado: 20, máximo: 100)
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Bibliotecas de Cliente
                  </h3>
                  <p className="mb-4">
                    Ofrecemos bibliotecas de cliente para varios lenguajes:
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      <a
                        href="#"
                        className="text-primary hover:underline font-medium"
                      >
                        JavaScript (npm)
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-primary hover:underline font-medium"
                      >
                        Python (pip)
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-primary hover:underline font-medium"
                      >
                        PHP (composer)
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Descargar Documentación
              </Button>
              <Button>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerar Documentación
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para crear nueva clave API */}
      <Dialog open={isCreatingKey} onOpenChange={setIsCreatingKey}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nueva Clave API</DialogTitle>
            <DialogDescription>
              Rellene el formulario para crear una nueva clave API para
              integraciones con terceros
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apiName">Nombre de la Clave</Label>
              <Input
                id="apiName"
                placeholder="Ej: Integración con WooCommerce"
                value={newApiKey.name}
                onChange={(e) =>
                  setNewApiKey({ ...newApiKey, name: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Un nombre descriptivo para identificar esta clave
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="permissions">Permisos</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={
                    newApiKey.permissions?.includes("read")
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    const permissions = newApiKey.permissions || [];
                    if (permissions.includes("read")) {
                      setNewApiKey({
                        ...newApiKey,
                        permissions: permissions.filter((p) => p !== "read"),
                      });
                    } else {
                      setNewApiKey({
                        ...newApiKey,
                        permissions: [...permissions, "read"],
                      });
                    }
                  }}
                >
                  Lectura
                </Button>
                <Button
                  type="button"
                  variant={
                    newApiKey.permissions?.includes("write")
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    const permissions = newApiKey.permissions || [];
                    if (permissions.includes("write")) {
                      setNewApiKey({
                        ...newApiKey,
                        permissions: permissions.filter((p) => p !== "write"),
                      });
                    } else {
                      setNewApiKey({
                        ...newApiKey,
                        permissions: [...permissions, "write"],
                      });
                    }
                  }}
                >
                  Escritura
                </Button>
                <Button
                  type="button"
                  variant={
                    newApiKey.permissions?.includes("delete")
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    const permissions = newApiKey.permissions || [];
                    if (permissions.includes("delete")) {
                      setNewApiKey({
                        ...newApiKey,
                        permissions: permissions.filter((p) => p !== "delete"),
                      });
                    } else {
                      setNewApiKey({
                        ...newApiKey,
                        permissions: [...permissions, "delete"],
                      });
                    }
                  }}
                >
                  Eliminación
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipRestrictions">Restricciones de IP (opcional)</Label>
              <Textarea
                id="ipRestrictions"
                placeholder="Ej: 192.168.1.1, 192.168.1.2"
                value={
                  newApiKey.ipRestrictions
                    ? newApiKey.ipRestrictions.join(", ")
                    : ""
                }
                onChange={(e) =>
                  setNewApiKey({
                    ...newApiKey,
                    ipRestrictions: e.target.value
                      ? e.target.value.split(",").map((ip) => ip.trim())
                      : null,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Limite el acceso a ciertas direcciones IP. Deje en blanco para
                permitir todas las IPs
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingKey(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateApiKey}>Crear Clave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para crear nuevo webhook */}
      <Dialog open={isCreatingWebhook} onOpenChange={setIsCreatingWebhook}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Webhook</DialogTitle>
            <DialogDescription>
              Configure un nuevo endpoint para recibir eventos en tiempo real
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="webhookName">Nombre del Webhook</Label>
              <Input
                id="webhookName"
                placeholder="Ej: Notificaciones de inventario"
                value={newWebhook.name}
                onChange={(e) =>
                  setNewWebhook({ ...newWebhook, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookUrl">URL del Webhook</Label>
              <Input
                id="webhookUrl"
                placeholder="https://ejemplo.com/webhook"
                value={newWebhook.url}
                onChange={(e) =>
                  setNewWebhook({ ...newWebhook, url: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                La URL a la que enviaremos los eventos
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookEvents">Eventos</Label>
              <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3">
                {mockWebhookEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      id={`event-${event.id}`}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                      checked={(newWebhook.events || []).includes(event.id)}
                      onChange={(e) => {
                        const events = newWebhook.events || [];
                        if (e.target.checked) {
                          setNewWebhook({
                            ...newWebhook,
                            events: [...events, event.id],
                          });
                        } else {
                          setNewWebhook({
                            ...newWebhook,
                            events: events.filter((id) => id !== event.id),
                          });
                        }
                      }}
                    />
                    <Label
                      htmlFor={`event-${event.id}`}
                      className="cursor-pointer flex-1"
                    >
                      <div className="font-medium">{event.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {event.description}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="webhookActive"
                checked={newWebhook.active}
                onCheckedChange={(checked) =>
                  setNewWebhook({ ...newWebhook, active: checked })
                }
              />
              <Label htmlFor="webhookActive">Activar webhook inmediatamente</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingWebhook(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateWebhook}>Crear Webhook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}