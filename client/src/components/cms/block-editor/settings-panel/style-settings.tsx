import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { BlockType } from '../types';

interface StyleSettingsProps {
  blockType: BlockType;
  style?: StyleOptions;
  onChange: (style: StyleOptions) => void;
}

export interface StyleOptions {
  // Espaciado
  padding?: {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
  };
  margin?: {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
  };
  
  // Dimensiones
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  
  // Bordes
  border?: {
    style?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
    width?: string | number;
    color?: string;
    radius?: string | number;
  };
  
  // Fondo
  background?: {
    color?: string;
    image?: string;
    position?: string;
    size?: string;
    repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
    attachment?: 'scroll' | 'fixed' | 'local';
  };
  
  // Sombras
  boxShadow?: {
    x?: string | number;
    y?: string | number;
    blur?: string | number;
    spread?: string | number;
    color?: string;
    inset?: boolean;
  };
  
  // Tipografía (para bloques basados en texto)
  typography?: {
    fontFamily?: string;
    fontSize?: string | number;
    fontWeight?: string | number;
    lineHeight?: string | number;
    letterSpacing?: string | number;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    color?: string;
    textDecoration?: 'none' | 'underline' | 'line-through';
    textShadow?: string;
  };
  
  // Efectos de transición
  transition?: {
    property?: string;
    duration?: string | number;
    timingFunction?: string;
    delay?: string | number;
  };
  
  // Otras opciones
  opacity?: number;
  zIndex?: number;
  filter?: string;
  backdropFilter?: string;
  pointerEvents?: 'auto' | 'none';
  cursor?: string;
}

/**
 * Componente de configuración de estilos visuales
 * 
 * Permite al usuario personalizar los estilos del bloque seleccionado
 * incluyendo espaciado, bordes, fondo, tipografía, etc.
 */
const StyleSettings: React.FC<StyleSettingsProps> = ({
  blockType,
  style = {},
  onChange
}) => {
  // Función auxiliar para actualizar propiedades anidadas
  const updateNestedProperty = (category: keyof StyleOptions, property: string, value: any) => {
    onChange({
      ...style,
      [category]: {
        ...(style[category] as any || {}),
        [property]: value
      }
    });
  };

  // Actualización simple de propiedad de nivel superior
  const updateProperty = (property: keyof StyleOptions, value: any) => {
    onChange({
      ...style,
      [property]: value
    });
  };

  return (
    <div className="space-y-6">
      <Accordion type="multiple" className="w-full">
        {/* Espaciado */}
        <AccordionItem value="spacing">
          <AccordionTrigger className="text-sm font-medium py-2">
            Espaciado
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs">Relleno (padding)</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Superior</Label>
                  <Input
                    type="text"
                    value={(style.padding?.top || '0') as string}
                    onChange={(e) => updateNestedProperty('padding', 'top', e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Derecho</Label>
                  <Input
                    type="text"
                    value={(style.padding?.right || '0') as string}
                    onChange={(e) => updateNestedProperty('padding', 'right', e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Inferior</Label>
                  <Input
                    type="text"
                    value={(style.padding?.bottom || '0') as string}
                    onChange={(e) => updateNestedProperty('padding', 'bottom', e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Izquierdo</Label>
                  <Input
                    type="text"
                    value={(style.padding?.left || '0') as string}
                    onChange={(e) => updateNestedProperty('padding', 'left', e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">Margen</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Superior</Label>
                  <Input
                    type="text"
                    value={(style.margin?.top || '0') as string}
                    onChange={(e) => updateNestedProperty('margin', 'top', e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Derecho</Label>
                  <Input
                    type="text"
                    value={(style.margin?.right || '0') as string}
                    onChange={(e) => updateNestedProperty('margin', 'right', e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Inferior</Label>
                  <Input
                    type="text"
                    value={(style.margin?.bottom || '0') as string}
                    onChange={(e) => updateNestedProperty('margin', 'bottom', e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Izquierdo</Label>
                  <Input
                    type="text"
                    value={(style.margin?.left || '0') as string}
                    onChange={(e) => updateNestedProperty('margin', 'left', e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Dimensiones */}
        <AccordionItem value="dimensions">
          <AccordionTrigger className="text-sm font-medium py-2">
            Dimensiones
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Ancho</Label>
                <Input
                  type="text"
                  value={style.width || 'auto'}
                  onChange={(e) => updateProperty('width', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Alto</Label>
                <Input
                  type="text"
                  value={style.height || 'auto'}
                  onChange={(e) => updateProperty('height', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Ancho máximo</Label>
                <Input
                  type="text"
                  value={style.maxWidth || 'none'}
                  onChange={(e) => updateProperty('maxWidth', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Alto máximo</Label>
                <Input
                  type="text"
                  value={style.maxHeight || 'none'}
                  onChange={(e) => updateProperty('maxHeight', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Bordes */}
        <AccordionItem value="borders">
          <AccordionTrigger className="text-sm font-medium py-2">
            Bordes
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs">Estilo de borde</Label>
              <Select
                value={style.border?.style || 'none'}
                onValueChange={(value) => updateNestedProperty('border', 'style', value)}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Seleccionar estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguno</SelectItem>
                  <SelectItem value="solid">Sólido</SelectItem>
                  <SelectItem value="dashed">Discontinuo</SelectItem>
                  <SelectItem value="dotted">Punteado</SelectItem>
                  <SelectItem value="double">Doble</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {style.border?.style && style.border.style !== 'none' && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Ancho de borde</Label>
                  <Input
                    type="text"
                    value={(style.border?.width || '1px') as string}
                    onChange={(e) => updateNestedProperty('border', 'width', e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Color de borde</Label>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="h-7 w-7 p-0"
                          style={{ backgroundColor: style.border?.color || '#000000' }}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="grid grid-cols-5 gap-1">
                          {['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
                            '#FFFF00', '#FF00FF', '#00FFFF', '#C0C0C0', '#808080'].map(color => (
                            <Button
                              key={color}
                              variant="outline"
                              className="h-6 w-6 p-0"
                              style={{ backgroundColor: color }}
                              onClick={() => updateNestedProperty('border', 'color', color)}
                            />
                          ))}
                        </div>
                        <Input
                          type="text"
                          value={style.border?.color || '#000000'}
                          onChange={(e) => updateNestedProperty('border', 'color', e.target.value)}
                          className="mt-2 h-7 text-xs"
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="text"
                      value={style.border?.color || '#000000'}
                      onChange={(e) => updateNestedProperty('border', 'color', e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Radio de borde</Label>
                  <Input
                    type="text"
                    value={(style.border?.radius || '0') as string}
                    onChange={(e) => updateNestedProperty('border', 'radius', e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
              </>
            )}
          </AccordionContent>
        </AccordionItem>
        
        {/* Fondo */}
        <AccordionItem value="background">
          <AccordionTrigger className="text-sm font-medium py-2">
            Fondo
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs">Color de fondo</Label>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-7 w-7 p-0"
                      style={{ backgroundColor: style.background?.color || 'transparent' }}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="grid grid-cols-5 gap-1">
                      {['transparent', '#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', 
                        '#CED4DA', '#ADB5BD', '#6C757D', '#495057', '#343A40', 
                        '#212529', '#F8D7DA', '#D1E7DD', '#FFF3CD', '#CFE2FF'].map(color => (
                        <Button
                          key={color}
                          variant="outline"
                          className="h-6 w-6 p-0"
                          style={{ backgroundColor: color }}
                          onClick={() => updateNestedProperty('background', 'color', color)}
                        />
                      ))}
                    </div>
                    <Input
                      type="text"
                      value={style.background?.color || 'transparent'}
                      onChange={(e) => updateNestedProperty('background', 'color', e.target.value)}
                      className="mt-2 h-7 text-xs"
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="text"
                  value={style.background?.color || 'transparent'}
                  onChange={(e) => updateNestedProperty('background', 'color', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Imagen de fondo</Label>
              </div>
              <Input
                type="text"
                value={style.background?.image || ''}
                onChange={(e) => updateNestedProperty('background', 'image', e.target.value)}
                className="h-7 text-xs"
                placeholder="URL de la imagen"
              />
            </div>
            
            {style.background?.image && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Tamaño de fondo</Label>
                  <Select
                    value={style.background?.size || 'cover'}
                    onValueChange={(value) => updateNestedProperty('background', 'size', value)}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Seleccionar tamaño" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">Cubrir</SelectItem>
                      <SelectItem value="contain">Contener</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="100%">100%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Repetición de fondo</Label>
                  <Select
                    value={style.background?.repeat || 'no-repeat'}
                    onValueChange={(value) => updateNestedProperty('background', 'repeat', value as any)}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Seleccionar repetición" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-repeat">Sin repetición</SelectItem>
                      <SelectItem value="repeat">Repetir</SelectItem>
                      <SelectItem value="repeat-x">Repetir horizontalmente</SelectItem>
                      <SelectItem value="repeat-y">Repetir verticalmente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </AccordionContent>
        </AccordionItem>
        
        {/* Tipografía (solo para bloques basados en texto) */}
        {['rich-text', 'heading', 'paragraph', 'quote', 'button'].includes(blockType) && (
          <AccordionItem value="typography">
            <AccordionTrigger className="text-sm font-medium py-2">
              Tipografía
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-xs">Familia de fuente</Label>
                <Select
                  value={style.typography?.fontFamily || 'inherit'}
                  onValueChange={(value) => updateNestedProperty('typography', 'fontFamily', value)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Seleccionar fuente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">Heredada</SelectItem>
                    <SelectItem value="'Inter', sans-serif">Inter</SelectItem>
                    <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                    <SelectItem value="'Montserrat', sans-serif">Montserrat</SelectItem>
                    <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                    <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                    <SelectItem value="'Lato', sans-serif">Lato</SelectItem>
                    <SelectItem value="'Playfair Display', serif">Playfair Display</SelectItem>
                    <SelectItem value="'Merriweather', serif">Merriweather</SelectItem>
                    <SelectItem value="monospace">Monoespaciada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Tamaño de fuente</Label>
                <Input
                  type="text"
                  value={(style.typography?.fontSize || 'inherit') as string}
                  onChange={(e) => updateNestedProperty('typography', 'fontSize', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Peso de fuente</Label>
                <Select
                  value={(style.typography?.fontWeight || 'normal') as string}
                  onValueChange={(value) => updateNestedProperty('typography', 'fontWeight', value)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Seleccionar peso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="bold">Negrita</SelectItem>
                    <SelectItem value="100">Muy ligero (100)</SelectItem>
                    <SelectItem value="200">Extra ligero (200)</SelectItem>
                    <SelectItem value="300">Ligero (300)</SelectItem>
                    <SelectItem value="400">Regular (400)</SelectItem>
                    <SelectItem value="500">Medio (500)</SelectItem>
                    <SelectItem value="600">Semi-negrita (600)</SelectItem>
                    <SelectItem value="700">Negrita (700)</SelectItem>
                    <SelectItem value="800">Extra-negrita (800)</SelectItem>
                    <SelectItem value="900">Negra (900)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Color de texto</Label>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="h-7 w-7 p-0"
                        style={{ backgroundColor: style.typography?.color || 'inherit' }}
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="grid grid-cols-5 gap-1">
                        {['inherit', '#000000', '#FFFFFF', '#FF0000', '#00FF00', 
                          '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#C0C0C0'].map(color => (
                          <Button
                            key={color}
                            variant="outline"
                            className="h-6 w-6 p-0"
                            style={{ backgroundColor: color }}
                            onClick={() => updateNestedProperty('typography', 'color', color)}
                          />
                        ))}
                      </div>
                      <Input
                        type="text"
                        value={style.typography?.color || 'inherit'}
                        onChange={(e) => updateNestedProperty('typography', 'color', e.target.value)}
                        className="mt-2 h-7 text-xs"
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="text"
                    value={style.typography?.color || 'inherit'}
                    onChange={(e) => updateNestedProperty('typography', 'color', e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Transformación de texto</Label>
                <Select
                  value={style.typography?.textTransform || 'none'}
                  onValueChange={(value) => updateNestedProperty('typography', 'textTransform', value as any)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Seleccionar transformación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna</SelectItem>
                    <SelectItem value="uppercase">MAYÚSCULAS</SelectItem>
                    <SelectItem value="lowercase">minúsculas</SelectItem>
                    <SelectItem value="capitalize">Cada Palabra En Mayúscula</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Decoración de texto</Label>
                <Select
                  value={style.typography?.textDecoration || 'none'}
                  onValueChange={(value) => updateNestedProperty('typography', 'textDecoration', value as any)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Seleccionar decoración" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna</SelectItem>
                    <SelectItem value="underline">Subrayado</SelectItem>
                    <SelectItem value="line-through">Tachado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
        
        {/* Efectos */}
        <AccordionItem value="effects">
          <AccordionTrigger className="text-sm font-medium py-2">
            Efectos
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Opacidad</Label>
                <span className="text-xs text-muted-foreground">{style.opacity !== undefined ? style.opacity : 1}</span>
              </div>
              <Slider
                value={[style.opacity !== undefined ? style.opacity * 100 : 100]}
                min={0}
                max={100}
                step={1}
                onValueChange={(values) => updateProperty('opacity', values[0] / 100)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">Sombra</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Horizontal</Label>
                  <Input
                    type="text"
                    value={(style.boxShadow?.x || '0') as string}
                    onChange={(e) => updateNestedProperty('boxShadow', 'x', e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Vertical</Label>
                  <Input
                    type="text"
                    value={(style.boxShadow?.y || '0') as string}
                    onChange={(e) => updateNestedProperty('boxShadow', 'y', e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Desenfoque</Label>
                  <Input
                    type="text"
                    value={(style.boxShadow?.blur || '0') as string}
                    onChange={(e) => updateNestedProperty('boxShadow', 'blur', e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Expansión</Label>
                  <Input
                    type="text"
                    value={(style.boxShadow?.spread || '0') as string}
                    onChange={(e) => updateNestedProperty('boxShadow', 'spread', e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1 mt-2">
                <Label className="text-xs text-muted-foreground">Color</Label>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="h-7 w-7 p-0"
                        style={{ backgroundColor: style.boxShadow?.color || 'rgba(0,0,0,0.1)' }}
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="grid grid-cols-5 gap-1">
                        {['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.5)', '#000000', '#333333'].map(color => (
                          <Button
                            key={color}
                            variant="outline"
                            className="h-6 w-6 p-0"
                            style={{ backgroundColor: color }}
                            onClick={() => updateNestedProperty('boxShadow', 'color', color)}
                          />
                        ))}
                      </div>
                      <Input
                        type="text"
                        value={style.boxShadow?.color || 'rgba(0,0,0,0.1)'}
                        onChange={(e) => updateNestedProperty('boxShadow', 'color', e.target.value)}
                        className="mt-2 h-7 text-xs"
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="text"
                    value={style.boxShadow?.color || 'rgba(0,0,0,0.1)'}
                    onChange={(e) => updateNestedProperty('boxShadow', 'color', e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  checked={!!style.boxShadow?.inset}
                  onCheckedChange={(checked) => updateNestedProperty('boxShadow', 'inset', checked)}
                  id="inset-shadow"
                />
                <Label htmlFor="inset-shadow" className="text-xs">Sombra interna</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {/* Vista previa */}
      <div className="border rounded-md p-3 mt-4">
        <div className="text-sm font-medium mb-2">Vista previa</div>
        <div 
          className="w-full h-24 flex items-center justify-center border rounded"
          style={{
            // Aplicamos los estilos configurados a la vista previa
            width: style.width,
            height: style.height,
            maxWidth: style.maxWidth,
            maxHeight: style.maxHeight,
            padding: style.padding ? `${style.padding.top || 0} ${style.padding.right || 0} ${style.padding.bottom || 0} ${style.padding.left || 0}` : undefined,
            margin: style.margin ? `${style.margin.top || 0} ${style.margin.right || 0} ${style.margin.bottom || 0} ${style.margin.left || 0}` : undefined,
            border: style.border ? `${style.border.width || '1px'} ${style.border.style || 'solid'} ${style.border.color || '#000'}` : undefined,
            borderRadius: style.border?.radius,
            backgroundColor: style.background?.color,
            backgroundImage: style.background?.image ? `url(${style.background.image})` : undefined,
            backgroundSize: style.background?.size,
            backgroundRepeat: style.background?.repeat,
            fontFamily: style.typography?.fontFamily,
            fontSize: style.typography?.fontSize,
            fontWeight: style.typography?.fontWeight,
            color: style.typography?.color,
            textTransform: style.typography?.textTransform,
            textDecoration: style.typography?.textDecoration,
            opacity: style.opacity,
            boxShadow: style.boxShadow ? `${style.boxShadow.inset ? 'inset ' : ''}${style.boxShadow.x || 0} ${style.boxShadow.y || 0} ${style.boxShadow.blur || 0} ${style.boxShadow.spread || 0} ${style.boxShadow.color || 'rgba(0,0,0,0.1)'}` : undefined
          }}
        >
          {/* Contenido de muestra según el tipo de bloque */}
          {['rich-text', 'heading', 'paragraph', 'quote', 'button'].includes(blockType) ? (
            <span>Texto de ejemplo</span>
          ) : blockType === 'image' ? (
            <span>Imagen</span>
          ) : (
            <span>Vista previa</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StyleSettings;