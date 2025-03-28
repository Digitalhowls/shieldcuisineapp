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

import { HeadingContent } from '../types';

interface HeadingBlockProps {
  data: {
    id: string;
    type: 'heading';
    text: string;
    level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    alignment?: "left" | "center" | "right";
  };
  isActive: boolean;
  onUpdate: (data: Partial<HeadingContent & { alignment?: "left" | "center" | "right" }>) => void;
  readOnly?: boolean;
}

const HeadingBlock: React.FC<HeadingBlockProps> = ({
  data,
  isActive,
  onUpdate,
  readOnly = false,
}) => {
  const handleTextChange = (text: string) => {
    onUpdate({ text });
  };
  
  const handleLevelChange = (level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') => {
    onUpdate({ level });
  };
  
  const handleAlignmentChange = (alignment: "left" | "center" | "right") => {
    onUpdate({ alignment });
  };
  
  // Renderizar el encabezado según el nivel
  const renderHeading = () => {
    const alignClass = data.alignment ? `text-${data.alignment}` : "text-left";
    const className = `${alignClass} mb-4`;
    
    switch (data.level) {
      case "h1":
        return <h1 className={`text-4xl font-bold ${className}`}>{data.text}</h1>;
      case "h2":
        return <h2 className={`text-3xl font-bold ${className}`}>{data.text}</h2>;
      case "h3":
        return <h3 className={`text-2xl font-bold ${className}`}>{data.text}</h3>;
      case "h4":
        return <h4 className={`text-xl font-bold ${className}`}>{data.text}</h4>;
      case "h5":
        return <h5 className={`text-lg font-bold ${className}`}>{data.text}</h5>;
      case "h6":
        return <h6 className={`text-base font-bold ${className}`}>{data.text}</h6>;
      default:
        return <h2 className={`text-3xl font-bold ${className}`}>{data.text}</h2>;
    }
  };
  
  // Si es solo lectura o no está activo, mostrar el encabezado renderizado
  if (readOnly || !isActive) {
    return renderHeading();
  }
  
  // Si está activo, mostrar la versión editable
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`heading-text-${data.id}`}>Texto del encabezado</Label>
        <Input
          id={`heading-text-${data.id}`}
          value={data.text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Texto del encabezado"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`heading-level-${data.id}`}>Nivel</Label>
          <Select
            value={data.level}
            onValueChange={(value) => handleLevelChange(value as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6')}
          >
            <SelectTrigger id={`heading-level-${data.id}`}>
              <SelectValue placeholder="Nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="h1">H1 (Título principal)</SelectItem>
              <SelectItem value="h2">H2 (Subtítulo)</SelectItem>
              <SelectItem value="h3">H3</SelectItem>
              <SelectItem value="h4">H4</SelectItem>
              <SelectItem value="h5">H5</SelectItem>
              <SelectItem value="h6">H6</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`heading-alignment-${data.id}`}>Alineación</Label>
          <Select
            value={data.alignment || "left"}
            onValueChange={(value: "left" | "center" | "right") => handleAlignmentChange(value)}
          >
            <SelectTrigger id={`heading-alignment-${data.id}`}>
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
    </div>
  );
};

export default HeadingBlock;