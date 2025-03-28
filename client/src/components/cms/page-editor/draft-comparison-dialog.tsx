import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  GitCompare, 
  Eye, 
  Save, 
  Clock, 
  FileText,
  Check,
  AlertTriangle
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageContent } from "../block-editor";
import BlockRenderer from "../public/block-renderer";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface DraftComparisonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
  publishedData?: {
    title: string;
    content: string;
    updatedAt: string;
    publishedAt?: string;
  };
  draftData: {
    title: string;
    content: any;
    updatedAt: string;
  };
}

/**
 * Dialogo de comparación de borradores
 * 
 * Muestra una comparación entre la versión publicada y el borrador actual
 * para ayudar al usuario a decidir si publicar los cambios.
 */
const DraftComparisonDialog: React.FC<DraftComparisonDialogProps> = ({
  isOpen,
  onClose,
  onPublish,
  publishedData,
  draftData
}) => {
  const [activeTab, setActiveTab] = useState<"current" | "changes" | "preview">("changes");
  const [publishedContent, setPublishedContent] = useState<PageContent | null>(null);
  const [draftContent, setDraftContent] = useState<PageContent | null>(null);
  
  // Preparar los datos al abrir el diálogo
  useEffect(() => {
    if (isOpen) {
      // Convertir el contenido publicado a objeto PageContent
      if (publishedData?.content) {
        try {
          const parsed = JSON.parse(publishedData.content);
          setPublishedContent(Array.isArray(parsed) 
            ? { blocks: parsed, settings: { layout: 'boxed', spacing: 'normal' } } 
            : parsed);
        } catch (e) {
          // Si no es JSON, considerar como un bloque HTML
          setPublishedContent({
            blocks: [{ 
              id: "legacy-content", 
              type: "html", 
              content: publishedData.content 
            }],
            settings: { layout: 'boxed', spacing: 'normal' }
          });
        }
      } else {
        setPublishedContent(null);
      }
      
      // Contenido del borrador
      if (draftData.content) {
        if (typeof draftData.content === 'string') {
          try {
            const parsed = JSON.parse(draftData.content);
            setDraftContent(Array.isArray(parsed) 
              ? { blocks: parsed, settings: { layout: 'boxed', spacing: 'normal' } } 
              : parsed);
          } catch (e) {
            setDraftContent({
              blocks: [{ 
                id: "draft-content", 
                type: "html", 
                content: draftData.content 
              }],
              settings: { layout: 'boxed', spacing: 'normal' }
            });
          }
        } else {
          // Asumir que ya es un objeto compatible
          setDraftContent(Array.isArray(draftData.content) 
            ? { blocks: draftData.content, settings: { layout: 'boxed', spacing: 'normal' } } 
            : draftData.content);
        }
      }
    }
  }, [isOpen, publishedData, draftData]);
  
  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
    } catch (e) {
      return "Fecha desconocida";
    }
  };
  
  // Determinar la cantidad de cambios entre versiones
  const getDiffCount = () => {
    if (!publishedContent || !draftContent) return 0;
    
    const publishedBlocks = publishedContent.blocks || [];
    const draftBlocks = draftContent.blocks || [];
    
    // Cambio en el número de bloques
    if (publishedBlocks.length !== draftBlocks.length) {
      return Math.abs(publishedBlocks.length - draftBlocks.length);
    }
    
    // Cambios en el contenido de los bloques existentes
    let changes = 0;
    for (let i = 0; i < publishedBlocks.length; i++) {
      if (JSON.stringify(publishedBlocks[i]) !== JSON.stringify(draftBlocks[i])) {
        changes++;
      }
    }
    
    return changes;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-full flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" /> 
            Comparar cambios antes de publicar
          </DialogTitle>
          <DialogDescription>
            Revisa los cambios entre la versión publicada y tu borrador actual
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="current">
              <Eye className="h-4 w-4 mr-2" />
              <span>Versión publicada</span>
            </TabsTrigger>
            <TabsTrigger value="changes">
              <GitCompare className="h-4 w-4 mr-2" />
              <span>Comparación {!!getDiffCount() && <Badge variant="outline" className="ml-2">{getDiffCount()}</Badge>}</span>
            </TabsTrigger>
            <TabsTrigger value="preview">
              <FileText className="h-4 w-4 mr-2" />
              <span>Vista previa</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Versión publicada */}
          <TabsContent value="current" className="flex-1 overflow-hidden mt-4">
            {publishedContent ? (
              <div className="h-full flex flex-col">
                <div className="bg-muted/50 p-3 rounded-t-md flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Versión publicada</span>
                  {publishedData?.publishedAt && (
                    <span className="text-sm text-muted-foreground ml-auto flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" /> 
                      Publicada el {formatDate(publishedData.publishedAt)}
                    </span>
                  )}
                </div>
                <div className="border flex-1 overflow-auto mb-2 rounded-b-md">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      <h1 className="text-3xl font-bold mb-4">{publishedData?.title}</h1>
                      <BlockRenderer blocks={publishedContent.blocks} />
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No hay versión publicada</h3>
                  <p className="text-muted-foreground text-center mt-2">
                    Esta página aún no ha sido publicada.<br />
                    La versión publicada aparecerá aquí para comparar.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Vista de comparación */}
          <TabsContent value="changes" className="flex-1 overflow-hidden mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
              {/* Columna izquierda: Versión publicada */}
              <div className="h-full flex flex-col">
                <div className="bg-muted/50 p-3 rounded-t-md flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Versión publicada</span>
                  {publishedData?.publishedAt && (
                    <span className="text-xs text-muted-foreground ml-auto flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> 
                      {formatDate(publishedData.publishedAt)}
                    </span>
                  )}
                </div>
                {publishedContent ? (
                  <div className="border flex-1 overflow-auto mb-2 rounded-b-md">
                    <ScrollArea className="h-full">
                      <div className="p-4">
                        <h1 className="text-3xl font-bold mb-4">{publishedData?.title}</h1>
                        <BlockRenderer blocks={publishedContent.blocks} />
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="border flex-1 flex items-center justify-center mb-2 rounded-b-md">
                    <div className="text-center p-4">
                      <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No hay versión publicada</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Columna derecha: Borrador actual */}
              <div className="h-full flex flex-col">
                <div className="bg-muted/50 p-3 rounded-t-md flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">Borrador actual</span>
                  <span className="text-xs text-muted-foreground ml-auto flex items-center">
                    <Clock className="h-3 w-3 mr-1" /> 
                    Actualizado el {formatDate(draftData.updatedAt)}
                  </span>
                </div>
                <div className="border flex-1 overflow-auto mb-2 rounded-b-md">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      <h1 className="text-3xl font-bold mb-4">{draftData.title}</h1>
                      {draftContent && (
                        <BlockRenderer blocks={draftContent.blocks} />
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Vista previa completa */}
          <TabsContent value="preview" className="flex-1 overflow-hidden mt-4">
            <div className="bg-muted/50 p-3 rounded-t-md flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Vista previa del borrador</span>
              <span className="text-sm text-muted-foreground ml-auto flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1" /> 
                Actualizado el {formatDate(draftData.updatedAt)}
              </span>
            </div>
            <div className="border flex-1 overflow-auto mb-2 rounded-b-md">
              <ScrollArea className="h-full">
                <div className="p-4 max-w-4xl mx-auto">
                  <h1 className="text-3xl font-bold mb-4">{draftData.title}</h1>
                  {draftContent && (
                    <BlockRenderer blocks={draftContent.blocks} />
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex flex-row justify-between items-center">
          <div className="flex items-center">
            {getDiffCount() > 0 ? (
              <Badge variant="outline" className="bg-amber-500/10 border-amber-500 text-amber-700">
                {getDiffCount()} {getDiffCount() === 1 ? 'cambio' : 'cambios'} detectados
              </Badge>
            ) : publishedContent ? (
              <Badge variant="outline" className="bg-green-500/10 border-green-500 text-green-700">
                No se detectaron cambios
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-blue-500/10 border-blue-500 text-blue-700">
                Publicación inicial
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={onPublish}>
              {publishedContent ? "Publicar cambios" : "Publicar página"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DraftComparisonDialog;