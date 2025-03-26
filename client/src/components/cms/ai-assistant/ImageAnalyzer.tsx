import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { ImageIcon, Wand2, Upload, X, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { generateImageDescription } from '@/lib/openai-service';
import { toast } from '@/hooks/use-toast';

interface ImageAnalysisResult {
  description: string;
  altText: string;
  tags: string[];
}

interface ImageAnalyzerProps {
  onApplyDescription?: (description: string) => void;
  onApplyAltText?: (altText: string) => void;
  onApplyTags?: (tags: string[]) => void;
}

export function ImageAnalyzer({
  onApplyDescription,
  onApplyAltText,
  onApplyTags,
}: ImageAnalyzerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [context, setContext] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Resetear análisis previo
      setAnalysisResult(null);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setAnalysisResult(null);
  };

  const handleAnalyzeImage = async () => {
    if (!imagePreview) return;
    
    try {
      setIsAnalyzing(true);
      
      // Si estamos en un entorno de desarrollo sin acceso a la API, usaríamos datos simulados
      // en un entorno de producción, se conectaría a la API real
      const result = await generateImageDescription(imagePreview, context);
      
      setAnalysisResult(result);
      
      toast({
        title: "Análisis completado",
        description: "La imagen ha sido analizada correctamente",
      });
    } catch (error) {
      console.error('Error al analizar imagen:', error);
      
      toast({
        title: "Error",
        description: "No se pudo analizar la imagen. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <ImageIcon className="mr-2 h-5 w-5" />
          Análisis de Imágenes
        </CardTitle>
        <CardDescription>
          Utiliza IA para analizar imágenes y generar descripciones, textos alternativos y etiquetas
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!imagePreview ? (
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <div className="flex flex-col items-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                Arrastra y suelta una imagen o haz clic para seleccionar
              </p>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                variant="secondary"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar Imagen
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-auto rounded-md"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="context">Contexto (opcional)</Label>
              <Input
                id="context"
                placeholder="Ej: página de productos, blog de recetas, etc."
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Proporciona contexto para generar descripciones más relevantes
              </p>
            </div>
            
            <Button
              onClick={handleAnalyzeImage}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Analizando...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Analizar Imagen
                </>
              )}
            </Button>
          </div>
        )}
        
        {analysisResult && (
          <div className="space-y-4 mt-6 border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="description">Descripción</Label>
                {onApplyDescription && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onApplyDescription(analysisResult.description)}
                  >
                    Aplicar
                  </Button>
                )}
              </div>
              <Textarea
                id="description"
                value={analysisResult.description}
                readOnly
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="alt-text">Texto Alternativo</Label>
                {onApplyAltText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onApplyAltText(analysisResult.altText)}
                  >
                    Aplicar
                  </Button>
                )}
              </div>
              <Input
                id="alt-text"
                value={analysisResult.altText}
                readOnly
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  Etiquetas
                </Label>
                {onApplyTags && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onApplyTags(analysisResult.tags)}
                  >
                    Aplicar Todas
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {analysisResult.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}