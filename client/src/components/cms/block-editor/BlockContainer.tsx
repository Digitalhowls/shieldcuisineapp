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
 */
export const BlockContainer = ({
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
      
      // Determinar el rectángulo en la pantalla
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Obtener el punto medio vertical
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determinar la posición del mouse
      const clientOffset = monitor.getClientOffset();
      
      // Si no hay offset del cliente, salir
      if (!clientOffset) {
        return;
      }
      
      // Obtener píxeles hasta la parte superior
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // Solo realizar el movimiento cuando el mouse cruza la mitad del elemento
      // Cuando se arrastra hacia abajo, solo mover cuando el cursor esté por debajo del 50%
      // Cuando se arrastra hacia arriba, solo mover cuando el cursor esté por encima del 50%
      
      // Arrastrar hacia abajo
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      
      // Arrastrar hacia arriba
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      // Ha llegado aquí, hora de realizar la acción
      onMove(dragIndex, hoverIndex);
      
      // Importante: actualizar el índice del item para que no salte hacia atrás
      // cuando el mouse pase sobre otro elemento
      item.index = hoverIndex;
    },
    canDrop: (_item: DragItem, _monitor: DropTargetMonitor) => !readOnly,
  });
  
  // Inicializar los refs para DnD
  drop(preview(ref));
  
  // Efecto visual durante el arrastre
  const opacity = isDragging ? 0.4 : 1;
  
  // Manejo de activación/desactivación de bloques
  const handleClickBlock = (e: React.MouseEvent) => {
    // Prevenir que la activación se propague a bloques anidados
    e.stopPropagation();
    
    if (isActive) {
      // Si ya está activo, mantenerlo activo
      return;
    }
    
    onActivate();
  };
  
  // Manejo de clicks fuera para desactivar
  React.useEffect(() => {
    if (!isActive) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onDeactivate();
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
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
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(index, Math.max(0, index - 1));
                }}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  drag(ref); // Activa manualmente el dragging
                }}
                ref={drag}
              >
                <Move className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(index, Math.min(index + 1, Number.MAX_SAFE_INTEGER));
                }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSettingsPanelOpen(true);
                }}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    window.confirm(
                      "¿Estás seguro de que quieres eliminar este bloque?"
                    )
                  ) {
                    onDelete();
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
          onChange={(newContent: Partial<BlockContent>) => {
            if (updateBlock) {
              updateBlock(id, newContent);
            }
          }}
          isVisible={isSettingsPanelOpen}
          onClose={() => setIsSettingsPanelOpen(false)}
        />
      )}
    </motion.div>
  );
};

// Mantiene la exportación por defecto para compatibilidad con código existente
export default BlockContainer;