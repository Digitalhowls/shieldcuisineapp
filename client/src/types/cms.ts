// Tipos para el CMS y el editor de páginas

// Tipo para un bloque de contenido genérico
export interface Block {
  id: string;
  type: string;
  [key: string]: any; // Para permitir propiedades específicas de cada tipo de bloque
}

// Tipos para bloques específicos
export interface TextBlockData extends Block {
  type: 'text';
  text: string;
}

export interface HeadingBlockData extends Block {
  type: 'heading';
  text: string;
  level: string; // 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
  alignment?: 'left' | 'center' | 'right';
}

export interface ImageBlockData extends Block {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface HtmlBlockData extends Block {
  type: 'html';
  content: string;
}

export interface AiBlockData extends Block {
  type: 'ai';
  content: string;
}

export interface ListBlockData extends Block {
  type: 'list';
  items: string[];
  listType: 'ordered' | 'unordered';
}

export interface QuoteBlockData extends Block {
  type: 'quote';
  text: string;
  citation?: string;
}

export interface DividerBlockData extends Block {
  type: 'divider';
}

export interface CalloutBlockData extends Block {
  type: 'callout';
  title?: string;
  content: string;
  style?: 'info' | 'warning' | 'success' | 'error' | 'default';
}

// Tipo para los datos de una página
export interface PageData {
  id?: number;
  title: string;
  slug?: string;
  description?: string;
  content?: string;
  blocks?: Block[];
  companyId?: number;
  categoryId?: number;
  authorId?: number;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'internal';
  type: 'page' | 'blog_post' | 'course_page' | 'landing_page';
  featuredImage?: string;
  publishDate?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Tipo para los metadatos de la página
export interface PageMetadata {
  title: string;
  description?: string;
  keywords?: string[];
  author?: string;
  image?: string;
}

// Tipos para la previsualización
export interface PreviewContextProps {
  pageData: PageData;
  blocks: Block[];
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  headerStyle?: string;
  footerStyle?: string;
}

// Tipos para el asistente de IA
export interface AIAssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AIAssistantContext {
  title?: string;
  description?: string;
  type?: string;
  messages: AIAssistantMessage[];
}

export interface SavedPrompt {
  id: string;
  title: string;
  prompt: string;
  category: 'seo' | 'content' | 'marketing' | 'general';
  useCount: number;
}

// Tipos para categorías y etiquetas
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

// Tipos para medios
export interface Media {
  id: number;
  name: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  altText?: string;
  description?: string;
  uploadedBy: number;
  uploadedAt: string;
}

// Tipos para el sistema de branding
export interface Branding {
  id?: number;
  companyId: number;
  logoUrl?: string;
  faviconUrl?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  colorAccent?: string;
  fontHeading?: string;
  fontBody?: string;
  customCss?: string;
  headerHtml?: string;
  footerHtml?: string;
}

// Tipo para envíos de formularios
export interface FormSubmission {
  id: number;
  formId: string;
  pageId?: number;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  data: Record<string, any>;
  createdAt: string;
  ip?: string;
  status: 'new' | 'read' | 'replied' | 'spam';
}

// Tipo para menús
export interface Menu {
  id: number;
  name: string;
  location: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: number;
  menuId: number;
  parentId?: number;
  title: string;
  url?: string;
  pageId?: number;
  order: number;
  target?: '_self' | '_blank';
  children?: MenuItem[];
}