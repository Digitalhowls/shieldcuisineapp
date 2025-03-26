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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  FileEdit,
  MoreVertical,
  Plus,
  Trash2,
  FileText,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

export default function AdminCMSPagesPanel() {
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

  // Función para redirigir al editor de páginas
  const handleEditPage = (page?: Page) => {
    if (page) {
      window.location.href = `/cms/paginas?edit=${page.id}`;
    } else {
      window.location.href = "/cms/paginas?new=true";
    }
  };

  // Estados de carga y error
  if (isLoading) {
    return (
      <div className="p-6">
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

  if (error) {
    return (
      <div className="p-6">
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Páginas</h1>
        <p className="text-muted-foreground mt-2">
          Crea y edita las páginas de tu sitio web
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          {/* Aquí podría ir un filtro o búsqueda */}
        </div>
        <Button className="gap-2" onClick={() => handleEditPage()}>
          <Plus size={16} />
          <span>Nueva Página</span>
        </Button>
      </div>

      {pages && pages.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <div className="flex flex-col items-center space-y-3">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No hay páginas todavía</h3>
              <p className="text-muted-foreground">
                Crea tu primera página para comenzar a construir tu sitio web.
              </p>
              <Button className="mt-4" onClick={() => handleEditPage()}>
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
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Ver detalles</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditPage(page)}
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

      {/* Diálogo para ver el contenido */}
      <Dialog open={dialogMode === "view"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedPage?.title}</DialogTitle>
            <DialogDescription>
              Detalles de la página
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
                <CardTitle className="text-lg">Vista previa del contenido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-md">
                  <div dangerouslySetInnerHTML={{ __html: selectedPage?.content || "Sin contenido" }} />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => handleEditPage(selectedPage!)}
              className="gap-1"
            >
              <FileEdit className="h-4 w-4" />
              <span>Editar</span>
            </Button>
            {selectedPage?.status === "published" && (
              <Button
                variant="outline"
                onClick={() => {
                  window.open(`/cms/preview/${selectedPage.id}`, '_blank');
                }}
                className="gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Vista previa</span>
              </Button>
            )}
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
}