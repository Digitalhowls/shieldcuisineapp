import React from 'react';
import { Block, PageData } from '@/types/cms';
import BlockPreview from './BlockPreview';

interface LivePreviewProps {
  pageData: PageData;
  blocks: Block[];
}

/**
 * Componente para previsualizar el contenido de la página en tiempo real
 * mientras se edita, sin necesidad de guardar los cambios
 */
const LivePreview: React.FC<LivePreviewProps> = ({ pageData, blocks }) => {
  return (
    <div className="w-full min-h-full bg-white font-sans">
      {/* Header de la página */}
      <header className="pt-12 pb-8 px-4 md:px-8 lg:px-12 border-b">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {pageData.title || 'Sin título'}
          </h1>
          {pageData.description && (
            <div className="text-lg text-gray-600 mb-4">
              {pageData.description}
            </div>
          )}
          <div className="flex flex-wrap gap-2 text-sm text-gray-500">
            {pageData.status === 'published' && pageData.publishedAt && (
              <div>
                Publicado: {new Date(pageData.publishedAt).toLocaleDateString()}
              </div>
            )}
            {pageData.type === 'blog_post' && pageData.author && (
              <div className="flex items-center">
                <span className="mx-2">•</span>
                <span>Autor: {pageData.author}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="py-8 px-4 md:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto">
          {blocks && blocks.length > 0 ? (
            <div className="space-y-6">
              {blocks.map((block, index) => (
                <BlockPreview 
                  key={block.id || index} 
                  block={block} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 italic">
              No hay contenido en esta página
            </div>
          )}
        </div>
      </main>

      {/* Footer de la página */}
      <footer className="py-8 px-4 md:px-8 lg:px-12 border-t mt-12 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-sm text-gray-500">
            <div>Esta es una vista previa en tiempo real de la página</div>
            <div className="mt-2">URL: {pageData.slug ? `/${pageData.slug}` : '-'}</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LivePreview;