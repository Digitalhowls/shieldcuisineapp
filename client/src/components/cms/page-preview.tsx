import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, DevicePhoneMobile, Monitor, Tablet } from "lucide-react";
import BlockRenderer from "./public/block-renderer";
import { PageContent } from "./block-editor";

interface PagePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  pageContent: PageContent;
  pageTitle: string;
  pageDescription?: string;
}

const PagePreview: React.FC<PagePreviewProps> = ({
  isOpen,
  onClose,
  pageContent,
  pageTitle,
  pageDescription
}) => {
  const [viewMode, setViewMode] = React.useState<"desktop" | "tablet" | "mobile">("desktop");

  // Definir el ancho según el modo de visualización
  const getPreviewWidth = () => {
    switch (viewMode) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      default:
        return "100%";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-full flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle>Vista previa: {pageTitle}</DialogTitle>
              {pageDescription && (
                <DialogDescription>{pageDescription}</DialogDescription>
              )}
            </div>
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as any)}
              className="ml-auto"
            >
              <TabsList>
                <TabsTrigger value="desktop">
                  <Monitor className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Escritorio</span>
                </TabsTrigger>
                <TabsTrigger value="tablet">
                  <Tablet className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Tablet</span>
                </TabsTrigger>
                <TabsTrigger value="mobile">
                  <DevicePhoneMobile className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Móvil</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </DialogHeader>
        
        <div className="relative flex-1 overflow-auto border rounded-lg mt-2">
          <div 
            className="bg-white mx-auto overflow-y-auto scrollbar-thin transition-all duration-200 p-4"
            style={{ 
              width: getPreviewWidth(),
              height: "calc(90vh - 160px)",
              maxHeight: "calc(90vh - 160px)"
            }}
          >
            {/* Título de la página (simulando el frontend público) */}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PagePreview;