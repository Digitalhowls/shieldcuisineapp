import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContent } from "../block-editor";
import { Smartphone, Tablet, Monitor, Laptop, RotateCcw } from "lucide-react";
// Componente simple para la vista previa de bloques
const BlockRenderer = ({ blocks = [] }: { blocks: any[] }) => {
  return (
    <div className="space-y-4">
      {blocks.map((block) => (
        <div key={block.id} className="p-3 border rounded">
          <h3 className="text-sm font-bold mb-1">{block.type}</h3>
          <div className="text-xs">ID: {block.id}</div>
          {block.content && <div className="mt-2">{block.content}</div>}
        </div>
      ))}
    </div>
  );
};

interface DevicePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pageTitle: string;
  pageContent: PageContent;
  pageSlug: string;
  pageDescription?: string;
}

/**
 * Componente de vista previa para diferentes dispositivos
 * 
 * Permite visualizar cómo se verá la página en diferentes tamaños de pantalla:
 * - Móvil (320px, 375px, 425px)
 * - Tablet (768px)
 * - Desktop (1024px, 1440px)
 */
const DevicePreviewDialog: React.FC<DevicePreviewDialogProps> = ({
  isOpen,
  onClose,
  pageTitle,
  pageContent,
  pageSlug,
  pageDescription,
}) => {
  const [activeDevice, setActiveDevice] = useState<string>("desktop-1024");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  
  // Configuraciones de dispositivos
  const deviceConfigs = {
    "mobile-320": { width: 320, height: 568, name: "Móvil pequeño" },
    "mobile-375": { width: 375, height: 667, name: "Móvil mediano" },
    "mobile-425": { width: 425, height: 736, name: "Móvil grande" },
    "tablet-768": { width: 768, height: 1024, name: "Tablet" },
    "desktop-1024": { width: 1024, height: 768, name: "Laptop" },
    "desktop-1440": { width: 1440, height: 900, name: "Desktop" },
  };
  
  // Obtener dimensiones según la configuración y orientación
  const getCurrentDimensions = () => {
    const config = deviceConfigs[activeDevice as keyof typeof deviceConfigs];
    
    if (orientation === "landscape" && activeDevice.includes("mobile")) {
      return { width: config.height, height: config.width };
    }
    
    return { width: config.width, height: config.height };
  };
  
  // Escala para ajustar la previsualización a la ventana
  const getScaleFactor = () => {
    const { width } = getCurrentDimensions();
    const containerWidth = 800; // ancho máximo del contenedor
    
    if (width > containerWidth) {
      return containerWidth / width;
    }
    
    return 1;
  };
  
  // Cambiar la orientación (solo para móviles y tablets)
  const toggleOrientation = () => {
    if (activeDevice.includes("mobile") || activeDevice.includes("tablet")) {
      setOrientation(prev => prev === "portrait" ? "landscape" : "portrait");
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Laptop className="h-5 w-5" />
            Vista previa en dispositivos
          </DialogTitle>
          <DialogDescription>
            Visualiza cómo se verá tu página en diferentes dispositivos y tamaños de pantalla.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Selector de dispositivos */}
          <div className="flex items-center justify-between mb-4">
            <Tabs value={activeDevice} onValueChange={setActiveDevice} className="w-full">
              <TabsList className="grid grid-cols-6">
                <TabsTrigger value="mobile-320" className="flex items-center gap-1">
                  <Smartphone className="h-3 w-3" />
                  <span className="hidden md:inline">320px</span>
                </TabsTrigger>
                <TabsTrigger value="mobile-375" className="flex items-center gap-1">
                  <Smartphone className="h-4 w-4" />
                  <span className="hidden md:inline">375px</span>
                </TabsTrigger>
                <TabsTrigger value="mobile-425" className="flex items-center gap-1">
                  <Smartphone className="h-4 w-4" />
                  <span className="hidden md:inline">425px</span>
                </TabsTrigger>
                <TabsTrigger value="tablet-768" className="flex items-center gap-1">
                  <Tablet className="h-4 w-4" />
                  <span className="hidden md:inline">768px</span>
                </TabsTrigger>
                <TabsTrigger value="desktop-1024" className="flex items-center gap-1">
                  <Monitor className="h-4 w-4" />
                  <span className="hidden md:inline">1024px</span>
                </TabsTrigger>
                <TabsTrigger value="desktop-1440" className="flex items-center gap-1">
                  <Monitor className="h-4 w-4" />
                  <span className="hidden md:inline">1440px</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Botón de rotación para móviles y tablets */}
            {(activeDevice.includes("mobile") || activeDevice.includes("tablet")) && (
              <Button 
                variant="outline" 
                size="icon" 
                className="ml-2" 
                onClick={toggleOrientation}
                title="Cambiar orientación"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Contenedor de la previsualización */}
          <div className="flex-1 overflow-hidden flex items-center justify-center bg-gray-100 rounded-md relative">
            <div className="absolute top-2 left-2 text-xs text-muted-foreground">
              {deviceConfigs[activeDevice as keyof typeof deviceConfigs]?.name} - 
              {orientation === "portrait" ? " Vertical" : " Horizontal"} - 
              Escala: {Math.round(getScaleFactor() * 100)}%
            </div>
            
            <div 
              className="bg-white overflow-y-auto border shadow-sm transition-all duration-300"
              style={{
                width: `${getCurrentDimensions().width}px`,
                height: `${getCurrentDimensions().height}px`,
                transform: `scale(${getScaleFactor()})`,
                transformOrigin: 'center'
              }}
            >
              <ScrollArea className="h-full">
                <div className="p-4">
                  {/* Título de la página */}
                  <h1 className="text-3xl font-bold mb-4 text-center">{pageTitle}</h1>
                  
                  {/* Descripción si existe */}
                  {pageDescription && (
                    <p className="text-muted-foreground text-center mb-6">{pageDescription}</p>
                  )}
                  
                  {/* Contenido de la página */}
                  {pageContent?.blocks?.length > 0 ? (
                    <BlockRenderer blocks={pageContent.blocks} />
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No hay contenido para mostrar
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
          
          {/* Información de URL */}
          <div className="mt-4 text-sm text-muted-foreground">
            <span className="font-medium">URL:</span> {pageSlug ? `/${pageSlug}` : '[Sin URL definida]'}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DevicePreviewDialog;