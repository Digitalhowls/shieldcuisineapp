/**
 * Servicio de historial de versiones para páginas del CMS
 * 
 * Este servicio gestiona el seguimiento y control de versiones de páginas,
 * permitiendo visualizar, comparar y restaurar versiones anteriores.
 */

import { queryClient } from '@/lib/queryClient';

// Tipo para representar una versión de página
export interface PageVersion {
  id: string;
  pageId: number;
  versionNumber: number;
  createdAt: string;
  content: string;
  title: string;
  description?: string;
  author?: string;
  changeDescription?: string;
  isSnapshot: boolean; // Indica si es una versión completa o un snapshot automático
  status: 'draft' | 'published' | 'archived' | 'scheduled';
}

// Tipos de acción del servicio de versiones
export type VersionActionType = 
  | 'CREATE_VERSION'
  | 'RESTORE_VERSION'
  | 'DELETE_VERSION'
  | 'COMPARE_VERSIONS';

// Interfaz de servicio de versiones
export class PageVersionHistoryService {
  private static instance: PageVersionHistoryService;
  
  private constructor() {
    // Constructor privado para patrón singleton
  }
  
  // Obtener la instancia del servicio (patrón singleton)
  public static getInstance(): PageVersionHistoryService {
    if (!PageVersionHistoryService.instance) {
      PageVersionHistoryService.instance = new PageVersionHistoryService();
    }
    return PageVersionHistoryService.instance;
  }
  
  /**
   * Crea una nueva versión para una página
   */
  public async createVersion(pageId: number, data: Omit<PageVersion, 'id' | 'versionNumber' | 'createdAt'>): Promise<PageVersion> {
    try {
      const response = await fetch(`/api/cms/pages/${pageId}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Error al crear versión');
      }
      
      const version = await response.json();
      
      // Invalidar consultas relacionadas
      this.invalidateRelatedQueries(pageId);
      
      return version;
    } catch (error) {
      console.error('Error al crear versión:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene el historial de versiones de una página
   */
  public async getVersionHistory(pageId: number): Promise<PageVersion[]> {
    try {
      const response = await fetch(`/api/cms/pages/${pageId}/versions`);
      
      if (!response.ok) {
        throw new Error('Error al obtener historial de versiones');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener historial de versiones:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene una versión específica
   */
  public async getVersion(pageId: number, versionId: string): Promise<PageVersion> {
    try {
      const response = await fetch(`/api/cms/pages/${pageId}/versions/${versionId}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener versión');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener versión:', error);
      throw error;
    }
  }
  
  /**
   * Restaura una versión anterior como la versión actual
   */
  public async restoreVersion(pageId: number, versionId: string): Promise<void> {
    try {
      const response = await fetch(`/api/cms/pages/${pageId}/versions/${versionId}/restore`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Error al restaurar versión');
      }
      
      // Invalidar consultas relacionadas
      this.invalidateRelatedQueries(pageId);
    } catch (error) {
      console.error('Error al restaurar versión:', error);
      throw error;
    }
  }
  
  /**
   * Compara dos versiones y devuelve las diferencias
   */
  public async compareVersions(pageId: number, versionId1: string, versionId2: string): Promise<any> {
    try {
      const response = await fetch(`/api/cms/pages/${pageId}/versions/compare?v1=${versionId1}&v2=${versionId2}`);
      
      if (!response.ok) {
        throw new Error('Error al comparar versiones');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al comparar versiones:', error);
      throw error;
    }
  }
  
  /**
   * Invalidar consultas relacionadas para actualizar la UI
   */
  private invalidateRelatedQueries(pageId: number): void {
    queryClient.invalidateQueries({ queryKey: [`/api/cms/pages/${pageId}`] });
    queryClient.invalidateQueries({ queryKey: [`/api/cms/pages/${pageId}/versions`] });
  }
}

// Exportar una función para obtener la instancia del servicio
export function getPageVersionService(): PageVersionHistoryService {
  return PageVersionHistoryService.getInstance();
}