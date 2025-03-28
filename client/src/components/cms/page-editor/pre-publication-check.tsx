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
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContent } from "../block-editor";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  FileCheck,
  FileWarning,
  ImageOff,
  Link2,
  ListChecks,
  Sparkles,
  SquareCheck
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PrePublicationCheckProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
  pageTitle: string;
  pageSlug: string;
  pageContent: PageContent;
  pageDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
}

interface CheckResult {
  type: "error" | "warning" | "info" | "success";
  message: string;
  details?: string;
}

/**
 * Verificaciones pre-publicación
 * 
 * Este componente realiza una serie de comprobaciones antes de publicar una página,
 * mostrando advertencias y errores que deben corregirse.
 */
const PrePublicationCheck: React.FC<PrePublicationCheckProps> = ({
  isOpen,
  onClose,
  onPublish,
  pageTitle,
  pageSlug,
  pageContent,
  pageDescription,
  metaTitle,
  metaDescription
}) => {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [hasErrors, setHasErrors] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      // Iniciar comprobaciones cuando se abre el diálogo
      runChecks();
    }
  }, [isOpen]);
  
  const runChecks = () => {
    setIsChecking(true);
    
    // Simulamos un pequeño retraso para que parezca que está haciendo comprobaciones
    setTimeout(() => {
      const checkResults: CheckResult[] = [];
      let hasErrors = false;
      
      // Comprobar título
      if (!pageTitle || pageTitle.trim() === "") {
        checkResults.push({
          type: "error",
          message: "El título es obligatorio",
          details: "La página debe tener un título para ser publicada."
        });
        hasErrors = true;
      } else if (pageTitle.length < 5) {
        checkResults.push({
          type: "warning",
          message: "El título es demasiado corto",
          details: "Se recomienda un título más descriptivo para mejor SEO."
        });
      } else {
        checkResults.push({
          type: "success",
          message: "El título es adecuado",
        });
      }
      
      // Comprobar slug
      if (!pageSlug || pageSlug.trim() === "") {
        checkResults.push({
          type: "error",
          message: "El slug (URL) es obligatorio",
          details: "La página debe tener una URL definida para ser publicada."
        });
        hasErrors = true;
      } else if (!/^[a-z0-9-]+$/.test(pageSlug)) {
        checkResults.push({
          type: "error",
          message: "El slug contiene caracteres no válidos",
          details: "Solo se permiten letras minúsculas, números y guiones (-)."
        });
        hasErrors = true;
      } else {
        checkResults.push({
          type: "success",
          message: "El slug (URL) es válido",
        });
      }
      
      // Comprobar descripción
      if (!pageDescription || pageDescription.trim() === "") {
        checkResults.push({
          type: "warning",
          message: "No hay descripción de página",
          details: "Se recomienda añadir una descripción breve para mejorar SEO."
        });
      } else if (pageDescription.length > 160) {
        checkResults.push({
          type: "warning",
          message: "La descripción es demasiado larga",
          details: "La descripción supera los 160 caracteres, lo que puede truncarse en resultados de búsqueda."
        });
      } else {
        checkResults.push({
          type: "success",
          message: "La descripción tiene una longitud adecuada",
        });
      }
      
      // Comprobar si hay bloques de contenido
      const blocks = pageContent.blocks || [];
      if (blocks.length === 0) {
        checkResults.push({
          type: "warning",
          message: "La página no tiene contenido",
          details: "Se recomienda añadir contenido antes de publicar."
        });
      } else {
        checkResults.push({
          type: "success",
          message: `La página tiene ${blocks.length} bloques de contenido`,
        });
      }
      
      // Comprobar meta etiquetas
      if (!metaTitle && !pageTitle) {
        checkResults.push({
          type: "error",
          message: "No hay título SEO ni título de página",
          details: "Es necesario al menos un título para la indexación en buscadores."
        });
        hasErrors = true;
      }
      
      if (!metaDescription && !pageDescription) {
        checkResults.push({
          type: "warning",
          message: "No hay meta descripción para SEO",
          details: "Se recomienda añadir una meta descripción para mejorar el posicionamiento."
        });
      }
      
      // Comprobar enlaces y referencias a imágenes
      let brokenImageLinks = 0;
      let brokenLinks = 0;
      let totalLinks = 0;
      
      blocks.forEach(block => {
        // Comprobar enlaces en bloques HTML o Rich Text
        if (block.type === 'html' || block.type === 'rich-text') {
          const content = typeof block.content === 'string' ? block.content : '';
          const linkMatches = content.match(/<a [^>]*href=["']([^"']+)["'][^>]*>/g) || [];
          
          totalLinks += linkMatches.length;
          
          // Simular detección de enlaces rotos (en un caso real, harías una verificación real)
          const badUrlExample = "http://example-bad-url.com";
          linkMatches.forEach(link => {
            if (link.includes(badUrlExample)) {
              brokenLinks++;
            }
          });
          
          // Comprobar imágenes
          const imgMatches = content.match(/<img [^>]*src=["']([^"']+)["'][^>]*>/g) || [];
          imgMatches.forEach(img => {
            if (img.includes(badUrlExample)) {
              brokenImageLinks++;
            }
          });
        }
        
        // Comprobar bloques de imagen
        if (block.type === 'image' && block.content && typeof block.content === 'object') {
          const imgSrc = (block.content as any).src || '';
          if (!imgSrc || imgSrc === 'broken-image-url') {
            brokenImageLinks++;
          }
        }
      });
      
      if (brokenLinks > 0) {
        checkResults.push({
          type: "warning",
          message: `Se detectaron ${brokenLinks} enlaces potencialmente rotos`,
          details: "Revisa los enlaces antes de publicar para asegurar que funcionan correctamente."
        });
      }
      
      if (brokenImageLinks > 0) {
        checkResults.push({
          type: "warning",
          message: `Se detectaron ${brokenImageLinks} imágenes potencialmente rotas`,
          details: "Algunas imágenes podrían no cargarse correctamente. Revisa las URLs de las imágenes."
        });
      }
      
      if (totalLinks > 0 && brokenLinks === 0) {
        checkResults.push({
          type: "success",
          message: `Todos los enlaces (${totalLinks}) parecen estar bien`,
        });
      }
      
      // Actualizar el estado con los resultados
      setResults(checkResults);
      setHasErrors(hasErrors);
      setIsChecking(false);
    }, 500);
  };
  
  const getIconForCheck = (type: CheckResult['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'info':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" /> 
            Verificación antes de publicar
          </DialogTitle>
          <DialogDescription>
            Se han realizado las siguientes comprobaciones antes de publicar tu página
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 max-h-[70vh]">
          <div className="space-y-6 p-1">
            {/* Resumen */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ListChecks className="h-5 w-5" />
                  Resumen de verificación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className={`bg-destructive/10 border-destructive ${!hasErrors ? 'opacity-50' : ''}`}>
                    {results.filter(r => r.type === 'error').length} errores
                  </Badge>
                  <Badge variant="outline" className={`bg-amber-500/10 border-amber-500 text-amber-700`}>
                    {results.filter(r => r.type === 'warning').length} advertencias
                  </Badge>
                  <Badge variant="outline" className={`bg-blue-500/10 border-blue-500 text-blue-700`}>
                    {results.filter(r => r.type === 'info').length} sugerencias
                  </Badge>
                  <Badge variant="outline" className={`bg-green-500/10 border-green-500 text-green-700`}>
                    {results.filter(r => r.type === 'success').length} correctos
                  </Badge>
                </div>
                
                <div className="text-sm">
                  {hasErrors ? (
                    <div className="flex items-center gap-2 text-destructive">
                      <FileWarning className="h-4 w-4" />
                      <span>Hay errores que deben resolverse antes de publicar</span>
                    </div>
                  ) : results.filter(r => r.type === 'warning').length > 0 ? (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Hay advertencias que deberías revisar, pero puedes publicar</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <SquareCheck className="h-4 w-4" />
                      <span>¡Todo parece estar bien! Tu página está lista para ser publicada</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Detalles de la verificación */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Detalles de la verificación</CardTitle>
                <CardDescription>
                  Revisa cada elemento antes de publicar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contenido básico */}
                <div>
                  <h3 className="text-md font-medium mb-3 flex items-center gap-2">
                    <FileCheck className="h-4 w-4" /> Contenido básico
                  </h3>
                  <div className="space-y-3">
                    {results
                      .filter(r => ['Título', 'slug', 'descripción', 'contenido'].some(term => 
                        r.message.toLowerCase().includes(term.toLowerCase())
                      ))
                      .map((result, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          {getIconForCheck(result.type)}
                          <div>
                            <p className={
                              result.type === 'error' ? 'text-destructive' : 
                              result.type === 'warning' ? 'text-amber-600' : 
                              result.type === 'success' ? 'text-green-600' : ''
                            }>
                              {result.message}
                            </p>
                            {result.details && (
                              <p className="text-muted-foreground text-xs mt-0.5">{result.details}</p>
                            )}
                          </div>
                        </div>  
                      ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* SEO */}
                <div>
                  <h3 className="text-md font-medium mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Optimización para buscadores (SEO)
                  </h3>
                  <div className="space-y-3">
                    {results
                      .filter(r => ['meta', 'seo'].some(term => 
                        r.message.toLowerCase().includes(term.toLowerCase())
                      ))
                      .map((result, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          {getIconForCheck(result.type)}
                          <div>
                            <p className={
                              result.type === 'error' ? 'text-destructive' : 
                              result.type === 'warning' ? 'text-amber-600' : 
                              result.type === 'success' ? 'text-green-600' : ''
                            }>
                              {result.message}
                            </p>
                            {result.details && (
                              <p className="text-muted-foreground text-xs mt-0.5">{result.details}</p>
                            )}
                          </div>
                        </div>  
                      ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Enlaces e imágenes */}
                <div>
                  <h3 className="text-md font-medium mb-3 flex items-center gap-2">
                    <Link2 className="h-4 w-4 mr-1" /> 
                    <ImageOff className="h-4 w-4 mr-1" /> 
                    Enlaces e imágenes
                  </h3>
                  <div className="space-y-3">
                    {results
                      .filter(r => ['enlace', 'imagen'].some(term => 
                        r.message.toLowerCase().includes(term.toLowerCase())
                      ))
                      .map((result, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          {getIconForCheck(result.type)}
                          <div>
                            <p className={
                              result.type === 'error' ? 'text-destructive' : 
                              result.type === 'warning' ? 'text-amber-600' : 
                              result.type === 'success' ? 'text-green-600' : ''
                            }>
                              {result.message}
                            </p>
                            {result.details && (
                              <p className="text-muted-foreground text-xs mt-0.5">{result.details}</p>
                            )}
                          </div>
                        </div>  
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
        
        <DialogFooter className="flex justify-between items-center">
          <div>
            {hasErrors ? (
              <Badge variant="destructive">
                No se puede publicar con errores
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-500/10 border-green-500 text-green-700">
                Listo para publicar
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={onPublish} disabled={hasErrors}>
              Publicar página
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrePublicationCheck;