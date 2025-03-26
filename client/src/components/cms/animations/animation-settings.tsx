import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Slider
} from "@/components/ui/slider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AnimationConfig } from './animation-config';

// Grupos de animaciones para una mejor organización
const animationGroups = {
  fade: ['fadeIn', 'fadeOut'],
  slide: ['slideIn', 'slideOut'],
  zoom: ['zoomIn', 'zoomOut'],
  attention: ['bounce', 'pulse', 'shake', 'rotate'],
  transform: ['flip', 'scale']
};

// Opciones de duración para el selector
const durationOptions = [
  { value: 'fast', label: 'Rápido (300ms)' },
  { value: 'normal', label: 'Normal (500ms)' },
  { value: 'slow', label: 'Lento (800ms)' },
  { value: 'verySlow', label: 'Muy lento (1200ms)' }
];

// Opciones de retraso para el selector
const delayOptions = [
  { value: 'none', label: 'Sin retardo' },
  { value: 'small', label: 'Pequeño (100ms)' },
  { value: 'medium', label: 'Medio (300ms)' },
  { value: 'large', label: 'Grande (600ms)' }
];

// Direcciones para animaciones con dirección
const directionOptions = [
  { value: 'none', label: 'Ninguna' },
  { value: 'up', label: 'Arriba' },
  { value: 'down', label: 'Abajo' },
  { value: 'left', label: 'Izquierda' },
  { value: 'right', label: 'Derecha' }
];

// Opciones de easing para el selector
const easingOptions = [
  { value: 'linear', label: 'Lineal' },
  { value: 'ease', label: 'Ease' },
  { value: 'easeIn', label: 'Ease In' },
  { value: 'easeOut', label: 'Ease Out' },
  { value: 'easeInOut', label: 'Ease In-Out' },
  { value: 'spring', label: 'Spring' },
  { value: 'bounce', label: 'Bounce' }
];

// Esquema de validación
const animationSchema = z.object({
  effect: z.string().optional(),
  duration: z.union([z.string(), z.number()]).optional(),
  delay: z.union([z.string(), z.number()]).optional(),
  repeat: z.number().min(0).optional(),
  threshold: z.number().min(0).max(1).optional(),
  intensity: z.number().min(0.1).max(5).optional(),
  direction: z.string().optional(),
  easing: z.string().optional(),
  library: z.string().optional(),
  scrollTrigger: z.boolean().optional()
});

interface AnimationSettingsProps {
  value: Partial<AnimationConfig>;
  onChange: (value: Partial<AnimationConfig>) => void;
  libraries?: string[];
  showScrollTrigger?: boolean;
}

/**
 * Componente para configurar animaciones
 * 
 * Este componente proporciona una interfaz de usuario para configurar
 * todas las propiedades de animación disponibles.
 */
