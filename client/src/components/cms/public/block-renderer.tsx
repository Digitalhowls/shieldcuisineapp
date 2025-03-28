import React from "react";
import { 
  ExternalLink, 
  Mail, 
  Phone,
  ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactFormPublic } from "./contact-form-public";

// Definimos el tipo para los bloques que vamos a renderizar
interface BlockContent {
  [key: string]: any;
}

interface Block {
  id: string;
  type: string;
  content: BlockContent;
}

interface BlockRendererProps {
  blocks: Block[];
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks }) => {
  if (!blocks || blocks.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No hay contenido para mostrar</div>;
  }

  // Función para renderizar un bloque individual según su tipo
  const renderBlock = (block: Block) => {
    switch (block.type) {
      case "heading":
        return renderHeading(block);
      case "paragraph":
        return renderParagraph(block);
      case "image":
        return renderImage(block);
      case "gallery":
        return renderGallery(block);
      case "button":
        return renderButton(block);
      case "divider":
        return renderDivider(block);
      case "quote":
        return renderQuote(block);
      case "list":
        return renderList(block);
      case "contact-form":
        return renderContactForm(block);
      case "video":
        return renderVideo(block);
      case "html":
        return renderHtml(block);
      case "table":
        return renderTable(block);
      default:
        return null;
    }
  };

  // Renderizado de cada tipo de bloque
  const renderHeading = (block: Block) => {
    const { text, level = "h2" } = block.content;
    
    switch (level) {
      case "h1":
        return <h1 key={block.id} className="text-4xl font-bold mb-6">{text}</h1>;
      case "h2":
        return <h2 key={block.id} className="text-3xl font-bold mb-5">{text}</h2>;
      case "h3":
        return <h3 key={block.id} className="text-2xl font-bold mb-4">{text}</h3>;
      case "h4":
        return <h4 key={block.id} className="text-xl font-bold mb-3">{text}</h4>;
      default:
        return <h2 key={block.id} className="text-3xl font-bold mb-5">{text}</h2>;
    }
  };

  const renderParagraph = (block: Block) => {
    const { text, align = "left" } = block.content;
    
    return (
      <p 
        key={block.id} 
        className={`mb-4 text-base leading-relaxed ${
          align === "center" ? "text-center" : 
          align === "right" ? "text-right" : 
          "text-left"
        }`}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  };

  const renderImage = (block: Block) => {
    const { src, alt, caption, width = "100%", align = "center" } = block.content;
    
    return (
      <figure 
        key={block.id} 
        className={`mb-6 ${
          align === "center" ? "mx-auto text-center" : 
          align === "right" ? "ml-auto mr-0 text-right" : 
          "mr-auto ml-0 text-left"
        }`}
        style={{ maxWidth: width }}
      >
        <img 
          src={src} 
          alt={alt || "Imagen"} 
          className="rounded-md w-full h-auto" 
        />
        {caption && (
          <figcaption className="text-sm text-muted-foreground mt-2">{caption}</figcaption>
        )}
      </figure>
    );
  };

  const renderGallery = (block: Block) => {
    const { images, layout = 'grid', columns = 3 } = block.content;
    
    if (!images || images.length === 0) {
      return null;
    }

    // Importamos dinámicamente para evitar problemas de renderizado en SSR
    const { Gallery } = require('../gallery');
    
    return (
      <div key={block.id} className="mb-6">
        <Gallery 
          images={images}
          viewType={layout as 'grid' | 'masonry' | 'carousel'}
          columns={columns as 2 | 3 | 4}
          showDots={true}
          showArrows={true}
          gap="medium"
        />
      </div>
    );
  };

  const renderButton = (block: Block) => {
    const { 
      text = "Botón", 
      link = "#", 
      target = "_self", 
      variant = "default", 
      size = "default",
      align = "left",
      icon = ""
    } = block.content;
    
    let buttonVariant: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link" = "default";
    
    // Mapear las variantes del editor a las variantes de shadcn
    switch (variant) {
      case "primary":
        buttonVariant = "default";
        break;
      case "secondary":
        buttonVariant = "secondary";
        break;
      case "outline":
        buttonVariant = "outline";
        break;
      case "ghost":
        buttonVariant = "ghost";
        break;
      case "link":
        buttonVariant = "link";
        break;
      default:
        buttonVariant = "default";
    }
    
    // Mapear los tamaños del editor a los tamaños de shadcn
    let buttonSize: "default" | "sm" | "lg" | "icon" = "default";
    switch (size) {
      case "small":
        buttonSize = "sm";
        break;
      case "large":
        buttonSize = "lg";
        break;
      default:
        buttonSize = "default";
    }
    
    return (
      <div 
        key={block.id} 
        className={`mb-6 ${
          align === "center" ? "text-center" : 
          align === "right" ? "text-right" : 
          "text-left"
        }`}
      >
        <Button
          variant={buttonVariant}
          size={buttonSize}
          onClick={() => {
            if (target === "_blank") {
              window.open(link, "_blank");
            } else {
              window.location.href = link;
            }
          }}
        >
          <span>{text}</span>
          {icon === "external" && <ExternalLink className="ml-2 h-4 w-4" />}
          {icon === "arrow" && <ChevronRight className="ml-2 h-4 w-4" />}
          {icon === "mail" && <Mail className="ml-2 h-4 w-4" />}
          {icon === "phone" && <Phone className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    );
  };

  const renderDivider = (block: Block) => {
    const { 
      style = "solid", 
      width = "100%", 
      align = "center" 
    } = block.content;
    
    let borderStyle = "border-solid";
    switch (style) {
      case "dashed":
        borderStyle = "border-dashed";
        break;
      case "dotted":
        borderStyle = "border-dotted";
        break;
      default:
        borderStyle = "border-solid";
    }
    
    return (
      <div 
        key={block.id} 
        className={`my-8 ${
          align === "center" ? "mx-auto" : 
          align === "right" ? "ml-auto mr-0" : 
          "mr-auto ml-0"
        }`}
        style={{ width }}
      >
        <hr className={`border-t ${borderStyle} border-border`} />
      </div>
    );
  };

  const renderQuote = (block: Block) => {
    const { text, author, align = "left" } = block.content;
    
    return (
      <blockquote 
        key={block.id} 
        className={`border-l-4 border-primary pl-4 my-6 ${
          align === "center" ? "mx-auto text-center" : 
          align === "right" ? "ml-auto text-right" : 
          "mr-auto text-left"
        }`}
      >
        <p className="text-lg italic mb-2">{text}</p>
        {author && <footer className="text-sm text-muted-foreground">— {author}</footer>}
      </blockquote>
    );
  };

  const renderList = (block: Block) => {
    const { items = [], type = "bullet" } = block.content;
    
    if (items.length === 0) {
      return null;
    }
    
    if (type === "checkbox") {
      return (
        <ul key={block.id} className="list-none space-y-2 mb-6">
          {items.map((item: any, index: number) => (
            <li key={index} className="flex items-start">
              <div className={`flex-shrink-0 h-5 w-5 rounded border ${item.checked ? 'bg-primary border-primary' : 'border-input'} mr-2 mt-0.5`}>
                {item.checked && (
                  <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="white">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span dangerouslySetInnerHTML={{ __html: item.text }} />
            </li>
          ))}
        </ul>
      );
    }
    
    if (type === "number") {
      return (
        <ol key={block.id} className="list-decimal pl-5 space-y-2 mb-6">
          {items.map((item: any, index: number) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: item.text }} />
          ))}
        </ol>
      );
    }
    
    // Default: bullet
    return (
      <ul key={block.id} className="list-disc pl-5 space-y-2 mb-6">
        {items.map((item: any, index: number) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: item.text }} />
        ))}
      </ul>
    );
  };

  const renderContactForm = (block: Block) => {
    return (
      <div key={block.id} className="mb-8">
        <ContactFormPublic
          title={block.content.title}
          description={block.content.description}
          fields={block.content.fields || []}
          submitText={block.content.submitText}
          email={block.content.email}
          showSuccess={block.content.showSuccess}
          successMessage={block.content.successMessage}
          companyId={1} // TODO: Obtener del contexto de la página
          pageId={undefined}
          formId={block.id}
        />
      </div>
    );
  };

  const renderVideo = (block: Block) => {
    const { 
      url, 
      caption, 
      width = "100%", 
      aspectRatio = "16:9",
      align = "center" 
    } = block.content;
    
    // Determinar tipo de video
    let videoId = "";
    let embedUrl = "";
    
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      // YouTube
      if (url.includes("youtube.com/watch?v=")) {
        videoId = url.split("v=")[1]?.split("&")[0] || "";
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
      }
      
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (url.includes("vimeo.com")) {
      // Vimeo
      videoId = url.split("vimeo.com/")[1]?.split("?")[0] || "";
      
      if (videoId) {
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }
    }
    
    if (!embedUrl) {
      return null;
    }
    
    // Calcular relación de aspecto
    let paddingBottom = "56.25%"; // Default 16:9
    if (aspectRatio === "4:3") {
      paddingBottom = "75%";
    } else if (aspectRatio === "1:1") {
      paddingBottom = "100%";
    }
    
    return (
      <figure 
        key={block.id} 
        className={`mb-6 ${
          align === "center" ? "mx-auto text-center" : 
          align === "right" ? "ml-auto mr-0 text-right" : 
          "mr-auto ml-0 text-left"
        }`}
        style={{ maxWidth: width }}
      >
        <div className="relative" style={{ paddingBottom }}>
          <iframe
            className="absolute inset-0 w-full h-full rounded-md"
            src={embedUrl}
            title="Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {caption && (
          <figcaption className="text-sm text-muted-foreground mt-2">{caption}</figcaption>
        )}
      </figure>
    );
  };

  const renderHtml = (block: Block) => {
    const { code = "" } = block.content;
    
    return (
      <div 
        key={block.id} 
        className="mb-6 custom-html-content"
        dangerouslySetInnerHTML={{ __html: code }}
      />
    );
  };

  const renderTable = (block: Block) => {
    const { 
      rows = [], 
      hasHeader = true, 
      style = "default" 
    } = block.content;
    
    if (rows.length === 0) {
      return null;
    }
    
    let tableClass = "w-full border-collapse mb-6";
    let headerClass = "bg-muted text-left p-2 font-medium";
    let cellClass = "border border-border p-2";
    
    if (style === "striped") {
      tableClass += " [&_tr:nth-child(even)]:bg-muted/50";
    } else if (style === "bordered") {
      cellClass += " border-2";
    }
    
    return (
      <div key={block.id} className="w-full overflow-x-auto mb-6">
        <table className={tableClass}>
          {hasHeader && rows.length > 0 && (
            <thead>
              <tr>
                {rows[0].map((cell: string, cellIndex: number) => (
                  <th key={cellIndex} className={headerClass}>
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.slice(hasHeader ? 1 : 0).map((row: string[], rowIndex: number) => (
              <tr key={rowIndex}>
                {row.map((cell: string, cellIndex: number) => (
                  <td key={cellIndex} className={cellClass}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Renderizar todos los bloques
  return (
    <div className="cms-content-renderer">
      {blocks.map((block) => renderBlock(block))}
    </div>
  );
};

export default BlockRenderer;