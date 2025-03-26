import React, { useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { v4 as uuidv4 } from "uuid";
import { Plus, Trash2, Move, Copy, Settings } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Block Components
import BlockContainer from "./BlockContainer";
import TextBlock from "./blocks/TextBlock";
import HeadingBlock from "./blocks/HeadingBlock";
import ImageBlock from "./blocks/ImageBlock";
import HtmlBlock from "./blocks/HtmlBlock";
import { AiBlock } from "./blocks/AiBlock";

export interface Block {
  id: string;
  type: string;
  [key: string]: any;
}

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  readOnly?: boolean;
}

const DEFAULT_BLOCKS: {[key: string]: any} = {
  heading: {
    text: "Título de encabezado",
    level: "h2",
    alignment: "left",
  },
  text: {
    text: "<p>Haz clic para editar este texto. Este es un párrafo de ejemplo que puedes modificar según tus necesidades.</p>",
  },
  image: {
    src: "/placeholder-image.jpg",
    alt: "Imagen descriptiva",
    caption: "",
    alignment: "center",
  },
  ai: {
    content: "",
    prompt: "Escribe un texto sobre...",
    tone: "profesional",
    format: "html",
  },
  button: {
    text: "Botón",
    url: "#",
    variant: "default",
    size: "default",
    alignment: "left",
  },
  divider: {
    style: "solid",
  },
  spacer: {
    height: 50,
  },
  video: {
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    aspectRatio: "16:9",
  },
  html: {
    content: "<div>Ingresa tu código HTML personalizado aquí</div>",
  },
  card: {
    title: "Título de tarjeta",
    content: "Contenido de la tarjeta con descripción detallada.",
    image: "/placeholder-card.jpg",
    buttonText: "Botón",
    buttonUrl: "#",
  },
  columns: {
    columns: [
      { id: uuidv4(), content: "<p>Contenido de la primera columna</p>" },
      { id: uuidv4(), content: "<p>Contenido de la segunda columna</p>" },
    ],
    columnCount: 2,
    gap: 16,
  },
  team: {
    members: [
      {
        id: uuidv4(),
        name: "Nombre Apellido",
        role: "Cargo / Puesto",
        image: "/placeholder-profile.jpg",
        bio: "Breve biografía del miembro del equipo.",
      }
    ],
    layout: "grid",
  },
  testimonial: {
    quote: "Este es un testimonio de ejemplo. Aquí iría un comentario positivo de un cliente satisfecho.",
    author: "Nombre del Cliente",
    company: "Empresa",
    image: "/placeholder-avatar.jpg",
    rating: 5,
  },
  pricing: {
    plans: [
      {
        id: uuidv4(),
        name: "Plan Básico",
        price: "19.99",
        period: "mes",
        features: ["Característica 1", "Característica 2", "Característica 3"],
        buttonText: "Elegir Plan",
        buttonUrl: "#",
        featured: false,
      }
    ],
  }
};

const BLOCK_CATEGORIES = [
  {
    name: "Básicos",
    blocks: ["heading", "text", "image"]
  },
  {
    name: "Avanzados",
    blocks: ["html", "ai"]
  }
];

