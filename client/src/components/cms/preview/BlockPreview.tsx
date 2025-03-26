import React from 'react';
import { 
  Block, 
  TextBlockData, 
  HeadingBlockData, 
  ImageBlockData, 
  HtmlBlockData, 
  AiBlockData, 
  ListBlockData, 
  QuoteBlockData,
  CalloutBlockData 
} from '@/types/cms';
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
    case 'text': {
      const textBlock = block as TextBlockData;
      return (
        <p className={cn(
          'my-4',
          getAlignmentClass(textBlock.alignment)
        )}>
          {textBlock.text || ''}
        </p>
      );
    }

    case 'heading': {
      const headingBlock = block as HeadingBlockData;
      const HeadingTag = `h${headingBlock.level || '2'}` as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag className={cn(
          'font-bold my-4',
          headingBlock.level === '1' ? 'text-3xl' :
          headingBlock.level === '2' ? 'text-2xl' :
          headingBlock.level === '3' ? 'text-xl' :
          headingBlock.level === '4' ? 'text-lg' :
          headingBlock.level === '5' ? 'text-base' : 'text-sm',
          getAlignmentClass(headingBlock.alignment)
        )}>
          {headingBlock.text || ''}
        </HeadingTag>
      );
    }

    case 'image': {
      const imageBlock = block as ImageBlockData;
      return (
        <figure className={cn(
          'my-6',
          getAlignmentClass(imageBlock.alignment)
        )}>
          <img
            src={imageBlock.src || ''}
            alt={imageBlock.alt || ''}
            className="max-w-full h-auto rounded-md mx-auto"
          />
          {imageBlock.caption && (
            <figcaption className="text-center text-sm text-gray-500 mt-2">
              {imageBlock.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'html': {
      const htmlBlock = block as HtmlBlockData;
      return (
        <div 
          className="my-4"
          dangerouslySetInnerHTML={{ __html: htmlBlock.content || '' }}
        />
      );
    }

    case 'ai': {
      const aiBlock = block as AiBlockData;
      return (
        <div className="my-6 p-4 border border-primary/20 bg-primary/5 rounded-md">
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: aiBlock.content || '' }}
          />
          <div className="text-xs text-right mt-2 text-primary/70 italic">
            Generado por IA
          </div>
        </div>
      );
    }

    case 'list': {
      const listBlock = block as ListBlockData;
      const ListComponent = listBlock.listType === 'ordered' ? 'ol' : 'ul';
      return (
        <ListComponent className={cn(
          'my-4 pl-6',
          listBlock.listType === 'ordered' ? 'list-decimal' : 'list-disc',
        )}>
          {(listBlock.items || []).map((item: string, index: number) => (
            <li key={index} className="my-1">{item}</li>
          ))}
        </ListComponent>
      );
    }

    case 'quote': {
      const quoteBlock = block as QuoteBlockData;
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 py-2 my-4 italic">
          <p>{quoteBlock.text || ''}</p>
          {quoteBlock.citation && (
            <footer className="text-sm text-gray-600 mt-2">
              — {quoteBlock.citation}
            </footer>
          )}
        </blockquote>
      );
    }
      
    case 'divider':
      return <hr className="my-6 border-t border-gray-200" />;

    case 'callout': {
      const calloutBlock = block as CalloutBlockData;
      return (
        <div className={cn(
          'my-6 p-4 rounded-md border',
          calloutBlock.style === 'info' ? 'bg-blue-50 border-blue-200' :
          calloutBlock.style === 'warning' ? 'bg-amber-50 border-amber-200' :
          calloutBlock.style === 'success' ? 'bg-green-50 border-green-200' :
          calloutBlock.style === 'error' ? 'bg-red-50 border-red-200' :
          'bg-gray-50 border-gray-200'
        )}>
          <div className="font-medium mb-1">
            {calloutBlock.title || 'Nota'}
          </div>
          <div>
            {calloutBlock.content || ''}
          </div>
        </div>
      );
    }

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