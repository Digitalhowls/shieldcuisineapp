import { FC, useCallback, useMemo, memo } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { RichTextContent } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

/**
 * Interfaz para el bloque de texto enriquecido
 */
interface RichTextBlockProps {
  data: {
    id: string;
    type: 'rich-text';
    content: RichTextContent;
  };
  isActive: boolean;
  onUpdate: (data: { content: RichTextContent }) => void;
  readOnly?: boolean;
}

/**
 * Barra de herramientas simple para el editor
 */
const Toolbar: FC<{ editor: Editor }> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-1 mb-2 border rounded-md bg-background">
      <div className="flex gap-1 mr-2">
        <Toggle
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          className="h-8 w-8 p-0"
          size="sm"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 w-8 p-0"
          size="sm"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('underline')}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          className="h-8 w-8 p-0"
          size="sm"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>
      </div>

      <div className="flex gap-1 mr-2">
        <Toggle
          pressed={editor.isActive({ textAlign: 'left' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
          className="h-8 w-8 p-0"
          size="sm"
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive({ textAlign: 'center' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
          className="h-8 w-8 p-0"
          size="sm"
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive({ textAlign: 'right' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
          className="h-8 w-8 p-0"
          size="sm"
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>
      </div>
    </div>
  );
};

/**
 * Componente interno del editor
 */
const RichTextEditor = ({ 
  editor, 
  isActive, 
  readOnly 
}: { 
  editor: Editor | null;
  isActive: boolean;
  readOnly?: boolean;
}) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor">
      {!readOnly && isActive && (
        <Toolbar editor={editor} />
      )}
      <EditorContent 
        editor={editor}
        className={`prose max-w-none dark:prose-invert ${isActive ? 'prose-focus' : ''}`}
      />
    </div>
  );
};

/**
 * Bloque de texto enriquecido con formato avanzado
 * 
 * Permite la edición de texto con formato enriquecido utilizando TipTap
 * con soporte para negrita, cursiva, enlaces, listas, alineación, etc.
 */
const RichTextBlock: FC<RichTextBlockProps> = ({ 
  data, 
  isActive,
  onUpdate,
  readOnly = false
}) => {
  const { content, textAlign = 'left' } = data.content;

  const handleUpdate = useCallback((newContent: string) => {
    onUpdate({
      content: {
        ...data.content,
        content: newContent
      }
    });
  }, [data.content, onUpdate]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
        defaultAlignment: textAlign,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TextStyle,
      Color,
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      handleUpdate(editor.getHTML());
    },
  });

  // Actualiza el editor si cambia el contenido de forma externa
  useMemo(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  return (
    <Card className={`w-full overflow-hidden ${isActive ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <RichTextEditor editor={editor} isActive={isActive} readOnly={readOnly} />
      </CardContent>
    </Card>
  );
};

export default memo(RichTextBlock);