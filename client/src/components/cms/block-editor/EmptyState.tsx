import React from 'react';
import { PlusCircle, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlockType } from './types';

/**
 * Propiedades para el componente EmptyState
 */
interface EmptyStateProps {
  /** Función a llamar cuando se selecciona un tipo de bloque para añadir */
  onAddBlock: (type: BlockType) => void;
}

/**
 * Componente que se muestra cuando el editor no tiene bloques
 * 
 * Proporciona una interfaz amigable con botones para añadir
 * los tipos de bloques más comunes
 * 
 * @module EmptyState
 * @category CMS
 * @subcategory BlockEditor
 */
/**
 * Componente interno memoizado para mejorar el rendimiento
 */
const MemoizedEmptyState: React.FC<EmptyStateProps> = ({ onAddBlock }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-md bg-muted/20">
      <LayoutTemplate className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No hay contenido</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        Comienza a diseñar tu página añadiendo bloques de contenido. Puedes añadir textos, imágenes, vídeos y más.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button size="sm" onClick={() => onAddBlock('heading')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Añadir Título
        </Button>
        <Button size="sm" onClick={() => onAddBlock('paragraph')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Añadir Párrafo
        </Button>
        <Button size="sm" onClick={() => onAddBlock('image')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Añadir Imagen
        </Button>
      </div>
    </div>
  );
};

/**
 * Componente externo memoizado para mejorar el rendimiento
 * cuando el editor está vacío, evitando renderizados innecesarios.
 */
export const EmptyState = React.memo(MemoizedEmptyState);

// Mantiene la exportación por defecto para compatibilidad con código existente
export default EmptyState;