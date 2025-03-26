import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { CmsPage } from "@shared/schema";
import BlockRenderer from "./block-renderer";

interface PageRendererProps {
  slug: string;
  companyId?: number;
}

const PageRenderer: React.FC<PageRendererProps> = ({ 
  slug,
  companyId = 1 // Valor por defecto
}) => {
  const {
    data: page,
    isLoading,
    error
  } = useQuery<CmsPage>({
    queryKey: [`/api/cms/companies/${companyId}/pages/${slug}`],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
        <h2 className="text-2xl font-bold mb-4">Página no encontrada</h2>
        <p className="text-muted-foreground">
          Lo sentimos, la página que estás buscando no existe o no está disponible.
        </p>
      </div>
    );
  }

  // Si la página no está publicada, mostrar mensaje de error
  if (page.status !== "published") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
        <h2 className="text-2xl font-bold mb-4">Página no disponible</h2>
        <p className="text-muted-foreground">
          Esta página no está disponible actualmente.
        </p>
      </div>
    );
  }

  // Renderizar el contenido de la página
  return (
    <div className="cms-page-container">
      {page.content && page.content.blocks && (
        <BlockRenderer blocks={page.content.blocks} />
      )}
    </div>
  );
};

export default PageRenderer;