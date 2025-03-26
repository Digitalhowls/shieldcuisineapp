import React, { useState } from 'react';
import { Layout } from '@/components/cms/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { EnhancedBlock, EnhancedBlockContainer } from '@/components/cms/block-editor/enhanced-block-container';
import { v4 as uuidv4 } from 'uuid';

/**
 * Página de demostración de bloques animados
 * 
 * Esta página muestra cómo se pueden animar diferentes bloques
 * de contenido en el CMS.
 */
const AnimatedBlocksDemo: React.FC = () => {
  // Estado para los bloques
  const [blocks, setBlocks] = useState<EnhancedBlock[]>([
    {
      id: uuidv4(),
      type: 'heading',
      content: {
        text: 'Demostración de Bloques Animados',
        level: 'h1',
      },
      animation: {
        config: {
          effect: 'fadeInDown',
          duration: 'slow',
          delay: 'small',
        },
        library: 'framer-motion',
      },
    },
    {
      id: uuidv4(),
      type: 'paragraph',
      content: {
        text: 'Esta página demuestra cómo se pueden aplicar diferentes animaciones a los bloques de contenido en el CMS. Cada bloque puede tener su propia animación personalizada, lo que permite crear páginas web más interactivas y atractivas.',
      },
      animation: {
        config: {
          effect: 'fadeIn',
          duration: 'normal',
          delay: 'medium',
        },
        library: 'react-spring',
      },
    },
    {
      id: uuidv4(),
      type: 'image',
      content: {
        src: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop',
        alt: 'Gradiente abstracto',
        caption: 'Ejemplo de imagen con animación',
      },
      animation: {
        config: {
          effect: 'zoomIn',
          duration: 'slow',
          delay: 'large',
        },
        library: 'gsap',
      },
    },
    {
      id: uuidv4(),
      type: 'button',
      content: {
        text: 'Botón con animación',
        url: '#',
        variant: 'default',
        size: 'lg',
        align: 'center',
      },
      animation: {
        config: {
          effect: 'hoverPulse',
          duration: 'fast',
        },
        library: 'framer-motion',
      },
    },
  ]);
  
  // Visualización previa de los bloques
  const [previewMode, setPreviewMode] = useState(false);
  
  // Funciones para manipular bloques
  const updateBlock = (id: string, updatedContent: any) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content: updatedContent } : block
    ));
  };
  
  const updateBlockMeta = (id: string, meta: Partial<Omit<EnhancedBlock, 'content'>>) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, ...meta } : block
    ));
  };
  
  const moveBlock = (dragIndex: number, hoverIndex: number) => {
    if (hoverIndex < 0 || hoverIndex >= blocks.length) return;
    
    const newBlocks = [...blocks];
    const draggedBlock = newBlocks[dragIndex];
    newBlocks.splice(dragIndex, 1);
    newBlocks.splice(hoverIndex, 0, draggedBlock);
    setBlocks(newBlocks);
  };
  
  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };
  
  const duplicateBlock = (id: string) => {
    const blockToDuplicate = blocks.find(block => block.id === id);
    if (!blockToDuplicate) return;
    
    const duplicatedBlock = {
      ...blockToDuplicate,
      id: uuidv4(),
    };
    
    const index = blocks.findIndex(block => block.id === id);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, duplicatedBlock);
    setBlocks(newBlocks);
  };
  
  const addBlockAfter = (id: string, type: string) => {
    const index = blocks.findIndex(block => block.id === id);
    if (index === -1) return;
    
    const newBlock: EnhancedBlock = {
      id: uuidv4(),
      type,
      content: getDefaultContentForType(type),
    };
    
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
  };
  
  // Función para obtener contenido predeterminado según el tipo de bloque
  const getDefaultContentForType = (type: string): any => {
    switch (type) {
      case 'heading':
        return { text: 'Nuevo título', level: 'h2' };
      case 'paragraph':
        return { text: 'Nuevo párrafo de texto...' };
      case 'image':
        return { src: '', alt: '', caption: '' };
      case 'gallery':
        return { images: [], layout: 'grid' };
      case 'button':
        return { text: 'Botón', url: '#', variant: 'default', size: 'default', align: 'left' };
      case 'quote':
        return { text: 'Cita de ejemplo', author: '', source: '', align: 'left' };
      case 'video':
        return { src: '', type: 'youtube', title: '', aspectRatio: '16:9' };
      case 'divider':
        return { style: 'solid' };
      case 'table':
        return { rows: [[{ content: 'Ejemplo', header: true }]], withHeader: true };
      case 'html':
        return { code: '<!-- Código HTML aquí -->' };
      case 'form':
        return { fields: [], submitButtonText: 'Enviar' };
      default:
        return {};
    }
  };
  
  // Renderizar el componente para cada tipo de bloque
  const renderBlockComponent = (block: EnhancedBlock) => {
    switch (block.type) {
      case 'heading':
        return renderHeading(block);
      case 'paragraph':
        return renderParagraph(block);
      case 'image':
        return renderImage(block);
      case 'button':
        return renderButton(block);
      default:
        return <div>Tipo de bloque no soportado: {block.type}</div>;
    }
  };
  
  // Renderizadores para cada tipo de bloque
  const renderHeading = (block: EnhancedBlock) => {
    const { text, level } = block.content;
    
    switch (level) {
      case 'h1':
        return <h1 className="text-4xl font-bold mb-4">{text}</h1>;
      case 'h2':
        return <h2 className="text-3xl font-bold mb-3">{text}</h2>;
      case 'h3':
        return <h3 className="text-2xl font-bold mb-2">{text}</h3>;
      case 'h4':
        return <h4 className="text-xl font-bold mb-2">{text}</h4>;
      default:
        return <h2 className="text-3xl font-bold mb-3">{text}</h2>;
    }
  };
  
  const renderParagraph = (block: EnhancedBlock) => {
    return <p className="mb-4">{block.content.text}</p>;
  };
  
  const renderImage = (block: EnhancedBlock) => {
    const { src, alt, caption } = block.content;
    
    return (
      <figure className="mb-4">
        {src ? (
          <img src={src} alt={alt || ''} className="w-full h-auto rounded-md" />
        ) : (
          <div className="h-40 bg-muted/30 flex items-center justify-center rounded-md">
            <p className="text-muted-foreground">Vista previa de imagen</p>
          </div>
        )}
        {caption && (
          <figcaption className="text-sm text-muted-foreground mt-2">{caption}</figcaption>
        )}
      </figure>
    );
  };
  
  const renderButton = (block: EnhancedBlock) => {
    const { text, url, variant, size, align } = block.content;
    
    const getButtonSize = () => {
      switch (size) {
        case 'sm': return 'h-8 px-3 text-xs';
        case 'lg': return 'h-11 px-8';
        default: return '';
      }
    };
    
    const getAlignment = () => {
      switch (align) {
        case 'center': return 'justify-center';
        case 'right': return 'justify-end';
        default: return 'justify-start';
      }
    };
    
    return (
      <div className={`flex w-full mb-4 ${getAlignment()}`}>
        <Button 
          variant={variant as any || 'default'} 
          className={getButtonSize()}
          asChild
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        </Button>
      </div>
    );
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <Tabs defaultValue="editor" className="mb-6">
          <div className="flex justify-between mb-4">
            <TabsList>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Vista previa</TabsTrigger>
            </TabsList>
            
            <Button
              variant={previewMode ? "default" : "outline"}
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? "Salir de vista previa" : "Vista previa"}
            </Button>
          </div>
          
          <TabsContent value="editor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Editor de Bloques Animados</CardTitle>
                <CardDescription>
                  Edita y configura la animación de cada bloque
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {blocks.map((block, index) => (
                    <EnhancedBlockContainer
                      key={block.id}
                      block={block}
                      index={index}
                      moveBlock={moveBlock}
                      updateBlock={updateBlock}
                      updateBlockMeta={updateBlockMeta}
                      removeBlock={removeBlock}
                      duplicateBlock={duplicateBlock}
                      addBlockAfter={addBlockAfter}
                      readOnly={false}
                    >
                      {renderBlockComponent(block)}
                    </EnhancedBlockContainer>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
                <CardDescription>
                  Visualiza cómo se verán los bloques con sus animaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 p-4">
                  {blocks.map((block, index) => (
                    <EnhancedBlockContainer
                      key={block.id}
                      block={block}
                      index={index}
                      moveBlock={moveBlock}
                      updateBlock={updateBlock}
                      updateBlockMeta={updateBlockMeta}
                      removeBlock={removeBlock}
                      duplicateBlock={duplicateBlock}
                      addBlockAfter={addBlockAfter}
                      readOnly={true}
                    >
                      {renderBlockComponent(block)}
                    </EnhancedBlockContainer>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AnimatedBlocksDemo;