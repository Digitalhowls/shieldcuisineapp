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
  DialogFooter,
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
  BookOpen,
  CalendarIcon,
  User,
  Tag,
  Save,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import PageEditor from "@/components/cms/page-editor";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: "draft" | "published" | "archived";
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  companyId: number;
  tags?: string[];
  categories?: string[];
}

type DialogMode = "create" | "edit" | "view" | "delete" | "preview" | null;

const BlogPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  
  // Obtener posts del blog del CMS
  const { data: posts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ["/api/cms/pages"],
    queryFn: async () => {
      if (!user?.companyId) {
        return [];
      }
      // Obtener solo las páginas de tipo blog_post
      const response = await fetch(`/api/cms/pages?companyId=${user.companyId}&type=blog_post`);
      if (!response.ok) {
        throw new Error("Error al cargar los artículos del blog");
      }
      
      const pages = await response.json();
      return pages.filter((page: any) => page.type === "blog_post") || [];
    },
  });

  // Función para abrir el diálogo en diferentes modos
  const openDialog = (mode: DialogMode, post?: BlogPost) => {
    if (post) {
      setSelectedPost(post);
    } else {
      setSelectedPost(null);
    }
    setDialogMode(mode);
  };

  // Función para cerrar el diálogo
  const closeDialog = () => {
    setDialogMode(null);
    setSelectedPost(null);
  };

  // Función para eliminar un post
  const handleDeletePost = async (postId: number) => {
    try {
      await apiRequest("DELETE", `/api/cms/pages/${postId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      toast({
        title: "Artículo eliminado",
        description: "El artículo ha sido eliminado correctamente.",
      });
      closeDialog();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el artículo. Inténtelo de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Función para confirmar eliminación
  const confirmDelete = (post: BlogPost) => {
    setSelectedPost(post);
    setDialogMode("delete");
  };

  // Función después de guardar el post
  const onPostSaved = () => {
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
            <p>No se pudieron cargar los artículos del blog. Por favor, inténtelo de nuevo.</p>
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
        <h1 className="text-3xl font-bold tracking-tight">Blog Corporativo</h1>
        <p className="text-muted-foreground">
          Administra el contenido del blog de tu empresa
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          {/* Aquí podría ir un filtro o búsqueda */}
        </div>
        <Button className="gap-2" onClick={() => openDialog("create")}>
          <Plus size={16} />
          <span>Nuevo Artículo</span>
        </Button>
      </div>

      {posts && posts.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <div className="flex flex-col items-center space-y-3">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No hay entradas de blog</h3>
              <p className="text-muted-foreground">
                Crea tu primer artículo para comenzar a compartir contenido.
              </p>
              <Button className="mt-4" onClick={() => openDialog("create")}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo artículo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableCaption>Lista de artículos del blog</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts && posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.author || user?.name || "Admin"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        post.status === "published"
                          ? "default"
                          : post.status === "draft"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {post.status === "published"
                        ? "Publicado"
                        : post.status === "draft"
                        ? "Borrador"
                        : "Archivado"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {post.publishedAt 
                      ? format(new Date(post.publishedAt), "dd MMM yyyy", { locale: es })
                      : post.createdAt 
                        ? format(new Date(post.createdAt), "dd MMM yyyy", { locale: es })
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
                          onClick={() => openDialog("view", post)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Ver</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDialog("edit", post)}
                        >
                          <FileEdit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => confirmDelete(post)}
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

      {/* Diálogo para crear/editar artículo de blog */}
      <Dialog open={dialogMode === "create" || dialogMode === "edit"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Crear nuevo artículo" : "Editar artículo"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Crea un nuevo artículo para el blog corporativo"
                : "Modifica el contenido del artículo"}
            </DialogDescription>
          </DialogHeader>
          <PageEditor 
            pageId={selectedPost?.id}
            onSave={onPostSaved}
            onCancel={closeDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo para ver el artículo */}
      <Dialog open={dialogMode === "view"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
            <DialogDescription>
              Visualización del artículo
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-[500px] overflow-y-auto">
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{selectedPost?.author || user?.name || "Admin"}</span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>
                  {selectedPost?.publishedAt
                    ? format(new Date(selectedPost.publishedAt), "dd MMM yyyy", { locale: es })
                    : selectedPost?.createdAt
                    ? format(new Date(selectedPost.createdAt), "dd MMM yyyy", { locale: es })
                    : "Sin fecha"}
                </span>
              </div>
              <Badge
                variant={
                  selectedPost?.status === "published"
                    ? "default"
                    : selectedPost?.status === "draft"
                    ? "outline"
                    : "secondary"
                }
              >
                {selectedPost?.status === "published"
                  ? "Publicado"
                  : selectedPost?.status === "draft"
                  ? "Borrador"
                  : "Archivado"}
              </Badge>
            </div>
            
            {selectedPost?.excerpt && (
              <Card className="mb-4">
                <CardContent className="p-4 italic text-muted-foreground">
                  {selectedPost.excerpt}
                </CardContent>
              </Card>
            )}
            
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: selectedPost?.content || "" }} />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => openDialog("edit", selectedPost!)}
              className="gap-1"
            >
              <FileEdit className="h-4 w-4" />
              <span>Editar</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar eliminación */}
      <Dialog open={dialogMode === "delete"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar artículo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el artículo "{selectedPost?.title}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedPost && handleDeletePost(selectedPost.id)}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogPage;