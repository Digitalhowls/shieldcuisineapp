import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DEFAULT_SHORTCUTS } from './keyboard-shortcuts';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Obtiene una representación legible del atajo de teclado
 */
function formatShortcut(shortcut: string): string {
  return shortcut
    .replace('Meta', '⌘')
    .replace('Ctrl', 'Ctrl')
    .replace('Alt', 'Alt')
    .replace('Shift', 'Shift')
    .replace('ArrowUp', '↑')
    .replace('ArrowDown', '↓')
    .replace('ArrowLeft', '←')
    .replace('ArrowRight', '→')
    .replace('Delete', 'Del')
    .replace('+', ' + ');
}

/**
 * Componente que muestra un modal con todos los atajos de teclado disponibles
 */
export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  const shortcuts = [
    {
      title: 'Guardar cambios',
      description: 'Guarda todos los cambios realizados',
      shortcut: formatShortcut(DEFAULT_SHORTCUTS.save),
    },
    {
      title: 'Vista previa',
      description: 'Ver una previsualización de la página',
      shortcut: formatShortcut(DEFAULT_SHORTCUTS.preview),
    },
    {
      title: 'Añadir bloque',
      description: 'Añadir un nuevo bloque al editor',
      shortcut: formatShortcut(DEFAULT_SHORTCUTS.addBlock),
    },
    {
      title: 'Eliminar bloque',
      description: 'Eliminar el bloque seleccionado',
      shortcut: formatShortcut(DEFAULT_SHORTCUTS.deleteBlock),
    },
    {
      title: 'Duplicar bloque',
      description: 'Duplicar el bloque seleccionado',
      shortcut: formatShortcut(DEFAULT_SHORTCUTS.duplicateBlock),
    },
    {
      title: 'Mover bloque hacia arriba',
      description: 'Mover el bloque seleccionado una posición hacia arriba',
      shortcut: formatShortcut(DEFAULT_SHORTCUTS.moveBlockUp),
    },
    {
      title: 'Mover bloque hacia abajo',
      description: 'Mover el bloque seleccionado una posición hacia abajo',
      shortcut: formatShortcut(DEFAULT_SHORTCUTS.moveBlockDown),
    },
    {
      title: 'Abrir configuración',
      description: 'Abrir el panel de configuración del bloque seleccionado',
      shortcut: formatShortcut(DEFAULT_SHORTCUTS.openSettings),
    },
    {
      title: 'Deshacer',
      description: 'Deshacer la última acción realizada',
      shortcut: formatShortcut(DEFAULT_SHORTCUTS.undo),
    },
    {
      title: 'Rehacer',
      description: 'Rehacer la última acción deshecha',
      shortcut: formatShortcut(DEFAULT_SHORTCUTS.redo),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atajos de teclado</DialogTitle>
          <DialogDescription>
            Utiliza estos atajos para mejorar tu productividad en el editor.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="grid gap-4 text-sm">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.title}
                className="grid grid-cols-[1fr_auto] items-center gap-4"
              >
                <div>
                  <div className="font-medium">{shortcut.title}</div>
                  <div className="text-muted-foreground">{shortcut.description}</div>
                </div>
                <code className="flex h-8 w-24 items-center justify-center rounded border bg-muted px-2 font-mono text-xs">
                  {shortcut.shortcut}
                </code>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}