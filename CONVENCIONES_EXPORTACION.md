# Convenciones de Exportación para ShieldCuisine

Este documento establece los estándares y convenciones de exportación de módulos y componentes para el proyecto ShieldCuisine, con el objetivo de mantener consistencia en todo el código y evitar errores comunes.

## Convenciones Generales

### 1. Exportación de Componentes React

Para los componentes de React, se debe utilizar siempre el siguiente patrón:

```tsx
export default function ComponentName() {
  // Implementación del componente
  return (
    // JSX
  );
}
```

**NO** usar el siguiente patrón:

```tsx
const ComponentName = () => {
  // Implementación
};

export default ComponentName; // ¡EVITAR ESTA SINTAXIS!
```

### 2. Exportación de Múltiples Elementos

Cuando sea necesario exportar múltiples elementos desde un archivo:

```tsx
// Exportaciones nombradas para elementos secundarios
export function HelperFunction() { /* ... */ }
export const CONSTANT_VALUE = "value";
export type CustomType = { /* ... */ };

// Exportación por defecto para el elemento principal
export default function MainComponent() { /* ... */ }
```

### 3. Barrel Files (index.tsx)

Para archivos índice que exportan componentes de una carpeta:

```tsx
// En /components/ui/index.tsx
export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as Input } from './Input';
```

### 4. Exportación de Hooks

Para hooks personalizados:

```tsx
export function useCustomHook() {
  // Implementación del hook
  return { /* ... */ };
}
```

## Importaciones Recomendadas

### 1. Importación de Componentes

```tsx
import ComponentName from './ComponentName';
```

### 2. Importación de Múltiples Elementos

```tsx
import ComponentName, { HelperFunction, CONSTANT_VALUE } from './ComponentFile';
```

### 3. Importación desde Barrel Files

```tsx
import { Button, Card, Input } from '@/components/ui';
```

## Convenciones de Nomenclatura

1. **Componentes React**: PascalCase (ej. `UserProfile`)
2. **Hooks**: camelCase con prefijo "use" (ej. `useAuth`)
3. **Funciones Auxiliares**: camelCase (ej. `formatDate`)
4. **Constantes**: UPPER_SNAKE_CASE (ej. `MAX_RETRY_COUNT`)
5. **Interfaces y Types**: PascalCase (ej. `UserData`)

## Buenas Prácticas

1. Evitar tener múltiples exportaciones por defecto en un mismo archivo
2. Preferir exportaciones nombradas para todo lo que no sea el componente principal
3. Mantener un componente principal por archivo
4. Utilizar barrel files (index.tsx) para exportar múltiples componentes relacionados
5. Documentar con JSDoc las exportaciones públicas importantes

## Resolución de Problemas Comunes

### Problema: Exportación Duplicada
Error: "A file can't have multiple default exports"

**Solución**: Asegurarse de que solo hay una exportación por defecto en el archivo.

### Problema: Importación Incorrecta
Error: "Module has no exported member 'X'"

**Solución**: Verificar si el elemento está siendo exportado como default o como exportación nombrada, y ajustar la sintaxis de importación según corresponda.

---

Estas convenciones deben ser seguidas por todos los desarrolladores que trabajen en el proyecto ShieldCuisine para mantener la consistencia y evitar errores relacionados con exportaciones incorrectas.