import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react';
import { generateContent as generateOpenAIContent } from '@/lib/openai-service';
// Removemos la importación que no vamos a utilizar
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

/**
 * Propiedades del componente de asistente de IA
 */
interface AiAssistantProps {
  onContentGenerated: (content: string) => void;
  initialPrompt?: string;
}

/**
 * Configuración para la generación de contenido
 */
interface GenerationSettings {
  modelo: 'openai'; // Solo usamos OpenAI
  tono: 'profesional' | 'casual' | 'persuasivo' | 'informativo';
  formato: 'text' | 'html';
  temperatura: number;
  longitud: 'corta' | 'media' | 'larga';
}

/**
 * Componente de asistente de IA para el editor de texto enriquecido
 * 
 * Permite generar contenido utilizando OpenAI (GPT-4o)
 */
export function AiAssistant({ onContentGenerated, initialPrompt = "" }: AiAssistantProps) {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<GenerationSettings>({
    modelo: 'openai',
    tono: 'profesional',
    formato: 'html',
    temperatura: 0.3,
    longitud: 'media',
  });
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  /**
   * Genera el contenido basado en el prompt y la configuración
   */
  const handleGenerate = async () => {
    if (!prompt) {
      setError('Por favor, especifica lo que deseas generar');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Adaptar el prompt según la configuración
      const maxTokensMap = {
        'corta': 250,
        'media': 500,
        'larga': 1000
      };

      const enhancedPrompt = `
        Genera contenido con las siguientes características:
        - Tono: ${settings.tono}
        - Formato: ${settings.formato === 'html' ? 'HTML con etiquetas apropiadas (p, h1-h6, ul, li, etc.)' : 'texto plano'}
        - Longitud: ${settings.longitud}

        Instrucciones: ${prompt}
      `;

      // Usar OpenAI para generar el contenido
      const generatedContent = await generateOpenAIContent({
        instruction: enhancedPrompt,
        format: settings.formato,
        temperature: settings.temperatura,
        maxTokens: maxTokensMap[settings.longitud],
      });

      onContentGenerated(generatedContent);
    } catch (err) {
      setError('Error al generar contenido: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ai-prompt">¿Qué contenido deseas generar?</Label>
          <Textarea
            id="ai-prompt"
            placeholder="Ej: Genera un párrafo sobre la importancia de la seguridad alimentaria en restaurantes"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <div className="bg-muted/50 p-2 rounded-md flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>Usando OpenAI (GPT-4o)</span>
          </div>
        </div>

        <div>
          <Label htmlFor="ai-tone">Tono</Label>
          <Select
            value={settings.tono}
            onValueChange={(value) => 
              setSettings({ ...settings, tono: value as 'profesional' | 'casual' | 'persuasivo' | 'informativo' })
            }
          >
            <SelectTrigger id="ai-tone">
              <SelectValue placeholder="Selecciona tono" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profesional">Profesional</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="persuasivo">Persuasivo</SelectItem>
              <SelectItem value="informativo">Informativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="advanced-settings"
            checked={showAdvancedSettings}
            onCheckedChange={setShowAdvancedSettings}
          />
          <Label htmlFor="advanced-settings">Configuración avanzada</Label>
        </div>

        {showAdvancedSettings && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="temperature">Temperatura: {settings.temperatura}</Label>
              </div>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.1}
                value={[settings.temperatura]}
                onValueChange={(value) => setSettings({ ...settings, temperatura: value[0] })}
              />
              <span className="text-xs text-muted-foreground">
                Valores bajos = más predecible, valores altos = más creativo
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ai-format">Formato</Label>
                <Select
                  value={settings.formato}
                  onValueChange={(value) => 
                    setSettings({ ...settings, formato: value as 'text' | 'html' })
                  }
                >
                  <SelectTrigger id="ai-format">
                    <SelectValue placeholder="Selecciona formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto plano</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ai-length">Longitud</Label>
                <Select
                  value={settings.longitud}
                  onValueChange={(value) => 
                    setSettings({ ...settings, longitud: value as 'corta' | 'media' | 'larga' })
                  }
                >
                  <SelectTrigger id="ai-length">
                    <SelectValue placeholder="Selecciona longitud" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corta">Corta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="larga">Larga</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !prompt} 
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generar contenido
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}