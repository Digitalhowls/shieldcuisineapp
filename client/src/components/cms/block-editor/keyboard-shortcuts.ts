/**
 * Sistema de atajos de teclado para el editor de bloques
 * 
 * Este módulo gestiona la detección y ejecución de atajos de teclado
 * para permitir a los usuarios realizar acciones comunes en el editor
 * sin necesidad de utilizar el ratón.
 * 
 * @module KeyboardShortcuts
 * @category CMS
 * @subcategory BlockEditor
 */

import { useCallback, useEffect } from 'react';
import { Block, BlockType } from './types';
import { v4 as uuidv4 } from 'uuid';

export interface PageContent {
  blocks: Block[];
  settings?: {
    layout?: 'full' | 'boxed';
    spacing?: 'tight' | 'normal' | 'loose';
    background?: string;
  };
}

export interface KeyboardShortcutsConfig {
  /** Permite desactivar completamente los atajos de teclado */
  enabled: boolean;
  /** Combinación para guardar cambios (Ej: 'Ctrl+S', 'Meta+S') */
  save: string;
  /** Combinación para previsualizar (Ej: 'Ctrl+P', 'Meta+P') */
  preview: string;
  /** Combinación para añadir un bloque (Ej: 'Alt+A') */
  addBlock: string;
  /** Combinación para eliminar bloque seleccionado (Ej: 'Alt+Delete', 'Alt+Backspace') */
  deleteBlock: string;
  /** Combinación para duplicar bloque seleccionado (Ej: 'Alt+D') */
  duplicateBlock: string;
  /** Combinación para mover bloque hacia arriba (Ej: 'Alt+ArrowUp') */
  moveBlockUp: string;
  /** Combinación para mover bloque hacia abajo (Ej: 'Alt+ArrowDown') */
  moveBlockDown: string;
  /** Atajo para abrir panel de configuración (Ej: 'Alt+S') */
  openSettings: string;
  /** Atajo para deshacer (Ej: 'Ctrl+Z', 'Meta+Z') */
  undo: string;
  /** Atajo para rehacer (Ej: 'Ctrl+Shift+Z', 'Meta+Shift+Z', 'Ctrl+Y') */
  redo: string;
}

/**
 * Configuración predeterminada de atajos de teclado adaptada a múltiples plataformas
 * 
 * Las teclas Meta funcionarán en Mac y las Ctrl en Windows/Linux
 */
export const DEFAULT_SHORTCUTS: KeyboardShortcutsConfig = {
  enabled: true,
  save: 'Meta+S,Ctrl+S',
  preview: 'Meta+P,Ctrl+P',
  addBlock: 'Alt+A',
  deleteBlock: 'Alt+Delete,Alt+Backspace',
  duplicateBlock: 'Alt+D',
  moveBlockUp: 'Alt+ArrowUp',
  moveBlockDown: 'Alt+ArrowDown',
  openSettings: 'Alt+S',
  undo: 'Meta+Z,Ctrl+Z',
  redo: 'Meta+Shift+Z,Ctrl+Shift+Z,Ctrl+Y',
};

/**
 * Parsea una combinación de teclas en sus componentes individuales
 * 
 * @param shortcut Atajo en formato texto (ej: 'Ctrl+S')
 * @returns Objeto con los modificadores y la tecla principal
 */
export function parseShortcut(shortcut: string) {
  const parts = shortcut.split('+');
  const key = parts.pop() || '';
  const modifiers = {
    ctrl: parts.includes('Ctrl'),
    meta: parts.includes('Meta'),
    alt: parts.includes('Alt'),
    shift: parts.includes('Shift'),
  };
  return { modifiers, key };
}

/**
 * Verifica si un evento de teclado coincide con un atajo de teclado
 * 
 * @param event Evento de teclado
 * @param shortcut Atajo a comparar
 * @returns true si el evento coincide con el atajo
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  // Acepta múltiples combinaciones separadas por coma (Ej: 'Meta+S,Ctrl+S')
  return shortcut.split(',').some(combination => {
    const { modifiers, key } = parseShortcut(combination.trim());
    
    // Comparamos los modificadores y la tecla principal
    return (
      (modifiers.ctrl === event.ctrlKey) &&
      (modifiers.meta === event.metaKey) &&
      (modifiers.alt === event.altKey) &&
      (modifiers.shift === event.shiftKey) &&
      (key.toLowerCase() === event.key.toLowerCase() || 
       key === 'Delete' && event.key === 'Delete' || 
       key === 'Backspace' && event.key === 'Backspace' ||
       key === 'ArrowUp' && event.key === 'ArrowUp' ||
       key === 'ArrowDown' && event.key === 'ArrowDown' ||
       key === 'ArrowLeft' && event.key === 'ArrowLeft' ||
       key === 'ArrowRight' && event.key === 'ArrowRight')
    );
  });
}

/**
 * Hook para gestionar atajos de teclado en el editor de bloques
 * 
 * @param config Configuración de atajos
 * @param actions Acciones a ejecutar para cada atajo
 * @returns Función para manejar eventos de teclado
 */
