import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BlockType } from '../types';

interface AdvancedSettingsProps {
  blockType: BlockType;
  settings?: AdvancedOptions;
  onChange: (settings: AdvancedOptions) => void;
}

export interface AdvancedOptions {
  // Identificadores y clases
  id?: string;
  className?: string;
  
  // Atributos de datos personalizados
  dataAttributes?: Record<string, string>; // data-*
  
  // Accesibilidad
  ariaLabel?: string;
  ariaDescribedby?: string;
  ariaHidden?: boolean;
  role?: string;
  tabIndex?: number;
  
  // Interacción
  clickAction?: string;
  hoverAction?: string;
  interactive?: boolean;
  
  // Visualización responsiva
  responsive?: {
    hideOnMobile?: boolean;
    hideOnTablet?: boolean;
    hideOnDesktop?: boolean;
    customBreakpoints?: Record<string, boolean>;
  };
  
  // SEO
  seoAttributes?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  
  // Rendimiento
  lazy?: boolean;
  priority?: boolean;
  
  // Código personalizado
  customCSS?: string;
  customHtml?: string;
  customJs?: string;
}

/**
 * Componente de configuraciones avanzadas
 * 
 * Permite configurar opciones técnicas más avanzadas como
 * identificadores, atributos personalizados, configuración SEO, etc.
 */