export const AnimationSettings: React.FC<AnimationSettingsProps> = ({
  value,
  onChange,
  libraries = ['framer-motion', 'react-spring', 'gsap', 'aos', 'none'],
  showScrollTrigger = true
}) => {
  const form = useForm({
    resolver: zodResolver(animationSchema),
    defaultValues: {
      effect: value.effect || 'none',
      duration: value.duration || 'normal',
      delay: value.delay || 'none',
      repeat: value.repeat || 0,
      threshold: value.threshold || 0.2,
      intensity: value.intensity || 1,
      direction: value.direction || 'none',
      easing: value.easing || 'ease',
      library: 'framer-motion',
      scrollTrigger: value.scrollTrigger || false
    }
  });

  // Actualizar formulario cuando cambian los valores externos
  React.useEffect(() => {
    if (value) {
      form.reset({
        ...form.getValues(),
        ...value
      });
    }
  }, [value]);

  // Gestionar cambios y enviar hacia arriba
  const handleValueChange = (field: keyof AnimationConfig, fieldValue: any) => {
    // Actualizar campo específico
    form.setValue(field, fieldValue);
    
    // Obtener valores actualizados y notificar
    const formValues = form.getValues();
    onChange(formValues);
  };

  // Determinar qué opciones de efectos están disponibles para la biblioteca seleccionada
  const getEffectsForLibrary = (library: string) => {
    // AOS tiene menos efectos
    if (library === 'aos') {
      return {
        fade: ['fadeIn'],
        slide: ['slideIn'],
        zoom: ['zoomIn', 'zoomOut'],
        transform: ['flip']
      };
    }
    
    return animationGroups;
  };

  // Renderizar opciones de efectos agrupadas
  const renderEffectOptions = (effect: string) => {
    const library = form.watch('library');
    const availableGroups = getEffectsForLibrary(library);
    
    return (
      <>
        <option value="none">Ninguno</option>
        <optgroup label="Fade">
          {availableGroups.fade?.map(effect => (
            <option key={effect} value={effect}>
              {effect === 'fadeIn' ? 'Aparecer' : 'Desaparecer'}
            </option>
          ))}
        </optgroup>
        
        <optgroup label="Slide">
          {availableGroups.slide?.map(effect => (
            <option key={effect} value={effect}>
              {effect === 'slideIn' ? 'Deslizar entrada' : 'Deslizar salida'}
            </option>
          ))}
        </optgroup>
        
        <optgroup label="Zoom">
          {availableGroups.zoom?.map(effect => (
            <option key={effect} value={effect}>
              {effect === 'zoomIn' ? 'Zoom entrada' : 'Zoom salida'}
            </option>
          ))}
        </optgroup>
        
        {availableGroups.attention && (
          <optgroup label="Atención">
            {availableGroups.attention.map(effect => (
              <option key={effect} value={effect}>
                {effect === 'bounce' ? 'Rebotar' : 
                 effect === 'pulse' ? 'Pulsar' : 
                 effect === 'shake' ? 'Agitar' : 'Rotar'}
              </option>
            ))}
          </optgroup>
        )}
        
        <optgroup label="Transformación">
          {availableGroups.transform?.map(effect => (
            <option key={effect} value={effect}>
              {effect === 'flip' ? 'Voltear' : 'Escalar'}
            </option>
          ))}
        </optgroup>
      </>
    );
  };

  // Determinar si mostrar opciones de dirección basado en el efecto seleccionado
  const shouldShowDirectionOptions = () => {
    const effect = form.watch('effect');
    return ['slideIn', 'slideOut', 'flip'].includes(effect);
  };

  // Determinar si mostrar opciones de intensidad basado en el efecto seleccionado  
  const shouldShowIntensityOptions = () => {
    const effect = form.watch('effect');
    return ['bounce', 'pulse', 'shake', 'flip', 'rotate', 'scale'].includes(effect);
  };

  // Determinar si mostrar opciones de repetición basado en el efecto seleccionado
  const shouldShowRepeatOptions = () => {
    const effect = form.watch('effect');
    return effect !== 'none';
  };

  return (
    <div className="animation-settings p-4 space-y-4 bg-card rounded-md border">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="advanced">Avanzado</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 pt-4">
          {/* Biblioteca de animación */}
          <div className="space-y-2">
            <FormLabel>Biblioteca</FormLabel>
            <Select
              value={form.watch('library')}
              onValueChange={(value) => handleValueChange('library', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar biblioteca" />
              </SelectTrigger>
              <SelectContent>
                {libraries.map(option => (
                  <SelectItem key={option} value={option}>
                    {option === 'framer-motion' ? 'Framer Motion' :
                     option === 'react-spring' ? 'React Spring' :
                     option === 'gsap' ? 'GSAP' :
                     option === 'aos' ? 'AOS (Scroll)' : 'Ninguna'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Efecto */}
          <div className="space-y-2">
            <FormLabel>Efecto</FormLabel>
            <Select
              value={form.watch('effect')}
              onValueChange={(value) => handleValueChange('effect', value)}
              disabled={form.watch('library') === 'none'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar efecto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguno</SelectItem>
                
                <SelectItem value="fadeIn">Aparecer</SelectItem>
                <SelectItem value="fadeOut">Desaparecer</SelectItem>
                
                <SelectItem value="slideIn">Deslizar entrada</SelectItem>
                <SelectItem value="slideOut">Deslizar salida</SelectItem>
                
                <SelectItem value="zoomIn">Zoom entrada</SelectItem>
                <SelectItem value="zoomOut">Zoom salida</SelectItem>
                
                <SelectItem value="bounce">Rebotar</SelectItem>
                <SelectItem value="pulse">Pulsar</SelectItem>
                <SelectItem value="shake">Agitar</SelectItem>
                <SelectItem value="rotate">Rotar</SelectItem>
                
                <SelectItem value="flip">Voltear</SelectItem>
                <SelectItem value="scale">Escalar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Dirección (solo para efectos que la usan) */}
          {shouldShowDirectionOptions() && (
            <div className="space-y-2">
              <FormLabel>Dirección</FormLabel>
              <Select
                value={form.watch('direction')}
                onValueChange={(value) => handleValueChange('direction', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar dirección" />
                </SelectTrigger>
                <SelectContent>
                  {directionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Duración */}
          <div className="space-y-2">
            <FormLabel>Duración</FormLabel>
            <Select
              value={String(form.watch('duration'))}
              onValueChange={(value) => handleValueChange('duration', value)}
              disabled={form.watch('effect') === 'none'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar duración" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Activar al hacer scroll */}
          {showScrollTrigger && (
            <div className="flex items-center justify-between py-2">
              <FormLabel className="cursor-pointer">Activar al hacer scroll</FormLabel>
              <Switch
                checked={form.watch('scrollTrigger')}
                onCheckedChange={(checked) => handleValueChange('scrollTrigger', checked)}
                disabled={form.watch('effect') === 'none'}
              />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4 pt-4">
          {/* Retraso */}
          <div className="space-y-2">
            <FormLabel>Retraso</FormLabel>
            <Select
              value={String(form.watch('delay'))}
              onValueChange={(value) => handleValueChange('delay', value)}
              disabled={form.watch('effect') === 'none'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar retraso" />
              </SelectTrigger>
              <SelectContent>
                {delayOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Repeticiones */}
          {shouldShowRepeatOptions() && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <FormLabel>Repeticiones ({form.watch('repeat')})</FormLabel>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleValueChange('repeat', -1)}
                  className="h-6 text-xs"
                  disabled={form.watch('effect') === 'none'}
                >
                  Infinito
                </Button>
              </div>
              <Slider
                value={[form.watch('repeat')]}
                min={0}
                max={10}
                step={1}
                onValueChange={(values) => handleValueChange('repeat', values[0])}
                disabled={form.watch('effect') === 'none'}
              />
            </div>
          )}
          
          {/* Intensidad (solo para ciertos efectos) */}
          {shouldShowIntensityOptions() && (
            <div className="space-y-2">
              <FormLabel>Intensidad ({form.watch('intensity')}x)</FormLabel>
              <Slider
                value={[form.watch('intensity')]}
                min={0.1}
                max={5}
                step={0.1}
                onValueChange={(values) => handleValueChange('intensity', values[0])}
                disabled={form.watch('effect') === 'none'}
              />
            </div>
          )}
          
          {/* Umbral de scroll (cuando scrollTrigger está activo) */}
          {form.watch('scrollTrigger') && (
            <div className="space-y-2">
              <FormLabel>Umbral de visibilidad ({form.watch('threshold')})</FormLabel>
              <Slider
                value={[form.watch('threshold')]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={(values) => handleValueChange('threshold', values[0])}
                disabled={form.watch('effect') === 'none'}
              />
              <FormDescription className="text-xs">
                Porcentaje del elemento que debe estar visible para activar la animación
              </FormDescription>
            </div>
          )}
          
          {/* Easing */}
          <div className="space-y-2">
            <FormLabel>Aceleración</FormLabel>
            <Select
              value={form.watch('easing')}
              onValueChange={(value) => handleValueChange('easing', value)}
              disabled={form.watch('effect') === 'none'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar aceleración" />
              </SelectTrigger>
              <SelectContent>
                {easingOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnimationSettings;