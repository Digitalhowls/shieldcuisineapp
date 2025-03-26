import React from 'react';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from '@/components/ui/slider';

import { 
  AnimationConfig, 
  animationGroups, 
  durationOptions, 
  delayOptions 
} from './animation-utils';

// Tipo para la biblioteca de animación
type AnimationLibrary = 'framer-motion' | 'react-spring' | 'gsap' | 'aos' | 'none';

interface AnimationSettingsProps {
  config: AnimationConfig;
  library: AnimationLibrary;
  onChange: (config: AnimationConfig, library: AnimationLibrary) => void;
}

/**
 * Componente de configuración de animaciones para el CMS
 * 
 * Este componente proporciona una interfaz para configurar animaciones
 * que se aplicarán a los bloques en el editor.
 * 
 * @example
 * <AnimationSettings
 *   config={animationConfig}
 *   library={animationLibrary}
 *   onChange={(newConfig, newLibrary) => {
 *     setAnimationConfig(newConfig);
 *     setAnimationLibrary(newLibrary);
 *   }}
 * />
 */
export const AnimationSettings: React.FC<AnimationSettingsProps> = ({
  config,
  library,
  onChange
}) => {
  // Manejar cambios en la configuración
  const handleConfigChange = (key: keyof AnimationConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    onChange(newConfig, library);
  };
  
  // Manejar cambios en la biblioteca
  const handleLibraryChange = (value: AnimationLibrary) => {
    onChange(config, value);
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Biblioteca de animación</Label>
        <Select 
          value={library} 
          onValueChange={(value) => handleLibraryChange(value as AnimationLibrary)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar biblioteca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin animación</SelectItem>
            <SelectItem value="framer-motion">Framer Motion</SelectItem>
            <SelectItem value="react-spring">React Spring</SelectItem>
            <SelectItem value="gsap">GSAP</SelectItem>
            <SelectItem value="aos">AOS (Animate On Scroll)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {library !== 'none' && (
        <>
          <Accordion type="single" collapsible defaultValue="effects">
            <AccordionItem value="effects">
              <AccordionTrigger>Efectos de animación</AccordionTrigger>
              <AccordionContent>
                <Tabs defaultValue="entrada">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="entrada">Entrada</TabsTrigger>
                    <TabsTrigger value="atencion">Atención</TabsTrigger>
                    <TabsTrigger value="hover">Hover</TabsTrigger>
                    <TabsTrigger value="scroll">Scroll</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="entrada">
                    <div className="grid grid-cols-2 gap-2">
                      {animationGroups.entrada.map((effect) => (
                        <div 
                          key={effect.value}
                          className={`border rounded p-2 cursor-pointer ${
                            config.effect === effect.value ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                          onClick={() => handleConfigChange('effect', effect.value)}
                        >
                          <div className="text-sm font-medium">{effect.label}</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="atencion">
                    <div className="grid grid-cols-2 gap-2">
                      {animationGroups.atencion.map((effect) => (
                        <div 
                          key={effect.value}
                          className={`border rounded p-2 cursor-pointer ${
                            config.effect === effect.value ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                          onClick={() => handleConfigChange('effect', effect.value)}
                        >
                          <div className="text-sm font-medium">{effect.label}</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="hover">
                    <div className="grid grid-cols-2 gap-2">
                      {animationGroups.hover.map((effect) => (
                        <div 
                          key={effect.value}
                          className={`border rounded p-2 cursor-pointer ${
                            config.effect === effect.value ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                          onClick={() => handleConfigChange('effect', effect.value)}
                        >
                          <div className="text-sm font-medium">{effect.label}</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="scroll">
                    <div className="grid grid-cols-2 gap-2">
                      {animationGroups.scroll.map((effect) => (
                        <div 
                          key={effect.value}
                          className={`border rounded p-2 cursor-pointer ${
                            config.effect === effect.value ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                          onClick={() => handleConfigChange('effect', effect.value)}
                        >
                          <div className="text-sm font-medium">{effect.label}</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="timing">
              <AccordionTrigger>Tiempo y configuración</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Duración</Label>
                    <Select 
                      value={config.duration || 'normal'} 
                      onValueChange={(value) => handleConfigChange('duration', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar duración" />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Retraso</Label>
                    <Select 
                      value={config.delay || 'none'} 
                      onValueChange={(value) => handleConfigChange('delay', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar retraso" />
                      </SelectTrigger>
                      <SelectContent>
                        {delayOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {config.effect?.startsWith('scroll') && (
                    <div className="space-y-2">
                      <Label>Umbral de activación (% visible)</Label>
                      <div className="pt-4 pb-2 px-1">
                        <Slider
                          value={[config.threshold || 0.2]}
                          min={0}
                          max={1}
                          step={0.05}
                          onValueChange={(value) => handleConfigChange('threshold', value[0])}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {Math.round((config.threshold || 0.2) * 100)}% del elemento debe ser visible para activar la animación.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox
                      id="repeat"
                      checked={config.repeat || false}
                      onCheckedChange={(checked) => handleConfigChange('repeat', Boolean(checked))}
                    />
                    <Label htmlFor="repeat" className="cursor-pointer">
                      Repetir animación
                    </Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="infinite"
                      checked={config.infinite || false}
                      onCheckedChange={(checked) => handleConfigChange('infinite', Boolean(checked))}
                    />
                    <Label htmlFor="infinite" className="cursor-pointer">
                      Repetir infinitamente
                    </Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="p-4 bg-muted/40 rounded-md mt-4">
            <h3 className="text-sm font-medium mb-2">Previsualización</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Selecciona un efecto y configura sus propiedades para ver una previsualización.
            </p>
            
            {/* Área de previsualización - Se podría implementar con el componente Animation */}
            <div className="border rounded-md p-6 bg-background text-center">
              Animación: {config.effect || 'Ninguna seleccionada'}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnimationSettings;