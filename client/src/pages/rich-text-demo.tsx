import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import RichTextBlock from '@/components/cms/block-editor/blocks/RichTextBlock';
import { RichTextContent } from '@/components/cms/block-editor/types';
import { Button } from '@/components/ui/button';

const RichTextDemo = () => {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  // Definimos un tipo para nuestros bloques con textAlign que puede cambiar
  type RichTextBlock = {
    id: string;
    type: 'rich-text';
    content: {
      content: string;
      textAlign: 'left' | 'center' | 'right';
    };
  };
  
  const [blocks, setBlocks] = useState<RichTextBlock[]>([
    {
      id: uuidv4(),
      type: 'rich-text',
      content: {
        content: '<h2>Bienvenido al Editor de Texto Enriquecido</h2><p>Este es un ejemplo de texto con <strong>formato</strong> y algunas <em>características</em> de <u>edición</u>.</p>',
        textAlign: 'left'
      }
    }
  ]);

  const handleBlockUpdate = (blockId: string, data: { content: RichTextContent }) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === blockId 
          ? { 
              ...block, 
              content: {
                content: data.content.content,
                textAlign: data.content.textAlign || 'left'
              } 
            } 
          : block
      )
    );
  };

  const addNewBlock = () => {
    const newBlock: RichTextBlock = {
      id: uuidv4(),
      type: 'rich-text',
      content: {
        content: '<p>Nuevo bloque de texto. Haz clic para editar.</p>',
        textAlign: 'left'
      }
    };
    setBlocks([...blocks, newBlock]);
    setActiveBlockId(newBlock.id);
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-bold">Demostración del Bloque de Texto Enriquecido</h1>
        <p className="text-muted-foreground mt-2">
          Este es un componente de texto enriquecido para el editor de bloques de ShieldCuisine.
        </p>
      </header>

      <div className="grid gap-6">
        {blocks.map(block => (
          <div 
            key={block.id}
            onClick={() => setActiveBlockId(block.id)}
            className="cursor-pointer"
          >
            <RichTextBlock
              data={block}
              isActive={activeBlockId === block.id}
              onUpdate={(data) => handleBlockUpdate(block.id, data)}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 my-4">
        <Button onClick={addNewBlock}>
          Añadir bloque de texto
        </Button>
        <Button variant="outline" onClick={() => setActiveBlockId(null)}>
          Desactivar selección
        </Button>
      </div>

      <div className="mt-8 border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">Datos del componente:</h2>
        <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60 text-sm">
          {JSON.stringify(blocks, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default RichTextDemo;