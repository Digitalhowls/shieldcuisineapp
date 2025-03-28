/**
 * Tipos para el editor de bloques
 */

/**
 * Definición de tipos de bloques disponibles
 */
export type BlockType = 
  | 'heading'
  | 'paragraph'
  | 'rich-text'
  | 'image'
  | 'gallery'
  | 'button'
  | 'quote'
  | 'table'
  | 'video'
  | 'divider'
  | 'list'
  | 'html'
  | 'form'
  | 'contact-form'
  | 'ai';

export interface AnimationOptions {
  effect?: string;
  duration?: string | number;
  delay?: string | number;
  repeat?: number;
  intensity?: number;
  direction?: string;
  easing?: string;
  library?: string;
  threshold?: number;
  scrollTrigger?: boolean;
}

/**
 * Interfaces para los diferentes tipos de contenido de bloques
 */

export interface HeadingContent {
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  alignment?: 'left' | 'center' | 'right';
  /** Tipo discriminante */
  type?: 'heading';
}

export interface ParagraphContent {
  text: string;
  /** Tipo discriminante */
  type?: 'paragraph';
}

/**
 * Contenido para bloques de texto enriquecido
 * Almacena HTML formateado con etiquetas permitidas
 */
export interface RichTextContent {
  content: string;
  textAlign?: 'left' | 'center' | 'right';
  /** Tipo discriminante */
  type?: 'rich-text';
}

export interface ImageContent {
  src: string;
  alt?: string;
  caption?: string;
  /** Tipo discriminante */
  type?: 'image';
}

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface GalleryContent {
  images: GalleryImage[];
  layout?: 'grid' | 'masonry' | 'carousel';
  /** Tipo discriminante */
  type?: 'gallery';
}

export interface ButtonContent {
  text: string;
  url: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  align?: 'left' | 'center' | 'right';
  newTab?: boolean;
  /** Tipo discriminante */
  type?: 'button';
}

export interface QuoteContent {
  text: string;
  author?: string;
  source?: string;
  align?: 'left' | 'center' | 'right';
  style?: 'default' | 'large' | 'bordered';
  /** Tipo discriminante */
  type?: 'quote';
}

export interface TableCell {
  content: string;
  header?: boolean;
  colspan?: number;
  rowspan?: number;
  align?: 'left' | 'center' | 'right';
}

export interface TableContent {
  rows: TableCell[][];
  caption?: string;
  withHeader?: boolean;
  withBorder?: boolean;
  striped?: boolean;
  /** Tipo discriminante */
  type?: 'table';
}

export interface VideoContent {
  src: string;
  videoType: 'youtube' | 'vimeo' | 'file';
  title?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16';
  /** Tipo discriminante */
  type?: 'video';
}

export interface DividerContent {
  style?: 'solid' | 'dashed' | 'dotted';
  width?: 'full' | 'half';
  thickness?: 'thin' | 'normal' | 'thick';
  /** Tipo discriminante */
  type?: 'divider';
}

export interface ListItemContent {
  text: string;
  level?: number;
}

export interface ListContent {
  items: ListItemContent[];
  listType: 'ordered' | 'unordered';
  /** Tipo discriminante para identificar el tipo de bloque */
  type?: 'list';
}

export interface HtmlContent {
  code: string;
  /** Tipo discriminante */
  type?: 'html';
}

export interface FormFieldContent {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string;
}

export interface ContactFormFieldContent {
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface FormContent {
  fields: FormFieldContent[];
  submitButtonText: string;
  successMessage?: string;
  errorMessage?: string;
  redirectUrl?: string;
  emailNotification?: boolean;
  /** Tipo discriminante */
  type?: 'form';
}

export interface ContactFormContent {
  title: string;
  fields: ContactFormFieldContent[];
  successMessage?: string;
  errorMessage?: string;
  redirectUrl?: string;
  /** Tipo discriminante */
  type?: 'contact-form';
}

export interface AiContent {
  prompt: string;
  content: string;
  generatedContent?: string;
  tone?: string;
  format?: 'text' | 'html';
  /** Tipo discriminante */
  type?: 'ai';
}

export interface MediaItem {
  id: string;
  url: string;
  title: string;
  description?: string;
  type: 'image' | 'video' | 'document' | 'audio';
  mimeType: string;
  fileSize?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Unión de todos los posibles tipos de contenido
export type BlockContent =
  | HeadingContent
  | ParagraphContent
  | RichTextContent
  | ImageContent
  | GalleryContent
  | ButtonContent
  | QuoteContent
  | TableContent
  | VideoContent
  | DividerContent
  | ListContent
  | HtmlContent
  | FormContent
  | ContactFormContent
  | AiContent;

// Importa las interfaces de cada componente de configuración
import { StyleOptions } from './settings-panel/style-settings';
import { LayoutOptions } from './settings-panel/layout-settings';
import { AdvancedOptions } from './settings-panel/advanced-settings';

export interface Block {
  id: string;
  type: BlockType;
  content: BlockContent;
  animation?: AnimationOptions;
  style?: StyleOptions;
  layout?: LayoutOptions;
  advanced?: AdvancedOptions;
}