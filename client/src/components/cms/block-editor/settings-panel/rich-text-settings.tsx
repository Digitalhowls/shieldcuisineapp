import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Type,
  Sliders
} from 'lucide-react';
import { RichTextContent } from '../types';
import { Separator } from '@/components/ui/separator';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface RichTextSettingsProps {
  content: RichTextContent;
  onUpdate: (updates: Partial<RichTextContent>) => void;
}

/**
 * Componente de configuración para bloques de texto enriquecido
 */
const RichTextSettings: React.FC<RichTextSettingsProps> = ({ 
  content, 
  onUpdate 
}) => {
  const handleAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
    onUpdate({ textAlign: alignment });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Alineación de texto</Label>
        </div>
        
        <RadioGroup 
          value={content.textAlign || 'left'} 
          onValueChange={(value) => handleAlignmentChange(value as 'left' | 'center' | 'right')}
          className="flex gap-2"
        >
          <div className="flex items-center space-x-2 border rounded-md px-3 py-2 cursor-pointer hover:bg-muted/50">
            <RadioGroupItem value="left" id="alignment-left" className="sr-only" />
            <Label htmlFor="alignment-left" className="flex items-center gap-2 cursor-pointer font-normal">
              <AlignLeft className="h-4 w-4" />
              <span>Izquierda</span>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md px-3 py-2 cursor-pointer hover:bg-muted/50">
            <RadioGroupItem value="center" id="alignment-center" className="sr-only" />
            <Label htmlFor="alignment-center" className="flex items-center gap-2 cursor-pointer font-normal">
              <AlignCenter className="h-4 w-4" />
              <span>Centrado</span>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md px-3 py-2 cursor-pointer hover:bg-muted/50">
            <RadioGroupItem value="right" id="alignment-right" className="sr-only" />
            <Label htmlFor="alignment-right" className="flex items-center gap-2 cursor-pointer font-normal">
              <AlignRight className="h-4 w-4" />
              <span>Derecha</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="typography">
          <AccordionTrigger className="py-2">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <span>Tipografía</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="py-2 space-y-3">
              <p className="text-sm text-muted-foreground">
                Opciones de tipografía disponibles próximamente
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="spacing">
          <AccordionTrigger className="py-2">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              <span>Espaciado</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="py-2 space-y-3">
              <p className="text-sm text-muted-foreground">
                Opciones de espaciado disponibles próximamente
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default RichTextSettings;