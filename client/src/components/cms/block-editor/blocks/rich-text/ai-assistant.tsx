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
import { Loader2, Sparkles, ListChecks, Utensils, FileText, Store, FileQuestion } from 'lucide-react';
import { generateContent as generateOpenAIContent } from '@/lib/openai-service';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
 * Plantillas predefinidas para facilitar la generación de contenido
 */
interface ContentTemplate {
  icon: React.ReactNode;
  name: string;
  prompt: string;
  description: string;
}

/**
 * Plantillas de contenido para restaurantes y seguridad alimentaria
 */
const contentTemplates: ContentTemplate[] = [
  {
    icon: <ListChecks className="h-4 w-4" />,
    name: "APPCC",
    prompt: "Genera una explicación detallada sobre la implementación de sistemas APPCC en restaurantes, incluyendo los 7 principios y consejos prácticos.",
    description: "Explicación de APPCC para restaurantes"
  },
  {
    icon: <Utensils className="h-4 w-4" />,
    name: "Carta/Menú",
    prompt: "Crea una descripción atractiva de 5 platos para un restaurante especializado en cocina mediterránea, destacando ingredientes locales y de temporada.",
    description: "Descripción de platos para carta o menú"
  },
  {
    icon: <FileText className="h-4 w-4" />,
    name: "Sobre Nosotros",
    prompt: "Escribe un texto para la sección 'Sobre Nosotros' de un restaurante familiar con 20 años de tradición, destacando valores, filosofía y compromiso con la calidad.",
    description: "Historia y valores del restaurante"
  },
  {
    icon: <Store className="h-4 w-4" />,
    name: "Promoción",
    prompt: "Genera un texto promocional persuasivo para un nuevo servicio de catering especializado en eventos corporativos, destacando la calidad, personalización y seguridad alimentaria.",
    description: "Texto promocional para servicios o productos"
  },
  {
    icon: <FileQuestion className="h-4 w-4" />,
    name: "FAQ",
    prompt: "Crea una lista de 7 preguntas frecuentes con sus respuestas sobre alérgenos, restricciones dietéticas y políticas de seguridad alimentaria para un restaurante.",
    description: "Preguntas y respuestas frecuentes"
  }
];

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
        <Tabs defaultValue="prompt" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prompt">Texto libre</TabsTrigger>
            <TabsTrigger value="templates">Plantillas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prompt" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="ai-prompt">¿Qué contenido deseas generar?</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setPrompt("")}
                  className="h-6 text-xs"
                  disabled={!prompt}
                >
                  Limpiar
                </Button>
              </div>
              <Textarea
                id="ai-prompt"
                placeholder="Ej: Genera un párrafo sobre la importancia de la seguridad alimentaria en restaurantes"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="resize-none"
              />
              
              <div className="space-y-2 pt-1">
                <Label className="text-xs text-muted-foreground">Sugerencias rápidas:</Label>
                <div className="flex flex-wrap gap-1.5">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs" 
                    onClick={() => setPrompt("Genera un párrafo sobre las medidas APPCC en cocinas profesionales.")}
                  >
                    APPCC
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs" 
                    onClick={() => setPrompt("Crea un texto promocional para un restaurante especializado en comida mediterránea fresca y saludable.")}
                  >
                    Promoción
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs" 
                    onClick={() => setPrompt("Escribe una descripción para la sección 'Sobre Nosotros' de un restaurante familiar.")}
                  >
                    Sobre Nosotros
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs" 
                    onClick={() => setPrompt("Genera un texto sobre los alérgenos e información nutricional para clientes.")}
                  >
                    Alérgenos
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-3 pt-3">
            <p className="text-sm text-muted-foreground">Selecciona una plantilla para generar contenido específico:</p>
            <div className="grid gap-2">
              {contentTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto py-2 px-3 justify-start"
                  onClick={() => setPrompt(template.prompt)}
                >
                  <div className="flex items-start gap-2 text-left">
                    <div className="mt-0.5 p-1 bg-primary/10 rounded-md">
                      {template.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{template.name}</p>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

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