import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { History, Clock, RotateCcw, ArrowLeftRight, Eye, Check, AlertTriangle } from 'lucide-react';
import { useVersionHistory } from './hooks/use-version-history';
import { PageVersion } from './version-history-service';

interface VersionHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: number;
  currentContent: string;
  currentTitle: string;
  currentStatus: 'draft' | 'published' | 'archived' | 'scheduled';
  onVersionRestore: (version: PageVersion) => void;
}

const VersionHistoryDialog: React.FC<VersionHistoryDialogProps> = ({
  isOpen,
  onClose,
  pageId,
  currentContent,
  currentTitle,
  currentStatus,
  onVersionRestore,
}) => {
  const [activeTab, setActiveTab] = useState('history');
  const [showRestoreAlert, setShowRestoreAlert] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<PageVersion | null>(null);
  const [createVersionData, setCreateVersionData] = useState({
    description: '',
  });
  
  // Hook para gestionar el historial de versiones
  const {
    versions,
    isLoadingVersions,
    isCreatingVersion,
    isRestoringVersion,
    createVersion,
    restoreVersion,
    startComparison,
    clearComparison,
    compareVersions,
    comparisonResult,
    isLoadingComparison,
  } = useVersionHistory(pageId);
  
  // Formatear fecha
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };
  
  // Crear una nueva versión manualmente
  const handleCreateVersion = () => {
    createVersion({
      pageId,
      content: currentContent,
      title: currentTitle,
      changeDescription: createVersionData.description,
      isSnapshot: false,
      status: currentStatus,
    });
    
    setCreateVersionData({
      description: '',
    });
  };
  
  // Confirmar restauración de versión
  const confirmRestore = (version: PageVersion) => {
    setVersionToRestore(version);
    setShowRestoreAlert(true);
  };
  
  // Ejecutar restauración
  const executeRestore = () => {
    if (versionToRestore) {
      restoreVersion(versionToRestore.id);
      onVersionRestore(versionToRestore);
      setShowRestoreAlert(false);
    }
  };
  
  // Cerrar alerta sin restaurar
  const cancelRestore = () => {
    setShowRestoreAlert(false);
    setVersionToRestore(null);
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de versiones
            </DialogTitle>
            <DialogDescription>
              Visualiza, compara y restaura versiones anteriores de esta página.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Historial</span>
              </TabsTrigger>
              <TabsTrigger value="compare" className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                <span>Comparar versiones</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="history" className="flex-1 flex flex-col">
              <div className="mb-4 bg-muted/30 p-4 rounded-md border">
                <h3 className="text-sm font-medium mb-2">Crear nueva versión</h3>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Descripción de los cambios (opcional)"
                      value={createVersionData.description}
                      onChange={(e) => setCreateVersionData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <Button 
                    onClick={handleCreateVersion} 
                    disabled={isCreatingVersion}
                    className="whitespace-nowrap"
                  >
                    Guardar versión
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="flex-1 border rounded-md">
                {isLoadingVersions ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !versions || versions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <h3 className="font-medium text-lg mb-1">Sin historial</h3>
                    <p>
                      No hay versiones guardadas para esta página.
                      <br />
                      Crea una nueva versión para comenzar a registrar cambios.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableCaption>Historial completo de versiones</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Versión</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {versions.map((version) => (
                        <TableRow key={version.id}>
                          <TableCell className="font-medium">
                            v{version.versionNumber}
                            {version.isSnapshot && (
                              <span className="ml-2 text-xs text-muted-foreground">(auto)</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{formatDate(version.createdAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                version.status === "published"
                                  ? "default"
                                  : version.status === "draft"
                                  ? "outline"
                                  : "secondary"
                              }
                            >
                              {version.status === "published" ? "Publicada" : 
                               version.status === "draft" ? "Borrador" : 
                               version.status === "scheduled" ? "Programada" : "Archivada"}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {version.changeDescription || "Sin descripción"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Ver versión"
                                onClick={() => {
                                  startComparison(version.id, versions[0].id);
                                  setActiveTab('compare');
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Restaurar versión"
                                onClick={() => confirmRestore(version)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="compare" className="flex-1 flex flex-col space-y-4">
              {isLoadingComparison ? (
                <div className="flex-1 flex items-center justify-center">
                  <Skeleton className="h-[400px] w-full" />
                </div>
              ) : !compareVersions.versionA || !compareVersions.versionB ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-8">
                    <ArrowLeftRight className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <h3 className="font-medium text-lg mb-1">
                      Selecciona versiones para comparar
                    </h3>
                    <p className="text-muted-foreground">
                      Utiliza la pestaña "Historial" para seleccionar versiones a comparar.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Versión A */}
                  <Card className="flex flex-col h-full">
                    <div className="bg-muted p-3 rounded-t-md flex items-center gap-2">
                      <h3 className="font-medium">
                        Versión {comparisonResult?.versionA?.versionNumber || '?'}
                      </h3>
                      {comparisonResult?.versionA?.createdAt && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatDate(comparisonResult.versionA.createdAt)}
                        </span>
                      )}
                    </div>
                    <CardContent className="p-0 flex-1 overflow-auto">
                      <ScrollArea className="h-full">
                        <div className="p-4">
                          <h2 className="text-xl font-bold mb-4">
                            {comparisonResult?.versionA?.title || 'Sin título'}
                          </h2>
                          <div 
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: comparisonResult?.versionA?.contentHtml || 'Sin contenido' 
                            }}
                          />
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                  
                  {/* Versión B */}
                  <Card className="flex flex-col h-full">
                    <div className="bg-muted p-3 rounded-t-md flex items-center gap-2">
                      <h3 className="font-medium">
                        Versión {comparisonResult?.versionB?.versionNumber || '?'}
                      </h3>
                      {comparisonResult?.versionB?.createdAt && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatDate(comparisonResult.versionB.createdAt)}
                        </span>
                      )}
                    </div>
                    <CardContent className="p-0 flex-1 overflow-auto">
                      <ScrollArea className="h-full">
                        <div className="p-4">
                          <h2 className="text-xl font-bold mb-4">
                            {comparisonResult?.versionB?.title || 'Sin título'}
                          </h2>
                          <div 
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: comparisonResult?.versionB?.contentHtml || 'Sin contenido' 
                            }}
                          />
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                  
                  {/* Resumen de diferencias */}
                  {comparisonResult?.differences && (
                    <div className="col-span-1 md:col-span-2 bg-muted/30 p-4 rounded-md border">
                      <h3 className="font-medium mb-2">Resumen de cambios</h3>
                      <ul className="space-y-1 text-sm">
                        {comparisonResult.differences.map((diff, index) => (
                          <li key={index} className="flex items-start gap-2">
                            {diff.type === 'added' ? (
                              <Badge variant="default" className="mt-0.5">Añadido</Badge>
                            ) : diff.type === 'removed' ? (
                              <Badge variant="destructive" className="mt-0.5">Eliminado</Badge>
                            ) : (
                              <Badge variant="outline" className="mt-0.5">Modificado</Badge>
                            )}
                            <span>{diff.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Alerta de confirmación para restaurar versión */}
      <AlertDialog open={showRestoreAlert} onOpenChange={setShowRestoreAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirmar restauración
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas restaurar la versión {versionToRestore?.versionNumber}?
              Esta acción reemplazará el contenido actual de la página.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRestore}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeRestore}
              disabled={isRestoringVersion}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Restaurar versión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VersionHistoryDialog;