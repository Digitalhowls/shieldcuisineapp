import React from 'react';
import { useRoute } from 'wouter';
import PageRenderer from '@/components/cms/public/page-renderer';

const PageView: React.FC = () => {
  // Obtener el slug de la página de la URL
  const [, params] = useRoute<{ slug: string }>('/public/pagina/:slug');
  const slug = params?.slug || '';
  const companyId = 1; // ID de la empresa por defecto
  
  return (
    <div className="container px-4 sm:px-6 lg:px-8 mx-auto py-12">
      <PageRenderer slug={slug} companyId={companyId} />
    </div>
  );
};

export default PageView;