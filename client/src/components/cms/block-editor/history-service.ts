import { Block } from './types';

/**
 * Servicio de historial para el editor de bloques
 * 
 * Gestiona el registro y acceso a acciones pasadas, permitiendo
 * funcionalidades como deshacer, rehacer, y recuperación automática.
 */

// Tipos de acciones que pueden ser registradas en el historial
export type ActionType = 
  | 'ADD_BLOCK'
  | 'UPDATE_BLOCK'
  | 'DELETE_BLOCK'
  | 'MOVE_BLOCK'
  | 'DUPLICATE_BLOCK'
  | 'REORDER_BLOCKS';

/**
 * Una acción que puede ser registrada en el historial
 */
export interface HistoryAction {
  id: string;
  timestamp: number;
  type: ActionType;
  payload: {
    blocks?: Record<string, Block>;
    blockIds?: string[];
    blockId?: string;
    updates?: Partial<Block>;
    previousIndex?: number;
    newIndex?: number;
    beforeId?: string;
    afterId?: string;
  };
  metadata?: {
    description: string;
    undoable: boolean;
  };
}

/**
 * Estado completo del editor en un momento dado
 */
export interface EditorSnapshot {
  id: string;
  timestamp: number;
  blocks: Record<string, Block>;
  blockIds: string[];
  actionId: string;
  metadata?: {
    description: string;
    autoSaved: boolean;
  };
}

// Variable global singleton para el servicio
let historyServiceInstance: HistoryService | null = null;

/**
 * Clase que implementa el servicio de historial
 */
export class HistoryService {
  private actions: HistoryAction[] = [];
  private snapshots: EditorSnapshot[] = [];
  private currentActionIndex: number = -1;
  private maxHistorySize: number = 100;
  private autoSaveInterval: number = 30000; // 30 segundos
  private autoSaveTimerId: number | null = null;
  private snapshotIntervalActions: number = 10; // Guardar snapshot cada 10 acciones
  private initialBlocks: Record<string, Block>;
  private initialBlockIds: string[];

  constructor(
    initialBlocks: Record<string, Block> = {},
    initialBlockIds: string[] = [],
    options: {
      maxHistorySize?: number;
      autoSaveInterval?: number;
      snapshotIntervalActions?: number;
    } = {}
  ) {
    this.initialBlocks = { ...initialBlocks };
    this.initialBlockIds = [...initialBlockIds];
    
    if (options.maxHistorySize) {
      this.maxHistorySize = options.maxHistorySize;
    }
    
    if (options.autoSaveInterval) {
      this.autoSaveInterval = options.autoSaveInterval;
    }
    
    if (options.snapshotIntervalActions) {
      this.snapshotIntervalActions = options.snapshotIntervalActions;
    }
    
    // Crear snapshot inicial
    this.createSnapshot(initialBlocks, initialBlockIds, 'Estado inicial', true);
    
    // Iniciar autoguardado si hay intervalo definido
    if (this.autoSaveInterval > 0) {
      this.startAutoSave();
    }
  }

  /**
   * Registra una nueva acción en el historial
   * @param action Acción a registrar
   */
  public recordAction(action: Omit<HistoryAction, 'id' | 'timestamp'>): string {
    // Si estamos en un punto anterior al final del historial,
    // eliminar todas las acciones futuras
    if (this.currentActionIndex < this.actions.length - 1) {
      this.actions = this.actions.slice(0, this.currentActionIndex + 1);
    }
    
    // Generar nueva acción con ID y timestamp
    const newAction: HistoryAction = {
      id: this.generateId(),
      timestamp: Date.now(),
      ...action,
      metadata: {
        description: action.metadata?.description || 
          this.getDefaultActionDescription({
            id: '',
            timestamp: 0,
            ...action
          }),
        undoable: action.metadata?.undoable !== false
      }
    };
    
    // Agregar la nueva acción y actualizar el índice
    this.actions.push(newAction);
    this.currentActionIndex = this.actions.length - 1;
    
    // Limitar el tamaño del historial
    this.pruneHistory();
    
    // Crear un snapshot cada cierto número de acciones
    if (this.actions.length % this.snapshotIntervalActions === 0) {
      const currentState = this.getCurrentState();
      if (currentState) {
        this.createSnapshot(
          currentState.blocks,
          currentState.blockIds,
          `Autoguardado periódico`,
          true
        );
      }
    }
    
    return newAction.id;
  }

