import React, { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, AlertTriangle, FileClock, CheckCircle2 } from 'lucide-react';

interface AutoRecoveryDialogProps {
  localStorageKey: string;
  onRecover: (data: { blocks: any; blockIds: string[] }) => void;
  onDiscard: () => void;
}

/**
 * Componente que muestra un diálogo para recuperar trabajo no guardado
 * 
 * Se muestra automáticamente cuando detecta datos de recuperación en localStorage
 */
export function AutoRecoveryDialog({
  localStorageKey,
  onRecover,
  onDiscard
}: AutoRecoveryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recoveryData, setRecoveryData] = useState<{
    blocks: any;
    blockIds: string[];
    timestamp: number;
  } | null>(null);

  // Comprobar si hay datos para recuperar al montar el componente
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(localStorageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        
        // Verificar que los datos son válidos
        if (parsed && parsed.blocks && parsed.blockIds) {
          setRecoveryData({
            blocks: parsed.blocks,
            blockIds: parsed.blockIds,
            timestamp: Date.now() // Usamos la hora actual como referencia
          });
          setIsOpen(true);
        }
      }
    } catch (error) {
      console.error('Error al recuperar datos de autoguardado', error);
    }
  }, [localStorageKey]);

  // Manejar la recuperación de datos
  const handleRecover = () => {
    if (recoveryData) {
      onRecover({
        blocks: recoveryData.blocks,
        blockIds: recoveryData.blockIds
      });
    }
    setIsOpen(false);
  };

  // Manejar el descarte de datos
  const handleDiscard = () => {
    onDiscard();
    localStorage.removeItem(localStorageKey);
    setIsOpen(false);
  };

  // No renderizar nada si no hay datos para recuperar
  if (!recoveryData) {
    return null;
  }

  // Formatear la fecha de recuperación
  const formattedDate = format(
    recoveryData.timestamp,
    "d 'de' MMMM 'a las' HH:mm",
    { locale: es }
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <FileClock className="h-5 w-5 text-amber-500" />
            <AlertDialogTitle>Recuperar trabajo no guardado</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>
              Se ha detectado contenido de una sesión anterior que no se guardó 
              correctamente. ¿Deseas recuperar este trabajo?
            </p>
            
            <div className="bg-muted p-3 rounded-md text-sm flex items-start gap-2 mt-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p>Fecha de autoguardado: <span className="font-medium">{formattedDate}</span></p>
                <p className="text-xs text-muted-foreground mt-1">
                  Estos datos se recuperaron del almacenamiento local de tu navegador
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel asChild>
            <Button variant="outline" className="gap-2" onClick={handleDiscard}>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Descartar y continuar</span>
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button className="gap-2" onClick={handleRecover}>
              <CheckCircle2 className="h-4 w-4" />
              <span>Recuperar contenido</span>
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}