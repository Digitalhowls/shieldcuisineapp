import React from 'react';
import { Block } from '@/types/cms';
import { cn } from '@/lib/utils';

interface BlockPreviewProps {
  block: Block;
}

/**
 * Componente para renderizar la vista previa de un bloque de contenido
 */
const BlockPreview: React.FC<BlockPreviewProps> = ({ block }) => {
  // Función para determinar la clase de alineación
  const getAlignmentClass = (alignment?: 'left' | 'center' | 'right') => {
    switch (alignment) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  // Renderización basada en el tipo de bloque
  switch (block.type) {
    case 'text':
      return (
        <p className={cn(
          'my-4',
          getAlignmentClass(block.alignment as any)
        )}>
          {block.text || ''}
        </p>
      );

    case 'heading':
      const HeadingTag = `h${block.level || '2'}` as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag className={cn(
          'font-bold my-4',
          block.level === '1' ? 'text-3xl' :
          block.level === '2' ? 'text-2xl' :
          block.level === '3' ? 'text-xl' :
          block.level === '4' ? 'text-lg' :
          block.level === '5' ? 'text-base' : 'text-sm',
          getAlignmentClass(block.alignment as any)
        )}>
          {block.text || ''}
        </HeadingTag>
      );

    case 'image':
      return (
        <figure className={cn(
          'my-6',
          getAlignmentClass(block.alignment as any)
        )}>
          <img
            src={block.src || ''}
            alt={block.alt || ''}
            className="max-w-full h-auto rounded-md mx-auto"
          />
          {block.caption && (
            <figcaption className="text-center text-sm text-gray-500 mt-2">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'html':
      return (
        <div 
          className="my-4"
          dangerouslySetInnerHTML={{ __html: block.content || '' }}
        />
      );

    case 'ai':
      return (
        <div className="my-6 p-4 border border-primary/20 bg-primary/5 rounded-md">
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: block.content || '' }}
          />
          <div className="text-xs text-right mt-2 text-primary/70 italic">
            Generado por IA
          </div>
        </div>
      );

    case 'list':
      const ListComponent = block.listType === 'ordered' ? 'ol' : 'ul';
      return (
        <ListComponent className={cn(
          'my-4 pl-6',
          block.listType === 'ordered' ? 'list-decimal' : 'list-disc',
        )}>
          {(block.items || []).map((item, index) => (
            <li key={index} className="my-1">{item}</li>
          ))}
        </ListComponent>
      );

    case 'quote':
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 py-2 my-4 italic">
          <p>{block.text || ''}</p>
          {block.citation && (
            <footer className="text-sm text-gray-600 mt-2">
              — {block.citation}
            </footer>
          )}
        </blockquote>
      );
      
    case 'divider':
      return <hr className="my-6 border-t border-gray-200" />;

    case 'callout':
      return (
        <div className={cn(
          'my-6 p-4 rounded-md border',
          block.style === 'info' ? 'bg-blue-50 border-blue-200' :
          block.style === 'warning' ? 'bg-amber-50 border-amber-200' :
          block.style === 'success' ? 'bg-green-50 border-green-200' :
          block.style === 'error' ? 'bg-red-50 border-red-200' :
          'bg-gray-50 border-gray-200'
        )}>
          <div className="font-medium mb-1">
            {block.title || 'Nota'}
          </div>
          <div>
            {block.content || ''}
          </div>
        </div>
      );

    default:
      return (
        <div className="p-4 border border-dashed border-gray-300 rounded-md my-4">
          <div className="text-sm text-gray-500">
            Bloque de tipo "{block.type}" no compatible con la vista previa
          </div>
        </div>
      );
  }
};

export default BlockPreview;