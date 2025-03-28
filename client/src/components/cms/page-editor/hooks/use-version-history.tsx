import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PageVersion, getPageVersionService } from '../version-history-service';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook personalizado para gestionar el historial de versiones de una página
 */
export function useVersionHistory(pageId: number) {
  const versionService = getPageVersionService();
  const { toast } = useToast();
  
  // Estado para gestionar comparaciones
  const [compareVersions, setCompareVersions] = useState<{
    versionA: string | null;
    versionB: string | null;
  }>({
    versionA: null,
    versionB: null,
  });
  
  // Consulta para obtener el historial de versiones
  const {
    data: versions,
    isLoading: isLoadingVersions,
    error: versionsError,
    refetch: refetchVersions,
  } = useQuery({
    queryKey: [`/api/cms/pages/${pageId}/versions`],
    queryFn: () => versionService.getVersionHistory(pageId),
    enabled: !!pageId,
  });
  
  // Mutación para crear una nueva versión
  const createVersionMutation = useMutation({
    mutationFn: (data: Omit<PageVersion, 'id' | 'versionNumber' | 'createdAt'>) => 
      versionService.createVersion(pageId, data),
    onSuccess: () => {
      toast({
        title: 'Versión creada',
        description: 'Se ha creado una nueva versión de la página',
      });
      refetchVersions();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `No se pudo crear la versión: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Mutación para restaurar una versión
  const restoreVersionMutation = useMutation({
    mutationFn: (versionId: string) => versionService.restoreVersion(pageId, versionId),
    onSuccess: () => {
      toast({
        title: 'Versión restaurada',
        description: 'La página ha sido restaurada a la versión seleccionada',
      });
      refetchVersions();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `No se pudo restaurar la versión: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Consulta para obtener la comparación de versiones
  const {
    data: comparisonResult,
    isLoading: isLoadingComparison,
    error: comparisonError,
  } = useQuery({
    queryKey: [
      `/api/cms/pages/${pageId}/versions/compare`,
      compareVersions.versionA,
      compareVersions.versionB,
    ],
    queryFn: () =>
      versionService.compareVersions(
        pageId,
        compareVersions.versionA as string,
        compareVersions.versionB as string
      ),
    enabled: !!pageId && !!compareVersions.versionA && !!compareVersions.versionB,
  });
  
  // Función para iniciar una comparación de versiones
  const startComparison = (versionIdA: string, versionIdB: string) => {
    setCompareVersions({
      versionA: versionIdA,
      versionB: versionIdB,
    });
  };
  
  // Función para limpiar la comparación actual
  const clearComparison = () => {
    setCompareVersions({
      versionA: null,
      versionB: null,
    });
  };
  
  // Crear una nueva versión
  const createVersion = (data: Omit<PageVersion, 'id' | 'versionNumber' | 'createdAt'>) => {
    createVersionMutation.mutate(data);
  };
  
  // Restaurar una versión
  const restoreVersion = (versionId: string) => {
    restoreVersionMutation.mutate(versionId);
  };
  
  return {
    // Datos
    versions,
    comparisonResult,
    
    // Estados de carga
    isLoadingVersions,
    isLoadingComparison,
    isCreatingVersion: createVersionMutation.isPending,
    isRestoringVersion: restoreVersionMutation.isPending,
    
    // Errores
    versionsError,
    comparisonError,
    
    // Funciones
    createVersion,
    restoreVersion,
    startComparison,
    clearComparison,
    
    // Estado actual de comparación
    compareVersions,
  };
}