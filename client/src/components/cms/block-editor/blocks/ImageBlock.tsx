import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileImage } from "lucide-react";

interface ImageBlockProps {
  data: {
    id: string;
    type: string;
    src: string;
    alt: string;
    caption?: string;
    alignment?: "left" | "center" | "right";
  };
  isActive: boolean;
  onUpdate: (data: any) => void;
  readOnly?: boolean;
}

const ImageBlock: React.FC<ImageBlockProps> = ({
  data,
  isActive,
  onUpdate,
  readOnly = false,
}) => {
  const handleSrcChange = (src: string) => {
    onUpdate({ src });
  };
  
  const handleAltChange = (alt: string) => {
    onUpdate({ alt });
  };
  
  const handleCaptionChange = (caption: string) => {
    onUpdate({ caption });
  };
  
  const handleAlignmentChange = (alignment: "left" | "center" | "right") => {
    onUpdate({ alignment });
  };
  
  // Si es solo lectura o no está activo, mostrar la imagen renderizada
  if (readOnly || !isActive) {
    const alignClass = data.alignment ? `text-${data.alignment}` : "text-center";
    
    return (
      <figure className={alignClass}>
        <img
          src={data.src}
          alt={data.alt}
          className="max-w-full mx-auto rounded-md"
        />
        {data.caption && (
          <figcaption className="mt-2 text-sm text-muted-foreground">
            {data.caption}
          </figcaption>
        )}
      </figure>
    );
  }
  
  // Si está activo, mostrar la versión editable
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`image-src-${data.id}`}>URL de la imagen</Label>
          <div className="flex gap-2">
            <Input
              id={`image-src-${data.id}`}
              value={data.src}
              onChange={(e) => handleSrcChange(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open("/cms/media", "_blank")}
            >
              <FileImage className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`image-alt-${data.id}`}>Texto alternativo</Label>
          <Input
            id={`image-alt-${data.id}`}
            value={data.alt}
            onChange={(e) => handleAltChange(e.target.value)}
            placeholder="Descripción de la imagen para accesibilidad"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`image-caption-${data.id}`}>Leyenda (opcional)</Label>
          <Input
            id={`image-caption-${data.id}`}
            value={data.caption || ""}
            onChange={(e) => handleCaptionChange(e.target.value)}
            placeholder="Leyenda que aparecerá debajo de la imagen"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`image-alignment-${data.id}`}>Alineación</Label>
          <Select
            value={data.alignment || "center"}
            onValueChange={(value: "left" | "center" | "right") => handleAlignmentChange(value)}
          >
            <SelectTrigger id={`image-alignment-${data.id}`}>
              <SelectValue placeholder="Alineación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Izquierda</SelectItem>
              <SelectItem value="center">Centro</SelectItem>
              <SelectItem value="right">Derecha</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {data.src && (
        <div className="mt-4 p-4 border rounded-md">
          <p className="text-sm font-medium mb-2">Vista previa:</p>
          <figure className={`text-${data.alignment || "center"}`}>
            <img
              src={data.src}
              alt={data.alt}
              className="max-w-full h-auto mx-auto rounded-md"
              style={{ maxHeight: "200px" }}
            />
            {data.caption && (
              <figcaption className="mt-2 text-sm text-muted-foreground">
                {data.caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </div>
  );
};

export default ImageBlock;