const BlockEditor: React.FC<BlockEditorProps> = ({
  blocks = [],
  onChange,
  readOnly = false,
}) => {
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  
  // Añadir un nuevo bloque
  const handleAddBlock = (type: string) => {
    const newBlock = {
      id: uuidv4(),
      type,
      ...DEFAULT_BLOCKS[type],
    };
    
    onChange([...blocks, newBlock]);
    setIsAddingBlock(false);
    setActiveBlock(newBlock.id);
  };
  
  // Actualizar un bloque
  const handleUpdateBlock = (id: string, data: any) => {
    onChange(
      blocks.map((block) => (block.id === id ? { ...block, ...data } : block))
    );
  };
  
  // Duplicar un bloque
  const handleDuplicateBlock = (id: string) => {
    const blockToDuplicate = blocks.find((block) => block.id === id);
    if (!blockToDuplicate) return;
    
    const newBlock = {
      ...blockToDuplicate,
      id: uuidv4(),
    };
    
    const index = blocks.findIndex((block) => block.id === id);
    
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    
    onChange(newBlocks);
  };
  
  // Eliminar un bloque
  const handleDeleteBlock = (id: string) => {
    onChange(blocks.filter((block) => block.id !== id));
    setActiveBlock(null);
  };
  
  // Mover un bloque
  const handleMoveBlock = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragBlock = blocks[dragIndex];
      const newBlocks = [...blocks];
      newBlocks.splice(dragIndex, 1);
      newBlocks.splice(hoverIndex, 0, dragBlock);
      onChange(newBlocks);
    },
    [blocks, onChange]
  );
  
  // Renderizar un bloque específico según su tipo
  const renderBlock = (block: Block, index: number) => {
    const isActive = activeBlock === block.id;
    
    // Propiedades comunes para todos los bloques
    const blockProps = {
      key: block.id,
      id: block.id,
      isActive,
      index,
      onActivate: () => setActiveBlock(block.id),
      onDeactivate: () => setActiveBlock(null),
      onUpdate: (data: any) => handleUpdateBlock(block.id, data),
      onMove: handleMoveBlock,
      onDuplicate: () => handleDuplicateBlock(block.id),
      onDelete: () => handleDeleteBlock(block.id),
      readOnly,
    };
    
    // Renderiza el componente según el tipo de bloque
    return (
      <BlockContainer {...blockProps} type={block.type}>
        {block.type === "heading" && <HeadingBlock {...blockProps} data={block} />}
        {block.type === "text" && <TextBlock {...blockProps} data={block} />}
        {block.type === "image" && <ImageBlock {...blockProps} data={block} />}
        {block.type === "html" && <HtmlBlock {...blockProps} data={block} />}
        {block.type === "ai" && <AiBlock {...blockProps} data={block} />}
        {/* Renderizamos un mensaje de error para tipos de bloques que aún no están implementados */}
        {!["heading", "text", "image", "html", "ai"].includes(block.type) && (
          <div className="p-4 border border-destructive bg-destructive/10 rounded-md">
            <p className="text-sm text-destructive">
              Bloque de tipo <strong>{block.type}</strong> no implementado aún.
            </p>
          </div>
        )}
      </BlockContainer>
    );
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="block-editor">
        <ScrollArea className="h-full">
          <div className="block-editor-content p-4 min-h-[400px]">
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-md p-6 text-muted-foreground">
                <p className="mb-4 text-center">No hay bloques en esta página. Haz clic en el botón para añadir contenido.</p>
                <Dialog open={isAddingBlock} onOpenChange={setIsAddingBlock}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Añadir Bloque
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Añadir Bloque</DialogTitle>
                      <DialogDescription>
                        Selecciona el tipo de bloque que quieres añadir a tu página
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-6">
                      {BLOCK_CATEGORIES.map((category) => (
                        <div key={category.name} className="mb-6">
                          <h3 className="mb-2 font-medium">{category.name}</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {category.blocks.map((blockType) => (
                              <Button
                                key={blockType}
                                variant="outline"
                                className="justify-start h-auto py-3 px-4"
                                onClick={() => handleAddBlock(blockType)}
                              >
                                <div className="flex flex-col items-start">
                                  <span className="font-medium capitalize">
                                    {blockType === "html" ? "HTML" : blockType === "ai" ? "IA" : blockType.charAt(0).toUpperCase() + blockType.slice(1)}
                                  </span>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingBlock(false)}>
                        Cancelar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="space-y-4">
                {blocks.map((block, index) => renderBlock(block, index))}
              </div>
            )}
          </div>
        </ScrollArea>
        
        {blocks.length > 0 && !readOnly && (
          <div className="p-4 border-t bg-background sticky bottom-0 flex justify-center">
            <Dialog open={isAddingBlock} onOpenChange={setIsAddingBlock}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Añadir Bloque
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Añadir Bloque</DialogTitle>
                  <DialogDescription>
                    Selecciona el tipo de bloque que quieres añadir a tu página
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-6">
                  {BLOCK_CATEGORIES.map((category) => (
                    <div key={category.name} className="mb-6">
                      <h3 className="mb-2 font-medium">{category.name}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {category.blocks.map((blockType) => (
                          <Button
                            key={blockType}
                            variant="outline"
                            className="justify-start h-auto py-3 px-4"
                            onClick={() => handleAddBlock(blockType)}
                          >
                            <div className="flex flex-col items-start">
                              <span className="font-medium capitalize">
                                {blockType === "html" ? "HTML" : blockType === "ai" ? "IA" : blockType.charAt(0).toUpperCase() + blockType.slice(1)}
                              </span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingBlock(false)}>
                    Cancelar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default BlockEditor;