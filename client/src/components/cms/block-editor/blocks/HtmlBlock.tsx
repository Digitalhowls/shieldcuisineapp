import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { HtmlContent } from "../types";

interface HtmlBlockProps {
  data: {
    id: string;
    type: 'html';
    code: string;
  };
  isActive: boolean;
  onUpdate: (data: Partial<HtmlContent>) => void;
  readOnly?: boolean;
}

const HtmlBlock: React.FC<HtmlBlockProps> = ({
  data,
  isActive,
  onUpdate,
  readOnly = false,
}) => {
  const handleContentChange = (content: string) => {
    onUpdate({ code: content });
  };
  
  // Si es solo lectura o no está activo, renderizar el HTML directamente
  if (readOnly || !isActive) {
    return (
      <div
        className="html-block"
        dangerouslySetInnerHTML={{ __html: data.code }}
      />
    );
  }
  
  // Si está activo, mostrar el editor de HTML
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`html-content-${data.id}`}>Código HTML</Label>
        <Textarea
          id={`html-content-${data.id}`}
          value={data.code}
          onChange={(e) => handleContentChange(e.target.value)}
          className="min-h-[150px] font-mono text-sm"
          placeholder="<div>Tu código HTML aquí</div>"
        />
      </div>
      
      {/* Vista previa */}
      <Card>
        <CardContent className="py-4">
          <Label className="mb-2 inline-block">Vista previa:</Label>
          <div
            className="p-4 border rounded-md bg-slate-50"
            dangerouslySetInnerHTML={{ __html: data.code }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default HtmlBlock;