import React from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import {
  PaletteIcon,
  Upload,
  Type,
  Save,
  Globe,
  Image as ImageIcon,
} from "lucide-react";

const BrandingPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Obtener información de marca del CMS
  const { data: branding, isLoading } = useQuery({
    queryKey: ["/api/cms/branding"],
    queryFn: async () => {
      if (!user?.companyId) {
        return null;
      }
      // En un entorno real, esto obtendría la configuración de marca
      return null;
    },
  });

  // Simulación de guardar los cambios
  const handleSave = () => {
    toast({
      title: "Cambios guardados",
      description: "La configuración de marca ha sido actualizada con éxito.",
    });
  };

  // Renderizar el estado de carga
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-6 w-3/4 mt-2" />
        </div>
        
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Configuración de Marca</h1>
        <p className="text-muted-foreground">
          Personaliza la apariencia y estilo de tu sitio web
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="colors">Colores y Estilos</TabsTrigger>
          <TabsTrigger value="typography">Tipografía</TabsTrigger>
          <TabsTrigger value="social">Redes Sociales</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
              <CardDescription>
                Configura la información básica de tu marca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Nombre del Sitio</Label>
                  <Input id="site-name" placeholder="Mi Empresa" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Eslogan</Label>
                  <Input id="tagline" placeholder="Eslogan o descripción breve" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Descripción detallada de tu empresa"
                  rows={4}
                />
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label>Logo Principal</Label>
                <Card className="relative h-48 flex flex-col items-center justify-center gap-2 border-dashed cursor-pointer hover:bg-muted/50 transition-colors">
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Arrastra y suelta o haz clic para subir
                  </p>
                  <Button variant="secondary" size="sm" className="mt-2">
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Logo
                  </Button>
                </Card>
              </div>
              
              <div className="space-y-2">
                <Label>Favicon</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="relative h-32 flex flex-col items-center justify-center gap-2 border-dashed cursor-pointer hover:bg-muted/50 transition-colors">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Favicon (32x32)
                    </p>
                    <Button variant="secondary" size="sm" className="mt-2">
                      Subir
                    </Button>
                  </Card>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="colors" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Colores y Estilos</CardTitle>
              <CardDescription>
                Personaliza los colores de tu sitio web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Color Principal</Label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <div className="w-10 h-10 rounded border overflow-hidden">
                        <div className="w-full h-full bg-primary"></div>
                      </div>
                    </div>
                    <Input id="primary-color" type="text" value="#0072F5" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Color Secundario</Label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <div className="w-10 h-10 rounded border overflow-hidden">
                        <div className="w-full h-full bg-secondary"></div>
                      </div>
                    </div>
                    <Input id="secondary-color" type="text" value="#7928CA" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accent-color">Color de Acento</Label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <div className="w-10 h-10 rounded border overflow-hidden">
                        <div className="w-full h-full bg-accent"></div>
                      </div>
                    </div>
                    <Input id="accent-color" type="text" value="#F4D35E" />
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label>Previsualización</Label>
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-bold">Vista previa de color</h3>
                  <p className="text-muted-foreground">
                    Así es como se verá tu paleta de colores en el sitio.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button>Primario</Button>
                    <Button variant="secondary">Secundario</Button>
                    <Button variant="outline">Contorno</Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="typography" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tipografía</CardTitle>
              <CardDescription>
                Elige las fuentes para tu sitio web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="heading-font">Fuente para Títulos</Label>
                  <Input id="heading-font" value="Inter" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body-font">Fuente para Texto</Label>
                  <Input id="body-font" value="Inter" />
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label>Previsualización</Label>
                <div className="border rounded-md p-4">
                  <h2 className="text-2xl font-bold mb-2">Título de Ejemplo</h2>
                  <p className="mb-4">
                    Este es un párrafo de ejemplo para mostrar cómo se verán las fuentes en tu sitio.
                    Es importante elegir tipografías que sean legibles y comuniquen tu personalidad de marca.
                  </p>
                  <h3 className="text-xl font-semibold mb-2">Subtítulo</h3>
                  <p>
                    La consistencia en la tipografía es clave para una buena experiencia de usuario.
                    Mantén un sistema coherente de estilos.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="social" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociales</CardTitle>
              <CardDescription>
                Configura los enlaces a tus perfiles sociales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input id="facebook" placeholder="https://facebook.com/tuempresa" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input id="instagram" placeholder="https://instagram.com/tuempresa" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input id="twitter" placeholder="https://twitter.com/tuempresa" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input id="linkedin" placeholder="https://linkedin.com/company/tuempresa" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input id="youtube" placeholder="https://youtube.com/c/tuempresa" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrandingPage;