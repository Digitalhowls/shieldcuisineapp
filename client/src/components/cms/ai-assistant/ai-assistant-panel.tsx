import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, MessageSquare, Image, Wand2 } from 'lucide-react';

import { AIConversation } from './AIConversation';
import { SavedPrompts } from './SavedPrompts';
import { ImageAnalyzer } from './ImageAnalyzer';

/**
 * Interfaz para las propiedades del panel asistente de IA
 */
interface AiAssistantPanelProps {
  /** Título de la página actual */
  pageTitle?: string;
  /** Descripción de la página actual */
  pageDescription?: string;
  /** Tipo de página (blog_post, landing_page, etc.) */
  pageType?: string;
  /** Función para añadir contenido generado a la página */
  onAddContent?: (content: string) => void;
  /** Función para aplicar título SEO */
  onApplySeoTitle?: (title: string) => void;
  /** Función para aplicar descripción SEO */
  onApplySeoDescription?: (description: string) => void;
  /** Función para aplicar palabras clave SEO */
  onApplySeoKeywords?: (keywords: string) => void;
}

/**
 * Panel de asistente de IA para ayudar en la creación de contenido
 * Proporciona herramientas de generación de contenido, análisis de imágenes
 * y sugerencias de SEO basadas en IA.
 */
export const AiAssistantPanel = ({
  pageTitle = '',
  pageDescription = '',
  pageType = 'page',
  onAddContent,
  onApplySeoTitle,
  onApplySeoDescription,
  onApplySeoKeywords,
}: AiAssistantPanelProps) => {
  const [activeTab, setActiveTab] = useState<string>('conversation');
  const [isOpen, setIsOpen] = useState(true);
  
  /**
   * Obtiene sugerencias de prompts contextuales según el tipo de página
   */
  const getContextualPrompts = () => {
    const commonPrompts = [
      "Genera una introducción para la página",
      "Escribe un párrafo de conclusión",
      "Crea una lista de preguntas frecuentes"
    ];
    
    switch (pageType) {
      case 'blog_post':
        return [
          "Escribe una introducción atractiva para este artículo de blog",
          "Genera 5 títulos alternativos para este post",
          "Crea un resumen de conclusión con llamada a la acción",
          "Sugiere etiquetas relevantes para este artículo",
          ...commonPrompts
        ];
      case 'landing_page':
        return [
          "Redacta un titular persuasivo para la landing page",
          "Escribe 3 testimonios ficticios para la sección de social proof",
          "Genera un texto convincente para el botón de llamada a la acción",
          "Escribe una sección de beneficios con 3-5 puntos clave",
          ...commonPrompts
        ];
      case 'course_page':
        return [
          "Genera una descripción atractiva del curso",
          "Crea una lista de los objetivos de aprendizaje",
          "Escribe una sección sobre a quién va dirigido este curso",
          "Redacta una biografía del instructor para la página",
          ...commonPrompts
        ];
      default:
        return [
          "Genera contenido para esta página",
          "Escribe un párrafo sobre nuestra empresa",
          "Crea una sección de contacto",
          "Genera una lista de características o servicios",
          ...commonPrompts
        ];
    }
  };

  /**
   * Maneja la aplicación de contenido generado a la página
   */
  const handleApplyContent = (content: string) => {
    if (onAddContent) {
      onAddContent(content);
    }
  };

  return (
    <div className="w-full">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full border rounded-md"
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Asistente de IA</h3>
              {pageTitle && (
                <Badge variant="outline" className="ml-2">
                  {pageTitle}
                </Badge>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <Tabs defaultValue="conversation" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-t px-4 py-2">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="conversation" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Conversación</span>
                </TabsTrigger>
                <TabsTrigger value="image-analyzer" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <span>Analizar Imágenes</span>
                </TabsTrigger>
                <TabsTrigger value="saved-prompts" className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  <span>Prompts Guardados</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-4">
              <TabsContent value="conversation" className="mt-0">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Asistente de Contenido IA</CardTitle>
                    <CardDescription>
                      Conversa con la IA para generar contenido, ideas o resolver dudas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AIConversation 
                      onApplyContent={handleApplyContent}
                      contextualPrompts={getContextualPrompts()}
                      pageContext={{
                        title: pageTitle,
                        description: pageDescription,
                        type: pageType
                      }}
                      onApplySeoTitle={onApplySeoTitle}
                      onApplySeoDescription={onApplySeoDescription}
                      onApplySeoKeywords={onApplySeoKeywords}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="image-analyzer" className="mt-0">
                <ImageAnalyzer />
              </TabsContent>
              
              <TabsContent value="saved-prompts" className="mt-0">
                <SavedPrompts 
                  contextualPrompts={getContextualPrompts()} 
                  onSelectPrompt={(prompt) => {
                    setActiveTab("conversation");
                  }}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};