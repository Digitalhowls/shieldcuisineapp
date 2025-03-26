import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { generateContent } from '@/lib/openai-service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export interface AiBlockData {
  id: string;
  type: 'ai';
  content: string;
  generatedContent?: string;
  prompt?: string;
  tone?: string;
  format?: 'text' | 'html';
}

interface AiBlockProps {
  data: AiBlockData;
  onUpdate: (data: Partial<AiBlockData>) => void;
  preview?: boolean;
  readOnly?: boolean;
}

export const AiBlock: React.FC<AiBlockProps> = ({ data, onUpdate, preview = false, readOnly = false }) => {
  const [prompt, setPrompt] = useState(data.prompt || '');
  const [tone, setTone] = useState(data.tone || 'profesional');
  const [format, setFormat] = useState(data.format || 'html');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Cuando estamos en preview, mostrar el contenido generado
  if (preview) {
    if (data.generatedContent) {
      if (format === 'html') {
        return <div dangerouslySetInnerHTML={{ __html: data.generatedContent }} />;
      } else {
        return <div className="whitespace-pre-wrap">{data.generatedContent}</div>;
      }
    }
    return <div className="text-muted-foreground italic">No hay contenido generado</div>;
  }

  // Si es de solo lectura, mostrar el contenido sin edición
  if (readOnly) {
    if (data.generatedContent) {
      if (format === 'html') {
        return <div dangerouslySetInnerHTML={{ __html: data.generatedContent }} />;
      } else {
        return <div className="whitespace-pre-wrap">{data.generatedContent}</div>;
      }
    }
    return <div className="text-muted-foreground italic">No hay contenido generado</div>;
  }

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        title: "Prompt requerido",
        description: "Por favor, introduce un prompt para generar contenido",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      // Obtener el contenido existente como contexto, si hay
      const existingContent = data.content || '';
      
      const generatedContent = await generateContent({
        instruction: prompt,
        context: existingContent,
        format: format,
        temperature: 0.7,
        maxTokens: 2000
      });
      
      // Actualizar los datos del bloque
      onUpdate({
        prompt,
        tone,
        format,
        generatedContent,
      });
      
      toast({
        title: "Contenido generado",
        description: "El contenido ha sido generado correctamente",
      });
    } catch (error) {
      console.error('Error generando contenido:', error);
      
      toast({
        title: "Error al generar contenido",
        description: error instanceof Error ? error.message : "Ocurrió un error al comunicarse con la API",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg font-medium">
          <Wand2 className="mr-2 h-5 w-5" />
          Bloque de IA
        </CardTitle>
        <CardDescription>
          Genera contenido inteligente utilizando IA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej: Escribe un párrafo sobre la importancia de la seguridad alimentaria"
              rows={3}
            />
          </div>
          
          <div>
            <button
              type="button"
              className="inline-flex items-center text-sm font-medium text-primary"
              onClick={() => setShowOptions(!showOptions)}
            >
              {showOptions ? 'Ocultar opciones' : 'Mostrar opciones avanzadas'}
            </button>
          </div>
          
          {showOptions && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tone">Tono</Label>
                <Select 
                  value={tone} 
                  onValueChange={(value) => setTone(value)}
                >
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Seleccionar tono" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profesional">Profesional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="técnico">Técnico</SelectItem>
                    <SelectItem value="educativo">Educativo</SelectItem>
                    <SelectItem value="persuasivo">Persuasivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="format">Formato</Label>
                <Select 
                  value={format} 
                  onValueChange={(value: 'text' | 'html') => setFormat(value)}
                >
                  <SelectTrigger id="format">
                    <SelectValue placeholder="Seleccionar formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto plano</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {data.generatedContent && (
            <div className="space-y-2">
              <Label>Contenido generado</Label>
              <div className="rounded-md border bg-muted p-4 max-h-[300px] overflow-y-auto">
                {format === 'html' ? (
                  <div dangerouslySetInnerHTML={{ __html: data.generatedContent }} />
                ) : (
                  <div className="whitespace-pre-wrap">{data.generatedContent}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className="w-full sm:w-auto"
        >
          {isGenerating ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Generando...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generar contenido
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};