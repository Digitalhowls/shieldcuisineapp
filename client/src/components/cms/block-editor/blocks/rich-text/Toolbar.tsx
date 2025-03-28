import { FC, memo } from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  Image as ImageIcon,
  AlertTriangle,
  Quote,
  Heading1,
  Heading2,
  Heading3, 
  Palette,
  Type,
  Code,
  Trash2
} from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ToolbarProps {
  editor: Editor;
}

// Función auxiliar para crear un botón de herramienta con tooltip
const ToolButton = ({ 
  onClick, 
  active, 
  disabled, 
  tooltip, 
  icon: Icon 
}: { 
  onClick: () => void; 
  active?: boolean; 
  disabled?: boolean;
  tooltip: string; 
  icon: FC<{ className?: string }> 
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          pressed={active}
          onPressedChange={() => onClick()}
          disabled={disabled}
          className="h-8 w-8 p-0"
          size="sm"
        >
          <Icon className="h-4 w-4" />
        </Toggle>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

/**
 * Barra de herramientas para el editor de texto enriquecido
 */
export const Toolbar: FC<ToolbarProps> = memo(({ editor }) => {
  if (!editor) {
    return null;
  }

  // Maneja el diálogo para agregar enlaces
  const handleLinkSubmit = (url: string) => {
    if (url) {
      // Si no hay texto seleccionado, usa la URL como texto
      if (editor.state.selection.empty) {
        editor.chain().focus().insertContent(url).run();
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      } else {
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      }
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
  };

  // Maneja el diálogo para insertar imágenes
  const handleImageSubmit = (url: string, alt: string) => {
    if (url) {
      editor.chain().focus().setImage({ src: url, alt }).run();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-1 mb-2 border rounded-md bg-background">
      {/* Estilos básicos */}
      <div className="flex gap-1 mr-2">
        <ToolButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          tooltip="Negrita"
          icon={Bold}
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          tooltip="Cursiva"
          icon={Italic}
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          tooltip="Subrayado"
          icon={Underline}
        />
      </div>

      {/* Encabezados */}
      <div className="flex gap-1 mr-2">
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          tooltip="Título 1"
          icon={Heading1}
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          tooltip="Título 2"
          icon={Heading2}
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          tooltip="Título 3"
          icon={Heading3}
        />
      </div>

      {/* Alineación */}
      <div className="flex gap-1 mr-2">
        <ToolButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          tooltip="Alinear a la izquierda"
          icon={AlignLeft}
        />
        <ToolButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          tooltip="Centrar"
          icon={AlignCenter}
        />
        <ToolButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          tooltip="Alinear a la derecha"
          icon={AlignRight}
        />
      </div>

      {/* Listas */}
      <div className="flex gap-1 mr-2">
        <ToolButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          tooltip="Lista con viñetas"
          icon={List}
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          tooltip="Lista numerada"
          icon={ListOrdered}
        />
      </div>

      {/* Citas */}
      <div className="flex gap-1 mr-2">
        <ToolButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          tooltip="Cita"
          icon={Quote}
        />
      </div>

      {/* Código */}
      <div className="flex gap-1 mr-2">
        <ToolButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          tooltip="Bloque de código"
          icon={Code}
        />
      </div>

      {/* Enlaces */}
      <div className="flex gap-1 mr-2">
        <Popover>
          <PopoverTrigger asChild>
            <Toggle
              pressed={editor.isActive('link')}
              className="h-8 w-8 p-0"
              size="sm"
            >
              <LinkIcon className="h-4 w-4" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Insertar enlace</h4>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input 
                  id="url" 
                  placeholder="https://ejemplo.com" 
                  defaultValue={editor.getAttributes('link').href || ''}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLinkSubmit((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                      document.body.click(); // Cierra el popover
                    }
                  }}
                />
                <div className="flex gap-2 justify-end">
                  {editor.isActive('link') && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        editor.chain().focus().unsetLink().run();
                        document.body.click(); // Cierra el popover
                      }}
                    >
                      Eliminar enlace
                    </Button>
                  )}
                  <Button 
                    size="sm"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).closest('.space-y-4')?.querySelector('input');
                      if (input) {
                        handleLinkSubmit(input.value);
                        input.value = '';
                        document.body.click(); // Cierra el popover
                      }
                    }}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Imágenes */}
      <div className="flex gap-1 mr-2">
        <Popover>
          <PopoverTrigger asChild>
            <Toggle className="h-8 w-8 p-0" size="sm">
              <ImageIcon className="h-4 w-4" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Insertar imagen</h4>
              <div className="space-y-2">
                <Label htmlFor="imgUrl">URL de la imagen</Label>
                <Input id="imgUrl" placeholder="https://ejemplo.com/imagen.jpg" />
                <Label htmlFor="imgAlt">Texto alternativo</Label>
                <Input id="imgAlt" placeholder="Descripción de la imagen" />
                <div className="flex justify-end">
                  <Button 
                    size="sm"
                    onClick={(e) => {
                      const container = (e.target as HTMLElement).closest('.space-y-4');
                      const urlInput = container?.querySelector('#imgUrl') as HTMLInputElement;
                      const altInput = container?.querySelector('#imgAlt') as HTMLInputElement;
                      if (urlInput) {
                        handleImageSubmit(urlInput.value, altInput?.value || '');
                        urlInput.value = '';
                        if (altInput) altInput.value = '';
                        document.body.click(); // Cierra el popover
                      }
                    }}
                  >
                    Insertar
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Color de texto */}
      <div className="flex gap-1 mr-2">
        <Popover>
          <PopoverTrigger asChild>
            <Toggle className="h-8 w-8 p-0" size="sm">
              <Palette className="h-4 w-4" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-60">
            <div className="space-y-4">
              <h4 className="font-medium">Color de texto</h4>
              <div className="grid grid-cols-5 gap-2">
                {['#000000', '#DC2626', '#2563EB', '#16A34A', '#CA8A04', 
                  '#525252', '#EA580C', '#4338CA', '#0891B2', '#A21CAF', 
                  '#FFFFFF', '#FCA5A5', '#93C5FD', '#86EFAC', '#FDE68A'
                ].map(color => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      editor.chain().focus().setColor(color).run();
                      document.body.click(); // Cierra el popover
                    }}
                  />
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  document.body.click(); // Cierra el popover
                }}
              >
                Restablecer color
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Limpiar formato */}
      <div className="flex gap-1">
        <ToolButton
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          tooltip="Limpiar formato"
          icon={Type}
        />
      </div>
    </div>
  );
});