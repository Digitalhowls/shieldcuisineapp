/**
 * Tipos para el módulo CMS/Constructor Web
 */

// Tipos de página
export type PageStatus = 'draft' | 'published' | 'archived';
export type PageVisibility = 'public' | 'private' | 'internal';
export type PageType = 'page' | 'blog_post' | 'course_page' | 'landing_page';

// Datos de la página
export interface PageData {
  id?: number;
  title: string;
  slug: string;
  content: string;
  status: PageStatus;
  visibility: PageVisibility;
  type: PageType;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  thumbnailUrl?: string;
  publishedAt?: string;
  companyId: number;
  author?: string;
  featured?: boolean;
  categoryIds?: number[];
  tagIds?: number[];
}

// Tipos base de bloques
export type BlockType = 
  | 'text' 
  | 'heading' 
  | 'image' 
  | 'html' 
  | 'list'
  | 'quote'
  | 'divider'
  | 'callout'
  | 'ai';

export type BlockAlignment = 'left' | 'center' | 'right';
export type HeadingLevel = '1' | '2' | '3' | '4' | '5' | '6';
export type ListType = 'ordered' | 'unordered';
export type CalloutStyle = 'info' | 'warning' | 'success' | 'error' | 'default';

// Interfaz base para todos los bloques
export interface BaseBlock {
  id: string;
  type: BlockType;
}

// Bloque de texto
export interface TextBlockData extends BaseBlock {
  type: 'text';
  text: string;
  alignment?: BlockAlignment;
}

// Bloque de encabezado
export interface HeadingBlockData extends BaseBlock {
  type: 'heading';
  text: string;
  level: HeadingLevel;
  alignment?: BlockAlignment;
}

// Bloque de imagen
export interface ImageBlockData extends BaseBlock {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
  alignment?: BlockAlignment;
}

// Bloque HTML
export interface HTMLBlockData extends BaseBlock {
  type: 'html';
  content: string;
}

// Bloque de lista
export interface ListBlockData extends BaseBlock {
  type: 'list';
  items: string[];
  listType: ListType;
}

// Bloque de cita
export interface QuoteBlockData extends BaseBlock {
  type: 'quote';
  text: string;
  citation?: string;
}

// Bloque divisor
export interface DividerBlockData extends BaseBlock {
  type: 'divider';
}

// Bloque de callout o alerta
export interface CalloutBlockData extends BaseBlock {
  type: 'callout';
  title?: string;
  content: string;
  style: CalloutStyle;
}

// Bloque generado por IA
export interface AiBlockData extends BaseBlock {
  type: 'ai';
  content: string;
}

// Tipo unión para todos los tipos de bloques
export type Block = 
  | TextBlockData
  | HeadingBlockData
  | ImageBlockData
  | HTMLBlockData
  | ListBlockData
  | QuoteBlockData
  | DividerBlockData
  | CalloutBlockData
  | AiBlockData;

// Datos de categorías
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  companyId: number;
}

// Datos de etiquetas
export interface Tag {
  id: number;
  name: string;
  slug: string;
  companyId: number;
}

// Datos de menú
export interface Menu {
  id: number;
  name: string;
  location: string;
  companyId: number;
  items: MenuItem[];
}

// Items de menú
export interface MenuItem {
  id: number;
  menuId: number;
  title: string;
  url?: string;
  pageId?: number;
  parentId?: number;
  order: number;
  children?: MenuItem[];
}

// Datos de branding
export interface Branding {
  id: number;
  companyId: number;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontPrimary?: string;
  fontSecondary?: string;
  customCss?: string;
  customJs?: string;
  siteTitle?: string;
  siteDescription?: string;
}

// Datos de archivos multimedia
export interface Media {
  id: number;
  companyId: number;
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
  uploadedAt: string;
  uploadedBy: number;
}

// Datos de formularios
export interface FormSubmission {
  id: number;
  formId: string;
  pageId?: number;
  data: Record<string, any>;
  submittedAt: string;
  ip?: string;
  companyId: number;
  status: 'new' | 'read' | 'responded' | 'archived';
}

// Preferencias del editor
export interface EditorPreference {
  userId: number;
  autoSave: boolean;
  spellCheck: boolean;
  showWordCount: boolean;
  darkMode: boolean;
  customizations?: Record<string, any>;
}