const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  blockType,
  settings = {},
  onChange
}) => {
  // Actualiza una propiedad simple
  const updateProperty = (property: keyof AdvancedOptions, value: any) => {
    onChange({
      ...settings,
      [property]: value
    });
  };

  // Actualiza una propiedad en una categoría anidada
  const updateNestedProperty = (category: keyof AdvancedOptions, property: string, value: any) => {
    onChange({
      ...settings,
      [category]: {
        ...(settings[category] as any || {}),
        [property]: value
      }
    });
  };

  // Añade un nuevo atributo data-*
  const addDataAttribute = () => {
    const existingAttributes = settings.dataAttributes || {};
    const newKey = `atributo-${Object.keys(existingAttributes).length + 1}`;
    
    updateProperty('dataAttributes', {
      ...existingAttributes,
      [newKey]: ''
    });
  };

  // Elimina un atributo data-*
  const removeDataAttribute = (key: string) => {
    const existingAttributes = settings.dataAttributes || {};
    const { [key]: removed, ...rest } = existingAttributes;
    
    updateProperty('dataAttributes', rest);
  };

  // Actualiza el valor de un atributo data-*
  const updateDataAttribute = (key: string, newKey: string, value: string) => {
    const existingAttributes = settings.dataAttributes || {};
    
    if (key !== newKey) {
      // Si la clave cambió, eliminar la antigua y crear una nueva
      const { [key]: removed, ...rest } = existingAttributes;
      updateProperty('dataAttributes', {
        ...rest,
        [newKey]: value
      });
    } else {
      // Solo actualizar el valor
      updateProperty('dataAttributes', {
        ...existingAttributes,
        [key]: value
      });
    }
  };

  return (
    <div className="space-y-6">
      <Accordion type="multiple" className="w-full" defaultValue={['identifiers', 'accessibility']}>
        {/* Identificadores y clases */}
        <AccordionItem value="identifiers">
          <AccordionTrigger className="text-sm font-medium py-2">
            Identificadores y clases
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="block-id">ID del bloque</Label>
              <Input
                id="block-id"
                type="text"
                value={settings.id || ''}
                onChange={(e) => updateProperty('id', e.target.value)}
                className="h-7 text-xs"
                placeholder="ID único para este bloque"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="block-classes">Clases CSS</Label>
              <Input
                id="block-classes"
                type="text"
                value={settings.className || ''}
                onChange={(e) => updateProperty('className', e.target.value)}
                className="h-7 text-xs"
                placeholder="Clases separadas por espacios"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Añade clases personalizadas separadas por espacios
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Atributos de datos personalizados */}
        <AccordionItem value="data-attributes">
          <AccordionTrigger className="text-sm font-medium py-2">
            Atributos de datos (data-*)
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-3">
              {Object.entries(settings.dataAttributes || {}).map(([key, value], index) => (
                <div key={index} className="grid grid-cols-5 gap-2 items-center">
                  <div className="col-span-2">
                    <Input
                      type="text"
                      value={key}
                      onChange={(e) => updateDataAttribute(key, e.target.value, value)}
                      className="h-7 text-xs"
                      placeholder="Nombre"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="text"
                      value={value}
                      onChange={(e) => updateDataAttribute(key, key, e.target.value)}
                      className="h-7 text-xs"
                      placeholder="Valor"
                    />
                  </div>
                  <button
                    type="button"
                    className="text-xs text-destructive hover:text-destructive/80"
                    onClick={() => removeDataAttribute(key)}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                className="text-xs text-primary hover:text-primary/80"
                onClick={addDataAttribute}
              >
                + Añadir atributo
              </button>
              
              <p className="text-xs text-muted-foreground mt-1">
                Los atributos de datos permiten almacenar información adicional en elementos HTML
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Accesibilidad */}
        <AccordionItem value="accessibility">
          <AccordionTrigger className="text-sm font-medium py-2">
            Accesibilidad
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="aria-label">Etiqueta ARIA</Label>
              <Input
                id="aria-label"
                type="text"
                value={settings.ariaLabel || ''}
                onChange={(e) => updateProperty('ariaLabel', e.target.value)}
                className="h-7 text-xs"
                placeholder="Descripción para lectores de pantalla"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="aria-describedby">Describido por</Label>
              <Input
                id="aria-describedby"
                type="text"
                value={settings.ariaDescribedby || ''}
                onChange={(e) => updateProperty('ariaDescribedby', e.target.value)}
                className="h-7 text-xs"
                placeholder="ID del elemento que describe este bloque"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="role">Rol</Label>
              <Input
                id="role"
                type="text"
                value={settings.role || ''}
                onChange={(e) => updateProperty('role', e.target.value)}
                className="h-7 text-xs"
                placeholder="Rol de este elemento (button, article, etc.)"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="aria-hidden"
                checked={!!settings.ariaHidden}
                onCheckedChange={(checked) => updateProperty('ariaHidden', checked)}
              />
              <Label htmlFor="aria-hidden" className="text-xs">Ocultar para lectores de pantalla</Label>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="tab-index">Índice de tabulación</Label>
              <Input
                id="tab-index"
                type="number"
                value={settings.tabIndex !== undefined ? settings.tabIndex : 0}
                onChange={(e) => updateProperty('tabIndex', parseInt(e.target.value))}
                className="h-7 text-xs"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Visualización responsiva */}
        <AccordionItem value="responsive">
          <AccordionTrigger className="text-sm font-medium py-2">
            Visualización responsiva
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="hide-mobile"
                  checked={!!settings.responsive?.hideOnMobile}
                  onCheckedChange={(checked) => updateNestedProperty('responsive', 'hideOnMobile', checked)}
                />
                <Label htmlFor="hide-mobile" className="text-xs">Ocultar en dispositivos móviles</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="hide-tablet"
                  checked={!!settings.responsive?.hideOnTablet}
                  onCheckedChange={(checked) => updateNestedProperty('responsive', 'hideOnTablet', checked)}
                />
                <Label htmlFor="hide-tablet" className="text-xs">Ocultar en tabletas</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="hide-desktop"
                  checked={!!settings.responsive?.hideOnDesktop}
                  onCheckedChange={(checked) => updateNestedProperty('responsive', 'hideOnDesktop', checked)}
                />
                <Label htmlFor="hide-desktop" className="text-xs">Ocultar en escritorio</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* SEO */}
        <AccordionItem value="seo">
          <AccordionTrigger className="text-sm font-medium py-2">
            SEO
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="seo-title">Título SEO</Label>
              <Input
                id="seo-title"
                type="text"
                value={settings.seoAttributes?.title || ''}
                onChange={(e) => updateNestedProperty('seoAttributes', 'title', e.target.value)}
                className="h-7 text-xs"
                placeholder="Título para motores de búsqueda"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="seo-description">Descripción</Label>
              <Textarea
                id="seo-description"
                value={settings.seoAttributes?.description || ''}
                onChange={(e) => updateNestedProperty('seoAttributes', 'description', e.target.value)}
                className="min-h-[60px] text-xs"
                placeholder="Descripción para motores de búsqueda"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="seo-keywords">Palabras clave</Label>
              <Input
                id="seo-keywords"
                type="text"
                value={settings.seoAttributes?.keywords || ''}
                onChange={(e) => updateNestedProperty('seoAttributes', 'keywords', e.target.value)}
                className="h-7 text-xs"
                placeholder="Palabras clave separadas por comas"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Rendimiento */}
        <AccordionItem value="performance">
          <AccordionTrigger className="text-sm font-medium py-2">
            Rendimiento
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="lazy-loading"
                  checked={!!settings.lazy}
                  onCheckedChange={(checked) => updateProperty('lazy', checked)}
                />
                <Label htmlFor="lazy-loading" className="text-xs">Carga diferida (lazy loading)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="priority-loading"
                  checked={!!settings.priority}
                  onCheckedChange={(checked) => updateProperty('priority', checked)}
                />
                <Label htmlFor="priority-loading" className="text-xs">Carga prioritaria</Label>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              La carga diferida mejora el rendimiento, pero la carga prioritaria es útil para contenido crítico.
            </p>
          </AccordionContent>
        </AccordionItem>
        
        {/* Código personalizado */}
        <AccordionItem value="custom-code">
          <AccordionTrigger className="text-sm font-medium py-2">
            Código personalizado
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="custom-css">CSS personalizado</Label>
              <Textarea
                id="custom-css"
                value={settings.customCSS || ''}
                onChange={(e) => updateProperty('customCSS', e.target.value)}
                className="min-h-[80px] text-xs font-mono"
                placeholder="/* CSS personalizado para este bloque */"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="custom-html">HTML personalizado</Label>
              <Textarea
                id="custom-html"
                value={settings.customHtml || ''}
                onChange={(e) => updateProperty('customHtml', e.target.value)}
                className="min-h-[80px] text-xs font-mono"
                placeholder="<!-- HTML personalizado -->"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="custom-js">JavaScript personalizado</Label>
              <Textarea
                id="custom-js"
                value={settings.customJs || ''}
                onChange={(e) => updateProperty('customJs', e.target.value)}
                className="min-h-[80px] text-xs font-mono"
                placeholder="// JavaScript personalizado"
              />
            </div>
            
            <p className="text-xs text-muted-foreground">
              El código personalizado se aplica específicamente a este bloque. Ten precaución al usar estas opciones.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default AdvancedSettings;