import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Eye,
  FileEdit,
  MoreVertical,
  Plus,
  Trash2,
  Globe,
  FileSearch,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import PageEditor from "@/components/cms/page-editor";

interface Page {
  id: number;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  updatedAt: string;
  content: string;
  visibility: "public" | "private" | "internal";
  type: "page" | "blog_post" | "course_page" | "landing_page";
  companyId: number;
}

type DialogMode = "create" | "edit" | "view" | "delete" | "preview" | null;

// Componente principal
const PaginasPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  
  // Obtener páginas del CMS
  const { data: pages, isLoading, error } = useQuery<Page[]>({
    queryKey: ["/api/cms/pages"],
    queryFn: async () => {
      if (!user?.companyId) {
        return [];
      }
      const response = await fetch(`/api/cms/pages?companyId=${user.companyId}`);
      if (!response.ok) {
        throw new Error("Error al cargar las páginas");
      }
      return response.json();
    },
  });

  // Función para abrir el diálogo en diferentes modos
  const openDialog = (mode: DialogMode, page?: Page) => {
    if (page) {
      setSelectedPage(page);
    } else {
      setSelectedPage(null);
    }
    setDialogMode(mode);
  };

  // Función para cerrar el diálogo
  const closeDialog = () => {
    setDialogMode(null);
    setSelectedPage(null);
  };

  // Función para eliminar una página
  const handleDeletePage = async (pageId: number) => {
    try {
      await apiRequest("DELETE", `/api/cms/pages/${pageId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      toast({
        title: "Página eliminada",
        description: "La página ha sido eliminada correctamente.",
      });
      closeDialog();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la página. Inténtelo de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Función para confirmar eliminación
  const confirmDelete = (page: Page) => {
    setSelectedPage(page);
    setDialogMode("delete");
  };

  // Función después de guardar la página
  const onPageSaved = () => {
    closeDialog();
    queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
  };

  // Renderizar el estado de carga
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-6 w-3/4 mt-2" />
        </div>
        
        <Skeleton className="h-10 w-32 mb-4" />
        
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  // Renderizar el estado de error
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No se pudieron cargar las páginas. Por favor, inténtelo de nuevo.</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] })}
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
        <h1 className="text-3xl font-bold tracking-tight">Gestor de Páginas</h1>
        <p className="text-muted-foreground">
          Crea y administra las páginas para tu sitio web
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          {/* Aquí podría ir un filtro o búsqueda */}
        </div>
        <Button className="gap-2" onClick={() => openDialog("create")}>
          <Plus size={16} />
          <span>Nueva Página</span>
        </Button>
      </div>

      {pages && pages.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <div className="flex flex-col items-center space-y-3">
              <Globe className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No hay páginas todavía</h3>
              <p className="text-muted-foreground">
                Crea tu primera página para comenzar a construir tu sitio web.
              </p>
              <Button className="mt-4" onClick={() => openDialog("create")}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva página
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableCaption>Lista de páginas del sitio web</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última Actualización</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages && pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>/{page.slug}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {page.type === "page" ? "Página" : 
                       page.type === "blog_post" ? "Blog" : 
                       page.type === "course_page" ? "Curso" : 
                       "Landing Page"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        page.status === "published"
                          ? "default"
                          : page.status === "draft"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {page.status === "published"
                        ? "Publicada"
                        : page.status === "draft"
                        ? "Borrador"
                        : "Archivada"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {page.updatedAt
                      ? format(new Date(page.updatedAt), "dd MMM yyyy", {
                          locale: es,
                        })
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openDialog("view", page)}
                        >
                          <FileSearch className="mr-2 h-4 w-4" />
                          <span>Ver contenido</span>
                        </DropdownMenuItem>
                        {page.status === "published" && (
                          <DropdownMenuItem
                            onClick={() => openDialog("preview", page)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Vista previa</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => openDialog("edit", page)}
                        >
                          <FileEdit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => confirmDelete(page)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Diálogo para crear/editar página */}
      <Dialog open={dialogMode === "create" || dialogMode === "edit"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Crear nueva página" : "Editar página"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Define los detalles de la nueva página web"
                : "Modifica los detalles y contenido de la página"}
            </DialogDescription>
          </DialogHeader>
          <PageEditor 
            pageId={selectedPage?.id} 
            onSave={onPageSaved} 
            onCancel={closeDialog} 
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo para ver el contenido */}
      <Dialog open={dialogMode === "view"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedPage?.title}</DialogTitle>
            <DialogDescription>
              Contenido de la página
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-[500px] overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-semibold">URL:</span> /{selectedPage?.slug}
                </div>
                <div>
                  <span className="font-semibold">Estado:</span>{" "}
                  {selectedPage?.status === "published"
                    ? "Publicado"
                    : selectedPage?.status === "draft"
                    ? "Borrador"
                    : "Archivado"}
                </div>
                <div>
                  <span className="font-semibold">Tipo:</span>{" "}
                  {selectedPage?.type === "page"
                    ? "Página"
                    : selectedPage?.type === "blog_post"
                    ? "Blog"
                    : selectedPage?.type === "course_page"
                    ? "Curso"
                    : "Landing Page"}
                </div>
                <div>
                  <span className="font-semibold">Visibilidad:</span>{" "}
                  {selectedPage?.visibility === "public"
                    ? "Pública"
                    : selectedPage?.visibility === "private"
                    ? "Privada"
                    : "Interna"}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Contenido</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap font-mono text-xs p-4 bg-muted rounded-md overflow-auto max-h-[300px]">
                  {selectedPage?.content || "Sin contenido"}
                </pre>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => openDialog("edit", selectedPage!)}
              className="gap-1"
            >
              <FileEdit className="h-4 w-4" />
              <span>Editar</span>
            </Button>
            {selectedPage?.status === "published" && (
              <Button
                variant="outline"
                onClick={() => openDialog("preview", selectedPage!)}
                className="gap-1"
              >
                <Eye className="h-4 w-4" />
                <span>Vista previa</span>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo para vista previa */}
      <Dialog open={dialogMode === "preview"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Vista previa: {selectedPage?.title}</DialogTitle>
            <DialogDescription>
              Así es como se verá la página en el sitio web
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 border rounded overflow-hidden">
            <div className="bg-background text-sm p-2 border-b flex justify-between items-center">
              <span>Vista previa</span>
              <Button variant="ghost" size="sm" className="h-7 gap-1">
                <ExternalLink className="h-3 w-3" />
                <span className="text-xs">Abrir en nueva ventana</span>
              </Button>
            </div>
            <div className="h-[500px] overflow-auto p-4">
              {/* Aquí se renderizaría el contenido HTML o Markdown */}
              <div dangerouslySetInnerHTML={{ __html: selectedPage?.content || "" }} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar eliminación */}
      <Dialog open={dialogMode === "delete"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar página</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la página "{selectedPage?.title}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedPage && handleDeletePage(selectedPage.id)}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaginasPage;