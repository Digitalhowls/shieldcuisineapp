import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Key, RefreshCw, Plus, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const ApiPage: React.FC = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<{
    id: string;
    name: string;
    key: string;
    createdAt: Date;
    lastUsed: Date | null;
    active: boolean;
  }[]>([]);

  // Simular generación de API key
  const generateApiKey = (name: string) => {
    const key = `sk_${Math.random().toString(36).substr(2, 9)}_${Math.random().toString(36).substr(2, 9)}`;
    const newKey = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      key,
      createdAt: new Date(),
      lastUsed: null,
      active: true,
    };
    
    setApiKeys([...apiKeys, newKey]);
    
    toast({
      title: "API Key generada",
      description: "La nueva API Key ha sido creada correctamente.",
    });
    
    return newKey;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado al portapapeles",
      description: "La API Key ha sido copiada al portapapeles.",
    });
  };

  const toggleApiKey = (id: string) => {
    setApiKeys(
      apiKeys.map((key) => 
        key.id === id ? { ...key, active: !key.active } : key
      )
    );
    
    toast({
      title: "Estado actualizado",
      description: "El estado de la API Key ha sido actualizado.",
    });
  };

  const deleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id));
    
    toast({
      title: "API Key eliminada",
      description: "La API Key ha sido eliminada correctamente.",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">API y Desarrolladores</h1>
        <p className="text-muted-foreground">
          Administra las llaves de API y las integraciones para desarrolladores
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Peticiones</CardTitle>
            <CardDescription>
              Total de peticiones a la API
            </CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            0
          </CardContent>
          <CardFooter className="text-muted-foreground text-sm">
            En los últimos 30 días
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Llaves Activas</CardTitle>
            <CardDescription>
              Llaves de API en uso
            </CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {apiKeys.filter(k => k.active).length}
          </CardContent>
          <CardFooter className="text-muted-foreground text-sm">
            De un total de {apiKeys.length} llaves
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Integraciones</CardTitle>
            <CardDescription>
              Servicios conectados
            </CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            0
          </CardContent>
          <CardFooter className="text-muted-foreground text-sm">
            Configuradas y activas
          </CardFooter>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Llaves de API</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              <span>Nueva llave</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear nueva llave de API</DialogTitle>
              <DialogDescription>
                Las llaves de API permiten a aplicaciones externas interactuar con tu plataforma.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Nombre de la llave</Label>
                <Input
                  id="key-name"
                  placeholder="Ej: App Web, Integración con CRM"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Permisos</Label>
                  <p className="text-sm text-muted-foreground">
                    Define qué acciones puede realizar esta llave de API
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => generateApiKey("Nueva API Key")}
              >
                Generar llave de API
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {apiKeys.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <div className="flex flex-col items-center space-y-3">
              <Key className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No hay llaves de API</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Crea tu primera llave de API para permitir que aplicaciones externas se conecten a tu plataforma. Las llaves de API son credenciales secretas que deben protegerse.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear llave de API
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  {/* Mismo contenido que el diálogo anterior */}
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableCaption>Listado de llaves de API</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Llave</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead>Último uso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">{apiKey.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs">
                        {apiKey.key.substring(0, 8)}...{apiKey.key.substring(apiKey.key.length - 4)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {apiKey.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {apiKey.lastUsed
                      ? apiKey.lastUsed.toLocaleDateString()
                      : "Nunca"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={apiKey.active ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleApiKey(apiKey.id)}
                    >
                      {apiKey.active ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deleteApiKey(apiKey.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Documentación de la API</h2>
        <Card>
          <CardHeader>
            <CardTitle>Guía para desarrolladores</CardTitle>
            <CardDescription>
              Aprende a utilizar nuestra API y a integrar tus aplicaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              La API de ShieldCuisine permite a desarrolladores acceder a datos de seguridad alimentaria, 
              inventario, conformidad APPCC y más, de forma segura y estructurada.
            </p>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Autenticación</h3>
              <p className="text-sm text-muted-foreground">
                Todas las peticiones deben incluir tu llave de API en la cabecera:
              </p>
              <div className="bg-muted p-3 rounded-md font-mono text-sm">
                Authorization: Bearer sk_your_api_key
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Endpoints disponibles</h3>
              <p className="text-sm text-muted-foreground">
                A continuación se muestran los principales endpoints:
              </p>
              <div className="bg-muted p-3 rounded-md font-mono text-sm">
                GET /api/v1/controls<br />
                GET /api/v1/controls/:id<br />
                GET /api/v1/inventory<br />
                GET /api/v1/reports
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline">
              Ver documentación completa
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ApiPage;