/**
 * Tipos para el editor de bloques
 */

export type BlockType = 
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'gallery'
  | 'button'
  | 'quote'
  | 'table'
  | 'video'
  | 'divider'
  | 'list'
  | 'html'
  | 'form';

export interface Block {
  id: string;
  type: BlockType;
  content: any;
  animation?: {
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
  };
}

/**
 * Interfaces para los diferentes tipos de contenido de bloques
 */

export interface HeadingContent {
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4';
}

export interface ParagraphContent {
  text: string;
}

export interface ImageContent {
  src: string;
  alt?: string;
  caption?: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface GalleryContent {
  images: GalleryImage[];
  layout?: 'grid' | 'masonry' | 'carousel';
}

export interface ButtonContent {
  text: string;
  url: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  align?: 'left' | 'center' | 'right';
  newTab?: boolean;
}

export interface QuoteContent {
  text: string;
  author?: string;
  source?: string;
  align?: 'left' | 'center' | 'right';
  style?: 'default' | 'large' | 'bordered';
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
}

export interface VideoContent {
  src: string;
  type: 'youtube' | 'vimeo' | 'file';
  title?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16';
}

export interface DividerContent {
  style?: 'solid' | 'dashed' | 'dotted';
  width?: 'full' | 'half';
  thickness?: 'thin' | 'normal' | 'thick';
}

export interface ListItemContent {
  text: string;
  level?: number;
}

export interface ListContent {
  items: ListItemContent[];
  type: 'ordered' | 'unordered';
}

export interface HtmlContent {
  code: string;
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

export interface FormContent {
  fields: FormFieldContent[];
  submitButtonText: string;
  successMessage?: string;
  errorMessage?: string;
  redirectUrl?: string;
  emailNotification?: boolean;
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