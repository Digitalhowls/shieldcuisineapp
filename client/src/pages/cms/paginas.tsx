import React from "react";
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Componente principal
const PaginasPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Obtener páginas del CMS
  const { data: pages, isLoading, error } = useQuery({
    queryKey: ["/api/cms/pages"],
    queryFn: async () => {
      if (!user?.companyId) {
        return [];
      }
      return fetch(`/api/cms/pages?companyId=${user.companyId}`).then(
        (res) => res.json()
      );
    },
  });

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

  // Función para eliminar una página
  const handleDeletePage = async (pageId: number) => {
    try {
      await apiRequest("DELETE", `/api/cms/pages/${pageId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      toast({
        title: "Página eliminada",
        description: "La página ha sido eliminada correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la página. Inténtelo de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Componente principal
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
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              <span>Nueva Página</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Crear nueva página</DialogTitle>
              <DialogDescription>
                Define los detalles de la nueva página web
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" placeholder="Título de la página" />
                </div>
                <div>
                  <Label htmlFor="slug">URL (slug)</Label>
                  <Input id="slug" placeholder="url-amigable" />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Breve descripción de la página"
                    rows={3}
                  />
                </div>
                {/* Aquí irían más campos como estado, visibilidad, etc. */}
              </div>
            </form>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Crear página</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva página
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
        <div className="border rounded-md">
          <Table>
            <TableCaption>Lista de páginas del sitio web</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última Actualización</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages && pages.map((page: any) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>/{page.slug}</TableCell>
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
                          onClick={() => {
                            // Visualizar la página
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Visualizar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            // Editar la página
                          }}
                        >
                          <FileEdit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeletePage(page.id)}
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
    </div>
  );
};

export default PaginasPage;