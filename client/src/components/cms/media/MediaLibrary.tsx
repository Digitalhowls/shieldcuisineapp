import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import {
  Search,
  Upload,
  Grid,
  List,
  Trash2,
  Edit,
  Image,
  FileText,
  FileVideo,
  File,
  MoreVertical,
  RefreshCcw,
  Download,
  FolderTree
} from "lucide-react";
import MediaUploader from "@/components/cms/media/MediaUploader";

// Definir los tipos
interface MediaItem {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
  description?: string;
  userId: number;
  companyId: number;
  createdAt: string;
  updatedAt: string;
  categories?: MediaCategory[];
}

interface MediaCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

type ViewMode = "grid" | "list";
type FilterOptions = {
  search: string;
  type: string;
  categoryId: number | null;
};

// Componente para mostrar un elemento multimedia
const MediaItem: React.FC<{
  item: MediaItem;
  viewMode: ViewMode;
  onView: (item: MediaItem) => void;
  onEdit: (item: MediaItem) => void;
  onDelete: (item: MediaItem) => void;
}> = ({ item, viewMode, onView, onEdit, onDelete }) => {
  // Función para determinar el icono según el tipo de archivo
  const getFileIcon = () => {
    if (item.mimeType.startsWith("image/")) {
      return <Image className="h-8 w-8 text-blue-500" />;
    } else if (item.mimeType.startsWith("video/")) {
      return <FileVideo className="h-8 w-8 text-red-500" />;
    } else if (
      item.mimeType === "application/pdf" ||
      item.mimeType.includes("text/")
    ) {
      return <FileText className="h-8 w-8 text-orange-500" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  // Función para formatear el tamaño del archivo
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return bytes + " B";
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    } else if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    } else {
      return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
    }
  };

  if (viewMode === "grid") {
    return (
      <Card className="overflow-hidden group cursor-pointer hover:border-primary transition-colors duration-200">
        <div className="relative aspect-square bg-muted flex items-center justify-center" onClick={() => onView(item)}>
          {item.mimeType.startsWith("image/") ? (
            <img
              src={item.fileUrl}
              alt={item.alt || item.fileName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4">
              {getFileIcon()}
              <span className="mt-2 text-xs text-center text-muted-foreground truncate max-w-full">
                {item.fileName}
              </span>
            </div>
          )}
        </div>
        <div className="p-2">
          <div className="flex justify-between items-start">
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate" title={item.fileName}>
                {item.fileName}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(item.fileSize)}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(item)}>
                  Ver detalles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={item.fileUrl} download target="_blank" rel="noopener noreferrer">
                    Descargar
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(item)}
                >
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {item.categories && item.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.categories.slice(0, 2).map((category) => (
                <Badge key={category.id} variant="outline" className="text-xs">
                  {category.name}
                </Badge>
              ))}
              {item.categories.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{item.categories.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Vista de lista
  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 rounded-md group cursor-pointer" onClick={() => onView(item)}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {item.mimeType.startsWith("image/") ? (
            <div className="w-10 h-10 rounded overflow-hidden bg-muted flex items-center justify-center">
              <img
                src={item.fileUrl}
                alt={item.alt || item.fileName}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 flex items-center justify-center">
              {getFileIcon()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm truncate" title={item.fileName}>
            {item.fileName}
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">
              {formatFileSize(item.fileSize)}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
            {item.categories && item.categories.length > 0 && (
              <div className="flex items-center space-x-1">
                <FolderTree className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {item.categories.length} categorías
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100"
          asChild
        >
          <a 
            href={item.fileUrl} 
            download 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="h-4 w-4" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Componente principal de la biblioteca multimedia
const MediaLibrary: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    type: "all",
    categoryId: null,
  });

  // Cargar medios
  const {
    data: mediaItems = [],
    isLoading,
    error,
    refetch,
  } = useQuery<MediaItem[]>({
    queryKey: ["/api/cms/media", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.type !== "all") params.append("fileType", filters.type);
      if (filters.categoryId) params.append("categoryId", filters.categoryId.toString());
      if (user?.companyId) params.append("companyId", user.companyId.toString());
      
      const response = await fetch(`/api/cms/media?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Error al cargar los archivos multimedia");
      }
      return response.json();
    },
  });

  // Cargar categorías
  const { data: categories = [] } = useQuery<MediaCategory[]>({
    queryKey: ["/api/cms/media/categories"],
    queryFn: async () => {
      if (!user?.companyId) {
        return [];
      }
      const response = await fetch(`/api/cms/media/categories?companyId=${user.companyId}`);
      if (!response.ok) {
        throw new Error("Error al cargar las categorías");
      }
      return response.json();
    },
  });

  // Mutación para eliminar medio
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
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el archivo: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar medio
  const updateMediaMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<MediaItem> }) => {
      return apiRequest("PUT", `/api/cms/media/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/media"] });
      toast({
        title: "Archivo actualizado",
        description: "La información del archivo ha sido actualizada correctamente",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el archivo: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Funciones para gestionar diálogos
  const handleViewItem = (item: MediaItem) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const handleEditItem = (item: MediaItem) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const handleDeleteItem = (item: MediaItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      deleteMediaMutation.mutate(selectedItem.id);
    }
  };

  const handleUpdateMedia = (updates: Partial<MediaItem>) => {
    if (selectedItem) {
      updateMediaMutation.mutate({ id: selectedItem.id, updates });
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string | number | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-36" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i}>
              <div className="aspect-square bg-muted">
                <Skeleton className="h-full w-full" />
              </div>
              <div className="p-2">
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Renderizar estado de error
  if (error) {
    return (
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
            onClick={() => refetch()}
            className="gap-2"
          >
            <RefreshCcw size={16} />
            <span>Reintentar</span>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Renderizar estados vacíos
  if (mediaItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="search"
                placeholder="Buscar archivos..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-64"
              />
              <Button type="submit" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo de archivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los archivos</SelectItem>
                <SelectItem value="image">Imágenes</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="document">Documentos</SelectItem>
                <SelectItem value="other">Otros</SelectItem>
              </SelectContent>
            </Select>
            {categories.length > 0 && (
              <Select
                value={filters.categoryId?.toString() || ""}
                onValueChange={(value) => handleFilterChange("categoryId", value ? parseInt(value) : null)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload size={16} />
                  <span>Subir Archivos</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Subir Archivos</DialogTitle>
                  <DialogDescription>
                    Sube tus archivos a la biblioteca de medios
                  </DialogDescription>
                </DialogHeader>
                <MediaUploader 
                  onUploadComplete={() => {
                    queryClient.invalidateQueries({ queryKey: ["/api/cms/media"] });
                    setIsUploadDialogOpen(false);
                  }}
                  onClose={() => setIsUploadDialogOpen(false)}
                  categories={categories}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card className="text-center py-16">
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <Image className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">No hay archivos multimedia</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Sube tus primeros archivos para comenzar a construir tu biblioteca de medios.
                </p>
              </div>
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Upload size={16} />
                    <span>Subir Archivos</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Subir Archivos</DialogTitle>
                    <DialogDescription>
                      Sube tus archivos a la biblioteca de medios
                    </DialogDescription>
                  </DialogHeader>
                  <MediaUploader 
                    onUploadComplete={() => {
                      queryClient.invalidateQueries({ queryKey: ["/api/cms/media"] });
                      setIsUploadDialogOpen(false);
                    }}
                    onClose={() => setIsUploadDialogOpen(false)}
                    categories={categories}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Renderizar biblioteca de medios
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="search"
              placeholder="Buscar archivos..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-64"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          <Select
            value={filters.type}
            onValueChange={(value) => handleFilterChange("type", value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo de archivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los archivos</SelectItem>
              <SelectItem value="image">Imágenes</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="document">Documentos</SelectItem>
              <SelectItem value="other">Otros</SelectItem>
            </SelectContent>
          </Select>
          {categories.length > 0 && (
            <Select
              value={filters.categoryId?.toString() || ""}
              onValueChange={(value) => handleFilterChange("categoryId", value ? parseInt(value) : null)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="border rounded-md p-1 flex">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Upload size={16} />
                <span>Subir Archivos</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Subir Archivos</DialogTitle>
                <DialogDescription>
                  Sube tus archivos a la biblioteca de medios
                </DialogDescription>
              </DialogHeader>
              <MediaUploader 
                onUploadComplete={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/cms/media"] });
                  setIsUploadDialogOpen(false);
                }}
                onClose={() => setIsUploadDialogOpen(false)}
                categories={categories}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mediaItems.map((item) => (
            <MediaItem
              key={item.id}
              item={item}
              viewMode={viewMode}
              onView={handleViewItem}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
            />
          ))}
        </div>
      ) : (
        <div className="border rounded-md">
          {mediaItems.map((item) => (
            <MediaItem
              key={item.id}
              item={item}
              viewMode={viewMode}
              onView={handleViewItem}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
            />
          ))}
        </div>
      )}

      {/* Diálogo de vista de detalles */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="truncate">{selectedItem.fileName}</DialogTitle>
                <DialogDescription>
                  Subido el {new Date(selectedItem.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="flex items-center justify-center bg-muted rounded-md overflow-hidden">
                  {selectedItem.mimeType.startsWith("image/") ? (
                    <img
                      src={selectedItem.fileUrl}
                      alt={selectedItem.alt || selectedItem.fileName}
                      className="max-w-full max-h-[300px] object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8">
                      {selectedItem.mimeType.startsWith("video/") ? (
                        <FileVideo className="h-16 w-16 text-red-500" />
                      ) : selectedItem.mimeType === "application/pdf" ||
                        selectedItem.mimeType.includes("text/") ? (
                        <FileText className="h-16 w-16 text-orange-500" />
                      ) : (
                        <File className="h-16 w-16 text-gray-500" />
                      )}
                      <span className="mt-4 text-sm text-muted-foreground">
                        {selectedItem.mimeType}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium">Nombre del archivo</div>
                      <div className="break-all">{selectedItem.fileName}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">URL</div>
                      <div className="text-sm break-all text-muted-foreground">
                        {selectedItem.fileUrl}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Tipo</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedItem.mimeType}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Tamaño</div>
                      <div className="text-sm text-muted-foreground">
                        {(selectedItem.fileSize / 1024).toFixed(2)} KB
                      </div>
                    </div>
                    {selectedItem.width && selectedItem.height && (
                      <div>
                        <div className="text-sm font-medium">Dimensiones</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedItem.width} × {selectedItem.height} píxeles
                        </div>
                      </div>
                    )}
                    {selectedItem.categories && selectedItem.categories.length > 0 && (
                      <div>
                        <div className="text-sm font-medium">Categorías</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedItem.categories.map((category) => (
                            <Badge key={category.id} variant="outline">
                              {category.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter className="flex justify-between sm:justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleEditItem(selectedItem);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    <span>Editar</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={selectedItem.fileUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      <span>Descargar</span>
                    </a>
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleDeleteItem(selectedItem);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span>Eliminar</span>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este archivo?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMediaMutation.isPending}
            >
              {deleteMediaMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar archivo</DialogTitle>
            <DialogDescription>
              Actualiza los metadatos del archivo
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">
                  Nombre:
                </label>
                <Input
                  className="col-span-3"
                  value={selectedItem.title || selectedItem.fileName}
                  onChange={(e) =>
                    setSelectedItem({
                      ...selectedItem,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">
                  Texto alternativo:
                </label>
                <Input
                  className="col-span-3"
                  value={selectedItem.alt || ""}
                  onChange={(e) =>
                    setSelectedItem({
                      ...selectedItem,
                      alt: e.target.value,
                    })
                  }
                  placeholder="Descripción para accesibilidad"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">
                  Descripción:
                </label>
                <Input
                  className="col-span-3"
                  value={selectedItem.description || ""}
                  onChange={(e) =>
                    setSelectedItem({
                      ...selectedItem,
                      description: e.target.value,
                    })
                  }
                  placeholder="Descripción opcional"
                />
              </div>
              {categories.length > 0 && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">
                    Categorías:
                  </label>
                  <div className="col-span-3">
                    <Select
                      // value={selectedItem.categoryId?.toString() || ""}
                      value=""
                      onValueChange={(value) => {
                        // IMPLEMENTAR: Asignar categoría
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin categoría</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedItem.categories && selectedItem.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedItem.categories.map((category) => (
                          <Badge key={category.id} variant="secondary">
                            {category.name}
                            <button
                              className="ml-1 text-xs hover:text-destructive"
                              onClick={() => {
                                // IMPLEMENTAR: Eliminar categoría
                              }}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (selectedItem) {
                  const updates: Partial<MediaItem> = {
                    title: selectedItem.title,
                    alt: selectedItem.alt,
                    description: selectedItem.description,
                  };
                  handleUpdateMedia(updates);
                }
              }}
              disabled={updateMediaMutation.isPending}
            >
              {updateMediaMutation.isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaLibrary;