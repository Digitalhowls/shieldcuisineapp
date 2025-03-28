import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ParagraphContent } from "../types";

interface TextBlockProps {
  data: {
    id: string;
    type: 'paragraph';
    text: string;
  };
  isActive: boolean;
  onUpdate: (data: Partial<ParagraphContent>) => void;
  readOnly?: boolean;
}

const TextBlock: React.FC<TextBlockProps> = ({
  data,
  isActive,
  onUpdate,
  readOnly = false,
}) => {
  const [text, setText] = useState(data.text);
  
  const handleTextChange = (value: string) => {
    setText(value);
  };
  
  const handleBlur = () => {
    if (text !== data.text) {
      onUpdate({ text });
    }
  };
  
  // Si es solo lectura o no está activo, mostrar el texto renderizado
  if (readOnly || !isActive) {
    return (
      <div 
        className="prose prose-sm lg:prose-base max-w-none"
        dangerouslySetInnerHTML={{ __html: data.text }}
      />
    );
  }
  
  // Si está activo, mostrar el editor
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`text-content-${data.id}`}>Contenido</Label>
        <Textarea
          id={`text-content-${data.id}`}
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onBlur={handleBlur}
          className="min-h-[150px] font-mono text-sm"
          placeholder="<p>Escribe tu contenido HTML aquí...</p>"
        />
      </div>
      
      {/* Vista previa */}
      <div className="space-y-2">
        <Label>Vista previa:</Label>
        <div 
          className="p-4 border rounded-md bg-slate-50 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </div>
    </div>
  );
};

export default TextBlock;