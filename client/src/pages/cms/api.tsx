import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Copy,
  RefreshCcw,
  Key,
  Loader2,
  Plus,
  Trash2,
  Code,
  CheckCircle,
  ChevronRight,
  Info,
  Link2,
  RotateCw,
  ShieldAlert,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ApiKey {
  id: number;
  companyId: number;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  isRevoked: boolean;
}

interface ApiEndpoint {
  id: string;
  path: string;
  method: string;
  description: string;
  requiresAuth: boolean;
  requestParams?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  responseExample?: string;
}

// Formulario para crear una nueva API key
const apiKeyFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  permissions: z.array(z.string()).min(1, "Selecciona al menos un permiso"),
  expiresAt: z.string().optional(),
});

type ApiKeyFormValues = z.infer<typeof apiKeyFormSchema>;

// Componente principal
const ApiPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("keys");
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showCreateKeyDialog, setShowCreateKeyDialog] = useState(false);
  const [showRevokeKeyDialog, setShowRevokeKeyDialog] = useState(false);
  const [newKey, setNewKey] = useState<ApiKey | null>(null);
  
  // Obtener API keys
  const { 
    data: apiKeys, 
    isLoading: isLoadingKeys, 
    error: keysError 
  } = useQuery<ApiKey[]>({
    queryKey: ["/api/cms/api-keys"],
    queryFn: async () => {
      if (!user?.companyId) {
        return [];
      }
      const response = await fetch(`/api/cms/api-keys?companyId=${user.companyId}`);
      if (!response.ok) {
        throw new Error("Error al cargar las claves API");
      }
      return response.json();
    },
  });

  // Lista de endpoints disponibles de la API
  const { 
    data: apiEndpoints, 
    isLoading: isLoadingEndpoints, 
    error: endpointsError 
  } = useQuery<ApiEndpoint[]>({
    queryKey: ["/api/cms/api-endpoints"],
    queryFn: async () => {
      const response = await fetch('/api/cms/api-endpoints');
      if (!response.ok) {
        throw new Error("Error al cargar los endpoints de la API");
      }
      return response.json();
    },
  });

  // Mutación para crear una nueva API key
  const createApiKeyMutation = useMutation({
    mutationFn: async (data: ApiKeyFormValues) => {
      if (!user?.companyId) {
        throw new Error("No se pudo identificar la compañía");
      }
      
      const response = await apiRequest("POST", "/api/cms/api-keys", {
        ...data,
        companyId: user.companyId,
      });
      
      if (!response.ok) {
        throw new Error("Error al crear la clave API");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/api-keys"] });
      setNewKey(data);
      setShowCreateKeyDialog(false);
      toast({
        title: "Clave API creada",
        description: "La clave API ha sido creada correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la clave API",
        variant: "destructive",
      });
    },
  });

  // Mutación para revocar una API key
  const revokeApiKeyMutation = useMutation({
    mutationFn: async (keyId: number) => {
      const response = await apiRequest("PUT", `/api/cms/api-keys/${keyId}/revoke`, {});
      
      if (!response.ok) {
        throw new Error("Error al revocar la clave API");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/api-keys"] });
      setShowRevokeKeyDialog(false);
      setSelectedApiKey(null);
      toast({
        title: "Clave API revocada",
        description: "La clave API ha sido revocada correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo revocar la clave API",
        variant: "destructive",
      });
    },
  });

  // Formulario para crear una API key
  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      name: "",
      permissions: [],
      expiresAt: "",
    },
  });

  // Manejar el envío del formulario
  const onSubmit = (values: ApiKeyFormValues) => {
    createApiKeyMutation.mutate(values);
  };

  // Función para copiar al portapapeles
  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key).then(
      () => {
        setCopiedKey(key);
        toast({
          title: "Copiado",
          description: "Clave API copiada al portapapeles",
        });
        
        // Resetear después de 2 segundos
        setTimeout(() => {
          setCopiedKey(null);
        }, 2000);
      },
      (err) => {
        toast({
          title: "Error",
          description: "No se pudo copiar la clave API",
          variant: "destructive",
        });
      }
    );
  };

  // Función para abrir el diálogo de revocar clave
  const openRevokeDialog = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey);
    setShowRevokeKeyDialog(true);
  };

  // Función para revocar una clave API
  const handleRevokeKey = () => {
    if (selectedApiKey) {
      revokeApiKeyMutation.mutate(selectedApiKey.id);
    }
  };

  // Renderizar el estado de carga para API keys
  if (isLoadingKeys) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-6 w-3/4 mt-2" />
        </div>
        
        <Skeleton className="h-10 w-32 mb-4" />
        
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Renderizar el estado de error para API keys
  if (keysError) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No se pudieron cargar las claves API. Por favor, inténtelo de nuevo.</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/cms/api-keys"] })}
            >
              Reintentar
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">API del CMS</h1>
        <p className="text-muted-foreground">
          Gestiona las claves API y consulta la documentación de los endpoints disponibles
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="keys">Claves API</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="docs">Documentación</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Claves API</h2>
            <Button onClick={() => setShowCreateKeyDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Clave API
            </Button>
          </div>

          {newKey && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-300 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Nueva clave API creada</span>
                </CardTitle>
                <CardDescription className="text-green-600 dark:text-green-400">
                  Guarda esta información de forma segura. La clave secreta no se volverá a mostrar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-green-700 dark:text-green-300">Nombre</Label>
                  <p className="text-sm font-medium">{newKey.name}</p>
                </div>
                <div>
                  <Label className="text-green-700 dark:text-green-300">Clave secreta</Label>
                  <div className="flex items-center mt-1 space-x-2">
                    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                      {newKey.key}
                    </code>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(newKey.key)}
                      className="h-8 gap-1"
                    >
                      {copiedKey === newKey.key ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => setNewKey(null)}>
                  Cerrar
                </Button>
              </CardFooter>
            </Card>
          )}

          {apiKeys && apiKeys.length === 0 ? (
            <Card>
              <CardContent className="pt-6 pb-6 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <Key className="h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">No hay claves API</h3>
                  <p className="text-muted-foreground">
                    Crea tu primera clave API para comenzar a utilizar la API de tu CMS
                  </p>
                  <Button className="mt-2" onClick={() => setShowCreateKeyDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Clave API
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Permisos</TableHead>
                    <TableHead>Creada</TableHead>
                    <TableHead>Expira</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys && apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {key.permissions.map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(key.createdAt), "dd MMM yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>
                        {key.expiresAt 
                          ? format(new Date(key.expiresAt), "dd MMM yyyy", { locale: es }) 
                          : "Sin expiración"}
                      </TableCell>
                      <TableCell>
                        {key.isRevoked ? (
                          <Badge variant="destructive">Revocada</Badge>
                        ) : (
                          <Badge variant="default">Activa</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openRevokeDialog(key)}
                          disabled={key.isRevoked}
                          className="h-8 px-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="endpoints" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Endpoints disponibles</h2>
            <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/cms/api-endpoints"] })}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          </div>

          {isLoadingEndpoints ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : endpointsError ? (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-destructive">Error al cargar los endpoints</p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/cms/api-endpoints"] })}
                >
                  Reintentar
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {apiEndpoints && apiEndpoints.map((endpoint) => (
                <AccordionItem key={endpoint.id} value={endpoint.id}>
                  <AccordionTrigger className="hover:no-underline group">
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        endpoint.method === "GET" ? "default" :
                        endpoint.method === "POST" ? "outline" :
                        endpoint.method === "PUT" ? "secondary" :
                        "destructive"
                      }>
                        {endpoint.method}
                      </Badge>
                      <span className="font-mono text-sm">{endpoint.path}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 px-4">
                    <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                    
                    {endpoint.requiresAuth && (
                      <div className="flex items-center gap-2 text-amber-500 text-xs">
                        <ShieldAlert className="h-4 w-4" />
                        <span>Requiere autenticación API</span>
                      </div>
                    )}
                    
                    {endpoint.requestParams && endpoint.requestParams.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Parámetros</h4>
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Requerido</TableHead>
                                <TableHead>Descripción</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {endpoint.requestParams.map((param, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-mono text-xs">{param.name}</TableCell>
                                  <TableCell className="text-xs">{param.type}</TableCell>
                                  <TableCell>
                                    {param.required ? (
                                      <Badge className="text-xs">Requerido</Badge>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">Opcional</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-xs">{param.description}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                    
                    {endpoint.responseExample && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Ejemplo de respuesta</h4>
                        <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs">
                          {endpoint.responseExample}
                        </pre>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </TabsContent>

        <TabsContent value="docs" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Documentación de la API</h2>
            <Button variant="outline">
              <Link2 className="mr-2 h-4 w-4" />
              Ver documentación completa
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Introducción</CardTitle>
              <CardDescription>
                Descripción general de la API del CMS y cómo utilizarla
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                La API del CMS te permite acceder y manipular los contenidos de tu sitio web de forma programática.
                Puedes utilizarla para integrar tu contenido con aplicaciones externas, automatizar procesos,
                o crear experiencias personalizadas.
              </p>

              <h3 className="text-lg font-medium">Autenticación</h3>
              <p className="text-sm">
                Todas las solicitudes a la API deben incluir una clave de API válida en la cabecera de la solicitud:
              </p>
              <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs">
                {`Authorization: Bearer [TU_CLAVE_API]`}
              </pre>

              <h3 className="text-lg font-medium">Formato de respuesta</h3>
              <p className="text-sm">
                Todas las respuestas de la API están en formato JSON con la siguiente estructura:
              </p>
              <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs">
                {`{
  "success": true,
  "data": { ... },
  "meta": { 
    "pagination": { 
      "page": 1, 
      "totalPages": 5, 
      "totalItems": 100 
    } 
  }
}`}
              </pre>

              <h3 className="text-lg font-medium">Errores</h3>
              <p className="text-sm">
                En caso de error, la API devuelve un código de estado HTTP adecuado y un mensaje de error:
              </p>
              <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs">
                {`{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "El campo 'title' es obligatorio"
  }
}`}
              </pre>
              
              <h3 className="text-lg font-medium">Límites y paginación</h3>
              <p className="text-sm">
                Los endpoints que devuelven listas de recursos admiten paginación mediante los parámetros
                <code className="text-xs mx-1 p-1 bg-muted rounded">page</code> y 
                <code className="text-xs mx-1 p-1 bg-muted rounded">limit</code>.
              </p>
              <p className="text-sm">
                Ejemplo de solicitud paginada:
              </p>
              <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs">
                {`GET /api/cms/pages?page=2&limit=10`}
              </pre>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Guías y ejemplos</CardTitle>
              <CardDescription>
                Guías básicas para el uso de la API con diferentes lenguajes de programación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="js" className="w-full">
                <TabsList>
                  <TabsTrigger value="js">JavaScript</TabsTrigger>
                  <TabsTrigger value="php">PHP</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>
                <TabsContent value="js" className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Ejemplo con JavaScript</h3>
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs">
                    {`// Obtener páginas con fetch
async function getPages() {
  const response = await fetch('https://tu-dominio.com/api/cms/pages', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer TU_CLAVE_API',
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data;
}

// Crear una nueva página
async function createPage(pageData) {
  const response = await fetch('https://tu-dominio.com/api/cms/pages', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer TU_CLAVE_API',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(pageData)
  });
  
  const data = await response.json();
  return data;
}`}
                  </pre>
                </TabsContent>
                <TabsContent value="php" className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Ejemplo con PHP</h3>
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs">
                    {`<?php
// Obtener páginas con cURL
function getPages() {
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, 'https://tu-dominio.com/api/cms/pages');
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer TU_CLAVE_API',
    'Content-Type: application/json'
  ]);
  
  $response = curl_exec($ch);
  curl_close($ch);
  
  return json_decode($response, true);
}

// Crear una nueva página
function createPage($pageData) {
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, 'https://tu-dominio.com/api/cms/pages');
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($pageData));
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer TU_CLAVE_API',
    'Content-Type: application/json'
  ]);
  
  $response = curl_exec($ch);
  curl_close($ch);
  
  return json_decode($response, true);
}
?>`}
                  </pre>
                </TabsContent>
                <TabsContent value="python" className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Ejemplo con Python</h3>
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs">
                    {`import requests
import json

# Obtener páginas
def get_pages():
    headers = {
        'Authorization': 'Bearer TU_CLAVE_API',
        'Content-Type': 'application/json'
    }
    
    response = requests.get('https://tu-dominio.com/api/cms/pages', headers=headers)
    return response.json()

# Crear una nueva página
def create_page(page_data):
    headers = {
        'Authorization': 'Bearer TU_CLAVE_API',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(
        'https://tu-dominio.com/api/cms/pages',
        headers=headers,
        data=json.dumps(page_data)
    )
    
    return response.json()`}
                  </pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Diálogo para crear una nueva API key */}
      <Dialog open={showCreateKeyDialog} onOpenChange={setShowCreateKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear nueva clave API</DialogTitle>
            <DialogDescription>
              Genera una nueva clave para integrar tu aplicación con la API del CMS
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Mi Aplicación" {...field} />
                    </FormControl>
                    <FormDescription>
                      Un nombre descriptivo para identificar esta clave
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <div className="mb-2">
                      <FormLabel>Permisos</FormLabel>
                      <FormDescription>
                        Selecciona los permisos que quieres otorgar a esta clave
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        "pages.read",
                        "pages.write",
                        "media.read",
                        "media.write",
                        "categories.read",
                        "categories.write",
                        "tags.read",
                        "tags.write"
                      ].map((permission) => (
                        <FormField
                          key={permission}
                          control={form.control}
                          name="permissions"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={permission}
                                className="flex flex-row items-center space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(permission)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...field.value, permission]);
                                      } else {
                                        field.onChange(
                                          field.value?.filter(
                                            (value) => value !== permission
                                          )
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {permission}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de expiración (opcional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      Deja en blanco para que la clave no expire
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateKeyDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={createApiKeyMutation.isPending}
                >
                  {createApiKeyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Creando...</span>
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      <span>Crear clave API</span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para revocar una API key */}
      <Dialog open={showRevokeKeyDialog} onOpenChange={setShowRevokeKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Revocar clave API</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. La clave API dejará de funcionar inmediatamente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              ¿Estás seguro de que quieres revocar la clave API 
              <span className="font-medium"> "{selectedApiKey?.name}"</span>?
            </p>
            {selectedApiKey?.key && (
              <div className="bg-muted p-2 rounded-md text-xs font-mono text-muted-foreground">
                {selectedApiKey.key.substring(0, 20)}...
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowRevokeKeyDialog(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="button"
              variant="destructive"
              onClick={handleRevokeKey}
              disabled={revokeApiKeyMutation.isPending}
            >
              {revokeApiKeyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Revocando...</span>
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Revocar clave</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiPage;