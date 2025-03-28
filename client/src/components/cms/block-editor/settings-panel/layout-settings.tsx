import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { BlockType } from '../types';

interface LayoutSettingsProps {
  blockType: BlockType;
  layout?: LayoutOptions;
  onChange: (layout: LayoutOptions) => void;
}

export interface LayoutOptions {
  // Posicionamiento
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
  
  // Alineación
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'middle' | 'bottom' | 'baseline';
  
  // Visualización
  display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'grid' | 'none';
  
  // Flexbox (cuando display es flex)
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  alignContent?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string;
  
  // Grid (cuando display es grid)
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridGap?: string;
  gridColumnGap?: string;
  gridRowGap?: string;
  
  // Comportamiento de desbordamiento
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';
  
  // Transformaciones
  transform?: {
    translate?: { x: string; y: string };
    rotate?: string;
    scale?: string | { x: number; y: number };
    skew?: { x: string; y: string };
  };
  
  // Otras propiedades de diseño
  aspectRatio?: string;
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
  objectPosition?: string;
  float?: 'none' | 'left' | 'right';
  clear?: 'none' | 'left' | 'right' | 'both';
  visibility?: 'visible' | 'hidden' | 'collapse';
}

/**
 * Componente de configuración de diseño (layout)
 * 
 * Permite al usuario configurar las propiedades de posicionamiento
 * y distribución espacial de los elementos.
 */
const LayoutSettings: React.FC<LayoutSettingsProps> = ({
  blockType,
  layout = {},
  onChange
}) => {
  // Función auxiliar para actualizar propiedades
  const updateProperty = (property: keyof LayoutOptions, value: any) => {
    onChange({
      ...layout,
      [property]: value
    });
  };

  // Actualiza una propiedad anidada
  const updateNestedProperty = (category: string, property: string, value: any) => {
    onChange({
      ...layout,
      [category]: {
        ...(layout[category as keyof LayoutOptions] as any || {}),
        [property]: value
      }
    });
  };

  // Determinar qué opciones mostrar según el tipo de bloque
  const showPositioningOptions = ['image', 'button', 'gallery', 'form'].includes(blockType);
  const showFlexOptions = layout.display === 'flex';
  const showGridOptions = layout.display === 'grid';
  const showTextAlignOptions = ['rich-text', 'heading', 'paragraph', 'quote'].includes(blockType);
  const showTransformOptions = true; // Para todos los bloques
  const showObjectOptions = ['image', 'video'].includes(blockType);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="position" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="position">Posición</TabsTrigger>
          <TabsTrigger value="display">Visualización</TabsTrigger>
          <TabsTrigger value="alignment">Alineación</TabsTrigger>
        </TabsList>
        
        {/* Configuración de posicionamiento */}
        <TabsContent value="position" className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-xs">Tipo de posicionamiento</Label>
            <Select
              value={layout.position || 'static'}
              onValueChange={(value) => updateProperty('position', value)}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Seleccionar posición" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="static">Estático (Normal)</SelectItem>
                <SelectItem value="relative">Relativo</SelectItem>
                <SelectItem value="absolute">Absoluto</SelectItem>
                <SelectItem value="fixed">Fijo</SelectItem>
                <SelectItem value="sticky">Pegajoso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {layout.position && layout.position !== 'static' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Superior</Label>
                <Input
                  type="text"
                  value={layout.top || 'auto'}
                  onChange={(e) => updateProperty('top', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Derecha</Label>
                <Input
                  type="text"
                  value={layout.right || 'auto'}
                  onChange={(e) => updateProperty('right', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Inferior</Label>
                <Input
                  type="text"
                  value={layout.bottom || 'auto'}
                  onChange={(e) => updateProperty('bottom', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Izquierda</Label>
                <Input
                  type="text"
                  value={layout.left || 'auto'}
                  onChange={(e) => updateProperty('left', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label className="text-xs">Índice Z (z-index)</Label>
            <Input
              type="number"
              value={layout.zIndex || 0}
              onChange={(e) => updateProperty('zIndex', parseInt(e.target.value))}
              className="h-7 text-xs"
            />
          </div>
          
          {showTransformOptions && (
            <div className="space-y-2">
              <Label className="text-xs">Transformaciones</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Traslación X</Label>
                  <Input
                    type="text"
                    value={layout.transform?.translate?.x || '0'}
                    onChange={(e) => {
                      const transform = layout.transform || {};
                      const translate = transform.translate || { x: '0', y: '0' };
                      updateNestedProperty('transform', 'translate', { ...translate, x: e.target.value });
                    }}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Traslación Y</Label>
                  <Input
                    type="text"
                    value={layout.transform?.translate?.y || '0'}
                    onChange={(e) => {
                      const transform = layout.transform || {};
                      const translate = transform.translate || { x: '0', y: '0' };
                      updateNestedProperty('transform', 'translate', { ...translate, y: e.target.value });
                    }}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Rotación</Label>
                  <Input
                    type="text"
                    value={layout.transform?.rotate || '0deg'}
                    onChange={(e) => updateNestedProperty('transform', 'rotate', e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Escala</Label>
                  <Input
                    type="text"
                    value={typeof layout.transform?.scale === 'string' ? layout.transform.scale : '1'}
                    onChange={(e) => updateNestedProperty('transform', 'scale', e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label className="text-xs">Comportamiento de desbordamiento</Label>
            <Select
              value={layout.overflow || 'visible'}
              onValueChange={(value) => updateProperty('overflow', value)}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Seleccionar comportamiento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visible">Visible</SelectItem>
                <SelectItem value="hidden">Oculto</SelectItem>
                <SelectItem value="scroll">Desplazable</SelectItem>
                <SelectItem value="auto">Automático</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
        
        {/* Configuración de visualización */}
        <TabsContent value="display" className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-xs">Tipo de visualización</Label>
            <Select
              value={layout.display || 'block'}
              onValueChange={(value) => updateProperty('display', value)}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Seleccionar visualización" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="block">Bloque</SelectItem>
                <SelectItem value="inline">En línea</SelectItem>
                <SelectItem value="inline-block">Bloque en línea</SelectItem>
                <SelectItem value="flex">Flexible</SelectItem>
                <SelectItem value="grid">Cuadrícula</SelectItem>
                <SelectItem value="none">Ninguno</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {showFlexOptions && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Dirección de elementos</Label>
                <Select
                  value={layout.flexDirection || 'row'}
                  onValueChange={(value) => updateProperty('flexDirection', value)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Seleccionar dirección" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="row">Fila</SelectItem>
                    <SelectItem value="row-reverse">Fila invertida</SelectItem>
                    <SelectItem value="column">Columna</SelectItem>
                    <SelectItem value="column-reverse">Columna invertida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Ajuste de elementos</Label>
                <Select
                  value={layout.flexWrap || 'nowrap'}
                  onValueChange={(value) => updateProperty('flexWrap', value)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Seleccionar ajuste" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nowrap">Sin ajuste</SelectItem>
                    <SelectItem value="wrap">Ajustar</SelectItem>
                    <SelectItem value="wrap-reverse">Ajuste invertido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Alineación horizontal</Label>
                <Select
                  value={layout.justifyContent || 'flex-start'}
                  onValueChange={(value) => updateProperty('justifyContent', value)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Seleccionar alineación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flex-start">Inicio</SelectItem>
                    <SelectItem value="flex-end">Fin</SelectItem>
                    <SelectItem value="center">Centro</SelectItem>
                    <SelectItem value="space-between">Espacio entre</SelectItem>
                    <SelectItem value="space-around">Espacio alrededor</SelectItem>
                    <SelectItem value="space-evenly">Espacio uniforme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Alineación vertical</Label>
                <Select
                  value={layout.alignItems || 'stretch'}
                  onValueChange={(value) => updateProperty('alignItems', value)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Seleccionar alineación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stretch">Estirar</SelectItem>
                    <SelectItem value="flex-start">Inicio</SelectItem>
                    <SelectItem value="flex-end">Fin</SelectItem>
                    <SelectItem value="center">Centro</SelectItem>
                    <SelectItem value="baseline">Línea base</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          {showGridOptions && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Plantilla de columnas</Label>
                <Input
                  type="text"
                  value={layout.gridTemplateColumns || 'auto'}
                  onChange={(e) => updateProperty('gridTemplateColumns', e.target.value)}
                  className="h-7 text-xs"
                  placeholder="Ej: 1fr 1fr 1fr"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Plantilla de filas</Label>
                <Input
                  type="text"
                  value={layout.gridTemplateRows || 'auto'}
                  onChange={(e) => updateProperty('gridTemplateRows', e.target.value)}
                  className="h-7 text-xs"
                  placeholder="Ej: auto 1fr auto"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Espacio entre celdas</Label>
                <Input
                  type="text"
                  value={layout.gridGap || '0'}
                  onChange={(e) => updateProperty('gridGap', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
            </>
          )}
          
          {showObjectOptions && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Ajuste de objeto</Label>
                <Select
                  value={layout.objectFit || 'fill'}
                  onValueChange={(value) => updateProperty('objectFit', value)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Seleccionar ajuste" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fill">Rellenar</SelectItem>
                    <SelectItem value="contain">Contener</SelectItem>
                    <SelectItem value="cover">Cubrir</SelectItem>
                    <SelectItem value="none">Ninguno</SelectItem>
                    <SelectItem value="scale-down">Reducir escala</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Posición de objeto</Label>
                <Input
                  type="text"
                  value={layout.objectPosition || 'center'}
                  onChange={(e) => updateProperty('objectPosition', e.target.value)}
                  className="h-7 text-xs"
                  placeholder="Ej: center, top left, 50% 50%"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Relación de aspecto</Label>
                <Input
                  type="text"
                  value={layout.aspectRatio || 'auto'}
                  onChange={(e) => updateProperty('aspectRatio', e.target.value)}
                  className="h-7 text-xs"
                  placeholder="Ej: 16/9, 4/3, 1/1"
                />
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label className="text-xs">Visibilidad</Label>
            <Select
              value={layout.visibility || 'visible'}
              onValueChange={(value) => updateProperty('visibility', value)}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Seleccionar visibilidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visible">Visible</SelectItem>
                <SelectItem value="hidden">Oculto</SelectItem>
                <SelectItem value="collapse">Colapsado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs">Flotación</Label>
            <Select
              value={layout.float || 'none'}
              onValueChange={(value) => updateProperty('float', value)}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Seleccionar flotación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguna</SelectItem>
                <SelectItem value="left">Izquierda</SelectItem>
                <SelectItem value="right">Derecha</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
        
        {/* Configuración de alineación */}
        <TabsContent value="alignment" className="space-y-4 mt-2">
          {showTextAlignOptions && (
            <div className="space-y-2">
              <Label className="text-xs">Alineación de texto</Label>
              <Select
                value={layout.textAlign || 'left'}
                onValueChange={(value) => updateProperty('textAlign', value)}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Seleccionar alineación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Izquierda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Derecha</SelectItem>
                  <SelectItem value="justify">Justificado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label className="text-xs">Alineación vertical</Label>
            <Select
              value={layout.verticalAlign || 'top'}
              onValueChange={(value) => updateProperty('verticalAlign', value)}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Seleccionar alineación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Superior</SelectItem>
                <SelectItem value="middle">Medio</SelectItem>
                <SelectItem value="bottom">Inferior</SelectItem>
                <SelectItem value="baseline">Línea base</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LayoutSettings;