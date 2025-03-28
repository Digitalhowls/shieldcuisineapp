import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Wand2,
  Settings,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  LayoutGrid,
  PanelLeft,
  Sparkles
} from "lucide-react";

import { 
  BlockType, 
  BlockContent, 
  HeadingContent, 
  ParagraphContent, 
  ImageContent, 
  GalleryContent,
  ButtonContent,
  VideoContent,
  QuoteContent,
  DividerContent,
  ListContent,
  HtmlContent,
  FormContent,
  ContactFormContent,
  AnimationOptions
} from "./types";

interface BlockSettingsPanelProps {
  blockType: BlockType;
  blockData: BlockContent;
  onChange: (data: Partial<BlockContent>) => void;
  isVisible: boolean;
  onClose: () => void;
}

const BlockSettingsPanel: React.FC<BlockSettingsPanelProps> = ({
  blockType,
  blockData,
  onChange,
  isVisible,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<string>("general");
  
  // Manejar cambios en cualquier campo
  const handleChange = (field: string, value: any) => {
    onChange({ ...blockData, [field]: value });
  };
  
  // Renderizar contenido según el tipo de bloque
  const renderContent = () => {
    switch (blockType) {
      case "heading":
        return renderHeadingSettings();
      case "paragraph":
        return renderParagraphSettings();
      case "image":
        return renderImageSettings();
      case "gallery":
        return renderGallerySettings();
      case "button":
        return renderButtonSettings();
      case "video":
        return renderVideoSettings();
      case "quote":
        return renderQuoteSettings();
      case "divider":
        return renderDividerSettings();
      case "list":
        return renderListSettings();
      case "html":
        return renderHtmlSettings();
      case "form":
      case "contact-form":
        return renderFormSettings();
      default:
        return (
          <div className="p-4 text-center text-muted-foreground">
            No hay configuraciones disponibles para este tipo de bloque.
          </div>
        );
    }
  };
  
  // Configuraciones para encabezado
  const renderHeadingSettings = () => {
    // Cast blockData to HeadingContent type
    const headingData = blockData as HeadingContent;
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="heading-level">Nivel</Label>
          <Select
            value={headingData.level}
            onValueChange={(value: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') => handleChange("level", value)}
          >
            <SelectTrigger id="heading-level">
              <SelectValue placeholder="Seleccionar nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="h1">H1 - Título principal</SelectItem>
              <SelectItem value="h2">H2 - Subtítulo</SelectItem>
              <SelectItem value="h3">H3 - Título de sección</SelectItem>
              <SelectItem value="h4">H4 - Subtítulo de sección</SelectItem>
              <SelectItem value="h5">H5 - Título menor</SelectItem>
              <SelectItem value="h6">H6 - Subtítulo menor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Alineación</Label>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={headingData.alignment === "left" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("alignment", "left")}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={headingData.alignment === "center" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("alignment", "center")}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={headingData.alignment === "right" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("alignment", "right")}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  // Configuraciones para párrafo
  const renderParagraphSettings = () => {
    const paragraphData = blockData as ParagraphContent & {
      alignment?: "left" | "center" | "right" | "justify";
      size?: string;
      color?: string;
      dropcap?: boolean;
    };
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Alineación</Label>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={paragraphData.alignment === "left" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("alignment", "left")}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={paragraphData.alignment === "center" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("alignment", "center")}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={paragraphData.alignment === "right" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("alignment", "right")}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={paragraphData.alignment === "justify" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("alignment", "justify")}
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="paragraph-size">Tamaño de texto</Label>
          <Select
            value={paragraphData.size || "normal"}
            onValueChange={(value) => handleChange("size", value)}
          >
            <SelectTrigger id="paragraph-size">
              <SelectValue placeholder="Tamaño del texto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Pequeño</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
              <SelectItem value="xlarge">Extra grande</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="paragraph-color">Color</Label>
          <div className="flex space-x-2">
            <Input
              id="paragraph-color"
              type="color"
              value={paragraphData.color || "#000000"}
              onChange={(e) => handleChange("color", e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={paragraphData.color || "#000000"}
              onChange={(e) => handleChange("color", e.target.value)}
              className="flex-1"
              placeholder="#000000"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="paragraph-dropcap">Letra capital</Label>
            <Switch
              id="paragraph-dropcap"
              checked={!!paragraphData.dropcap}
              onCheckedChange={(checked) => handleChange("dropcap", checked)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            La primera letra del párrafo aparecerá más grande
          </p>
        </div>
      </div>
    );
  };
  
  // Configuraciones para imagen
  const renderImageSettings = () => {
    const imageData = blockData as ImageContent & {
      alignment?: "left" | "center" | "right";
      size?: string;
      lightbox?: boolean;
      link?: string;
      linkNewTab?: boolean;
    };
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="image-alt">Texto alternativo</Label>
          <Input
            id="image-alt"
            value={imageData.alt || ""}
            onChange={(e) => handleChange("alt", e.target.value)}
            placeholder="Descripción de la imagen para accesibilidad"
          />
          <p className="text-xs text-muted-foreground">
            Importante para SEO y usuarios con lectores de pantalla
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="image-caption">Pie de foto</Label>
          <Input
            id="image-caption"
            value={imageData.caption || ""}
            onChange={(e) => handleChange("caption", e.target.value)}
            placeholder="Descripción o créditos de la imagen"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Alineación</Label>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={imageData.alignment === "left" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("alignment", "left")}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={imageData.alignment === "center" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("alignment", "center")}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={imageData.alignment === "right" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("alignment", "right")}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="image-size">Tamaño</Label>
          <Select
            value={imageData.size || "medium"}
            onValueChange={(value) => handleChange("size", value)}
          >
            <SelectTrigger id="image-size">
              <SelectValue placeholder="Tamaño de la imagen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Pequeño (25%)</SelectItem>
              <SelectItem value="medium">Mediano (50%)</SelectItem>
              <SelectItem value="large">Grande (75%)</SelectItem>
              <SelectItem value="full">Completo (100%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="image-lightbox">Activar lightbox</Label>
            <Switch
              id="image-lightbox"
              checked={!!imageData.lightbox}
              onCheckedChange={(checked) => handleChange("lightbox", checked)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Permite ampliar la imagen al hacer clic en ella
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="image-link">Enlace (opcional)</Label>
          <Input
            id="image-link"
            value={imageData.link || ""}
            onChange={(e) => handleChange("link", e.target.value)}
            placeholder="https://..."
          />
          
          {imageData.link && (
            <div className="flex items-center space-x-2 mt-2">
              <Switch
                id="image-link-newtab"
                checked={!!imageData.linkNewTab}
                onCheckedChange={(checked) => handleChange("linkNewTab", checked)}
              />
              <Label htmlFor="image-link-newtab">Abrir en nueva pestaña</Label>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Configuraciones para galería
  const renderGallerySettings = () => {
    const galleryData = blockData as GalleryContent & {
      columns?: number;
      gap?: number;
      lightbox?: boolean;
      showCaptions?: boolean;
    };
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="gallery-layout">Diseño</Label>
          <Select
            value={galleryData.layout || "grid"}
            onValueChange={(value) => handleChange("layout", value)}
          >
            <SelectTrigger id="gallery-layout">
              <SelectValue placeholder="Tipo de diseño" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Cuadrícula</SelectItem>
              <SelectItem value="masonry">Mosaico</SelectItem>
              <SelectItem value="carousel">Carrusel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gallery-columns">Columnas</Label>
          <Select
            value={String(galleryData.columns || "3")}
            onValueChange={(value) => handleChange("columns", parseInt(value))}
          >
            <SelectTrigger id="gallery-columns">
              <SelectValue placeholder="Número de columnas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 columnas</SelectItem>
              <SelectItem value="3">3 columnas</SelectItem>
              <SelectItem value="4">4 columnas</SelectItem>
              <SelectItem value="5">5 columnas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gallery-gap">Espacio entre imágenes</Label>
          <Slider
            id="gallery-gap"
            value={[galleryData.gap || 8]}
            min={0}
            max={24}
            step={2}
            onValueChange={(value) => handleChange("gap", value[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Sin espacio</span>
            <span>Máximo</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="gallery-lightbox">Activar lightbox</Label>
            <Switch
              id="gallery-lightbox"
              checked={galleryData.lightbox !== false}
              onCheckedChange={(checked) => handleChange("lightbox", checked)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Permite ver las imágenes en tamaño completo con navegación
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="gallery-captions">Mostrar pies de foto</Label>
            <Switch
              id="gallery-captions"
              checked={!!galleryData.showCaptions}
              onCheckedChange={(checked) => handleChange("showCaptions", checked)}
            />
          </div>
        </div>
      </div>
    );
  };
  
  // Configuraciones para botón
  const renderButtonSettings = () => {
    const buttonData = blockData as ButtonContent;
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="button-url">URL</Label>
          <Input
            id="button-url"
            value={buttonData.url || ""}
            onChange={(e) => handleChange("url", e.target.value)}
            placeholder="https://..."
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="button-newtab"
              checked={!!buttonData.newTab}
              onCheckedChange={(checked) => handleChange("newTab", checked)}
            />
            <Label htmlFor="button-newtab">Abrir en nueva pestaña</Label>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="button-variant">Estilo</Label>
          <Select
            value={buttonData.variant || "default"}
            onValueChange={(value) => handleChange("variant", value)}
          >
            <SelectTrigger id="button-variant">
              <SelectValue placeholder="Estilo del botón" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Predeterminado</SelectItem>
              <SelectItem value="secondary">Secundario</SelectItem>
              <SelectItem value="outline">Contorno</SelectItem>
              <SelectItem value="ghost">Fantasma</SelectItem>
              <SelectItem value="link">Enlace</SelectItem>
              <SelectItem value="destructive">Destructivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="button-size">Tamaño</Label>
          <Select
            value={buttonData.size || "default"}
            onValueChange={(value) => handleChange("size", value)}
          >
            <SelectTrigger id="button-size">
              <SelectValue placeholder="Tamaño del botón" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Predeterminado</SelectItem>
              <SelectItem value="sm">Pequeño</SelectItem>
              <SelectItem value="lg">Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Alineación</Label>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={buttonData.align === "left" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("align", "left")}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={buttonData.align === "center" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("align", "center")}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={buttonData.align === "right" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("align", "right")}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  // Configuraciones para video
  const renderVideoSettings = () => {
    const videoData = blockData as VideoContent;
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="video-type">Tipo de video</Label>
          <Select
            value={videoData.type}
            onValueChange={(value) => handleChange("type", value)}
          >
            <SelectTrigger id="video-type">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="vimeo">Vimeo</SelectItem>
              <SelectItem value="file">Archivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="video-title">Título</Label>
          <Input
            id="video-title"
            value={videoData.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Título del video"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="video-aspect">Relación de aspecto</Label>
          <Select
            value={videoData.aspectRatio || "16:9"}
            onValueChange={(value) => handleChange("aspectRatio", value)}
          >
            <SelectTrigger id="video-aspect">
              <SelectValue placeholder="Relación de aspecto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="16:9">16:9 (Panorámico)</SelectItem>
              <SelectItem value="4:3">4:3 (Estándar)</SelectItem>
              <SelectItem value="1:1">1:1 (Cuadrado)</SelectItem>
              <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="video-autoplay"
              checked={!!videoData.autoplay}
              onCheckedChange={(checked) => handleChange("autoplay", checked)}
            />
            <Label htmlFor="video-autoplay">Reproducción automática</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Los navegadores pueden bloquear la reproducción automática sin silenciar
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="video-loop"
              checked={!!videoData.loop}
              onCheckedChange={(checked) => handleChange("loop", checked)}
            />
            <Label htmlFor="video-loop">Reproducir en bucle</Label>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="video-muted"
              checked={!!videoData.muted}
              onCheckedChange={(checked) => handleChange("muted", checked)}
            />
            <Label htmlFor="video-muted">Silenciar</Label>
          </div>
        </div>
        
        {videoData.type === "file" && (
          <div className="space-y-2">
            <Label htmlFor="video-poster">Imagen de portada (URL)</Label>
            <Input
              id="video-poster"
              value={videoData.poster || ""}
              onChange={(e) => handleChange("poster", e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
        )}
      </div>
    );
  };
  
  // Configuraciones para cita
  const renderQuoteSettings = () => {
    const quoteData = blockData as QuoteContent;
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="quote-author">Autor</Label>
          <Input
            id="quote-author"
            value={quoteData.author || ""}
            onChange={(e) => handleChange("author", e.target.value)}
            placeholder="Nombre del autor"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quote-source">Fuente</Label>
          <Input
            id="quote-source"
            value={quoteData.source || ""}
            onChange={(e) => handleChange("source", e.target.value)}
            placeholder="Libro, discurso, etc."
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quote-style">Estilo</Label>
          <Select
            value={quoteData.style || "default"}
            onValueChange={(value) => handleChange("style", value)}
          >
            <SelectTrigger id="quote-style">
              <SelectValue placeholder="Estilo de la cita" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Predeterminado</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
              <SelectItem value="bordered">Con borde</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Alineación</Label>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={quoteData.align === "left" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("align", "left")}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={quoteData.align === "center" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("align", "center")}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={quoteData.align === "right" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("align", "right")}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  // Configuraciones para divisor
  const renderDividerSettings = () => {
    const dividerData = blockData as DividerContent;
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="divider-style">Estilo</Label>
          <Select
            value={dividerData.style || "solid"}
            onValueChange={(value) => handleChange("style", value)}
          >
            <SelectTrigger id="divider-style">
              <SelectValue placeholder="Estilo de línea" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Sólida</SelectItem>
              <SelectItem value="dashed">Discontinua</SelectItem>
              <SelectItem value="dotted">Punteada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="divider-width">Ancho</Label>
          <Select
            value={dividerData.width || "full"}
            onValueChange={(value) => handleChange("width", value)}
          >
            <SelectTrigger id="divider-width">
              <SelectValue placeholder="Ancho del divisor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Completo</SelectItem>
              <SelectItem value="half">Medio</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="divider-thickness">Grosor</Label>
          <Select
            value={dividerData.thickness || "normal"}
            onValueChange={(value) => handleChange("thickness", value)}
          >
            <SelectTrigger id="divider-thickness">
              <SelectValue placeholder="Grosor de línea" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thin">Fino</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="thick">Grueso</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };
  
  // Configuraciones para lista
  const renderListSettings = () => {
    const listData = blockData as ListContent;
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="list-type">Tipo de lista</Label>
          <Select
            value={listData.type}
            onValueChange={(value) => handleChange("type", value)}
          >
            <SelectTrigger id="list-type">
              <SelectValue placeholder="Tipo de lista" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ordered">Numerada</SelectItem>
              <SelectItem value="unordered">Con viñetas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };
  
  // Configuraciones para HTML
  const renderHtmlSettings = () => {
    return (
      <div className="space-y-4">
        <div className="p-4 text-center text-muted-foreground">
          Edita el código HTML directamente en el bloque.
        </div>
      </div>
    );
  };
  
  // Configuraciones para formulario
  const renderFormSettings = () => {
    if (blockType === "form") {
      const formData = blockData as FormContent;
      
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="form-submit-text">Texto del botón</Label>
            <Input
              id="form-submit-text"
              value={formData.submitButtonText || "Enviar"}
              onChange={(e) => handleChange("submitButtonText", e.target.value)}
              placeholder="Enviar formulario"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="form-success">Mensaje de éxito</Label>
            <Textarea
              id="form-success"
              value={formData.successMessage || ""}
              onChange={(e) => handleChange("successMessage", e.target.value)}
              placeholder="¡Gracias por enviar el formulario!"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="form-redirect">URL de redirección (opcional)</Label>
            <Input
              id="form-redirect"
              value={formData.redirectUrl || ""}
              onChange={(e) => handleChange("redirectUrl", e.target.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">
              Deja en blanco para mostrar el mensaje de éxito en lugar de redirigir
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="form-notification"
                checked={!!formData.emailNotification}
                onCheckedChange={(checked) => handleChange("emailNotification", checked)}
              />
              <Label htmlFor="form-notification">Recibir notificaciones por email</Label>
            </div>
          </div>
        </div>
      );
    } else {
      // contact-form
      const contactFormData = blockData as ContactFormContent;
      
      return (
        <div className="space-y-4">
          <div className="p-4 border border-border rounded-md bg-muted/50">
            <p className="text-sm text-center text-muted-foreground">
              Configura los campos del formulario de contacto en el panel del editor.
            </p>
          </div>
        </div>
      );
    }
  };
  
  // Configuración de animaciones (común para todos los bloques)
  const renderAnimationSettings = () => {
    // Obtenemos las propiedades de animación del bloque
    const animation = (blockData as any).animation || {};
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="animation-effect">Efecto</Label>
          <Select
            value={animation.effect || "none"}
            onValueChange={(value) => handleChange("animation", { ...animation, effect: value })}
          >
            <SelectTrigger id="animation-effect">
              <SelectValue placeholder="Seleccionar efecto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Ninguno</SelectItem>
              <SelectItem value="fade">Desvanecer</SelectItem>
              <SelectItem value="slide-up">Deslizar hacia arriba</SelectItem>
              <SelectItem value="slide-down">Deslizar hacia abajo</SelectItem>
              <SelectItem value="slide-left">Deslizar desde la izquierda</SelectItem>
              <SelectItem value="slide-right">Deslizar desde la derecha</SelectItem>
              <SelectItem value="zoom-in">Zoom de entrada</SelectItem>
              <SelectItem value="zoom-out">Zoom de salida</SelectItem>
              <SelectItem value="flip">Voltear</SelectItem>
              <SelectItem value="bounce">Rebotar</SelectItem>
              <SelectItem value="spin">Girar</SelectItem>
              <SelectItem value="pulse">Pulsar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {animation.effect && animation.effect !== "none" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="animation-duration">Duración (segundos)</Label>
              <Slider
                id="animation-duration"
                value={[parseFloat(animation.duration) || 0.5]}
                min={0.1}
                max={3}
                step={0.1}
                onValueChange={(value) => handleChange("animation", { ...animation, duration: value[0] })}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.1s</span>
                <span>{(parseFloat(animation.duration) || 0.5)}s</span>
                <span>3s</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="animation-delay">Retraso (segundos)</Label>
              <Slider
                id="animation-delay"
                value={[parseFloat(animation.delay) || 0]}
                min={0}
                max={2}
                step={0.1}
                onValueChange={(value) => handleChange("animation", { ...animation, delay: value[0] })}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0s</span>
                <span>{(parseFloat(animation.delay) || 0)}s</span>
                <span>2s</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="animation-repeat">Repetir (número de veces)</Label>
                <Input
                  id="animation-repeat"
                  type="number"
                  min="0"
                  max="10"
                  className="w-16"
                  value={animation.repeat || "1"}
                  onChange={(e) => handleChange("animation", { ...animation, repeat: parseInt(e.target.value) || 1 })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Usa 0 para infinito
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="animation-intensity">Intensidad</Label>
                <Slider
                  id="animation-intensity"
                  className="w-1/2"
                  value={[parseFloat(animation.intensity) || 1]}
                  min={0.5}
                  max={2}
                  step={0.1}
                  onValueChange={(value) => handleChange("animation", { ...animation, intensity: value[0] })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="animation-scroll"
                  checked={!!animation.scrollTrigger}
                  onCheckedChange={(checked) => handleChange("animation", { ...animation, scrollTrigger: checked })}
                />
                <Label htmlFor="animation-scroll">Activar al hacer scroll</Label>
              </div>
            </div>
            
            {animation.scrollTrigger && (
              <div className="space-y-2">
                <Label htmlFor="animation-threshold">Umbral de visibilidad</Label>
                <Slider
                  id="animation-threshold"
                  value={[parseFloat(animation.threshold) || 0.2]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={(value) => handleChange("animation", { ...animation, threshold: value[0] })}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 (inicio)</span>
                  <span>1 (completo)</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };
  
  return (
    <Sheet open={isVisible} onOpenChange={onClose}>
      <SheetContent className="w-[350px] sm:w-[450px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Configuración del bloque
          </SheetTitle>
          <SheetDescription>
            Personaliza las propiedades de este bloque
          </SheetDescription>
        </SheetHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="animation" className="flex items-center">
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Animación</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="mt-4">
            {renderContent()}
          </TabsContent>
          
          <TabsContent value="animation" className="mt-4">
            {renderAnimationSettings()}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default BlockSettingsPanel;