export function useKeyboardShortcuts({
  content,
  activeBlockId,
  actions,
  config = DEFAULT_SHORTCUTS,
}: {
  content: PageContent;
  activeBlockId: string | null;
  actions: {
    onSave?: () => void;
    onPreview?: () => void;
    addBlock: (type: BlockType, index?: number) => void;
    updateContent: (newContent: PageContent) => void;
    setActiveBlockId: (id: string | null) => void;
    undo?: () => void;
    redo?: () => void;
  };
  config?: KeyboardShortcutsConfig;
}) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Si los atajos están desactivados o el foco está en un campo de entrada, no hacemos nada
    if (
      !config.enabled ||
      (event.target instanceof HTMLInputElement) ||
      (event.target instanceof HTMLTextAreaElement) ||
      (event.target instanceof HTMLSelectElement) ||
      (document.activeElement?.getAttribute('contenteditable') === 'true')
    ) {
      return;
    }

    // Evitar las combinaciones de teclas del navegador
    if (
      (event.metaKey || event.ctrlKey) && 
      ['s', 'p'].includes(event.key.toLowerCase())
    ) {
      event.preventDefault();
    }

    // Guardar
    if (matchesShortcut(event, config.save) && actions.onSave) {
      event.preventDefault();
      actions.onSave();
      return;
    }

    // Previsualizar
    if (matchesShortcut(event, config.preview) && actions.onPreview) {
      event.preventDefault();
      actions.onPreview();
      return;
    }

    // Añadir bloque de párrafo
    if (matchesShortcut(event, config.addBlock)) {
      event.preventDefault();
      const activeIndex = content.blocks.findIndex((b: Block) => b.id === activeBlockId);
      actions.addBlock('paragraph', activeIndex !== -1 ? activeIndex + 1 : undefined);
      return;
    }

    // Las siguientes acciones requieren un bloque activo
    if (!activeBlockId) return;

    // Eliminar bloque
    if (matchesShortcut(event, config.deleteBlock)) {
      event.preventDefault();
      const newBlocks = content.blocks.filter((b: Block) => b.id !== activeBlockId);
      actions.updateContent({ ...content, blocks: newBlocks });
      actions.setActiveBlockId(null);
      return;
    }

    // Duplicar bloque
    if (matchesShortcut(event, config.duplicateBlock)) {
      event.preventDefault();
      const activeIndex = content.blocks.findIndex((b: Block) => b.id === activeBlockId);
      if (activeIndex !== -1) {
        const activeBlock = content.blocks[activeIndex];
        const duplicatedBlock: Block = {
          ...activeBlock,
          id: uuidv4(),
        };
        const newBlocks = [...content.blocks];
        newBlocks.splice(activeIndex + 1, 0, duplicatedBlock);
        actions.updateContent({ ...content, blocks: newBlocks });
        // Seleccionar el bloque duplicado
        actions.setActiveBlockId(duplicatedBlock.id);
      }
      return;
    }

    // Mover bloque hacia arriba
    if (matchesShortcut(event, config.moveBlockUp)) {
      event.preventDefault();
      const activeIndex = content.blocks.findIndex((b: Block) => b.id === activeBlockId);
      if (activeIndex > 0) {
        const newBlocks = [...content.blocks];
        const temp = newBlocks[activeIndex];
        newBlocks[activeIndex] = newBlocks[activeIndex - 1];
        newBlocks[activeIndex - 1] = temp;
        actions.updateContent({ ...content, blocks: newBlocks });
      }
      return;
    }

    // Mover bloque hacia abajo
    if (matchesShortcut(event, config.moveBlockDown)) {
      event.preventDefault();
      const activeIndex = content.blocks.findIndex((b: Block) => b.id === activeBlockId);
      if (activeIndex < content.blocks.length - 1) {
        const newBlocks = [...content.blocks];
        const temp = newBlocks[activeIndex];
        newBlocks[activeIndex] = newBlocks[activeIndex + 1];
        newBlocks[activeIndex + 1] = temp;
        actions.updateContent({ ...content, blocks: newBlocks });
      }
      return;
    }
    
    // Deshacer
    if (matchesShortcut(event, config.undo) && actions.undo) {
      event.preventDefault();
      actions.undo();
      return;
    }
    
    // Rehacer
    if (matchesShortcut(event, config.redo) && actions.redo) {
      event.preventDefault();
      actions.redo();
      return;
    }
  }, [config, content, activeBlockId, actions]);

  useEffect(() => {
    // Registrar el manejador de eventos al montar el componente
    document.addEventListener('keydown', handleKeyDown);
    
    // Limpiar al desmontar
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return handleKeyDown;
}