import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Download,
  MoreVertical,
  Plus,
  Trash2,
  Upload,
  Image,
  FileText,
  FileVideo,
  CheckCircle,
  FileIcon,
  Eye,
  Link,
  X,
  Info,
  ExternalLink,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import MediaUpload from "@/components/media-upload";
import { Input } from "@/components/ui/input";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface MediaItem {
  id: number;
  name: string;
  type: string;
  size: number;
  url: string;
  alt?: string;
  caption?: string;
  createdAt: string;
  updatedAt: string;
  companyId: number;
}

type DialogMode = "upload" | "view" | "delete" | null;

// Función auxiliar para formatear el tamaño del archivo
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
};

// Componente principal
export default function MediaPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  
  // Obtener medios del CMS
  const { data: media, isLoading, error } = useQuery<MediaItem[]>({
    queryKey: ["/api/cms/media"],
    queryFn: async () => {
      if (!user?.companyId) {
        return [];
      }
      const response = await fetch(`/api/cms/media?companyId=${user.companyId}`);
      if (!response.ok) {
        throw new Error("Error al cargar los medios");
      }
      return response.json();
    },
  });

  // Mutación para eliminar un archivo
  const deleteMediaMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/cms/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/media"] });
      toast({
        title: "Archivo eliminado",
        description: "El archivo ha sido eliminado correctamente",
      });
      setDialogMode(null);
      setSelectedMedia(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo. Inténtelo de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Funciones para el manejo de diálogos
  const openDialog = (mode: DialogMode, item?: MediaItem) => {
    if (item) {
      setSelectedMedia(item);
    }
    setDialogMode(mode);
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedMedia(null);
  };

  // Función para confirmar eliminación
  const confirmDeleteMedia = (mediaItem: MediaItem) => {
    setSelectedMedia(mediaItem);
    setDialogMode("delete");
  };

  // Función para manejar la eliminación
  const handleDeleteMedia = () => {
    if (selectedMedia) {
      deleteMediaMutation.mutate(selectedMedia.id);
    }
  };

  // Función para copiar URL al portapapeles
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(
      () => {
        setCopiedUrl(url);
        toast({
          title: "URL copiada",
          description: "URL copiada al portapapeles",
        });
        
        // Resetear el estado después de unos segundos
        setTimeout(() => {
          setCopiedUrl(null);
        }, 2000);
      },
      (err) => {
        toast({
          title: "Error",
          description: "No se pudo copiar la URL",
          variant: "destructive",
        });
      }
    );
  };

  // Función para filtrar medios por tipo
  const getFilteredMedia = () => {
    if (!media) return [];
    
    switch (activeTab) {
      case "images":
        return media.filter(item => item.type.startsWith("image/"));
      case "documents":
        return media.filter(item => 
          item.type.includes("pdf") || 
          item.type.includes("doc") || 
          item.type.includes("xls") || 
          item.type.includes("ppt") ||
          item.type.includes("text/")
        );
      case "videos":
        return media.filter(item => item.type.startsWith("video/"));
      case "all":
      default:
        return media;
    }
  };

  // Función para obtener el icono según el tipo de archivo
  const getFileIcon = (mediaType: string) => {
    if (mediaType.startsWith("image/")) {
      return <Image className="h-12 w-12 text-primary/80" />;
    } else if (mediaType.startsWith("video/")) {
      return <FileVideo className="h-12 w-12 text-blue-500" />;
    } else if (
      mediaType.includes("pdf") || 
      mediaType.includes("doc") || 
      mediaType.includes("xls") || 
      mediaType.includes("ppt") ||
      mediaType.includes("text/")
    ) {
      return <FileText className="h-12 w-12 text-amber-500" />;
    } else {
      return <FileIcon className="h-12 w-12 text-muted-foreground" />;
    }
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="aspect-square" />
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
            <p>No se pudo cargar la biblioteca de medios. Por favor, inténtelo de nuevo.</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/cms/media"] })}
            >
              Reintentar
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Obtener los medios filtrados
  const filteredMedia = getFilteredMedia();

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Biblioteca de Medios</h1>
        <p className="text-muted-foreground">
          Administra imágenes y archivos para tu sitio web
        </p>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="images">Imágenes</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>

          <Button className="gap-2" onClick={() => openDialog("upload")}>
            <Upload size={16} />
            <span>Subir Archivo</span>
          </Button>
        </div>

        <TabsContent value="all" className="mt-6">
          <RenderMediaGrid 
            media={filteredMedia} 
            openDialog={openDialog} 
            copyToClipboard={copyToClipboard} 
            confirmDeleteMedia={confirmDeleteMedia}
            copiedUrl={copiedUrl}
          />
        </TabsContent>

        <TabsContent value="images" className="mt-6">
          <RenderMediaGrid 
            media={filteredMedia}
            openDialog={openDialog}
            copyToClipboard={copyToClipboard}
            confirmDeleteMedia={confirmDeleteMedia}
            copiedUrl={copiedUrl}
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <RenderMediaGrid 
            media={filteredMedia}
            openDialog={openDialog}
            copyToClipboard={copyToClipboard}
            confirmDeleteMedia={confirmDeleteMedia}
            copiedUrl={copiedUrl}
          />
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <RenderMediaGrid 
            media={filteredMedia}
            openDialog={openDialog}
            copyToClipboard={copyToClipboard}
            confirmDeleteMedia={confirmDeleteMedia}
            copiedUrl={copiedUrl}
          />
        </TabsContent>
      </Tabs>

      {/* Diálogo de carga de archivos */}
      <Dialog open={dialogMode === "upload"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subir archivos</DialogTitle>
            <DialogDescription>
              Añade archivos a tu biblioteca de medios
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <MediaUpload 
              multiple={true}
              accept="image/*,video/*,application/pdf,application/msword,application/vnd.ms-excel"
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/cms/media"] });
              }}
              onError={(error) => {
                toast({
                  title: "Error",
                  description: error.message,
                  variant: "destructive",
                });
              }}
            />
          </div>
          <DialogFooter className="sm:justify-end">
            <Button type="button" variant="secondary" onClick={closeDialog}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de vista detallada */}
      <Dialog open={dialogMode === "view"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles del archivo</DialogTitle>
            <DialogDescription>
              Información y vista previa del archivo
            </DialogDescription>
          </DialogHeader>
          {selectedMedia && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border rounded-md overflow-hidden bg-muted/30 flex items-center justify-center aspect-square">
                  {selectedMedia.type.startsWith("image/") ? (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.alt || selectedMedia.name}
                      className="object-contain max-h-full max-w-full"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4">
                      {getFileIcon(selectedMedia.type)}
                      <span className="mt-2 text-sm text-muted-foreground">
                        {selectedMedia.name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(selectedMedia.url)}
                    className="gap-1"
                  >
                    {copiedUrl === selectedMedia.url ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copiar URL</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedMedia.url, "_blank")}
                    className="gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Abrir</span>
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Nombre</h3>
                  <p className="text-sm break-all">{selectedMedia.name}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Tipo</h3>
                  <p className="text-sm">{selectedMedia.type}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Tamaño</h3>
                  <p className="text-sm">{formatFileSize(selectedMedia.size)}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Fecha de subida</h3>
                  <p className="text-sm">
                    {format(new Date(selectedMedia.createdAt), "dd MMMM yyyy, HH:mm", {
                      locale: es,
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">URL</h3>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={selectedMedia.url}
                      readOnly
                      className="text-xs"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(selectedMedia.url)}
                    >
                      {copiedUrl === selectedMedia.url ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-end mt-4">
            <Button
              variant="destructive"
              onClick={() => {
                closeDialog();
                if (selectedMedia) {
                  confirmDeleteMedia(selectedMedia);
                }
              }}
              className="gap-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>Eliminar</span>
            </Button>
            <Button type="button" variant="secondary" onClick={closeDialog}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={dialogMode === "delete"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar archivo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este archivo? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {selectedMedia && (
            <div className="flex items-center space-x-4 py-4">
              <div className="flex-shrink-0 w-16 h-16 rounded bg-muted flex items-center justify-center">
                {selectedMedia.type.startsWith("image/") ? (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.name}
                    className="object-cover w-full h-full rounded"
                  />
                ) : (
                  getFileIcon(selectedMedia.type)
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{selectedMedia.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedMedia.size)} • {selectedMedia.type}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-end">
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteMedia}
              disabled={deleteMediaMutation.isPending}
            >
              {deleteMediaMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Componente de cuadrícula de medios
interface MediaGridProps {
  media: MediaItem[];
  openDialog: (mode: DialogMode, item?: MediaItem) => void;
  copyToClipboard: (url: string) => void;
  confirmDeleteMedia: (item: MediaItem) => void;
  copiedUrl: string | null;
}

const RenderMediaGrid: React.FC<MediaGridProps> = ({ 
  media, 
  openDialog, 
  copyToClipboard, 
  confirmDeleteMedia,
  copiedUrl 
}) => {
  if (media.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <div className="flex flex-col items-center space-y-3">
            <Image className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No hay archivos</h3>
            <p className="text-muted-foreground">
              Sube tus primeros archivos para comenzar a construir tu biblioteca de medios.
            </p>
            <Button className="mt-4" onClick={() => openDialog("upload")}>
              <Upload className="mr-2 h-4 w-4" />
              Subir archivo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {media.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <div 
            className="relative aspect-square bg-muted flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => openDialog("view", item)}
          >
            {item.type.startsWith("image/") ? (
              <img
                src={item.url}
                alt={item.alt || item.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                {item.type.startsWith("video/") ? (
                  <FileVideo className="h-12 w-12 text-blue-500" />
                ) : item.type.includes("pdf") || 
                     item.type.includes("doc") || 
                     item.type.includes("xls") || 
                     item.type.includes("ppt") ? (
                  <FileText className="h-12 w-12 text-amber-500" />
                ) : (
                  <FileIcon className="h-12 w-12 text-muted-foreground" />
                )}
                <span className="mt-2 text-xs text-muted-foreground px-2 text-center">
                  {item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name}
                </span>
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="font-mono text-xs">
                {formatFileSize(item.size)}
              </Badge>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
              <Button variant="secondary" size="sm" className="gap-1">
                <Eye className="h-4 w-4" />
                <span>Ver detalles</span>
              </Button>
            </div>
          </div>
          <CardContent className="p-3">
            <div className="flex justify-between items-start">
              <div>
                <HoverCard>
                  <HoverCardTrigger>
                    <p className="font-medium text-sm truncate max-w-[150px]" title={item.name}>
                      {item.name}
                    </p>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        {item.type} - {formatFileSize(item.size)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Subido el {format(new Date(item.createdAt), "dd MMM yyyy", { locale: es })}
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(item.createdAt), "dd MMM yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openDialog("view", item)}>
                    <Eye className="mr-2 h-4 w-4" />
                    <span>Ver detalles</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => copyToClipboard(item.url)}>
                    {copiedUrl === item.url ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        <span>Copiar URL</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(item.url, "_blank")}>
                    <Link className="mr-2 h-4 w-4" />
                    <span>Abrir</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => confirmDeleteMedia(item)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Eliminar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

