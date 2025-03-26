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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  FileEdit,
  MoreVertical,
  Plus,
  Trash2,
  Image,
  Upload,
  Search,
  Grid,
  List,
  Download,
  Copy,
  Link as LinkIcon,
  FolderPlus,
  X,
  FileVideo,
  FileAudio,
  File,
  FileText
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Tipos de datos para los archivos multimedia
interface MediaFile {
  id: number;
  title: string;
  filename: string;
  fileType: string;
  mimeType: string;
  url: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  companyId: number;
}

enum ViewMode {
  GRID = "grid",
  LIST = "list"
}

export default function AdminCMSMediaPanel() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRID);

  // Obtener archivos multimedia
  const { data: mediaFiles, isLoading, error } = useQuery<MediaFile[]>({
    queryKey: ["/api/cms/media"],
    queryFn: async () => {
      if (!user?.companyId) {
        return [];
      }
      const response = await fetch(`/api/cms/media?companyId=${user.companyId}`);
      if (!response.ok) {
        throw new Error("Error al cargar los archivos multimedia");
      }
      return response.json();
    },
  });

  // Función para abrir el diálogo de detalles del archivo
  const openFileDetails = (file: MediaFile) => {
    setSelectedFile(file);
  };

  // Función para cerrar el diálogo de detalles
  const closeFileDetails = () => {
    setSelectedFile(null);
  };

  // Función para confirmar eliminación
  const confirmDelete = (file: MediaFile) => {
    setSelectedFile(file);
    setIsDeleteDialogOpen(true);
  };

  // Función para eliminar un archivo
  const handleDeleteFile = async () => {
    if (!selectedFile) return;
    
    try {
      await apiRequest("DELETE", `/api/cms/media/${selectedFile.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/cms/media"] });
      toast({
        title: "Archivo eliminado",
        description: "El archivo ha sido eliminado correctamente.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedFile(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo. Inténtelo de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Función para formatear el tamaño del archivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Función para obtener el icono según el tipo de archivo
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <Image className="h-8 w-8 text-primary" />;
    } else if (mimeType.startsWith("video/")) {
      return <FileVideo className="h-8 w-8 text-orange-500" />;
    } else if (mimeType.startsWith("audio/")) {
      return <FileAudio className="h-8 w-8 text-purple-500" />;
    } else if (mimeType === "application/pdf") {
      return <File className="h-8 w-8 text-red-500" />;
    } else {
      return <FileText className="h-8 w-8 text-blue-500" />;
    }
  };

  // Función para copiar URL al portapapeles
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "URL copiada",
          description: "La URL ha sido copiada al portapapeles",
        });
      },
      (err) => {
        toast({
          title: "Error",
          description: "No se pudo copiar al portapapeles",
          variant: "destructive",
        });
      }
    );
  };

  // Filtrar archivos por búsqueda
  const filteredFiles = mediaFiles?.filter(file => 
    file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Estados de carga y error
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-6 w-3/4 mt-2" />
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-40 rounded-md" />
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
            <p>No se pudieron cargar los archivos multimedia. Por favor, inténtelo de nuevo.</p>
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Biblioteca de Medios</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona imágenes, videos y archivos para tu sitio web
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar archivos..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === ViewMode.GRID ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode(ViewMode.GRID)}
            className="h-9 w-9"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === ViewMode.LIST ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode(ViewMode.LIST)}
            className="h-9 w-9"
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button 
            className="gap-2" 
            onClick={() => window.location.href = "/cms/media"}
          >
            <Upload size={16} />
            <span>Subir Archivos</span>
          </Button>
        </div>
      </div>

      {!filteredFiles || filteredFiles.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <div className="flex flex-col items-center space-y-3">
              <Image className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No hay archivos disponibles</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "No se encontraron resultados para tu búsqueda." 
                  : "Sube archivos para comenzar a construir tu biblioteca de medios."}
              </p>
              <Button 
                className="mt-4" 
                onClick={() => window.location.href = "/cms/media"}
              >
                <Upload className="mr-2 h-4 w-4" />
                Subir archivos
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === ViewMode.GRID ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredFiles.map((file) => (
            <Card 
              key={file.id} 
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openFileDetails(file)}
            >
              <div className="aspect-square bg-muted relative flex items-center justify-center">
                {file.mimeType.startsWith("image/") ? (
                  <img 
                    src={file.url} 
                    alt={file.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    {getFileIcon(file.mimeType)}
                    <p className="text-xs text-muted-foreground mt-2">
                      {file.fileType.toUpperCase()}
                    </p>
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate" title={file.title}>
                  {file.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Archivo</th>
                <th className="text-left p-3 font-medium">Tipo</th>
                <th className="text-left p-3 font-medium">Tamaño</th>
                <th className="text-left p-3 font-medium">Fecha</th>
                <th className="text-right p-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file.id} className="border-b hover:bg-muted/50">
                  <td className="p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                        {file.mimeType.startsWith("image/") ? (
                          <img 
                            src={file.url} 
                            alt={file.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getFileIcon(file.mimeType)
                        )}
                      </div>
                      <span className="font-medium truncate max-w-[200px]" title={file.title}>
                        {file.title}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    <Badge variant="outline">{file.fileType.toUpperCase()}</Badge>
                  </td>
                  <td className="p-3 text-sm">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="p-3 text-sm">
                    {format(new Date(file.createdAt), "dd MMM yyyy", { locale: es })}
                  </td>
                  <td className="p-3 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openFileDetails(file);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Diálogo de detalles del archivo */}
      {selectedFile && (
        <Dialog open={!!selectedFile} onOpenChange={(open) => !open && closeFileDetails()}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedFile.title}</DialogTitle>
              <DialogDescription>
                Detalles del archivo
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted rounded-md flex items-center justify-center p-4 aspect-square overflow-hidden">
                {selectedFile.mimeType.startsWith("image/") ? (
                  <img 
                    src={selectedFile.url} 
                    alt={selectedFile.title}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    {getFileIcon(selectedFile.mimeType)}
                    <p className="text-lg font-medium mt-2">
                      {selectedFile.fileType.toUpperCase()}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Nombre</h3>
                  <p className="mt-1">{selectedFile.title}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Archivo</h3>
                  <p className="mt-1">{selectedFile.filename}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tipo</h3>
                  <p className="mt-1">{selectedFile.mimeType}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tamaño</h3>
                  <p className="mt-1">{formatFileSize(selectedFile.size)}</p>
                </div>
                
                {selectedFile.width && selectedFile.height && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Dimensiones</h3>
                    <p className="mt-1">{selectedFile.width} × {selectedFile.height}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Fecha de carga</h3>
                  <p className="mt-1">
                    {format(new Date(selectedFile.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                className="gap-2 flex-1"
                onClick={() => copyToClipboard(selectedFile.url)}
              >
                <Copy className="h-4 w-4" />
                <span>Copiar URL</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="gap-2 flex-1"
                onClick={() => window.open(selectedFile.url, "_blank")}
              >
                <LinkIcon className="h-4 w-4" />
                <span>Abrir</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="gap-2 flex-1"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = selectedFile.url;
                  a.download = selectedFile.filename;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
              >
                <Download className="h-4 w-4" />
                <span>Descargar</span>
              </Button>
              
              <Button 
                variant="destructive"
                className="gap-2 flex-1"
                onClick={() => confirmDelete(selectedFile)}
              >
                <Trash2 className="h-4 w-4" />
                <span>Eliminar</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar archivo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar permanentemente este archivo?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          {selectedFile && (
            <div className="flex items-center space-x-3 my-4">
              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                {selectedFile.mimeType.startsWith("image/") ? (
                  <img 
                    src={selectedFile.url} 
                    alt={selectedFile.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getFileIcon(selectedFile.mimeType)
                )}
              </div>
              <div>
                <p className="font-medium">{selectedFile.title}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteFile}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}