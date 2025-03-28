import React, { useRef, useState, useEffect } from "react";
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
import { 
  useDragAndDrop, 
  BLOCK_DRAG_TYPE 
} from "./drag-drop-interface";

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
  // Estado para panel de configuración
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  
  // Referencia para detectar clics fuera
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Implementación del sistema de arrastrar y soltar mejorado
  const {
    ref: dragDropRef,
    dragHandleRef,
    isDragging,
    isOver,
    handlerId
  } = useDragAndDrop({
    id,
    index,
    moveBlock: onMove,
    canDrag: !readOnly,
    config: {
      // Umbrales optimizados para una mejor experiencia UX
      upperThreshold: 0.4,
      lowerThreshold: 0.6,
      useAnimationFrame: true
    }
  });
  
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
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
  
  // Combinar referencias para tener tanto la funcionalidad de drag-drop como la detección de clics
  const combinedRef = (element: HTMLDivElement | null) => {
    // Técnica alternativa que evita la modificación directa de current
    // Usamos el elemento como parámetro para referencia
    if (element !== null) {
      // Guardamos el elemento en una variable para usarlo en handleClickOutside
      window.setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Actualizamos el current sin necesidad de usar defineProperty
        containerRef.current = element;
      }, 0);
    }
    dragDropRef(element);
  };

  // Manejadores de eventos memoizados
  const handleMoveUp = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    requestAnimationFrame(() => {
      onMove(index, Math.max(0, index - 1));
    });
  }, [index, onMove]);

  const handleMoveDown = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    requestAnimationFrame(() => {
      onMove(index, index + 1);
    });
  }, [index, onMove]);

  const handleDuplicate = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    requestAnimationFrame(() => {
      onDuplicate();
    });
  }, [onDuplicate]);

  const handleOpenSettings = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSettingsPanelOpen(true);
  }, []);

  const handleDelete = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm("¿Estás seguro de que quieres eliminar este bloque?")) {
      requestAnimationFrame(() => {
        onDelete();
      });
    }
  }, [onDelete]);

  const handleContentChange = React.useCallback(
    (newContent: Partial<BlockContent>) => {
      if (updateBlock) {
        requestAnimationFrame(() => {
          updateBlock(id, newContent);
        });
      }
    },
    [id, updateBlock]
  );

  const handleCloseSettings = React.useCallback(() => 
    setIsSettingsPanelOpen(false), 
    []
  );

  return (
    <motion.div
      ref={combinedRef}
      className={`relative group ${isDragging ? "z-50" : ""} ${
        isOver ? "border-t-2 border-primary" : ""
      }`}
      onClick={handleClickBlock}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ opacity }}
      data-handler-id={handlerId}
      data-block-id={id}
      data-block-type={type}
      data-test="block-container"
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
                onClick={handleMoveUp}
                title="Mover hacia arriba (Alt+↑)"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                ref={dragHandleRef}
                title="Arrastrar para reordenar"
                data-test="drag-handle"
              >
                <Move className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={handleMoveDown}
                title="Mover hacia abajo (Alt+↓)"
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
                onClick={handleOpenSettings}
                title="Configuración (Alt+S)"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                onClick={handleDuplicate}
                title="Duplicar (Alt+D)"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
                title="Eliminar (Alt+Supr)"
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
          onChange={handleContentChange}
          isVisible={isSettingsPanelOpen}
          onClose={handleCloseSettings}
        />
      )}
    </motion.div>
  );
};

// Exportar componente memoizado
export const BlockContainer = React.memo(MemoizedBlockContainer);

// Mantiene la exportación por defecto para compatibilidad con código existente
export default BlockContainer;