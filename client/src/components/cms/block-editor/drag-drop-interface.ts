/**
 * Sistema de arrastrar y soltar mejorado para el editor de bloques
 * 
 * Este módulo proporciona hooks y utilidades para la funcionalidad
 * de arrastrar y soltar (drag & drop) con optimizaciones de rendimiento.
 * 
 * @module DragDropInterface
 * @category CMS
 * @subcategory BlockEditor
 */

import { useRef, useCallback, useState } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { Block } from './types';

// Tipo constante para el tipo de arrastre de bloques
export const BLOCK_DRAG_TYPE = 'BLOCK' as const;

/**
 * Elemento de arrastre para React DnD
 */
export interface DragItem {
  /** Posición del elemento en la lista */
  index: number;
  /** Identificador único del elemento */
  id: string;
  /** Tipo de elemento arrastrable */
  type: typeof BLOCK_DRAG_TYPE;
}

/**
 * Resultado del evento drop para React DnD
 */
export interface DropResult {
  /** ID del manejador de drop */
  handlerId: string | symbol | null;
  /** Si el cursor está sobre la zona de drop */
  isOver: boolean;
}

/**
 * Configuración para el comportamiento de arrastrar y soltar
 */
export interface DragDropConfig {
  /** Umbral superior para zona de arrastre (0-1) */
  upperThreshold: number;
  /** Umbral inferior para zona de arrastre (0-1) */
  lowerThreshold: number;
  /** Si se debe usar animationFrame para limitar frecuencia de actualizaciones */
  useAnimationFrame: boolean;
}

// Configuración predeterminada optimizada
export const DEFAULT_DRAG_DROP_CONFIG: DragDropConfig = {
  upperThreshold: 0.4,
  lowerThreshold: 0.6,
  useAnimationFrame: true,
};

/**
 * Hook personalizado para la funcionalidad de drag & drop de bloques
 * 
 * @param id ID del bloque
 * @param index Posición del bloque en la lista
 * @param moveBlock Función para mover el bloque
 * @param config Configuración del comportamiento
 * @param canDrag Si el bloque puede ser arrastrado
 * @returns Referencias y estado para implementar drag & drop
 */
export function useDragAndDrop({
  id,
  index,
  moveBlock,
  config = DEFAULT_DRAG_DROP_CONFIG,
  canDrag = true,
}: {
  id: string;
  index: number;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
  config?: Partial<DragDropConfig>;
  canDrag?: boolean;
}) {
  // Combinamos la configuración predeterminada con la proporcionada
  const dragDropConfig: DragDropConfig = { 
    ...DEFAULT_DRAG_DROP_CONFIG, 
    ...config 
  };
  
  // Almacenamos el elemento DOM en un estado en lugar de ref
  // para evitar problemas con la propiedad 'current' readonly
  const [domNode, setDomNode] = useState<HTMLDivElement | null>(null);
  
  // Configuración del sistema de arrastre
  const [{ isDragging }, drag, preview] = useDrag<
    DragItem, 
    unknown, 
    { isDragging: boolean }
  >({
    type: BLOCK_DRAG_TYPE,
    item: { type: BLOCK_DRAG_TYPE, id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag,
  });
  
  // Configuración del sistema de destino para soltar
  const [dropState, drop] = useDrop<
    DragItem, 
    unknown, 
    DropResult
  >({
    accept: BLOCK_DRAG_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: monitor.isOver(),
      };
    },
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!domNode) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // No reemplazar elementos consigo mismos
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Cálculos optimizados de posición
      const hoverBoundingRect = domNode.getBoundingClientRect();
      
      // Usar umbrales personalizados para una mejor experiencia
      const hoverUpperThreshold = 
        (hoverBoundingRect.bottom - hoverBoundingRect.top) * 
        dragDropConfig.upperThreshold;
        
      const hoverLowerThreshold = 
        (hoverBoundingRect.bottom - hoverBoundingRect.top) * 
        dragDropConfig.lowerThreshold;
      
      // Posición del cursor
      const clientOffset = monitor.getClientOffset();
      
      if (!clientOffset) {
        return;
      }
      
      // Distancia del cursor al borde superior del elemento
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // Lógica mejorada para determinar la dirección y decidir si realizar el movimiento
      
      // Arrastrar hacia abajo - usar umbral superior
      if (dragIndex < hoverIndex && hoverClientY < hoverUpperThreshold) {
        return;
      }
      
      // Arrastrar hacia arriba - usar umbral inferior
      if (dragIndex > hoverIndex && hoverClientY > hoverLowerThreshold) {
        return;
      }
      
      // Ejecutar el movimiento con o sin requestAnimationFrame según la configuración
      const executeMoveBlock = () => {
        moveBlock(dragIndex, hoverIndex);
        item.index = hoverIndex;
      };
      
      if (dragDropConfig.useAnimationFrame) {
        requestAnimationFrame(executeMoveBlock);
      } else {
        executeMoveBlock();
      }
    },
    canDrop: () => canDrag,
  });
  
  // Inicializar las referencias
  const setupRefs = useCallback((element: HTMLDivElement | null) => {
    // Guardar el elemento DOM mediante useState
    setDomNode(element);
    
    // Aplicar los refs de react-dnd
    preview(drop(element));
  }, [preview, drop]);
  
  // Inicializar la manija de arrastre
  const dragHandleRef = drag;
  
  return {
    ref: setupRefs,
    dragHandleRef,
    isDragging,
    isOver: dropState.isOver,
    handlerId: dropState.handlerId,
  };
}