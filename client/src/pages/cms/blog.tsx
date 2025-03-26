import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const BlogPage: React.FC = () => {
  const { user } = useAuth();
  
  // Obtener posts del blog del CMS
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/cms/blog"],
    queryFn: async () => {
      if (!user?.companyId) {
        return [];
      }
      // En un entorno real, esto obtendría los posts de blog de la API
      return [];
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
        <Button className="gap-2">
          <Plus size={16} />
          <span>Nuevo Post</span>
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
              <Button className="mt-4">
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
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts && posts.map((post: any) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.category}</TableCell>
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
                    {format(new Date(post.createdAt), "dd MMM yyyy", {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Ver</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileEdit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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

export default BlogPage;