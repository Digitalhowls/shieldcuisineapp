import React from 'react';
import { AnimationOptions } from '../types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface AnimationSettingsProps {
  animation?: AnimationOptions;
  onChange: (animation: AnimationOptions) => void;
}

/**
 * Componente para configurar las animaciones de los bloques
 */
const AnimationSettings: React.FC<AnimationSettingsProps> = ({ 
  animation = {}, 
  onChange 
}) => {
  const handleChange = (field: keyof AnimationOptions, value: any) => {
    onChange({
      ...animation,
      [field]: value
    });
  };

  const effects = [
    { value: 'fade', label: 'Desvanecer' },
    { value: 'slide-up', label: 'Deslizar hacia arriba' },
    { value: 'slide-down', label: 'Deslizar hacia abajo' },
    { value: 'slide-left', label: 'Deslizar desde izquierda' },
    { value: 'slide-right', label: 'Deslizar desde derecha' },
    { value: 'zoom-in', label: 'Aumentar' },
    { value: 'zoom-out', label: 'Disminuir' },
    { value: 'flip', label: 'Voltear' },
    { value: 'bounce', label: 'Rebotar' },
    { value: 'rotate', label: 'Rotar' }
  ];

  const libraries = [
    { value: 'aos', label: 'AOS' },
    { value: 'gsap', label: 'GSAP' },
    { value: 'framer-motion', label: 'Framer Motion' },
    { value: 'react-spring', label: 'React Spring' }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="animation-effect">Efecto</Label>
        <Select 
          value={animation.effect || 'fade'} 
          onValueChange={value => handleChange('effect', value)}
        >
          <SelectTrigger id="animation-effect">
            <SelectValue placeholder="Seleccionar efecto" />
          </SelectTrigger>
          <SelectContent>
            {effects.map(effect => (
              <SelectItem key={effect.value} value={effect.value}>
                {effect.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="animation-library">Biblioteca</Label>
        <Select 
          value={animation.library || 'aos'} 
          onValueChange={value => handleChange('library', value)}
        >
          <SelectTrigger id="animation-library">
            <SelectValue placeholder="Seleccionar biblioteca" />
          </SelectTrigger>
          <SelectContent>
            {libraries.map(library => (
              <SelectItem key={library.value} value={library.value}>
                {library.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Duración (ms)</Label>
        <div className="flex items-center gap-3">
          <Slider 
            value={[typeof animation.duration === 'number' ? animation.duration : 400]}
            min={100}
            max={2000}
            step={50}
            onValueChange={([value]) => handleChange('duration', value)}
            className="flex-1"
          />
          <Input
            type="number"
            min={0}
            className="w-20"
            value={animation.duration?.toString() || '400'}
            onChange={e => handleChange('duration', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Retraso (ms)</Label>
        <div className="flex items-center gap-3">
          <Slider 
            value={[typeof animation.delay === 'number' ? animation.delay : 0]}
            min={0}
            max={1000}
            step={50}
            onValueChange={([value]) => handleChange('delay', value)}
            className="flex-1"
          />
          <Input
            type="number"
            min={0}
            className="w-20"
            value={animation.delay?.toString() || '0'}
            onChange={e => handleChange('delay', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Intensidad</Label>
        <div className="flex items-center gap-3">
          <Slider 
            value={[animation.intensity || 1]}
            min={0.1}
            max={2}
            step={0.1}
            onValueChange={([value]) => handleChange('intensity', value)}
            className="flex-1"
          />
          <Input
            type="number"
            min={0.1}
            max={2}
            step={0.1}
            className="w-20"
            value={animation.intensity?.toString() || '1'}
            onChange={e => handleChange('intensity', parseFloat(e.target.value) || 1)}
          />
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="scroll-trigger">Activar al hacer scroll</Label>
          <p className="text-sm text-muted-foreground">
            La animación se activa cuando el elemento es visible
          </p>
        </div>
        <Switch 
          id="scroll-trigger"
          checked={animation.scrollTrigger ?? true}
          onCheckedChange={value => handleChange('scrollTrigger', value)}
        />
      </div>

      {animation.scrollTrigger && (
        <div className="space-y-2">
          <Label>Umbral de visibilidad</Label>
          <div className="flex items-center gap-3">
            <Slider 
              value={[animation.threshold || 0.2]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([value]) => handleChange('threshold', value)}
              className="flex-1"
            />
            <Input
              type="number"
              min={0}
              max={1}
              step={0.05}
              className="w-20"
              value={animation.threshold?.toString() || '0.2'}
              onChange={e => handleChange('threshold', parseFloat(e.target.value) || 0.2)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            0 = inicio de la pantalla, 1 = final de la pantalla
          </p>
        </div>
      )}
    </div>
  );
};

export default AnimationSettings;