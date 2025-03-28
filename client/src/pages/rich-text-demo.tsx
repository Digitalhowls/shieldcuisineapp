import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import RichTextBlock from '@/components/cms/block-editor/blocks/RichTextBlock';
import { RichTextContent } from '@/components/cms/block-editor/types';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const RichTextDemo = () => {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  // Definimos un tipo para nuestros bloques con textAlign que puede cambiar
  type RichTextBlock = {
    id: string;
    type: 'rich-text';
    content: {
      content: string;
      textAlign: 'left' | 'center' | 'right';
    };
  };
  
  const [blocks, setBlocks] = useState<RichTextBlock[]>([
    {
      id: uuidv4(),
      type: 'rich-text',
      content: {
        content: '<h2>Bienvenido al Editor de Texto Enriquecido</h2><p>Este es un ejemplo de texto con <strong>formato</strong> y algunas <em>características</em> de <u>edición</u>.</p>',
        textAlign: 'left'
      }
    }
  ]);

  const handleBlockUpdate = (blockId: string, data: { content: RichTextContent }) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === blockId 
          ? { 
              ...block, 
              content: {
                content: data.content.content,
                textAlign: data.content.textAlign || 'left'
              } 
            } 
          : block
      )
    );
  };

  const addNewBlock = () => {
    const newBlock: RichTextBlock = {
      id: uuidv4(),
      type: 'rich-text',
      content: {
        content: '<p>Nuevo bloque de texto. Haz clic para editar.</p>',
        textAlign: 'left'
      }
    };
    setBlocks([...blocks, newBlock]);
    setActiveBlockId(newBlock.id);
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <header className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Editor de Texto Enriquecido</h1>
            <p className="text-muted-foreground mt-2">
              Editor avanzado con formato y asistente de IA para generación de contenido.
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span>Asistente IA Integrado</span>
          </Badge>
        </div>
      </header>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="info">Información</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Editor con Asistente de IA</CardTitle>
              <CardDescription>
                Haz clic en cualquier bloque para editarlo. Activa el asistente de IA con el botón "Asistente IA" 
                que aparece en la barra de herramientas cuando seleccionas un bloque.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {blocks.map(block => (
                  <div 
                    key={block.id}
                    onClick={() => setActiveBlockId(block.id)}
                    className="cursor-pointer"
                  >
                    <RichTextBlock
                      data={block}
                      isActive={activeBlockId === block.id}
                      onUpdate={(data) => handleBlockUpdate(block.id, data)}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={addNewBlock} className="flex items-center gap-1">
                  Añadir bloque de texto
                </Button>
                <Button variant="outline" onClick={() => setActiveBlockId(null)}>
                  Desactivar selección
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="info" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sobre el Editor de Texto Enriquecido</CardTitle>
              <CardDescription>
                Características y funcionalidades del componente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Características principales:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Editor de texto completo con formato avanzado (negrita, cursiva, subrayado, listas, etc.)</li>
                  <li>Alineación de texto (izquierda, centro, derecha)</li>
                  <li>Encabezados (H1-H3) y citas</li>
                  <li>Inserción de enlaces e imágenes</li>
                  <li>Selección de colores para el texto</li>
                  <li><strong>Asistente de IA integrado</strong> para generación de contenido</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Asistente de IA:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Generación de contenido basada en prompts del usuario</li>
                  <li>Opción de seleccionar entre dos modelos: OpenAI (GPT-4o) y Perplexity (Llama 3.1)</li>
                  <li>Configuración de tono, formato y longitud del contenido generado</li>
                  <li>Ajustes avanzados para temperatura y otros parámetros</li>
                </ul>
              </div>
              
              <div className="mt-8 border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Datos del componente:</h3>
                <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60 text-sm">
                  {JSON.stringify(blocks, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RichTextDemo;