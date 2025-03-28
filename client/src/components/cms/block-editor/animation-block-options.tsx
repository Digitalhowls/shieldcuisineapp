import React from 'react';
import { AnimationConfig } from '../animations/animation-config';
import AnimationSettings from '../animations/animation-settings';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

/**
 * Propiedades para el componente AnimationBlockOptions
 */
interface AnimationBlockOptionsProps {
  /** ID único del bloque que será animado */
  blockId: string;
  /** Configuración actual de animación del bloque (parcial) */
  animation?: Partial<AnimationConfig>;
  /** Función llamada cuando se actualiza la configuración de animación */
  onUpdate: (animation: Partial<AnimationConfig>) => void;
  /** Función llamada cuando se elimina la animación */
  onRemove: () => void;
}

/**
 * Panel de opciones de animación para bloques
 * 
 * Este componente permite configurar las animaciones de un bloque
 * en el editor CMS, incluyendo tipo, duración, retraso y otras
 * propiedades de animación.
 * 
 * @module AnimationBlockOptions
 * @category CMS
 * @subcategory BlockEditor
 */
export const AnimationBlockOptions: React.FC<AnimationBlockOptionsProps> = ({
  blockId,
  animation = {},
  onUpdate,
  onRemove
}) => {
  // Estado local para la configuración de animación
  const [config, setConfig] = React.useState<Partial<AnimationConfig>>(
    animation || {
      effect: 'fadeIn',
      duration: 'normal',
      delay: 'none',
      library: 'framer-motion'
    }
  );
  
  // Actualizar configuración cuando cambian las props
  React.useEffect(() => {
    if (animation) {
      setConfig(animation);
    }
  }, [animation]);
  
  // Manejar cambios en la configuración
  const handleConfigChange = (newConfig: Partial<AnimationConfig>) => {
    setConfig(newConfig);
    onUpdate(newConfig);
  };
  
  // Remover animación
  const handleRemoveAnimation = () => {
    onRemove();
  };
  
  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <Accordion type="single" collapsible defaultValue="animation-options">
          <AccordionItem value="animation-options">
            <AccordionTrigger className="py-2 text-sm font-medium flex items-center">
              <Wand2 className="h-4 w-4 mr-2" />
              Opciones de animación
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <div className="space-y-4">
                <AnimationSettings 
                  value={config}
                  onChange={handleConfigChange}
                />
                
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleRemoveAnimation}
                  className="w-full"
                >
                  Eliminar animación
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

// Mantiene la exportación por defecto para compatibilidad con código existente
export default AnimationBlockOptions;