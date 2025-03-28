# Convenciones de Exportación en ShieldCuisine

Este documento detalla las convenciones de exportación a seguir en el proyecto ShieldCuisine, complementando los estándares de codificación generales definidos en CODIGO_ESTANDARES.md.

## 1. Exportación de Componentes React

### 1.1 Exportación Nombrada (Recomendada)

Preferir el uso de **exportaciones nombradas** para la mayoría de los componentes:

```tsx
// En el archivo componente.tsx
export const MiComponente = () => {
  // Implementación
};

// Importación
import { MiComponente } from '@/ruta/componente';
```

Beneficios:
- Facilita el uso de herramientas de análisis estático
- Mejora la refactorización automática
- Previene colisiones de nombres en las importaciones
- Permite exportar múltiples componentes relacionados en un mismo archivo

### 1.2 Exportación por Defecto (Casos Específicos)

Usar exportaciones por defecto solo para:
- Páginas completas
- Componentes que representan la única exportación importante de un archivo

```tsx
// En el archivo pagina.tsx
const PaginaPrincipal = () => {
  // Implementación
};

export default PaginaPrincipal;

// Importación
import PaginaPrincipal from '@/paginas/pagina-principal';
```

## 2. Archivos de Barril (Index)

### 2.1 Propósito
Utilizar archivos `index.ts` para:
- Proporcionar una API limpia para cada módulo o carpeta
- Facilitar la importación de múltiples componentes relacionados
- Ocultar detalles de implementación internos

### 2.2 Estructura Recomendada

```ts
// En la carpeta /components/ui/index.ts

// Re-exportaciones simples
export { Button } from './button';
export { Card, CardHeader, CardContent, CardFooter } from './card';

// Re-exportación con alias para evitar conflictos
export { default as MyInput } from './input';

// Exportación de tipos
export type { ButtonProps } from './button';
export type { CardProps } from './card';
```

### 2.3 Importación desde Barriles

```tsx
// Importación desde un barril
import { Button, Card, CardHeader } from '@/components/ui';
```

## 3. Módulos TypeScript

### 3.1 Tipos e Interfaces

Preferir exportaciones nombradas para tipos e interfaces:

```ts
// En types.ts
export interface Usuario {
  id: number;
  nombre: string;
}

export type Rol = 'admin' | 'usuario' | 'invitado';

// Importación
import { Usuario, Rol } from '@/types';
```

### 3.2 Constantes y Configuraciones

Para constantes, enumeraciones y objetos de configuración:

```ts
// En constantes.ts
export const API_URL = 'https://api.ejemplo.com';

export const ESTADOS_PEDIDO = {
  PENDIENTE: 'pendiente',
  PROCESANDO: 'procesando',
  COMPLETADO: 'completado',
  CANCELADO: 'cancelado'
} as const;

export enum TipoNotificacion {
  INFO = 'info',
  EXITO = 'exito',
  ADVERTENCIA = 'advertencia',
  ERROR = 'error'
}
```

## 4. Funciones Utilitarias

### 4.1 Exportación de Funciones

Preferir exportaciones nombradas para funciones utilitarias:

```ts
// En utils.ts
export function formatearFecha(fecha: Date): string {
  // Implementación
}

export const calcularTotal = (items: Item[]): number => {
  // Implementación
};

// Importación
import { formatearFecha, calcularTotal } from '@/utils';
```

### 4.2 Agrupación de Funciones Relacionadas

Organizar funciones relacionadas en objetos cuando sea apropiado:

```ts
// En formato-utils.ts
export const formatoUtils = {
  fecha: (fecha: Date): string => {
    // Implementación
  },
  
  moneda: (valor: number, moneda = 'EUR'): string => {
    // Implementación
  },
  
  porcentaje: (valor: number): string => {
    // Implementación
  }
};

// Importación
import { formatoUtils } from '@/utils/formato-utils';
formatoUtils.moneda(12.95);
```

## 5. Hooks Personalizados

### 5.1 Convención de Nombres

Los hooks personalizados deben:
- Comenzar con `use` (requisito de React)
- Usar camelCase
- Ser exportados de forma nombrada

```tsx
// En hooks/use-auth.tsx
export const useAuth = () => {
  // Implementación
};

// Importación
import { useAuth } from '@/hooks/use-auth';
```

## 6. Migración al Nuevo Estándar

### 6.1 Directrices de Transición

Durante la fase de estandarización:

1. Al crear nuevos archivos, seguir estrictamente estas convenciones
2. Al modificar archivos existentes para otras tareas, aprovechar para adaptarlos a estas convenciones
3. Mantener temporalmente compatibilidad con exportaciones anteriores durante la transición
4. Documentar los cambios realizados en los commits

### 6.2 Ejemplo de Transición Gradual

```ts
// Antes de la migración (mantener durante transición)
export default MiComponente;

// Añadir exportación nombrada (nuevo estándar)
export { MiComponente };
```

## 7. Resolución de Conflictos

En caso de conflicto o necesidad de desviarse de estas convenciones, discutirlo con el equipo y documentar la decisión y su justificación en forma de comentario en el código.

---

Seguir estas convenciones de exportación de manera consistente mejorará la coherencia y mantenibilidad del código. Este documento será revisado y actualizado a medida que el proyecto evolucione.