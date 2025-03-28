import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
import { EditorSnapshot, HistoryService } from './history-service';
import { History, Save, RotateCcw, Clock, FileCheck } from 'lucide-react';

interface HistoryManagerProps {
  historyService: HistoryService;
  onRestoreSnapshot: (snapshotId: string) => void;
  onSaveSnapshot: (name: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

/**
 * Componente para gestionar el historial y los snapshots del editor
 */
export function HistoryManager({
  historyService,
  onRestoreSnapshot,
  onSaveSnapshot,
  canUndo,
  canRedo,
  onUndo,
  onRedo
}: HistoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [newSnapshotName, setNewSnapshotName] = useState('');
  const [snapshots, setSnapshots] = useState<EditorSnapshot[]>([]);
  const { toast } = useToast();

  // Cargar snapshots cuando se abre el diálogo
  useEffect(() => {
    if (isOpen) {
      const allSnapshots = historyService.getSnapshots();
      setSnapshots(allSnapshots);
    }
  }, [isOpen, historyService]);
  
  // Funciones para gestionar snapshots
  
  /**
   * Maneja la creación de un nuevo snapshot
   */
  const handleSaveSnapshot = () => {
    if (!newSnapshotName.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor, introduce un nombre para el estado",
        variant: "destructive",
      });
      return;
    }
    
    onSaveSnapshot(newSnapshotName.trim());
    setNewSnapshotName('');
    
    // Actualizar la lista de snapshots
    const updatedSnapshots = historyService.getSnapshots();
    setSnapshots(updatedSnapshots);
  };
  
  /**
   * Prepara la restauración de un snapshot (muestra confirmación)
   */
  const prepareRestore = (snapshotId: string) => {
    setSelectedSnapshotId(snapshotId);
    setIsConfirmOpen(true);
  };
  
  /**
   * Ejecuta la restauración del snapshot seleccionado
   */
  const executeRestore = () => {
    if (selectedSnapshotId) {
      onRestoreSnapshot(selectedSnapshotId);
      setIsOpen(false); // Cerrar el diálogo tras restaurar
    }
    setIsConfirmOpen(false);
  };
  
  /**
   * Formatea una fecha timestamp para mostrarla
   */
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2"
            size="sm" 
          >
            <History className="h-4 w-4" />
            <span>Historial</span>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Historial y puntos de guardado</DialogTitle>
            <DialogDescription>
              Gestiona los estados guardados de tu diseño y restaura versiones anteriores.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-3 mb-4">
            <Button
              variant="outline"
              onClick={onUndo}
              disabled={!canUndo}
              className="gap-2"
              size="sm"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Deshacer</span>
            </Button>
            <Button
              variant="outline"
              onClick={onRedo}
              disabled={!canRedo}
              className="gap-2"
              size="sm"
            >
              <RotateCcw className="h-4 w-4 rotate-180" />
              <span>Rehacer</span>
            </Button>
          </div>
          
          <div className="grid gap-4">
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input
                placeholder="Nombre del punto de guardado"
                value={newSnapshotName}
                onChange={(e) => setNewSnapshotName(e.target.value)}
              />
              <Button onClick={handleSaveSnapshot} className="gap-2">
                <Save className="h-4 w-4" />
                <span>Guardar estado</span>
              </Button>
            </div>
            
            <div className="border rounded-md">
              <Table>
                <TableCaption>Lista de estados guardados</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshots.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No hay estados guardados disponibles.
                      </TableCell>
                    </TableRow>
                  ) : (
                    snapshots.map((snapshot) => (
                      <TableRow key={snapshot.id}>
                        <TableCell className="font-medium">
                          {snapshot.metadata?.description || 'Sin nombre'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{formatTimestamp(snapshot.timestamp)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {snapshot.metadata?.autoSaved ? (
                            <Badge variant="outline" className="bg-blue-50">Automático</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50">Manual</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => prepareRestore(snapshot.id)}
                            className="gap-2"
                          >
                            <FileCheck className="h-4 w-4" />
                            <span>Restaurar</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar restauración</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas restaurar este estado guardado? 
              Los cambios no guardados se perderán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeRestore}>
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}