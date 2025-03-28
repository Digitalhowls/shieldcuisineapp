import { useCallback, useEffect, useState } from 'react';
import { Block } from '../types';
import { 
  ActionType, 
  HistoryService, 
  getHistoryService, 
  initHistoryService 
} from '../history-service';
import { useToast } from '@/hooks/use-toast';

/**
 * Opciones para el hook useEditorHistory
 */
interface UseEditorHistoryOptions {
  initialBlocks?: Record<string, Block>;
  initialBlockIds?: string[];
  maxHistorySize?: number;
  autoSaveInterval?: number;
  enableLocalStorage?: boolean;
  localStorageKey?: string;
  autoSaveNotifications?: boolean;
}

/**
 * Hook personalizado para gestionar el historial de cambios del editor
 * 
 * Proporciona funcionalidades para deshacer, rehacer, y guardar estados
 * del editor, así como funciones para registrar acciones.
 */
export function useEditorHistory({
  initialBlocks = {},
  initialBlockIds = [],
  maxHistorySize = 100,
  autoSaveInterval = 30000,
  enableLocalStorage = true,
  localStorageKey = 'editor_history',
  autoSaveNotifications = false
}: UseEditorHistoryOptions = {}) {
  // Servicios y estado
  const [historyService] = useState<HistoryService>(() => {
    // Intentar recuperar estado de localStorage si está habilitado
    if (enableLocalStorage) {
      try {
        const savedData = localStorage.getItem(localStorageKey);
        if (savedData) {
          const { blocks, blockIds } = JSON.parse(savedData);
          return initHistoryService(blocks, blockIds, { 
            maxHistorySize, 
            autoSaveInterval 
          });
        }
      } catch (error) {
        console.error('Error al recuperar historial del localStorage', error);
      }
    }
    
    // Inicializar con los valores proporcionados
    return initHistoryService(initialBlocks, initialBlockIds, { 
      maxHistorySize, 
      autoSaveInterval 
    });
  });
  
  // Estado de bloques actual
  const [blocks, setBlocks] = useState<Record<string, Block>>(initialBlocks);
  const [blockIds, setBlockIds] = useState<string[]>(initialBlockIds);
  
  // Estado para deshacer/rehacer
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const [undoInfo, setUndoInfo] = useState<{description: string}>({ description: '' });
  const [redoInfo, setRedoInfo] = useState<{description: string}>({ description: '' });
  
  // Toast para notificaciones
  const { toast } = useToast();
  
  // Actualizar estados de deshacer/rehacer
  const updateUndoRedoState = useCallback(() => {
    setCanUndo(historyService.canUndo());
    setCanRedo(historyService.canRedo());
    setUndoInfo(historyService.getUndoInfo());
    setRedoInfo(historyService.getRedoInfo());
  }, [historyService]);
  
  // Funciones para gestionar acciones de historial
  
  /**
   * Registrar una acción en el historial
   */
  const recordAction = useCallback((
    type: ActionType,
    payload: any,
    metadata?: { description: string; undoable: boolean }
  ) => {
    historyService.recordAction({ type, payload, metadata });
    const currentState = historyService.getCurrentState();
    if (currentState) {
      setBlocks(currentState.blocks);
      setBlockIds(currentState.blockIds);
    }
    updateUndoRedoState();
  }, [historyService, updateUndoRedoState]);
  
  /**
   * Deshacer la última acción
   */
  const undo = useCallback(() => {
    if (!historyService.canUndo()) return;
    
    const result = historyService.undo();
    if (result) {
      setBlocks(result.blocks);
      setBlockIds(result.blockIds);
      updateUndoRedoState();
      
      // Mostrar toast de deshacer
      toast({
        title: "Acción deshecha",
        description: historyService.getUndoInfo().description,
        variant: "default",
        duration: 2000,
      });
    }
  }, [historyService, updateUndoRedoState, toast]);
  
  /**
   * Rehacer la última acción deshecha
   */
  const redo = useCallback(() => {
    if (!historyService.canRedo()) return;
    
    const result = historyService.redo();
    if (result) {
      setBlocks(result.blocks);
      setBlockIds(result.blockIds);
      updateUndoRedoState();
      
      // Mostrar toast de rehacer
      toast({
        title: "Acción rehecha",
        description: historyService.getRedoInfo().description,
        variant: "default",
        duration: 2000,
      });
    }
  }, [historyService, updateUndoRedoState, toast]);
  
  // Crear un snapshot manualmente
  const saveSnapshot = useCallback((name: string) => {
    const snapshot = historyService.saveNamedSnapshot(name);
    if (snapshot) {
      toast({
        title: "Estado guardado",
        description: `Se ha guardado el estado: ${name}`,
        variant: "default",
      });
      return snapshot.id;
    }
    return null;
  }, [historyService, toast]);
  
  // Restaurar a un snapshot específico
  const restoreSnapshot = useCallback((snapshotId: string) => {
    const result = historyService.restoreSnapshot(snapshotId);
    if (result) {
      setBlocks(result.blocks);
      setBlockIds(result.blockIds);
      updateUndoRedoState();
      
      toast({
        title: "Estado restaurado",
        description: "Se ha restaurado el estado guardado",
        variant: "default",
      });
      
      return true;
    }
    return false;
  }, [historyService, updateUndoRedoState, toast]);
  
  // Guardar en localStorage si está habilitado
  useEffect(() => {
    if (!enableLocalStorage) return;
    
    // Guardar bloqueos actuales al cambiar
    const saveToLocalStorage = () => {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify({
          blocks,
          blockIds,
        }));
      } catch (error) {
        console.error('Error al guardar el historial en localStorage', error);
      }
    };
    
    saveToLocalStorage();
    
    // Configurar un intervalo para guardar periódicamente
    const intervalId = setInterval(saveToLocalStorage, 5000);
    
    return () => {
      clearInterval(intervalId);
      saveToLocalStorage(); // Guardar al desmontar
    };
  }, [blocks, blockIds, enableLocalStorage, localStorageKey]);
  
  // Configurar listeners de teclas para atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z para deshacer
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      
      // Ctrl+Y o Ctrl+Shift+Z para rehacer
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        redo();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);
  
  // Inicializar estados
  useEffect(() => {
    // Actualizar estado de deshacer/rehacer inicialmente
    updateUndoRedoState();
    
    // Configurar listeners para autosave si las notificaciones están habilitadas
    if (autoSaveNotifications) {
      const handleBeforeUnload = () => {
        historyService.saveNamedSnapshot('Autoguardado al salir');
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [historyService, updateUndoRedoState, autoSaveNotifications]);
  
  /**
   * Función auxiliar para registrar la adición de un bloque
   */
  const recordAddBlock = useCallback((
    block: Block,
    position?: { afterId?: string; beforeId?: string }
  ) => {
    recordAction('ADD_BLOCK', {
      blocks: { [block.id]: block },
      blockId: block.id,
      afterId: position?.afterId,
      beforeId: position?.beforeId,
    }, {
      description: `Añadir bloque de tipo ${block.type}`,
      undoable: true
    });
  }, [recordAction]);
  
  /**
   * Función auxiliar para registrar la actualización de un bloque
   */
  const recordUpdateBlock = useCallback((
    blockId: string,
    updates: Partial<Block>
  ) => {
    recordAction('UPDATE_BLOCK', {
      blockId,
      updates
    }, {
      description: `Actualizar bloque ${blockId.substring(0, 6)}`,
      undoable: true
    });
  }, [recordAction]);
  
  /**
   * Función auxiliar para registrar la eliminación de un bloque
   */
  const recordDeleteBlock = useCallback((blockId: string) => {
    // Guardar el bloque antes de eliminarlo para poder deshacerlo
    const blockToDelete = blocks[blockId];
    if (!blockToDelete) return;
    
    recordAction('DELETE_BLOCK', {
      blockId,
      // Guardar el bloque y su posición para poder restaurarlo
      blocks: { [blockId]: blockToDelete },
      previousIndex: blockIds.indexOf(blockId)
    }, {
      description: `Eliminar bloque ${blockId.substring(0, 6)}`,
      undoable: true
    });
  }, [blocks, blockIds, recordAction]);
  
  /**
   * Función auxiliar para registrar el movimiento de un bloque
   */
  const recordMoveBlock = useCallback((
    blockId: string,
    previousIndex: number,
    newIndex: number
  ) => {
    recordAction('MOVE_BLOCK', {
      blockId,
      previousIndex,
      newIndex
    }, {
      description: `Mover bloque ${blockId.substring(0, 6)}`,
      undoable: true
    });
  }, [recordAction]);
  
  /**
   * Función auxiliar para registrar la duplicación de un bloque
   */
  const recordDuplicateBlock = useCallback((
    originalBlockId: string,
    newBlock: Block
  ) => {
    recordAction('DUPLICATE_BLOCK', {
      blockId: originalBlockId,
      blocks: { [newBlock.id]: newBlock }
    }, {
      description: `Duplicar bloque ${originalBlockId.substring(0, 6)}`,
      undoable: true
    });
  }, [recordAction]);
  
  /**
   * Función auxiliar para registrar la reordenación de bloques
   */
  const recordReorderBlocks = useCallback((newBlockIds: string[]) => {
    recordAction('REORDER_BLOCKS', {
      blockIds: newBlockIds
    }, {
      description: 'Reordenar bloques',
      undoable: true
    });
  }, [recordAction]);
  
  return {
    // Estado actual
    blocks,
    blockIds,
    
    // Funciones de historial básicas
    undo,
    redo,
    canUndo,
    canRedo,
    undoInfo,
    redoInfo,
    
    // Funciones de guardado
    saveSnapshot,
    restoreSnapshot,
    
    // Funciones para registrar acciones específicas
    recordAddBlock,
    recordUpdateBlock,
    recordDeleteBlock,
    recordMoveBlock,
    recordDuplicateBlock,
    recordReorderBlocks,
    
    // Acceso directo al servicio para casos avanzados
    historyService,
  };
}