  /**
   * Obtener el estado actual tras aplicar todas las acciones
   */
  public getCurrentState(): { blocks: Record<string, Block>; blockIds: string[] } | null {
    // Si no hay acciones, devolver el estado inicial
    if (this.actions.length === 0) {
      return {
        blocks: { ...this.initialBlocks },
        blockIds: [...this.initialBlockIds]
      };
    }
    
    // Empezar con el estado inicial
    let blocks = { ...this.initialBlocks };
    let blockIds = [...this.initialBlockIds];
    
    // Aplicar todas las acciones hasta el índice actual
    for (let i = 0; i <= this.currentActionIndex; i++) {
      const result = this.applyAction(this.actions[i], blocks, blockIds);
      blocks = result.blocks;
      blockIds = result.blockIds;
    }
    
    return { blocks, blockIds };
  }

  /**
   * Deshacer la última acción
   */
  public undo(): { blocks: Record<string, Block>; blockIds: string[] } | null {
    if (!this.canUndo()) {
      return null;
    }
    
    // Retroceder un paso en el historial
    this.currentActionIndex--;
    
    return this.getCurrentState();
  }

  /**
   * Rehacer la última acción deshecha
   */
  public redo(): { blocks: Record<string, Block>; blockIds: string[] } | null {
    if (!this.canRedo()) {
      return null;
    }
    
    // Avanzar un paso en el historial
    this.currentActionIndex++;
    
    return this.getCurrentState();
  }

  /**
   * Verificar si se puede deshacer
   */
  public canUndo(): boolean {
    return this.currentActionIndex >= 0;
  }

  /**
   * Verificar si se puede rehacer
   */
  public canRedo(): boolean {
    return this.currentActionIndex < this.actions.length - 1;
  }

  /**
   * Obtener información sobre la acción de deshacer actual
   */
  public getUndoInfo(): { description: string; available: boolean } {
    if (!this.canUndo()) {
      return { description: "No hay acciones para deshacer", available: false };
    }
    
    const action = this.actions[this.currentActionIndex];
    return {
      description: action.metadata?.description || "Deshacer acción",
      available: true
    };
  }

  /**
   * Obtener información sobre la acción de rehacer actual
   */
  public getRedoInfo(): { description: string; available: boolean } {
    if (!this.canRedo()) {
      return { description: "No hay acciones para rehacer", available: false };
    }
    
    const action = this.actions[this.currentActionIndex + 1];
    return {
      description: action.metadata?.description || "Rehacer acción",
      available: true
    };
  }

  /**
   * Crear un snapshot (estado completo) del editor
   */
  private createSnapshot(
    blocks: Record<string, Block>,
    blockIds: string[],
    description: string = "Estado guardado",
    autoSaved: boolean = false
  ): EditorSnapshot {
    const currentActionId = this.actions.length > 0 
      ? this.actions[this.currentActionIndex]?.id 
      : 'initial';
    
    const snapshot: EditorSnapshot = {
      id: this.generateId(),
      timestamp: Date.now(),
      blocks: { ...blocks },
      blockIds: [...blockIds],
      actionId: currentActionId,
      metadata: {
        description,
        autoSaved
      }
    };
    
    this.snapshots.push(snapshot);
    
    // Limitar el número de snapshots (conservar el doble que acciones)
    if (this.snapshots.length > this.maxHistorySize * 2) {
      // Mantener siempre el primer snapshot (inicial)
      const firstSnapshot = this.snapshots[0];
      
      // Organizar por timestamp y conservar los más recientes
      this.snapshots = [
        firstSnapshot,
        ...this.snapshots
          .slice(1)
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, this.maxHistorySize)
      ];
    }
    
    return snapshot;
  }

  /**
   * Iniciar el autoguardado periódico
   */
  private startAutoSave(): void {
    // Asegurarse de que no haya un autoguardado ya en marcha
    if (this.autoSaveTimerId !== null) {
      clearInterval(this.autoSaveTimerId);
    }
    
    // Configurar intervalo de autoguardado
    this.autoSaveTimerId = window.setInterval(() => {
      const currentState = this.getCurrentState();
      if (currentState) {
        this.createSnapshot(
          currentState.blocks,
          currentState.blockIds,
          `Autoguardado (${new Date().toLocaleTimeString()})`,
          true
        );
      }
    }, this.autoSaveInterval);
  }

  /**
   * Detener el autoguardado
   */
  public stopAutoSave(): void {
    if (this.autoSaveTimerId !== null) {
      clearInterval(this.autoSaveTimerId);
      this.autoSaveTimerId = null;
    }
  }

  /**
   * Limitar el tamaño del historial
   */
  private pruneHistory(): void {
    if (this.actions.length > this.maxHistorySize) {
      // Calcular cuántas acciones eliminar
      const toRemove = this.actions.length - this.maxHistorySize;
      
      // Eliminar desde el principio (las más antiguas)
      this.actions = this.actions.slice(toRemove);
      
      // Ajustar el índice actual
      this.currentActionIndex = Math.max(0, this.currentActionIndex - toRemove);
    }
  }

  /**
   * Aplicar una acción para modificar el estado
   */
  private applyAction(
    action: HistoryAction,
    currentBlocks: Record<string, Block>,
    currentBlockIds: string[]
  ): { blocks: Record<string, Block>; blockIds: string[] } {
    // Crear copias para no mutar el original
    const blocks = { ...currentBlocks };
    let blockIds = [...currentBlockIds];
    
    switch (action.type) {
      case 'ADD_BLOCK': {
        // Añadir un nuevo bloque
        if (action.payload.blocks) {
          const newBlockId = Object.keys(action.payload.blocks)[0];
          Object.assign(blocks, action.payload.blocks);
          
          // Determinar posición del nuevo bloque
          if (action.payload.afterId) {
            const afterIndex = blockIds.indexOf(action.payload.afterId);
            if (afterIndex >= 0) {
              blockIds.splice(afterIndex + 1, 0, newBlockId);
            } else {
              blockIds.push(newBlockId);
            }
          } else if (action.payload.beforeId) {
            const beforeIndex = blockIds.indexOf(action.payload.beforeId);
            if (beforeIndex >= 0) {
              blockIds.splice(beforeIndex, 0, newBlockId);
            } else {
              blockIds.unshift(newBlockId);
            }
          } else {
            blockIds.push(newBlockId);
          }
        }
        break;
      }
      
      case 'UPDATE_BLOCK': {
        // Actualizar un bloque existente
        const { blockId, updates } = action.payload;
        if (blockId && updates && blocks[blockId]) {
          blocks[blockId] = {
            ...blocks[blockId],
            ...updates
          };
        }
        break;
      }
      
      case 'DELETE_BLOCK': {
        // Eliminar un bloque
        const { blockId } = action.payload;
        if (blockId && blocks[blockId]) {
          const { [blockId]: deletedBlock, ...remainingBlocks } = blocks;
          blockIds = blockIds.filter(id => id !== blockId);
          return { blocks: remainingBlocks, blockIds };
        }
        break;
      }
      
      case 'MOVE_BLOCK': {
        // Mover un bloque a otra posición
        const { blockId, previousIndex, newIndex } = action.payload;
        if (
          blockId && 
          typeof previousIndex === 'number' && 
          typeof newIndex === 'number' && 
          blocks[blockId]
        ) {
          // Asegurarse de que los índices sean válidos
          if (
            previousIndex >= 0 && 
            previousIndex < blockIds.length && 
            newIndex >= 0 && 
            newIndex <= blockIds.length
          ) {
            // Eliminar el bloque de su posición actual
            blockIds.splice(previousIndex, 1);
            // Insertarlo en la nueva posición
            blockIds.splice(newIndex, 0, blockId);
          }
        }
        break;
      }
      
      case 'DUPLICATE_BLOCK': {
        // Duplicar un bloque
        const { blockId } = action.payload;
        if (
          blockId && 
          blocks[blockId] && 
          action.payload.blocks
        ) {
          // Obtener ID del nuevo bloque duplicado
          const newBlockId = Object.keys(action.payload.blocks)[0];
          
          // Añadir el nuevo bloque
          Object.assign(blocks, action.payload.blocks);
          
          // Insertar después del bloque original
          const originalIndex = blockIds.indexOf(blockId);
          if (originalIndex >= 0) {
            blockIds.splice(originalIndex + 1, 0, newBlockId);
          } else {
            blockIds.push(newBlockId);
          }
        }
        break;
      }
      
      case 'REORDER_BLOCKS': {
        // Reordenar la lista completa de bloques
        if (action.payload.blockIds) {
          blockIds = [...action.payload.blockIds];
        }
        break;
      }
    }
    
    return { blocks, blockIds };
  }

  /**
   * Obtener una descripción predeterminada para una acción
   */
  private getDefaultActionDescription(action: HistoryAction): string {
    switch (action.type) {
      case 'ADD_BLOCK':
        return 'Añadir bloque';
      case 'UPDATE_BLOCK':
        return 'Actualizar bloque';
      case 'DELETE_BLOCK':
        return 'Eliminar bloque';
      case 'MOVE_BLOCK':
        return 'Mover bloque';
      case 'DUPLICATE_BLOCK':
        return 'Duplicar bloque';
      case 'REORDER_BLOCKS':
        return 'Reordenar bloques';
      default:
        return 'Acción';
    }
  }

  /**
   * Generar un ID único para acciones y snapshots
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtener el historial completo de acciones
   */
  public getActionHistory(): HistoryAction[] {
    return [...this.actions];
  }

  /**
   * Obtener todos los snapshots guardados
   */
  public getSnapshots(): EditorSnapshot[] {
    return [...this.snapshots].sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Guardar el estado actual como un snapshot etiquetado
   */
  public saveNamedSnapshot(name: string): EditorSnapshot | null {
    const currentState = this.getCurrentState();
    if (!currentState) return null;
    
    const snapshot: EditorSnapshot = this.createSnapshot(
      currentState.blocks,
      currentState.blockIds,
      name,
      false
    );
    
    return snapshot;
  }

  /**
   * Restaurar a un snapshot específico
   */
  public restoreSnapshot(snapshotId: string): { blocks: Record<string, Block>; blockIds: string[] } | null {
    const snapshot = this.snapshots.find(s => s.id === snapshotId);
    if (!snapshot) return null;
    
    // Buscar el índice de la acción asociada al snapshot
    const actionIndex = this.actions.findIndex(a => a.id === snapshot.actionId);
    
    if (actionIndex >= 0) {
      // Si encontramos la acción, restaurar a ese punto
      this.currentActionIndex = actionIndex;
      return this.getCurrentState();
    } else {
      // Si no encontramos la acción (ej. snapshot inicial o muy antiguo)
      // restaurar directamente desde el snapshot
      return {
        blocks: { ...snapshot.blocks },
        blockIds: [...snapshot.blockIds]
      };
    }
  }

  /**
   * Limpiar el historial y los snapshots
   */
  public clear(): void {
    this.actions = [];
    this.snapshots = [];
    this.currentActionIndex = -1;
    
    // Crear un nuevo snapshot inicial
    this.createSnapshot(this.initialBlocks, this.initialBlockIds, 'Estado inicial', true);
  }
}

/**
 * Obtener la instancia del servicio de historial
 */
export function getHistoryService(): HistoryService {
  if (!historyServiceInstance) {
    historyServiceInstance = new HistoryService();
  }
  return historyServiceInstance;
}

/**
 * Inicializar el servicio de historial con un estado inicial
 */
export function initHistoryService(
  initialBlocks: Record<string, Block> = {},
  initialBlockIds: string[] = [],
  options: {
    maxHistorySize?: number;
    autoSaveInterval?: number;
    snapshotIntervalActions?: number;
  } = {}
): HistoryService {
  // Destruir instancia anterior si existe
  if (historyServiceInstance) {
    historyServiceInstance.stopAutoSave();
  }
  
  // Crear nueva instancia
  historyServiceInstance = new HistoryService(
    initialBlocks,
    initialBlockIds,
    options
  );
  
  return historyServiceInstance;
}