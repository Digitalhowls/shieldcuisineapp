import React, { useRef, useState, useEffect } from "react";
import { useDrag, useDrop, DropTargetMonitor } from "react-dnd";
import { Trash2, Copy, Move, Settings, ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import BlockSettingsPanel from "./block-settings-panel";
import { Block, BlockType, BlockContent } from "./types";

/**
 * Contenedor para los bloques en el editor que gestiona su interactividad.
 * 
 * Proporciona funcionalidades de:
 * - Arrastrar y soltar (drag & drop) para reordenar
 * - Activación/desactivación de bloques seleccionados
 * - Controles de edición (mover, duplicar, eliminar)
 * - Panel de configuración contextual
 * 
 * @module BlockContainer
 * @category CMS
 * @subcategory BlockEditor
 */

// Tipo constante para el tipo de arrastre
const DRAG_TYPE = "BLOCK" as const;

/**
 * Propiedades para el componente BlockContainer
 */
interface BlockContainerProps {
  /** Identificador único del bloque */
  id: string;
  /** Tipo de bloque (heading, text, image, etc.) */
  type: BlockType;
  /** Posición del bloque en la lista */
  index: number;
  /** Si el bloque está actualmente seleccionado/activo */
  isActive: boolean;
  /** Contenido del bloque a renderizar */
  children: React.ReactNode;
  /** Datos completos del bloque (opcional) */
  block?: Block;
  /** Función a llamar cuando se activa el bloque */
  onActivate: () => void;
  /** Función a llamar cuando se desactiva el bloque */
  onDeactivate: () => void;
  /** Función para mover el bloque de una posición a otra */
  onMove: (dragIndex: number, hoverIndex: number) => void;
  /** Función para eliminar el bloque */
  onDelete: () => void;
  /** Función para duplicar el bloque */
  onDuplicate: () => void;
  /** Función para actualizar el contenido del bloque */
  updateBlock?: (id: string, content: Partial<BlockContent>) => void;
  /** Si el bloque está en modo solo lectura (sin edición) */
  readOnly?: boolean;
}

/**
 * Elemento de arrastre para React DnD
 */
interface DragItem {
  /** Posición del elemento en la lista */
  index: number;
  /** Identificador único del elemento */
  id: string;
  /** Tipo de elemento arrastrable */
  type: typeof DRAG_TYPE;
}

/**
 * Resultado del evento drop para React DnD
 */
interface DropResult {
  /** ID del manejador de drop */
  handlerId: string | symbol | null;
  /** Si el cursor está sobre la zona de drop */
  isOver: boolean;
}

/**
 * Componente contenedor para bloques en el editor CMS.
 * Proporciona funcionalidad drag & drop y controles de edición.
 * 
 * Componente memoizado para mejorar el rendimiento cuando hay muchos bloques
 * en el editor, evitando renderizados innecesarios.
 */
const MemoizedBlockContainer = ({
  id,
  type,
  index,
  isActive,
  children,
  block,
  onActivate,
  onDeactivate,
  onMove,
  onDelete,
  onDuplicate,
  updateBlock,
  readOnly = false,
}: BlockContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  
  // Configuración de Drag and Drop con tipado mejorado
  const [{ isDragging }, drag, preview] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: DRAG_TYPE,
    item: { type: DRAG_TYPE, id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !readOnly,
  });

  const [dropState, drop] = useDrop<DragItem, unknown, DropResult>({
    accept: DRAG_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: monitor.isOver(),
      };
    },
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // No reemplazar elementos consigo mismos
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Optimización: Usar memoización de valores calculados para evitar cálculos repetitivos
      // durante el arrastre (movimiento fluido del mouse)
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Optimización: Mejorado con umbral ajustado para una mejor experiencia de usuario
      // Usar 40%/60% en lugar de 50% para crear una "zona muerta" que reduce cambios accidentales
      const hoverUpperThreshold = (hoverBoundingRect.bottom - hoverBoundingRect.top) * 0.4;
      const hoverLowerThreshold = (hoverBoundingRect.bottom - hoverBoundingRect.top) * 0.6;
      
      const clientOffset = monitor.getClientOffset();
      
      if (!clientOffset) {
        return;
      }
      
      // Obtener píxeles hasta la parte superior
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // Implementación mejorada del algoritmo de zona de soltar
      // que reduce los movimientos erráticos durante el arrastre
      
      // Arrastrar hacia abajo - usar umbral superior
      if (dragIndex < hoverIndex && hoverClientY < hoverUpperThreshold) {
        return;
      }
      
      // Arrastrar hacia arriba - usar umbral inferior
      if (dragIndex > hoverIndex && hoverClientY > hoverLowerThreshold) {
        return;
      }
      
      // Optimización: Limitar la frecuencia de actualizaciones durante el arrastre 
      // para mejorar el rendimiento (control de rebote)
      requestAnimationFrame(() => {
        // Realizar la acción de mover el bloque
        onMove(dragIndex, hoverIndex);
        
        // Actualizar el índice para coherencia del arrastre
        item.index = hoverIndex;
      });
    },
    canDrop: (_item: DragItem, _monitor: DropTargetMonitor) => !readOnly,
  });
  
  // Inicializar los refs para DnD
  drop(preview(ref));
  
  // Efecto visual durante el arrastre
  const opacity = isDragging ? 0.4 : 1;
  
  // Manejo de activación/desactivación de bloques - Memoizado para evitar recreaciones en cada render
  const handleClickBlock = React.useCallback((e: React.MouseEvent) => {
    // Prevenir que la activación se propague a bloques anidados
    e.stopPropagation();
    
    if (isActive) {
      // Si ya está activo, mantenerlo activo
      return;
    }
    
    onActivate();
  }, [isActive, onActivate]);
  
  // Manejo de clicks fuera para desactivar
  React.useEffect(() => {
    if (!isActive) return;
    
    // Implementación optimizada del detector de clics fuera con debounce
    let clickTimeout: number | null = null;
    
    const handleClickOutside = (e: MouseEvent) => {
      // Cancelar cualquier timeout pendiente para evitar múltiples desactivaciones
      if (clickTimeout) {
        window.clearTimeout(clickTimeout);
      }
      
      // Verificar si el clic fue fuera del bloque actual
      if (ref.current && !ref.current.contains(e.target as Node)) {
        // Usar un timeout corto para evitar desactivaciones accidentales
        // durante operaciones rápidas como doble clic
        clickTimeout = window.setTimeout(() => {
          onDeactivate();
          clickTimeout = null;
        }, 50);
      }
    };
    
    // Usar método moderno de eventos pasivos para mejor rendimiento
    document.addEventListener("mousedown", handleClickOutside, { passive: true });
    
    return () => {
      // Limpieza completa
      if (clickTimeout) {
        window.clearTimeout(clickTimeout);
      }
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isActive, onDeactivate]);
  
  // Extraer las propiedades del estado del drop con tipado seguro
  const { handlerId, isOver } = dropState;

  return (
    <motion.div
      ref={ref}
      className={`relative group ${isDragging ? "z-50" : ""} ${
        isOver ? "border-t-2 border-primary" : ""
      }`}
      onClick={handleClickBlock}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ opacity }}
      data-handler-id={handlerId}
    >
      {!readOnly && (
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute inset-0 border-2 border-primary rounded-md pointer-events-none z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            ></motion.div>
          )}
        </AnimatePresence>
      )}
      
      {!readOnly && (
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute left-0 top-0 -translate-x-full -ml-2 flex flex-col items-center gap-1 rounded-l-md p-1 bg-background border border-border"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={React.useCallback((e: React.MouseEvent) => {
                  e.stopPropagation();
                  // Usar requestAnimationFrame para sincronizar con ciclo de renderizado
                  requestAnimationFrame(() => {
                    onMove(index, Math.max(0, index - 1));
                  });
                }, [index, onMove])}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={React.useCallback((e: React.MouseEvent) => {
                  e.stopPropagation();
                  // La función drag está optimizada por React DnD
                  drag(ref); // Activa manualmente el dragging
                }, [drag, ref])}
                ref={drag}
              >
                <Move className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={React.useCallback((e: React.MouseEvent) => {
                  e.stopPropagation();
                  // Usar requestAnimationFrame para sincronizar con ciclo de renderizado
                  requestAnimationFrame(() => {
                    onMove(index, Math.min(index + 1, Number.MAX_SAFE_INTEGER));
                  });
                }, [index, onMove])}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      
      {!readOnly && (
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute right-0 top-0 translate-x-full mr-2 flex items-center gap-1 rounded-r-md p-1 bg-background border border-border"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                onClick={React.useCallback((e: React.MouseEvent) => {
                  e.stopPropagation();
                  setIsSettingsPanelOpen(true);
                }, [setIsSettingsPanelOpen])}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                onClick={React.useCallback((e: React.MouseEvent) => {
                  e.stopPropagation();
                  // Duplicar puede ser una operación costosa, usamos animationFrame
                  requestAnimationFrame(() => {
                    onDuplicate();
                  });
                }, [onDuplicate])}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  
                  // Confirmar antes de eliminar (operación destructiva)
                  if (window.confirm("¿Estás seguro de que quieres eliminar este bloque?")) {
                    // Programar la eliminación en el siguiente frame para no 
                    // bloquear la UI mientras se procesa la confirmación
                    requestAnimationFrame(() => {
                      onDelete();
                    });
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      
      <div className={`p-2 ${isActive ? "z-20 relative" : ""}`}>{children}</div>
      
      {/* Panel de configuración lateral */}
      {!readOnly && block && updateBlock && (
        <BlockSettingsPanel
          blockType={type}
          blockData={block.content}
          onChange={React.useCallback(
            (newContent: Partial<BlockContent>) => {
              // Utilizamos useCallback para evitar recrear esta función en cada render
              if (updateBlock) {
                // Envolver la actualización en requestAnimationFrame para limitar
                // la frecuencia de actualizaciones y mejorar rendimiento
                requestAnimationFrame(() => {
                  updateBlock(id, newContent);
                });
              }
            },
            [id, updateBlock]
          )}
          isVisible={isSettingsPanelOpen}
          onClose={React.useCallback(() => setIsSettingsPanelOpen(false), [setIsSettingsPanelOpen])}
        />
      )}
    </motion.div>
  );
};

// Exportar componente memoizado
export const BlockContainer = React.memo(MemoizedBlockContainer);

// Mantiene la exportación por defecto para compatibilidad con código existente
export default BlockContainer;