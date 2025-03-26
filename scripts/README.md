# Scripts de Pruebas Automatizadas para ShieldCuisine

Este directorio contiene scripts para probar automáticamente toda la funcionalidad de ShieldCuisine, simulando las acciones de un usuario real en la interfaz.

## Requisitos previos

Para ejecutar estas pruebas, necesitas tener instalado Node.js y las siguientes dependencias:

```bash
npm install playwright @playwright/test
```

También necesitas instalar los navegadores necesarios:

```bash
npx playwright install
```

## Organización de los scripts

- `test-automation.js` - Script principal con todas las pruebas automatizadas
- `run-tests.js` - Script de línea de comandos para ejecutar las pruebas con opciones
- `../playwright.config.js` - Configuración de Playwright para los tests

## Cómo ejecutar las pruebas

### Ejecutar todas las pruebas

```bash
node scripts/run-tests.js
```

### Ejecutar pruebas de un módulo específico

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

### Opciones adicionales

- `--headless` - Ejecutar sin mostrar el navegador (útil para entornos CI/CD)
- `--verbose` - Mostrar logs detallados
- `--report-path RUTA` - Especificar ruta para el informe de resultados

Ejemplo:

```bash
node scripts/run-tests.js --module CMS --headless --report-path ./mi-reporte.json
```

## Informes y resultados

Después de ejecutar las pruebas, se generarán:

1. Un informe JSON con todos los resultados
2. Capturas de pantalla de cada paso relevante
3. Vídeos en caso de fallos (si se utiliza la configuración de Playwright)

Por defecto, estos archivos se guardan en el directorio `test-results/`.

## Consejos para desarrolladores

- Añade nuevas pruebas en `test-automation.js` si implementas nuevas funcionalidades
- Modifica los selectores CSS si cambia la estructura HTML de la aplicación
- Ejecuta las pruebas después de cada cambio importante para detectar regresiones
- Revisa las capturas de pantalla y los vídeos para entender la causa de los fallos

## Corrección de fallos comunes

Si aparecen errores en las pruebas, verifica:

1. Que el servidor de la aplicación esté ejecutándose en el puerto 5000
2. Que las credenciales de prueba sean correctas
3. Que los selectores CSS utilizados coincidan con la estructura actual de la interfaz
4. Que las dependencias estén actualizadas

## Integración con CI/CD

Estos scripts están diseñados para integrarse con sistemas de integración continua. Usa el modo `--headless` y rutas de informes específicas para tu entorno de CI.