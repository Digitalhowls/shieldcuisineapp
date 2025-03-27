import { Route, Switch, useLocation } from "wouter";
import MediaPage from "./media";
import BrandingPage from "./branding";
import ApiPage from "./api";

import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import BlockEditor from "@/components/cms/block-editor";

/**
 * Componente para la página de edición de una página individual
 */
function EditorPage({ pageId, onBack }: {
  pageId?: string;
  onBack: () => void;
}) {
  const { toast } = useToast();
  const isNew = !pageId;
  
  // Contenido inicial vacío para el editor
  const initialContent = {
    blocks: []
  };
  
  const handleSave = (content: any) => {
    console.log("Guardando contenido:", content);
    toast({
      title: "Contenido guardado",
      description: "El contenido se ha guardado correctamente."
    });
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack}>Volver al listado</Button>
        <Button onClick={() => handleSave(initialContent)}>Guardar cambios</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{isNew ? "Nueva página" : "Editar página"}</CardTitle>
        </CardHeader>
        <CardContent>
          <BlockEditor 
            initialContent={initialContent}
            onChange={(content) => console.log("Contenido actualizado:", content)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Componente para el listado y gestión de páginas
 */
function PaginasPage() {
  const { toast } = useToast();
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Páginas de ejemplo (simular datos)
  const examplePages = [
    { id: '1', title: 'Página de inicio', slug: 'inicio', status: 'published', updatedAt: '2025-03-26T10:30:00.000Z' },
    { id: '2', title: 'Nosotros', slug: 'nosotros', status: 'published', updatedAt: '2025-03-25T14:45:00.000Z' },
    { id: '3', title: 'Servicios', slug: 'servicios', status: 'draft', updatedAt: '2025-03-24T09:15:00.000Z' },
  ];
  
  // Si estamos en modo de edición, mostrar el editor de bloques
  if (editingPageId || isCreating) {
    return (
      <EditorPage 
        pageId={editingPageId || undefined} 
        onBack={() => {
          setEditingPageId(null);
          setIsCreating(false);
        }}
      />
    );
  }
  
  // Renderizar la lista de páginas
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestor de Páginas</h1>
          <p className="text-muted-foreground mt-2">
            Crea y edita las páginas de tu sitio web
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva página
        </Button>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium">Título</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Slug</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Estado</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Actualización</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {examplePages.map((page) => (
                    <tr key={page.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle">{page.title}</td>
                      <td className="p-4 align-middle">{page.slug}</td>
                      <td className="p-4 align-middle">
                        <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                          {page.status === 'published' ? 'Publicado' : 'Borrador'}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">{new Date(page.updatedAt).toLocaleDateString()}</td>
                      <td className="p-4 align-middle">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingPageId(page.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * Componente temporal de blog hasta que se implemente
 */
function BlogPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      <p className="text-muted-foreground mt-2">
        Gestiona los artículos del blog de tu sitio web
      </p>
      <div className="mt-6 p-6 border rounded-lg text-center">
        <p>Esta sección está en desarrollo</p>
      </div>
    </div>
  );
};

/**
 * Componente principal del dashboard del CMS
 */
function CMSDashboard() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard CMS</h1>
      <p className="text-muted-foreground mt-2">
        Panel de control para gestionar el contenido y funcionalidades del CMS
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold">Páginas</h2>
          <p className="text-muted-foreground mt-2">Gestiona el contenido de tu sitio</p>
        </div>
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold">Medios</h2>
          <p className="text-muted-foreground mt-2">Administra imágenes y archivos</p>
        </div>
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold">API</h2>
          <p className="text-muted-foreground mt-2">Integración con otras aplicaciones</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Módulo principal del CMS
 * Maneja el enrutamiento interno dentro del módulo CMS
 */
export default function CMSModule() {
  const [location] = useLocation();
  
  return (
    <Switch>
      <Route path="/cms">
        {location === "/cms" && <CMSDashboard />}
      </Route>
      <Route path="/cms/paginas">
        <PaginasPage />
      </Route>
      <Route path="/cms/blog">
        <BlogPage />
      </Route>
      <Route path="/cms/media">
        <MediaPage />
      </Route>
      <Route path="/cms/branding">
        <BrandingPage />
      </Route>
      <Route path="/cms/api">
        <ApiPage />
      </Route>
    </Switch>
  );
}