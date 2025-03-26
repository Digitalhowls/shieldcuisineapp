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
  Eye,
  FileEdit,
  MoreVertical,
  Plus,
  Trash2,
  ImageIcon,
  Upload,
  Download,
  Copy,
  Link as LinkIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { formatBytes } from "@/lib/utils";

const MediaPage: React.FC = () => {
  const { user } = useAuth();
  
  // Obtener archivos multimedia del CMS
  const { data: mediaFiles, isLoading } = useQuery({
    queryKey: ["/api/cms/media"],
    queryFn: async () => {
      if (!user?.companyId) {
        return [];
      }
      // En un entorno real, esto obtendría los archivos de media de la API
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Biblioteca de Medios</h1>
        <p className="text-muted-foreground">
          Administra imágenes, vídeos y otros archivos multimedia
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          {/* Aquí podría ir un filtro o búsqueda */}
        </div>
        <Button className="gap-2">
          <Upload size={16} />
          <span>Subir archivo</span>
        </Button>
      </div>

      {mediaFiles && mediaFiles.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <div className="flex flex-col items-center space-y-3">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No hay archivos multimedia</h3>
              <p className="text-muted-foreground">
                Sube tus primeras imágenes o documentos para comenzar la biblioteca multimedia.
              </p>
              <Button className="mt-4">
                <Upload className="mr-2 h-4 w-4" />
                Subir archivo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mediaFiles && mediaFiles.map((file: any) => (
            <Card key={file.id} className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {file.type?.startsWith("image/") ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileEdit className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Ver</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Descargar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        <span>Copiar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        <span>Copiar URL</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Eliminar</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{file.type}</span>
                  <span>{formatBytes(file.size)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaPage;