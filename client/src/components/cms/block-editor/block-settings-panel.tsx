import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Settings2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  MoveHorizontal,
  MoveVertical,
  Palette,
  Type,
  Link,
  ExternalLink,
  PlayCircle,
  PanelLeft,
  Sparkles
} from "lucide-react";

import { BlockType } from "./types";

interface BlockSettingsPanelProps {
  blockType: BlockType;
  blockData: any;
  onChange: (data: any) => void;
  isVisible: boolean;
  onClose: () => void;
}

export const BlockSettingsPanel: React.FC<BlockSettingsPanelProps> = ({
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
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="heading-level">Nivel</Label>
          <Select
            value={blockData.level || "h2"}
            onValueChange={(value) => handleChange("level", value)}
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
              variant={blockData.alignment === "left" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("alignment", "left")}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={blockData.alignment === "center" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("alignment", "center")}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={blockData.alignment === "right" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("alignment", "right")}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="heading-color">Color</Label>
          <div className="flex space-x-2">
            <Input
              id="heading-color"
              type="color"
              value={blockData.color || "#000000"}
              onChange={(e) => handleChange("color", e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={blockData.color || "#000000"}
              onChange={(e) => handleChange("color", e.target.value)}
              className="flex-1"
              placeholder="#000000"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="heading-id">ID para navegación</Label>
            <Switch
              id="heading-enable-id"
              checked={!!blockData.enableId}
              onCheckedChange={(checked) => handleChange("enableId", checked)}
            />
          </div>
          
          {blockData.enableId && (
            <Input
              id="heading-id"
              value={blockData.id || ""}
              onChange={(e) => handleChange("id", e.target.value)}
              placeholder="mi-seccion"
            />
          )}
          <p className="text-xs text-muted-foreground">
            El ID permite enlazar directamente a esta sección
          </p>
        </div>
      </div>
    );
  };
  
  // Configuraciones para párrafo
  const renderParagraphSettings = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Alineación</Label>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={blockData.alignment === "left" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("alignment", "left")}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={blockData.alignment === "center" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("alignment", "center")}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={blockData.alignment === "right" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("alignment", "right")}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={blockData.alignment === "justify" ? "default" : "outline"}
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
            value={blockData.size || "normal"}
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
              value={blockData.color || "#000000"}
              onChange={(e) => handleChange("color", e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={blockData.color || "#000000"}
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
              checked={!!blockData.dropcap}
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
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="image-alt">Texto alternativo</Label>
          <Input
            id="image-alt"
            value={blockData.alt || ""}
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
            value={blockData.caption || ""}
            onChange={(e) => handleChange("caption", e.target.value)}
            placeholder="Descripción o créditos de la imagen"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Alineación</Label>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={blockData.alignment === "left" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("alignment", "left")}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={blockData.alignment === "center" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("alignment", "center")}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={blockData.alignment === "right" ? "default" : "outline"}
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
            value={blockData.size || "medium"}
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
              checked={!!blockData.lightbox}
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
            value={blockData.link || ""}
            onChange={(e) => handleChange("link", e.target.value)}
            placeholder="https://..."
          />
          
          {blockData.link && (
            <div className="flex items-center space-x-2 mt-2">
              <Switch
                id="image-link-newtab"
                checked={!!blockData.linkNewTab}
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
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="gallery-layout">Diseño</Label>
          <Select
            value={blockData.layout || "grid"}
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
            value={String(blockData.columns || "3")}
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
            value={[blockData.gap || 8]}
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
              checked={blockData.lightbox !== false}
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
              checked={!!blockData.showCaptions}
              onCheckedChange={(checked) => handleChange("showCaptions", checked)}
            />
          </div>
        </div>
      </div>
    );
  };
  
  // Configuraciones para botón
  const renderButtonSettings = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="button-url">URL</Label>
          <Input
            id="button-url"
            value={blockData.url || ""}
            onChange={(e) => handleChange("url", e.target.value)}
            placeholder="https://..."
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="button-newtab"
              checked={!!blockData.newTab}
              onCheckedChange={(checked) => handleChange("newTab", checked)}
            />
            <Label htmlFor="button-newtab">Abrir en nueva pestaña</Label>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="button-variant">Estilo</Label>
          <Select
            value={blockData.variant || "default"}
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
            value={blockData.size || "default"}
            onValueChange={(value) => handleChange("size", value)}
          >
            <SelectTrigger id="button-size">
              <SelectValue placeholder="Tamaño del botón" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Normal</SelectItem>
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
              variant={blockData.align === "left" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("align", "left")}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={blockData.align === "center" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("align", "center")}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={blockData.align === "right" ? "default" : "outline"}
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
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="video-type">Tipo de video</Label>
          <Select
            value={blockData.type || "youtube"}
            onValueChange={(value) => handleChange("type", value)}
          >
            <SelectTrigger id="video-type">
              <SelectValue placeholder="Tipo de video" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="vimeo">Vimeo</SelectItem>
              <SelectItem value="file">Archivo de vídeo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="video-title">Título</Label>
          <Input
            id="video-title"
            value={blockData.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Título del vídeo (para accesibilidad)"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="video-aspect-ratio">Relación de aspecto</Label>
          <Select
            value={blockData.aspectRatio || "16:9"}
            onValueChange={(value) => handleChange("aspectRatio", value)}
          >
            <SelectTrigger id="video-aspect-ratio">
              <SelectValue placeholder="Relación de aspecto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="16:9">16:9 (Panorámico)</SelectItem>
              <SelectItem value="4:3">4:3 (Clásico)</SelectItem>
              <SelectItem value="1:1">1:1 (Cuadrado)</SelectItem>
              <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="video-autoplay">Reproducción automática</Label>
            <Switch
              id="video-autoplay"
              checked={!!blockData.autoplay}
              onCheckedChange={(checked) => handleChange("autoplay", checked)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="video-loop">Reproducir en bucle</Label>
            <Switch
              id="video-loop"
              checked={!!blockData.loop}
              onCheckedChange={(checked) => handleChange("loop", checked)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="video-muted">Silenciado</Label>
            <Switch
              id="video-muted"
              checked={!!blockData.muted}
              onCheckedChange={(checked) => handleChange("muted", checked)}
            />
          </div>
        </div>
        
        {blockData.type === "file" && (
          <div className="space-y-2">
            <Label htmlFor="video-poster">URL de la imagen de poster</Label>
            <Input
              id="video-poster"
              value={blockData.poster || ""}
              onChange={(e) => handleChange("poster", e.target.value)}
              placeholder="URL de la imagen que se muestra antes de reproducir"
            />
          </div>
        )}
      </div>
    );
  };
  
  // Configuraciones para cita
  const renderQuoteSettings = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="quote-author">Autor</Label>
          <Input
            id="quote-author"
            value={blockData.author || ""}
            onChange={(e) => handleChange("author", e.target.value)}
            placeholder="Nombre del autor"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quote-source">Fuente</Label>
          <Input
            id="quote-source"
            value={blockData.source || ""}
            onChange={(e) => handleChange("source", e.target.value)}
            placeholder="Libro, entrevista, etc."
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quote-style">Estilo</Label>
          <Select
            value={blockData.style || "default"}
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
              variant={blockData.align === "left" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("align", "left")}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={blockData.align === "center" ? "default" : "outline"}
              size="icon"
              onClick={() => handleChange("align", "center")}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={blockData.align === "right" ? "default" : "outline"}
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
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="divider-style">Estilo</Label>
          <Select
            value={blockData.style || "solid"}
            onValueChange={(value) => handleChange("style", value)}
          >
            <SelectTrigger id="divider-style">
              <SelectValue placeholder="Estilo de línea" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Sólida</SelectItem>
              <SelectItem value="dashed">Guiones</SelectItem>
              <SelectItem value="dotted">Puntos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="divider-width">Ancho</Label>
          <Select
            value={blockData.width || "full"}
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
            value={blockData.thickness || "normal"}
            onValueChange={(value) => handleChange("thickness", value)}
          >
            <SelectTrigger id="divider-thickness">
              <SelectValue placeholder="Grosor del divisor" />
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
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="list-type">Tipo de lista</Label>
          <Select
            value={blockData.type || "unordered"}
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
        <div className="p-4 border rounded-md bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-sm">
          <p>Edita el código HTML directamente en el editor de bloques.</p>
          <p className="mt-2">Recuerda que el código HTML personalizado puede afectar al diseño y funcionamiento de la página.</p>
        </div>
      </div>
    );
  };
  
  // Configuraciones para formulario
  const renderFormSettings = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="form-submit-text">Texto del botón de envío</Label>
          <Input
            id="form-submit-text"
            value={blockData.submitButtonText || "Enviar"}
            onChange={(e) => handleChange("submitButtonText", e.target.value)}
            placeholder="Enviar formulario"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="form-success-message">Mensaje de éxito</Label>
          <Textarea
            id="form-success-message"
            value={blockData.successMessage || ""}
            onChange={(e) => handleChange("successMessage", e.target.value)}
            placeholder="¡Gracias! Tu mensaje ha sido enviado correctamente."
            className="resize-y"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="form-redirect-url">URL de redirección (opcional)</Label>
          <Input
            id="form-redirect-url"
            value={blockData.redirectUrl || ""}
            onChange={(e) => handleChange("redirectUrl", e.target.value)}
            placeholder="https://... (dejar en blanco para no redirigir)"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="form-email-notification">Notificación por email</Label>
            <Switch
              id="form-email-notification"
              checked={!!blockData.emailNotification}
              onCheckedChange={(checked) => handleChange("emailNotification", checked)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Recibe un email cuando alguien complete el formulario
          </p>
        </div>
      </div>
    );
  };
  
  // Pestaña de animación común para todos los bloques
  const renderAnimationTab = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="animation-library">Biblioteca</Label>
          <Select
            value={blockData.animation?.library || "none"}
            onValueChange={(value) => 
              handleChange("animation", {
                ...(blockData.animation || {}),
                library: value,
                effect: blockData.animation?.effect || "fade-in"
              })
            }
          >
            <SelectTrigger id="animation-library">
              <SelectValue placeholder="Biblioteca de animación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin animación</SelectItem>
              <SelectItem value="aos">AOS (Animate On Scroll)</SelectItem>
              <SelectItem value="spring">React Spring</SelectItem>
              <SelectItem value="framer">Framer Motion</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {blockData.animation?.library && blockData.animation.library !== "none" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="animation-effect">Efecto</Label>
              <Select
                value={blockData.animation?.effect || "fade"}
                onValueChange={(value) => 
                  handleChange("animation", {
                    ...(blockData.animation || {}),
                    effect: value
                  })
                }
              >
                <SelectTrigger id="animation-effect">
                  <SelectValue placeholder="Selecciona un efecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fade-in">Desvanecer</SelectItem>
                  <SelectItem value="slide-up">Deslizar hacia arriba</SelectItem>
                  <SelectItem value="slide-down">Deslizar hacia abajo</SelectItem>
                  <SelectItem value="slide-left">Deslizar desde la izquierda</SelectItem>
                  <SelectItem value="slide-right">Deslizar desde la derecha</SelectItem>
                  <SelectItem value="zoom-in">Zoom de entrada</SelectItem>
                  <SelectItem value="zoom-out">Zoom de salida</SelectItem>
                  <SelectItem value="flip">Voltear</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="animation-duration">Duración (ms)</Label>
              <Input
                id="animation-duration"
                type="number"
                min="0"
                step="50"
                value={blockData.animation?.duration || 500}
                onChange={(e) => 
                  handleChange("animation", {
                    ...(blockData.animation || {}),
                    duration: parseInt(e.target.value) || 500
                  })
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="animation-delay">Retraso (ms)</Label>
              <Input
                id="animation-delay"
                type="number"
                min="0"
                step="50"
                value={blockData.animation?.delay || 0}
                onChange={(e) => 
                  handleChange("animation", {
                    ...(blockData.animation || {}),
                    delay: parseInt(e.target.value) || 0
                  })
                }
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="animation-scroll-trigger">Activar al hacer scroll</Label>
                <Switch
                  id="animation-scroll-trigger"
                  checked={!!blockData.animation?.scrollTrigger}
                  onCheckedChange={(checked) => 
                    handleChange("animation", {
                      ...(blockData.animation || {}),
                      scrollTrigger: checked
                    })
                  }
                />
              </div>
              
              {blockData.animation?.scrollTrigger && (
                <div className="mt-2">
                  <Label htmlFor="animation-threshold">Umbral de visibilidad</Label>
                  <Slider
                    id="animation-threshold"
                    value={[blockData.animation?.threshold || 0.2]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={(value) => 
                      handleChange("animation", {
                        ...(blockData.animation || {}),
                        threshold: value[0]
                      })
                    }
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Superior de pantalla</span>
                    <span>Centro de pantalla</span>
                    <span>Inferior de pantalla</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };
  
  // Renderizar el panel completo
  return (
    <div 
      className={cn(
        "fixed top-0 bottom-0 right-0 w-80 bg-card border-l shadow-lg z-30 transition-transform duration-300 transform",
        isVisible ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center">
          <Settings2 className="h-4 w-4 mr-2" />
          Configuración
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <PanelLeft className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-4 h-[calc(100vh-60px)] overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="animation">Animación</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            {renderContent()}
          </TabsContent>
          
          <TabsContent value="animation" className="space-y-4">
            {renderAnimationTab()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BlockSettingsPanel;