# Estándares de Codificación de ShieldCuisine

Este documento define los estándares de codificación para el proyecto ShieldCuisine. Estos estándares buscan mejorar la legibilidad, mantenibilidad y escalabilidad del código, facilitando la colaboración entre desarrolladores.

## 1. Nomenclatura de Archivos

### 1.1 Componentes React y TypeScript
- Usar **kebab-case** para todos los archivos de componentes: `mi-componente.tsx`
- Usar **kebab-case** para todos los archivos de utilidades y lógica: `mis-utilidades.ts`
- Usar **kebab-case** para carpetas: `mi-modulo/`

### 1.2 Excepciones
- Los archivos de tipos o interfaces pueden usar **kebab-case** con el sufijo `.types.ts`: `mi-componente.types.ts`
- Los archivos que contienen constantes pueden utilizar el sufijo `.constants.ts`: `api-endpoints.constants.ts`

## 2. Estructura de Componentes

### 2.1 Declaración de Componentes
- Utilizar funciones nombradas con la sintaxis de función de flecha para componentes:
```tsx
export const MiComponente = ({ prop1, prop2 }: MiComponenteProps) => {
  // Implementación
  return <div>...</div>;
};
```

### 2.2 Props
- Definir las interfaces de props fuera del componente
- Usar el sufijo `Props` en las interfaces: `MiComponenteProps`
- Usar desestructuración en los parámetros de la función

```tsx
interface MiComponenteProps {
  usuario: Usuario;
  onGuardar: (datos: FormData) => void;
  estaActivo?: boolean; // Propiedades opcionales con ?
}

export const MiComponente = ({ 
  usuario, 
  onGuardar, 
  estaActivo = false // Valores por defecto aquí
}: MiComponenteProps) => {
  // Implementación
};
```

## 3. Estructura de Imports

Organizar los imports en bloques separados por un salto de línea, en el siguiente orden:

1. Módulos externos/librerías (React, librerías terceras)
2. Componentes y utilidades internas (comenzando con '@/')
3. Tipos e interfaces
4. Estilos (CSS modules, SCSS, etc.)
5. Assets (imágenes, iconos, etc.)

Ejemplo:
```tsx
// 1. Módulos externos/librerías
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// 2. Componentes y utilidades internas
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { formatearFecha } from '@/lib/utils';

// 3. Tipos e interfaces
import type { Usuario, FormData } from '@/types';

// 4. Estilos
import styles from './mi-componente.module.css';

// 5. Assets
import logoImg from '@/assets/logo.png';
```

## 4. Estilo de Código

### 4.1 Espaciado y Formato
- Usar 2 espacios para la indentación
- Usar punto y coma al final de las declaraciones
- Máximo 80 caracteres por línea (con algunas excepciones para JSX)

### 4.2 Comentarios
- Usar JSDoc para documentar componentes, funciones y tipos complejos
- Comentar código no obvio o complejo

```tsx
/**
 * Componente que muestra información detallada del usuario
 * y permite editar su perfil.
 *
 * @param usuario - Datos del usuario
 * @param onGuardar - Función llamada al guardar cambios
 * @param esModoEditable - Si el formulario permite edición
 */
export const PerfilUsuario = ({ 
  usuario,
  onGuardar,
  esModoEditable = false
}: PerfilUsuarioProps) => {
  // Implementación
};
```

### 4.3 Tipado
- Preferir interfaces sobre types para objetos
- Usar types para uniones, intersecciones y tipos primitivos
- Evitar el uso de `any`. Preferir `unknown` cuando sea necesario

## 5. Estructura de Archivos

### 5.1 Componentes
Cada componente debe seguir esta estructura general:
1. Imports
2. Definición de tipos/interfaces
3. Constantes y variables auxiliares
4. Componente principal
5. Subcomponentes (si los hay)
6. Export

### 5.2 Páginas
Las páginas deben seguir una estructura similar a los componentes, con énfasis en la claridad y separación de responsabilidades.

## 6. Estado y Efectos

### 6.1 Hooks de useState
- Nombrar el estado y su setter con prefijos descriptivos:
```tsx
const [isLoading, setIsLoading] = useState(false);
const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
```

### 6.2 Efectos
- Mantener los efectos enfocados en una sola responsabilidad
- Proporcionar las dependencias correctas en el array de dependencias
- Comentar claramente el propósito del efecto

```tsx
// Cargar datos del usuario al montar el componente o cambiar el ID
useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUserProfile(userId);
      setUserProfile(data);
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, [userId]);
```

---

Estos estándares se irán actualizando a medida que el proyecto evolucione. Es responsabilidad de todos los miembros del equipo seguir estos estándares y sugerir mejoras cuando sea necesario.