import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, 
  DialogTitle, DialogTrigger, DialogClose 
} from '@/components/ui/dialog';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Image, Upload, Trash2, Edit, FilePlus, FolderPlus, RefreshCw, Search,
  FileText, Video, Music, Archive, Filter, MoreHorizontal, Tag, Check
} from 'lucide-react';

interface MediaFile {
  id: number;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
  description?: string;
  folder?: string;
  tags?: string[];
  companyId: number;
  uploadedBy: number;
  createdAt: string;
  updatedAt: string;
}

interface MediaCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  companyId: number;
}

// Función para formatear el tamaño del archivo
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Componente para el ícono de tipo de archivo
const FileTypeIcon = ({ mimeType }: { mimeType: string }) => {
  if (mimeType.startsWith('image/')) {
    return <Image className="h-5 w-5 text-blue-500" />;
  } else if (mimeType.startsWith('video/')) {
    return <Video className="h-5 w-5 text-red-500" />;
  } else if (mimeType.startsWith('audio/')) {
    return <Music className="h-5 w-5 text-green-500" />;
  } else if (
    mimeType === 'application/pdf' ||
    mimeType === 'application/msword' ||
    mimeType.includes('officedocument') ||
    mimeType === 'text/plain'
  ) {
    return <FileText className="h-5 w-5 text-yellow-500" />;
  }
  return <Archive className="h-5 w-5 text-gray-500" />;
};

const MediaPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>();
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadMetadata, setUploadMetadata] = useState({
    title: '',
    description: '',
    alt: '',
    folder: '',
    tags: '',
    categoryId: ''
  });
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: ''
  });

  // Consulta de archivos multimedia
  const { 
    data: mediaFiles, 
    isLoading: isLoadingFiles,
    refetch: refetchFiles
  } = useQuery({
    queryKey: ['/api/cms/media', activeTab, searchQuery, selectedCategory, selectedFolder],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('fileType', activeTab);
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('categoryId', selectedCategory.toString());
      if (selectedFolder) params.append('folder', selectedFolder);
      
      const response = await apiRequest('GET', `/api/cms/media?${params.toString()}`);
      return await response.json() as MediaFile[];
    }
  });

  // Consulta de categorías
  const { 
    data: categories,
    isLoading: isLoadingCategories,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['/api/cms/media/categories'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/cms/media/categories');
      return await response.json() as MediaCategory[];
    }
  });

  // Mutación para subir archivos
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!uploadFile) return;
      
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadMetadata.title || uploadFile.name);
      formData.append('description', uploadMetadata.description);
      formData.append('alt', uploadMetadata.alt || uploadFile.name);
      formData.append('folder', uploadMetadata.folder);
      
      if (uploadMetadata.tags) {
        try {
          // Intentar analizar como JSON si comienza con [
          const tagsValue = uploadMetadata.tags.trim().startsWith('[') 
            ? JSON.stringify(JSON.parse(uploadMetadata.tags))
            : JSON.stringify(uploadMetadata.tags.split(',').map(tag => tag.trim()));
          formData.append('tags', tagsValue);
        } catch (e) {
          // Si falla, enviar como array de un solo elemento
          formData.append('tags', JSON.stringify([uploadMetadata.tags]));
        }
      }
      
      if (uploadMetadata.categoryId) {
        formData.append('categoryId', uploadMetadata.categoryId);
      }
      
      const response = await fetch('/api/cms/media/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir archivo');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Archivo subido correctamente',
        description: 'El archivo se ha subido y guardado correctamente',
        variant: 'default',
      });
      setIsUploadOpen(false);
      resetUploadForm();
      queryClient.invalidateQueries({ queryKey: ['/api/cms/media'] });
    },
    onError: (error) => {
      toast({
        title: 'Error al subir archivo',
        description: error instanceof Error ? error.message : 'Ocurrió un error al subir el archivo',
        variant: 'destructive',
      });
    }
  });

  // Mutación para crear categorías
  const createCategoryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/cms/media/categories', {
        name: newCategory.name,
        slug: newCategory.slug || newCategory.name.toLowerCase().replace(/\s+/g, '-'),
        description: newCategory.description,
        parentId: newCategory.parentId ? parseInt(newCategory.parentId) : undefined
      });
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Categoría creada',
        description: 'La categoría se ha creado correctamente',
        variant: 'default',
      });
      setIsNewCategoryOpen(false);
      resetCategoryForm();
      queryClient.invalidateQueries({ queryKey: ['/api/cms/media/categories'] });
    },
    onError: (error) => {
      toast({
        title: 'Error al crear categoría',
        description: error instanceof Error ? error.message : 'Ocurrió un error al crear la categoría',
        variant: 'destructive',
      });
    }
  });

  // Mutación para eliminar archivos
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await apiRequest('DELETE', `/api/cms/media/${fileId}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Archivo eliminado',
        description: 'El archivo se ha eliminado correctamente',
        variant: 'default',
      });
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['/api/cms/media'] });
    },
    onError: (error) => {
      toast({
        title: 'Error al eliminar archivo',
        description: error instanceof Error ? error.message : 'Ocurrió un error al eliminar el archivo',
        variant: 'destructive',
      });
    }
  });

  // Mutación para actualizar archivos
  const updateFileMutation = useMutation({
    mutationFn: async (file: Partial<MediaFile> & { id: number }) => {
      const { id, ...updateData } = file;
      const response = await apiRequest('PUT', `/api/cms/media/${id}`, updateData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Archivo actualizado',
        description: 'La información del archivo se ha actualizado correctamente',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cms/media'] });
    },
    onError: (error) => {
      toast({
        title: 'Error al actualizar archivo',
        description: error instanceof Error ? error.message : 'Ocurrió un error al actualizar la información',
        variant: 'destructive',
      });
    }
  });

  // Extraer carpetas únicas de los archivos
  const uniqueFolders = React.useMemo(() => {
    if (!mediaFiles) return [];
    
    const folders = mediaFiles
      .map(file => file.folder)
      .filter((folder): folder is string => 
        typeof folder === 'string' && folder.trim() !== ''
      );
    
    return Array.from(new Set(folders)).sort();
  }, [mediaFiles]);

  // Manejar cambio de archivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploadFile(file);
    setUploadMetadata({
      ...uploadMetadata,
      title: file.name,
      alt: file.name
    });
    
    // Crear vista previa para imágenes
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadPreview(null);
    }
  };

  // Manejar actualización de archivo seleccionado
  const handleUpdateSelectedFile = () => {
    if (!selectedFile) return;
    
    const updatedData: Partial<MediaFile> & { id: number } = {
      id: selectedFile.id,
      title: selectedFile.title,
      description: selectedFile.description,
      alt: selectedFile.alt,
      folder: selectedFile.folder,
      tags: selectedFile.tags
    };
    
    updateFileMutation.mutate(updatedData);
  };

  // Limpiar formulario de carga
  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadPreview(null);
    setUploadMetadata({
      title: '',
      description: '',
      alt: '',
      folder: '',
      tags: '',
      categoryId: ''
    });
  };

  // Limpiar formulario de categorías
  const resetCategoryForm = () => {
    setNewCategory({
      name: '',
      slug: '',
      description: '',
      parentId: ''
    });
  };

  // Generar slug para categoría
  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Eliminar guiones múltiples
      .trim();
  };

  // Actualizar slug al cambiar nombre de categoría
  useEffect(() => {
    if (newCategory.name && !newCategory.slug) {
      setNewCategory({
        ...newCategory,
        slug: generateSlug(newCategory.name)
      });
    }
  }, [newCategory.name]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Biblioteca de Medios</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsUploadOpen(true)} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Subir Archivo
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsNewCategoryOpen(true)}
            className="flex items-center gap-2"
          >
            <FolderPlus className="h-4 w-4" />
            Nueva Categoría
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              refetchFiles();
              refetchCategories();
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-6">
        {/* Panel lateral */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center border rounded-md px-2 w-full">
                <Search className="h-4 w-4 mr-2 opacity-70" />
                <Input
                  placeholder="Buscar archivos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 h-9"
                />
              </div>
              
              {/* Tipos de archivo */}
              <div>
                <Label className="text-sm font-medium">Tipo de archivo</Label>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="mt-2 w-full"
                >
                  <TabsList className="grid grid-cols-5 w-full">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="image">Imágenes</TabsTrigger>
                    <TabsTrigger value="document">Docs</TabsTrigger>
                    <TabsTrigger value="video">Videos</TabsTrigger>
                    <TabsTrigger value="audio">Audio</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {/* Categorías */}
              <div>
                <Label className="text-sm font-medium">Categoría</Label>
                <Select
                  value={selectedCategory?.toString() || ""}
                  onValueChange={(value) => 
                    setSelectedCategory(value ? parseInt(value) : undefined)
                  }
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las categorías</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Carpetas */}
              {uniqueFolders.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Carpeta</Label>
                  <Select
                    value={selectedFolder || ""}
                    onValueChange={(value) => 
                      setSelectedFolder(value || undefined)
                    }
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Todas las carpetas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las carpetas</SelectItem>
                      {uniqueFolders.map((folder) => (
                        <SelectItem key={folder} value={folder}>
                          {folder}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <Button 
                variant="ghost" 
                className="w-full flex justify-center items-center gap-2 mt-2"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(undefined);
                  setSelectedFolder(undefined);
                  setActiveTab('all');
                }}
              >
                <RefreshCw className="h-4 w-4" />
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Panel principal */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                Archivos {mediaFiles?.length ? `(${mediaFiles.length})` : ''}
              </CardTitle>
              <CardDescription>
                {activeTab !== 'all' && 
                  <Badge variant="outline" className="mr-2">
                    {activeTab === 'image' && 'Imágenes'}
                    {activeTab === 'document' && 'Documentos'}
                    {activeTab === 'video' && 'Videos'}
                    {activeTab === 'audio' && 'Audio'}
                  </Badge>
                }
                {selectedCategory && categories && (
                  <Badge variant="outline" className="mr-2">
                    Categoría: {categories.find(c => c.id === selectedCategory)?.name}
                  </Badge>
                )}
                {selectedFolder && (
                  <Badge variant="outline" className="mr-2">
                    Carpeta: {selectedFolder}
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="outline">
                    Búsqueda: {searchQuery}
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingFiles ? (
                <div className="flex justify-center items-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Cargando archivos...</span>
                  </div>
                </div>
              ) : mediaFiles?.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Archive className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-lg">No hay archivos disponibles</h3>
                  <p className="text-muted-foreground mt-1">
                    No se encontraron archivos que coincidan con los filtros.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsUploadOpen(true)}
                    className="mt-4"
                  >
                    Subir nuevo archivo
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-320px)]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vista previa</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Tamaño</TableHead>
                        <TableHead>Fecha de carga</TableHead>
                        <TableHead className="w-[100px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mediaFiles?.map((file) => (
                        <TableRow key={file.id} className="cursor-pointer hover:bg-muted">
                          <TableCell 
                            className="w-[80px]"
                            onClick={() => setSelectedFile(file)}
                          >
                            {file.mimeType.startsWith('image/') ? (
                              <img 
                                src={file.thumbnailUrl || file.url} 
                                alt={file.alt || file.filename} 
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                                <FileTypeIcon mimeType={file.mimeType} />
                              </div>
                            )}
                          </TableCell>
                          <TableCell onClick={() => setSelectedFile(file)}>
                            <div className="font-medium truncate max-w-[200px]">{file.title || file.originalFilename}</div>
                            {file.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {file.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell onClick={() => setSelectedFile(file)}>
                            <div className="flex items-center gap-2">
                              <FileTypeIcon mimeType={file.mimeType} />
                              <span className="text-xs">{file.mimeType.split('/')[1].toUpperCase()}</span>
                            </div>
                          </TableCell>
                          <TableCell onClick={() => setSelectedFile(file)}>
                            {formatFileSize(file.size)}
                          </TableCell>
                          <TableCell onClick={() => setSelectedFile(file)}>
                            {new Date(file.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setSelectedFile(file)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. El archivo se eliminará
                                      permanentemente del servidor.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => deleteFileMutation.mutate(file.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Dialog de detalles de archivo */}
      {selectedFile && (
        <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Detalles del archivo</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Vista previa */}
              <div>
                {selectedFile.mimeType.startsWith('image/') ? (
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={selectedFile.url} 
                      alt={selectedFile.alt || selectedFile.filename} 
                      className="w-full h-auto max-h-[400px] object-contain"
                    />
                  </div>
                ) : (
                  <div className="border rounded-lg h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        <FileTypeIcon mimeType={selectedFile.mimeType} />
                      </div>
                      <p className="text-xs uppercase">{selectedFile.mimeType}</p>
                      <p className="mt-2">{selectedFile.originalFilename}</p>
                      <a 
                        href={selectedFile.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-sm text-blue-500 hover:underline"
                      >
                        Descargar archivo
                      </a>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="col-span-2">{selectedFile.mimeType}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Tamaño:</span>
                    <span className="col-span-2">{formatFileSize(selectedFile.size)}</span>
                  </div>
                  {selectedFile.width && selectedFile.height && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Dimensiones:</span>
                      <span className="col-span-2">{selectedFile.width} × {selectedFile.height} px</span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Fecha de carga:</span>
                    <span className="col-span-2">
                      {new Date(selectedFile.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">URL:</span>
                    <div className="col-span-2 truncate">
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {selectedFile.url}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Información */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-title">Título</Label>
                  <Input
                    id="file-title"
                    value={selectedFile.title || ''}
                    onChange={(e) => setSelectedFile({
                      ...selectedFile,
                      title: e.target.value
                    })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="file-alt">Texto alternativo</Label>
                  <Input
                    id="file-alt"
                    value={selectedFile.alt || ''}
                    onChange={(e) => setSelectedFile({
                      ...selectedFile,
                      alt: e.target.value
                    })}
                    className="mt-1"
                  />
                  <span className="text-xs text-muted-foreground">
                    Se utiliza para accesibilidad y SEO
                  </span>
                </div>
                
                <div>
                  <Label htmlFor="file-description">Descripción</Label>
                  <Textarea
                    id="file-description"
                    value={selectedFile.description || ''}
                    onChange={(e) => setSelectedFile({
                      ...selectedFile,
                      description: e.target.value
                    })}
                    className="mt-1 resize-none h-20"
                  />
                </div>
                
                <div>
                  <Label htmlFor="file-folder">Carpeta</Label>
                  <Select
                    value={selectedFile.folder || ''}
                    onValueChange={(value) => setSelectedFile({
                      ...selectedFile,
                      folder: value
                    })}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Sin carpeta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin carpeta</SelectItem>
                      {uniqueFolders.map((folder) => (
                        <SelectItem key={folder} value={folder}>
                          {folder}
                        </SelectItem>
                      ))}
                      {/* Opción para nueva carpeta */}
                      <SelectItem value="new-folder">
                        <div className="flex items-center gap-1">
                          <FolderPlus className="h-3 w-3" />
                          <span>Nueva carpeta...</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedFile.folder === 'new-folder' && (
                  <div>
                    <Label htmlFor="new-folder-name">Nombre de la nueva carpeta</Label>
                    <div className="flex mt-1 gap-2">
                      <Input
                        id="new-folder-name"
                        placeholder="Nombre de carpeta"
                        onBlur={(e) => {
                          if (e.target.value) {
                            setSelectedFile({
                              ...selectedFile,
                              folder: e.target.value.trim()
                            });
                          } else {
                            setSelectedFile({
                              ...selectedFile,
                              folder: ''
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="file-tags">Etiquetas</Label>
                  <Input
                    id="file-tags"
                    value={selectedFile.tags ? 
                      (Array.isArray(selectedFile.tags) ? 
                        selectedFile.tags.join(', ') : 
                        String(selectedFile.tags)
                      ) : ''
                    }
                    onChange={(e) => {
                      const tagsArray = e.target.value
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(tag => tag);
                      setSelectedFile({
                        ...selectedFile,
                        tags: tagsArray
                      });
                    }}
                    placeholder="Separadas por comas"
                    className="mt-1"
                  />
                </div>
                
                {selectedFile.tags && selectedFile.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Array.isArray(selectedFile.tags) && selectedFile.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex gap-1 items-center">
                        <Tag className="h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setSelectedFile(null)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateSelectedFile}
                disabled={updateFileMutation.isPending}
              >
                {updateFileMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Dialog de subida de archivos */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir archivo</DialogTitle>
            <DialogDescription>
              Sube un nuevo archivo a la biblioteca de medios.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {!uploadFile ? (
              <div className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer" onClick={() => document.getElementById('upload-file')?.click()}>
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Haz clic para seleccionar un archivo</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  o arrastra y suelta aquí
                </p>
                <Input
                  id="upload-file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground mt-4">
                  Formatos soportados: JPG, PNG, GIF, PDF, DOCX, XLSX, MP4, MP3, etc.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {uploadPreview ? (
                    <img 
                      src={uploadPreview} 
                      alt="Preview" 
                      className="w-20 h-20 object-cover rounded" 
                    />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded flex items-center justify-center">
                      <FileTypeIcon mimeType={uploadFile.type} />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium">{uploadFile.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(uploadFile.size)} • {uploadFile.type}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetUploadForm}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="upload-title">Título</Label>
                    <Input
                      id="upload-title"
                      value={uploadMetadata.title}
                      onChange={(e) => setUploadMetadata({
                        ...uploadMetadata,
                        title: e.target.value
                      })}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="upload-alt">Texto alternativo</Label>
                    <Input
                      id="upload-alt"
                      value={uploadMetadata.alt}
                      onChange={(e) => setUploadMetadata({
                        ...uploadMetadata,
                        alt: e.target.value
                      })}
                      className="mt-1"
                    />
                    <span className="text-xs text-muted-foreground">
                      Se utiliza para accesibilidad y SEO
                    </span>
                  </div>
                  
                  <div>
                    <Label htmlFor="upload-description">Descripción</Label>
                    <Textarea
                      id="upload-description"
                      value={uploadMetadata.description}
                      onChange={(e) => setUploadMetadata({
                        ...uploadMetadata,
                        description: e.target.value
                      })}
                      className="mt-1 resize-none h-20"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="upload-folder">Carpeta</Label>
                      <Select
                        value={uploadMetadata.folder}
                        onValueChange={(value) => setUploadMetadata({
                          ...uploadMetadata,
                          folder: value
                        })}
                      >
                        <SelectTrigger className="mt-1 w-full">
                          <SelectValue placeholder="Sin carpeta" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sin carpeta</SelectItem>
                          {uniqueFolders.map((folder) => (
                            <SelectItem key={folder} value={folder}>
                              {folder}
                            </SelectItem>
                          ))}
                          {/* Opción para nueva carpeta */}
                          <SelectItem value="new-folder">
                            <div className="flex items-center gap-1">
                              <FolderPlus className="h-3 w-3" />
                              <span>Nueva carpeta...</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="upload-category">Categoría</Label>
                      <Select
                        value={uploadMetadata.categoryId}
                        onValueChange={(value) => setUploadMetadata({
                          ...uploadMetadata,
                          categoryId: value
                        })}
                      >
                        <SelectTrigger className="mt-1 w-full">
                          <SelectValue placeholder="Sin categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sin categoría</SelectItem>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {uploadMetadata.folder === 'new-folder' && (
                    <div>
                      <Label htmlFor="new-upload-folder-name">Nombre de la nueva carpeta</Label>
                      <div className="flex mt-1 gap-2">
                        <Input
                          id="new-upload-folder-name"
                          placeholder="Nombre de carpeta"
                          onBlur={(e) => {
                            if (e.target.value) {
                              setUploadMetadata({
                                ...uploadMetadata,
                                folder: e.target.value.trim()
                              });
                            } else {
                              setUploadMetadata({
                                ...uploadMetadata,
                                folder: ''
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="upload-tags">Etiquetas</Label>
                    <Input
                      id="upload-tags"
                      value={uploadMetadata.tags}
                      onChange={(e) => setUploadMetadata({
                        ...uploadMetadata,
                        tags: e.target.value
                      })}
                      placeholder="Separadas por comas"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsUploadOpen(false);
                resetUploadForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => uploadMutation.mutate()}
              disabled={!uploadFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir archivo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de nueva categoría */}
      <Dialog open={isNewCategoryOpen} onOpenChange={setIsNewCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva categoría</DialogTitle>
            <DialogDescription>
              Crea una nueva categoría para organizar tus archivos multimedia.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">Nombre</Label>
              <Input
                id="category-name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({
                  ...newCategory,
                  name: e.target.value
                })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="category-slug">Slug</Label>
              <Input
                id="category-slug"
                value={newCategory.slug}
                onChange={(e) => setNewCategory({
                  ...newCategory,
                  slug: e.target.value
                })}
                className="mt-1"
              />
              <span className="text-xs text-muted-foreground">
                Identificador único para URLs (generado automáticamente)
              </span>
            </div>
            
            <div>
              <Label htmlFor="category-description">Descripción</Label>
              <Textarea
                id="category-description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({
                  ...newCategory,
                  description: e.target.value
                })}
                className="mt-1 resize-none h-20"
              />
            </div>
            
            <div>
              <Label htmlFor="category-parent">Categoría padre</Label>
              <Select
                value={newCategory.parentId}
                onValueChange={(value) => setNewCategory({
                  ...newCategory,
                  parentId: value
                })}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Sin categoría padre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin categoría padre</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsNewCategoryOpen(false);
                resetCategoryForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => createCategoryMutation.mutate()}
              disabled={!newCategory.name || createCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Crear categoría
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaPage;