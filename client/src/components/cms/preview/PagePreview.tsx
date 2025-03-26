import React from "react";
import { Block } from "@/types/cms";
import { Card } from "@/components/ui/card";
import BlockPreview from "./BlockPreview";

interface PagePreviewProps {
  blocks: Block[];
  title: string;
  description?: string;
  className?: string;
}

/**
 * Componente para previsualizar una página completa del CMS
 */
export default function PagePreview({
  blocks,
  title,
  description,
  className,
}: PagePreviewProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Previsualización</h2>
        <p className="text-muted-foreground">
          Añade algunos bloques de contenido para visualizar tu página
        </p>
      </div>
    );
  }

  return (
    <div className={`preview-container w-full max-w-4xl mx-auto ${className}`}>
      <Card className="p-6 bg-white shadow-sm rounded-lg">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          {description && <p className="text-lg text-muted-foreground mb-6">{description}</p>}
          
          <div className="space-y-6">
            {blocks.map((block) => (
              <BlockPreview key={block.id} block={block} />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}