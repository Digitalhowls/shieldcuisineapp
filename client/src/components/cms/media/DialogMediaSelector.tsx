import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Search, Video, Image, FileText, Upload } from 'lucide-react';

interface Media {
  id: number;
  title: string;
  filename: string;
  url: string;
  type: string;
  width?: number;
  height?: number;
  filesize: number;
  mimeType: string;
  thumbnailUrl?: string;
  createdAt: string;
  uploadedBy: {
    id: number;
    username: string;
  };
}

interface DialogMediaSelectorProps {
  onSelect: (media: Media) => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  defaultTab?: 'image' | 'video' | 'document' | 'all';
  allowedTypes?: string[];
}

const DialogMediaSelector: React.FC<DialogMediaSelectorProps> = ({
  onSelect,
  trigger,
  title = 'Selector de medios',
  description = 'Selecciona un archivo de la biblioteca de medios',
  defaultTab = 'all',
  allowedTypes,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [selectedItem, setSelectedItem] = useState<Media | null>(null);
  const { toast } = useToast();

  // Simulamos datos para la demostración - en una implementación real, esto vendría de la API
  const dummyVideos: Media[] = [
    {
      id: 1,
      title: 'Video de demostración 1',
      filename: 'demo1.mp4',
      url: 'https://example.com/videos/demo1.mp4',
      type: 'video',
      filesize: 1024000,
      mimeType: 'video/mp4',
      thumbnailUrl: 'https://via.placeholder.com/320x180',
      createdAt: '2023-04-15T10:00:00Z',
      uploadedBy: {
        id: 1,
        username: 'admin',
      },
    },
    {
      id: 2,
      title: 'Video promocional',
      filename: 'promo.mp4',
      url: 'https://example.com/videos/promo.mp4',
      type: 'video',
      filesize: 5120000,
      mimeType: 'video/mp4',
      thumbnailUrl: 'https://via.placeholder.com/320x180',
      createdAt: '2023-05-20T14:30:00Z',
      uploadedBy: {
        id: 1,
        username: 'admin',
      },
    },
    {
      id: 3,
      title: 'Tutorial de cocina',
      filename: 'tutorial.mp4',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      type: 'youtube',
      filesize: 0,
      mimeType: 'text/html',
      thumbnailUrl: 'https://via.placeholder.com/320x180',
      createdAt: '2023-06-10T09:15:00Z',
      uploadedBy: {
        id: 2,
        username: 'editor',
      },
    },
    {
      id: 4,
      title: 'Presentación de producto',
      filename: 'presentation.mp4',
      url: 'https://vimeo.com/123456789',
      type: 'vimeo',
      filesize: 0,
      mimeType: 'text/html',
      thumbnailUrl: 'https://via.placeholder.com/320x180',
      createdAt: '2023-07-05T16:45:00Z',
      uploadedBy: {
        id: 2,
        username: 'editor',
      },
    },
  ];

  // En una implementación real, usaríamos react-query para cargar los datos
  /*
  const { data: mediaItems, isLoading, error } = useQuery<Media[]>({
    queryKey: ['/api/cms/media', activeTab, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      if (activeTab !== 'all') {
        params.append('type', activeTab);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      return fetch(`/api/cms/media?${params.toString()}`).then(res => res.json());
    }
  });
  */

  // Para esta demostración, filtramos los datos localmente
  const filteredMedia = dummyVideos.filter((item) => {
    // Filtrar por tipo si está seleccionado algo distinto a 'all'
    if (activeTab !== 'all' && item.type !== activeTab) {
      return false;
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filtrar por tipos permitidos
    if (allowedTypes && allowedTypes.length > 0) {
      return allowedTypes.includes(item.type);
    }
    
    return true;
  });

  const handleSelect = () => {
    if (selectedItem) {
      onSelect(selectedItem);
    } else {
      toast({
        title: 'Selección requerida',
        description: 'Por favor, selecciona un archivo de la biblioteca',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let size = bytes;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline" size="sm">Seleccionar</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 my-4">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
        
        <Tabs defaultValue={defaultTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="image">Imágenes</TabsTrigger>
            <TabsTrigger value="video">Vídeos</TabsTrigger>
            <TabsTrigger value="document">Documentos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredMedia.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`cursor-pointer border rounded-md overflow-hidden transition-all ${
                    selectedItem?.id === item.id ? 'ring-2 ring-primary' : 'hover:border-muted-foreground'
                  }`}
                >
                  <div className="aspect-video bg-muted relative">
                    {item.thumbnailUrl ? (
                      <img 
                        src={item.thumbnailUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        {item.type === 'video' || item.type === 'youtube' || item.type === 'vimeo' ? (
                          <Video className="w-10 h-10 text-muted-foreground" />
                        ) : item.type === 'image' ? (
                          <Image className="w-10 h-10 text-muted-foreground" />
                        ) : (
                          <FileText className="w-10 h-10 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-md">
                      {item.type}
                    </div>
                  </div>
                  <div className="p-2">
                    <h4 className="font-medium text-sm truncate">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{formatFileSize(item.filesize)}</p>
                  </div>
                </div>
              ))}
              
              {filteredMedia.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
                  <FileText className="w-10 h-10 text-muted-foreground mb-2" />
                  <h4 className="text-lg font-medium">No se encontraron archivos</h4>
                  <p className="text-sm text-muted-foreground">
                    Intenta con otros términos de búsqueda o cambia el tipo de archivo
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="image" className="flex-1 overflow-y-auto">
            {/* Mismo contenido que "all" pero filtrado por imágenes */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredMedia.filter(item => item.type === 'image').length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
                  <Image className="w-10 h-10 text-muted-foreground mb-2" />
                  <h4 className="text-lg font-medium">No se encontraron imágenes</h4>
                  <p className="text-sm text-muted-foreground">
                    Sube imágenes para utilizarlas en tus contenidos
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="video" className="flex-1 overflow-y-auto">
            {/* Mismo contenido que "all" pero filtrado por videos */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredMedia.filter(item => item.type === 'video' || item.type === 'youtube' || item.type === 'vimeo').map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`cursor-pointer border rounded-md overflow-hidden transition-all ${
                    selectedItem?.id === item.id ? 'ring-2 ring-primary' : 'hover:border-muted-foreground'
                  }`}
                >
                  <div className="aspect-video bg-muted relative">
                    {item.thumbnailUrl ? (
                      <img 
                        src={item.thumbnailUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Video className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-md">
                      {item.type}
                    </div>
                  </div>
                  <div className="p-2">
                    <h4 className="font-medium text-sm truncate">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{formatFileSize(item.filesize)}</p>
                  </div>
                </div>
              ))}
              
              {filteredMedia.filter(item => item.type === 'video' || item.type === 'youtube' || item.type === 'vimeo').length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
                  <Video className="w-10 h-10 text-muted-foreground mb-2" />
                  <h4 className="text-lg font-medium">No se encontraron videos</h4>
                  <p className="text-sm text-muted-foreground">
                    Sube videos o añade enlaces de YouTube/Vimeo
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="document" className="flex-1 overflow-y-auto">
            {/* Mismo contenido que "all" pero filtrado por documentos */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredMedia.filter(item => item.type === 'document').length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
                  <FileText className="w-10 h-10 text-muted-foreground mb-2" />
                  <h4 className="text-lg font-medium">No se encontraron documentos</h4>
                  <p className="text-sm text-muted-foreground">
                    Sube documentos para utilizarlos en tus contenidos
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between items-center mt-4">
          <Button variant="outline" asChild>
            <DialogClose>Cancelar</DialogClose>
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild>
              <label className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                <span>Subir nuevo</span>
                <input type="file" className="hidden" />
              </label>
            </Button>
            <DialogClose asChild>
              <Button onClick={handleSelect} disabled={!selectedItem}>Seleccionar</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogMediaSelector;