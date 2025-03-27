# Hoja de Ruta: Módulo CMS

## Visión General
El módulo CMS de ShieldCuisine es una solución completa para la gestión de contenido que permite a los negocios de alimentación crear y gestionar su presencia digital de forma autónoma, sin depender de servicios externos como WordPress.

## Fases de Desarrollo

### Fase 1: Infraestructura Base ✅
- [x] Definición del esquema de base de datos para contenidos
- [x] Creación de la estructura modular del CMS
- [x] Implementación del sistema de autenticación y permisos
- [x] Configuración de rutas API básicas

### Fase 2: Gestión de Medios ✅
- [x] Biblioteca de medios con vista de cuadrícula/lista
- [x] Uploader con soporte drag & drop
- [x] Sistema de categorías para organización
- [x] Optimización automática de imágenes
- [x] Visualización y filtrado por tipo

### Fase 3: Editor de Bloques ⚙️
- [x] Estructura base del editor
- [x] Bloques de texto básicos (párrafo, título, lista)
- [x] Bloques multimedia (imagen, galería, vídeo)
- [x] Sistema drag & drop para reordenamiento
- [ ] Panel de configuración lateral para bloques
- [ ] Guardado y recuperación del contenido

### Fase 4: Páginas y Blog 🔄
- [ ] Estructura de páginas y directorio
- [ ] Sistema de blog con categorías y etiquetas
- [ ] Campos SEO (metadatos, slug personalizado)
- [ ] Programación de publicaciones
- [ ] Vista previa de contenido desde administración

### Fase 5: Mejoras del Editor 📝
- [ ] Bloques avanzados (tabs, acordeón, carrusel)
- [ ] Bloques dinámicos (listados de entradas, cursos)
- [ ] Bloques HTML y embebido de contenido externo
- [ ] Historial de revisiones y control de versiones
- [ ] Templates y secciones prediseñadas

### Fase 6: Personalización y Branding 🎨
- [ ] Configuración de logo y favicon
- [ ] Selector de paleta de colores
- [ ] Biblioteca de tipografías (Google Fonts)
- [ ] Personalización de dominio o subdominio
- [ ] Configuraciones globales de estilo

### Fase 7: Integración con Módulos 🧩
- [ ] Conexión con módulo de cursos para publicación
- [ ] Integración con portal de transparencia
- [ ] Conectividad con WooCommerce
- [ ] Vinculación al sistema de notificaciones
- [ ] Integración con módulo de facturación

### Fase 8: API y Extensibilidad 🔌
- [ ] API REST completa para acceso externo
- [ ] Documentación OpenAPI/Swagger
- [ ] Sistema de webhooks para eventos
- [ ] Tokens de autenticación para API
- [ ] Soporte para headless CMS

### Fase 9: Performance y SEO 🚀
- [ ] Optimización de rendimiento (carga diferida)
- [ ] Generación automática de sitemap.xml
- [ ] Implementación Schema.org
- [ ] Configuración de Open Graph para redes sociales
- [ ] Soporte para microformatos

### Fase 10: Inteligencia Artificial 🧠
- [ ] Generación de contenido asistida por IA
- [ ] Sugerencias de mejora SEO
- [ ] Análisis de legibilidad y accesibilidad
- [ ] Traducción automática preliminar
- [ ] Asistente de diseño inteligente

## Estado Actual

El módulo CMS se encuentra actualmente en la **Fase 3** de desarrollo, con las siguientes características implementadas:

### Implementado ✅
- Sistema completo de gestión de medios con categorización
- Estructura base del editor de bloques
- Bloques fundamentales de texto y multimedia
- API para gestión de categorías de medios
- Integración con autenticación

### En Progreso 🔄
- Sistema drag & drop para reordenamiento de bloques
- Panel de configuración de bloques
- Guardado y recuperación de contenido
- Implementación de botones de acción en bloques
- Edición contextual in-situ

### Próximos Pasos 📋
1. Completar funcionalidades del editor de bloques
2. Implementar la estructura de páginas y blog
3. Crear vista previa de páginas en construcción
4. Desarrollar sistema de revisiones básico
5. Implementar campos y herramientas SEO

## Integraciones Principales

El CMS se conectará con otros módulos de ShieldCuisine:

1. **Módulo de Cursos**: Publicación de cursos como páginas públicas o entradas de blog.
2. **Portal de Transparencia**: Generación de páginas públicas con datos relevantes.
3. **WooCommerce**: Sincronización con productos y categorías.
4. **Sistema de Notificaciones**: Alertas sobre cambios y publicaciones.
5. **Branding Global**: Compartir configuraciones de estilo con otros módulos.

## Consideraciones Técnicas

- **Frontend**: React + React DnD para sistema de bloques
- **Backend**: Node.js + Express con PostgreSQL
- **Imágenes**: Optimización y almacenamiento eficiente
- **SSR/SSG**: Generación de páginas estáticas para SEO
- **API**: Estructura RESTful con documentación completa

## Monetización

El módulo CMS formará parte de los planes de suscripción de ShieldCuisine:

1. **CMS Básico** (15€/mes): Páginas + blog + branding básico
2. **CMS Pro** (29€/mes): + Cursos públicos + dominio propio + API + SEO avanzado
3. **CMS White Label** (49-99€/mes): Full branding sin ShieldCuisine visible

---

Esta hoja de ruta se actualizará periódicamente para reflejar el progreso y ajustar las prioridades según las necesidades del proyecto.