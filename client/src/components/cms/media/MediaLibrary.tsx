import React, { useState, useEffect, useRef } from "react";
import { FixedSizeGrid as VirtualGrid } from "react-window";
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
  Grid as GridIcon,
  List,
  Trash2,
  Edit,
  Image as ImageIcon,
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
const MediaItemComponent: React.FC<{
  item: MediaItem;
  viewMode: ViewMode;
  onView: (item: MediaItem) => void;
  onEdit: (item: MediaItem) => void;
  onDelete: (item: MediaItem) => void;
}> = ({ item, viewMode, onView, onEdit, onDelete }) => {
  // Función para determinar el icono según el tipo de archivo
  const getFileIcon = () => {
    if (item.mimeType.startsWith("image/")) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
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
  
  // Referencia al contenedor para medir el ancho disponible
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

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

  // Medir tamaño del contenedor para la cuadrícula virtual
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          setContainerSize({ width, height });
        }
      });
      
      resizeObserver.observe(containerRef.current);
      
      return () => {
        if (containerRef.current) {
          resizeObserver.unobserve(containerRef.current);
        }
      };
    }
  }, []);

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
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsUploadDialogOpen(true)}
            >
              <Upload className="h-4 w-4" />
              <span>Subir</span>
            </Button>
            <div className="flex border rounded-md overflow-hidden">
              <Button
                size="sm"
                variant={viewMode === "grid" ? "default" : "ghost"}
                className="px-3 rounded-none"
                onClick={() => setViewMode("grid")}
              >
                <GridIcon className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === "list" ? "default" : "ghost"}
                className="px-3 rounded-none"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No hay archivos multimedia</h3>
          <p className="text-muted-foreground mb-6">
            No se encontraron archivos que coincidan con los filtros aplicados.
          </p>
          <Button className="gap-2" onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="h-4 w-4" />
            <span>Subir archivos</span>
          </Button>
        </Card>
      </div>
    );
  }

  // Calcular dimensiones para la cuadrícula virtual en modo grid
  const calculateGridDimensions = () => {
    // Tamaño por defecto si no tenemos el contenedor
    if (!containerSize.width) {
      return { columnCount: 4, columnWidth: 250, rowHeight: 300 };
    }
    
    let columnCount = 1;
    if (containerSize.width >= 1280) columnCount = 4;      // xl
    else if (containerSize.width >= 1024) columnCount = 3; // lg
    else if (containerSize.width >= 768) columnCount = 2;  // md
    
    const columnWidth = Math.floor((containerSize.width - (16 * (columnCount - 1))) / columnCount);
    const rowHeight = columnWidth + 80; // Altura para el aspecto cuadrado + espacio para el pie
    
    return { columnCount, columnWidth, rowHeight };
  };
  
  const { columnCount, columnWidth, rowHeight } = calculateGridDimensions();

  // Renderiza una celda en la cuadrícula virtual
  const GridCell = ({ columnIndex, rowIndex, style }: { columnIndex: number, rowIndex: number, style: React.CSSProperties }) => {
    const itemIndex = rowIndex * columnCount + columnIndex;
    if (itemIndex >= mediaItems.length) {
      return <div style={style}></div>;
    }
    
    const item = mediaItems[itemIndex];
    return (
      <div style={{ ...style, padding: '8px' }}>
        <MediaItemComponent
          item={item}
          viewMode="grid"
          onView={handleViewItem}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
        />
      </div>
    );
  };

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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            <Upload className="h-4 w-4" />
            <span>Subir</span>
          </Button>
          <div className="flex border rounded-md overflow-hidden">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              className="px-3 rounded-none"
              onClick={() => setViewMode("grid")}
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              className="px-3 rounded-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div ref={containerRef} className="w-full min-h-[500px]">
        {viewMode === "grid" ? (
          mediaItems.length > 30 ? (
            // Renderizar con virtualización para colecciones grandes
            <VirtualGrid
              columnCount={columnCount}
              columnWidth={columnWidth}
              height={Math.min(rowHeight * Math.ceil(mediaItems.length / columnCount), 600)}
              rowCount={Math.ceil(mediaItems.length / columnCount)}
              rowHeight={rowHeight}
              width={containerSize.width || 1200}
              className="media-library-grid"
            >
              {GridCell}
            </VirtualGrid>
          ) : (
            // Renderizar normal para colecciones pequeñas
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mediaItems.map((item) => (
                <MediaItemComponent
                  key={item.id}
                  item={item}
                  viewMode="grid"
                  onView={handleViewItem}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          )
        ) : (
          // Vista de lista
          <div className="space-y-1">
            {mediaItems.map((item) => (
              <MediaItemComponent
                key={item.id}
                item={item}
                viewMode="list"
                onView={handleViewItem}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Diálogo de carga de archivos */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Subir archivos</DialogTitle>
            <DialogDescription>
              Sube archivos multimedia a tu biblioteca. Puedes seleccionar varios archivos a la vez.
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
      
      {/* Diálogo de visualización de detalles */}
      {selectedItem && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalles del archivo</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted rounded-md overflow-hidden flex items-center justify-center">
                {selectedItem.mimeType.startsWith("image/") ? (
                  <img
                    src={selectedItem.fileUrl}
                    alt={selectedItem.alt || selectedItem.fileName}
                    className="max-w-full max-h-[300px] object-contain"
                  />
                ) : (
                  <div className="p-12">
                    {selectedItem.mimeType.startsWith("video/") ? (
                      <FileVideo className="h-24 w-24 text-red-500" />
                    ) : selectedItem.mimeType === "application/pdf" ? (
                      <FileText className="h-24 w-24 text-orange-500" />
                    ) : (
                      <File className="h-24 w-24 text-gray-500" />
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Nombre de archivo</h3>
                  <p className="text-md break-all">{selectedItem.fileName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tamaño</h3>
                  <p className="text-md">
                    {selectedItem.fileSize < 1024
                      ? `${selectedItem.fileSize} B`
                      : selectedItem.fileSize < 1024 * 1024
                      ? `${(selectedItem.fileSize / 1024).toFixed(2)} KB`
                      : `${(selectedItem.fileSize / (1024 * 1024)).toFixed(2)} MB`}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tipo</h3>
                  <p className="text-md">{selectedItem.mimeType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Fecha de subida</h3>
                  <p className="text-md">
                    {new Date(selectedItem.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {selectedItem.width && selectedItem.height && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Dimensiones</h3>
                    <p className="text-md">{selectedItem.width} × {selectedItem.height}</p>
                  </div>
                )}
                {selectedItem.alt && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Texto alternativo</h3>
                    <p className="text-md">{selectedItem.alt}</p>
                  </div>
                )}
                {selectedItem.description && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Descripción</h3>
                    <p className="text-md">{selectedItem.description}</p>
                  </div>
                )}
                {selectedItem.categories && selectedItem.categories.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Categorías</h3>
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Cerrar
              </Button>
              <Button 
                variant="outline" 
                className="gap-2" 
                asChild
              >
                <a 
                  href={selectedItem.fileUrl} 
                  download 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4" />
                  <span>Descargar</span>
                </a>
              </Button>
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                handleEditItem(selectedItem);
              }}>
                Editar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Diálogo de edición */}
      {selectedItem && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar archivo</DialogTitle>
              <DialogDescription>
                Modifica los detalles del archivo multimedia
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-4 space-y-1">
                  <Input
                    id="fileName"
                    value={selectedItem.fileName}
                    onChange={(e) => setSelectedItem({ ...selectedItem, fileName: e.target.value })}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Nombre del archivo</p>
                </div>
                <div className="col-span-4 space-y-1">
                  <Input
                    id="alt"
                    value={selectedItem.alt || ""}
                    onChange={(e) => setSelectedItem({ ...selectedItem, alt: e.target.value })}
                    className="w-full"
                    placeholder="Texto alternativo para la imagen"
                  />
                  <p className="text-xs text-muted-foreground">Texto alternativo (para imágenes)</p>
                </div>
                <div className="col-span-4 space-y-1">
                  <Input
                    id="title"
                    value={selectedItem.title || ""}
                    onChange={(e) => setSelectedItem({ ...selectedItem, title: e.target.value })}
                    className="w-full"
                    placeholder="Título del archivo"
                  />
                  <p className="text-xs text-muted-foreground">Título</p>
                </div>
                <div className="col-span-4 space-y-1">
                  <textarea
                    id="description"
                    value={selectedItem.description || ""}
                    onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Descripción del archivo"
                  />
                  <p className="text-xs text-muted-foreground">Descripción</p>
                </div>
                {categories.length > 0 && (
                  <div className="col-span-4 space-y-1">
                    <p className="text-sm mb-2">Categorías</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => {
                        const isSelected =
                          selectedItem.categories?.some(
                            (cat) => cat.id === category.id
                          ) || false;
                        return (
                          <Badge
                            key={category.id}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              const newCategories = isSelected
                                ? selectedItem.categories?.filter(
                                    (cat) => cat.id !== category.id
                                  ) || []
                                : [
                                    ...(selectedItem.categories || []),
                                    category,
                                  ];
                              setSelectedItem({
                                ...selectedItem,
                                categories: newCategories,
                              });
                            }}
                          >
                            {category.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  handleDeleteItem(selectedItem);
                }}
              >
                Eliminar
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  const { id, ...updates } = selectedItem;
                  handleUpdateMedia(updates);
                }}
                disabled={updateMediaMutation.isPending}
              >
                {updateMediaMutation.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Diálogo de confirmación de eliminación */}
      {selectedItem && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar eliminación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que quieres eliminar este archivo? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <p className="font-medium">{selectedItem.fileName}</p>
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
      )}
    </div>
  );
};

export default MediaLibrary;