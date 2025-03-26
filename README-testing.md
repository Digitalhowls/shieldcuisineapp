# ShieldCuisine - Framework de Pruebas Automatizadas

Este documento describe el framework de pruebas automatizadas implementado para ShieldCuisine, una plataforma integral de gestión de seguridad alimentaria.

## Descripción General

El framework de pruebas automatizadas de ShieldCuisine permite verificar el correcto funcionamiento de todos los módulos de la aplicación simulando las acciones de un usuario real. Estas pruebas automáticas ayudan a:

- Detectar regresiones y errores antes de que lleguen a producción
- Verificar que todas las funcionalidades críticas sigan funcionando
- Documentar el comportamiento esperado de cada módulo
- Agilizar el proceso de desarrollo y despliegue

## Arquitectura

El sistema de pruebas está construido sobre [Playwright](https://playwright.dev/), una potente herramienta de automatización de navegadores que permite:

- Controlar Chrome, Firefox y WebKit con una sola API
- Interactuar con elementos de la interfaz de usuario
- Realizar capturas de pantalla automáticas
- Simular eventos de arrastrar y soltar (drag and drop)
- Ejecutar en modo headless (sin interfaz gráfica) para entornos CI/CD

## Estructura de Directorios

```
shieldcuisine/
├── scripts/                    # Scripts de pruebas y utilitarios
│   ├── run-tests.js            # Ejecutor de pruebas con opciones
│   ├── test-automation.js      # Pruebas principales de todos los módulos
│   ├── test-cms-module.js      # Pruebas específicas del módulo CMS
│   ├── test-block-editor.js    # Pruebas específicas del editor de bloques
│   ├── run-all-tests.js        # Ejecutor completo con reportes consolidados
│   ├── install-browsers.js     # Instalador de navegadores para Playwright
│   ├── modules-test-index.js   # Índice de pruebas por módulo
│   └── README.md               # Documentación específica de scripts
├── test-results/               # Resultados de pruebas y capturas de pantalla
│   ├── screenshots/            # Capturas de pantalla organizadas por módulo
│   ├── report.json             # Reporte JSON de resultados
│   └── report.html             # Reporte HTML visual de resultados
├── playwright.config.js        # Configuración de Playwright
└── README-testing.md           # Este documento
```

## Módulos Probados

El framework de pruebas cubre todos los módulos principales de ShieldCuisine:

1. **Autenticación**: Login, registro y gestión de sesiones
2. **APPCC**: Controles de puntos críticos, registros y alertas
3. **Inventario**: Gestión de productos, stock y movimientos
4. **Portal de Transparencia**: Acceso público a controles
5. **WooCommerce**: Integración con tienda online
6. **Bancario**: Integración con APIs bancarias PSD2
7. **E-Learning**: Plataforma de formación online
8. **Compras**: Gestión de proveedores y pedidos
9. **CMS/Constructor Web**: Creación y gestión de contenidos

## Pruebas del Módulo CMS

Las pruebas del módulo CMS y del editor de bloques son especialmente detalladas debido a la complejidad de este componente. Estas pruebas verifican:

- Creación, edición y eliminación de páginas
- Funcionamiento del editor de bloques con drag-and-drop
- Biblioteca de medios con filtrado y búsqueda
- Configuración de branding y personalización
- API para integración con sistemas externos

## Tipos de Prueba

1. **Pruebas de interfaz de usuario**: Verifican la correcta renderización y comportamiento de la interfaz
2. **Pruebas funcionales**: Comprueban que las funcionalidades cumplan los requisitos
3. **Pruebas de integración**: Verifican la correcta interacción entre módulos
4. **Pruebas end-to-end**: Simulan flujos completos de usuario

## Informes y Resultados

Cada ejecución de pruebas genera:

- **Capturas de pantalla** de cada paso importante
- **Registro de resultados** (passed/failed/skipped) para cada prueba
- **Informes en formato JSON** con datos estructurados
- **Informes visuales en HTML** con estadísticas y detalles
- **Mensajes de consola** con resultados en tiempo real

## Guía de Uso

### Requisitos Previos

Para ejecutar las pruebas, necesitas tener instalados:

- Node.js (v18 o superior)
- Dependencias de Playwright (`playwright` y `@playwright/test`)
- Navegadores para Playwright (Chromium, Firefox, WebKit)

### Instalación de Requisitos

```bash
# Instalar dependencias de Node.js
npm install

# Instalar navegadores para Playwright
node scripts/install-browsers.js
```

### Ejecución de Pruebas

#### Pruebas Completas

```bash
node scripts/run-all-tests.js
```

#### Pruebas por Módulo

```bash
node scripts/run-tests.js --module CMS
```

Módulos disponibles:
- Autenticación
- APPCC
- Inventario
- Transparencia
- WooCommerce
- Bancario
- E-Learning
- Compras
- CMS

#### Opciones Adicionales

- `--headless`: Ejecutar sin mostrar el navegador
- `--verbose`: Mostrar logs detallados
- `--report-path RUTA`: Especificar ruta para el informe

### Visualización de Resultados

Después de ejecutar las pruebas, puedes ver los resultados en:

- **Consola**: Resumen básico con número de pruebas y estados
- **Reporte JSON**: `test-results/report.json` (datos estructurados)
- **Reporte HTML**: `test-results/report.html` (interfaz visual)
- **Capturas**: `test-results/screenshots/` (organizadas por módulo)

## Integración Continua

El framework está diseñado para integrarse con sistemas CI/CD como GitHub Actions, GitLab CI, Jenkins, etc. Para ello, utiliza el modo headless y la generación de informes en formato JSON:

```bash
node scripts/run-all-tests.js --headless
```

## Extensión

Para añadir nuevas pruebas:

1. Identifica el módulo al que pertenece la funcionalidad
2. Añade la prueba al script correspondiente o crea uno nuevo
3. Registra el script en `run-all-tests.js` si es necesario
4. Actualiza el índice de pruebas en `modules-test-index.js`

## Solución de Problemas

Si las pruebas fallan, verifica:

1. **Selectores CSS**: Pueden cambiar si se modifica la estructura HTML
2. **Credenciales**: Asegúrate de que las credenciales de prueba sean correctas
3. **Estado de la aplicación**: Las pruebas asumen un estado inicial específico
4. **Versiones de navegadores**: Actualiza los navegadores de Playwright
5. **Errores de red**: Verifica la conectividad a servicios externos

## Contribución

Para contribuir al framework de pruebas:

1. Sigue las convenciones de código existentes
2. Documenta las nuevas pruebas en los informes de test
3. Asegúrate de que las pruebas sean deterministas (mismo resultado en cada ejecución)
4. Minimiza las dependencias externas para evitar falsos positivos

---

## Notas sobre el Editor de Bloques

El editor de bloques del CMS es un componente especialmente complejo que utiliza:

- **react-dnd**: Para funcionalidad de arrastrar y soltar
- **react-dnd-html5-backend**: Para la implementación de HTML5 DnD
- **uuid**: Para la generación de identificadores únicos

Las pruebas del editor de bloques verifican:
- Creación de diferentes tipos de bloques
- Edición de contenido en bloques
- Operaciones de arrastrar y soltar
- Duplicación y eliminación de bloques
- Guardado de contenido

La prueba `test-block-editor.js` está especialmente optimizada para esta funcionalidad.

---

© 2025 Shield Cuisine. Todos los derechos reservados.