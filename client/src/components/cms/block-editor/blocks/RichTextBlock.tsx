import { FC, useCallback, useMemo, memo, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { Toolbar } from './rich-text/Toolbar';
import { AiAssistant } from './rich-text/ai-assistant';

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
 * Componente interno del editor
 */
const RichTextEditor = ({ 
  editor, 
  isActive, 
  readOnly,
  onAiContentGenerated
}: { 
  editor: Editor | null;
  isActive: boolean;
  readOnly?: boolean;
  onAiContentGenerated?: (content: string) => void;
}) => {
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  
  if (!editor) {
    return null;
  }

  const handleAiContentGenerated = (content: string) => {
    if (onAiContentGenerated) {
      onAiContentGenerated(content);
    }
    setShowAiAssistant(false);
  };

  return (
    <div className="rich-text-editor">
      {!readOnly && isActive && (
        <>
          <div className="flex items-center justify-between mb-2">
            <Toolbar editor={editor} />
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 ml-2" 
              onClick={() => setShowAiAssistant(!showAiAssistant)}
            >
              <Sparkles className="h-4 w-4" /> 
              {showAiAssistant ? 'Ocultar IA' : 'Asistente IA'}
            </Button>
          </div>
          {showAiAssistant && (
            <div className="mb-4 border rounded-md p-3 bg-secondary/10">
              <AiAssistant 
                onContentGenerated={handleAiContentGenerated}
                initialPrompt={editor.getText().substring(0, 100)}
              />
            </div>
          )}
        </>
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
 * Integra un asistente de IA para generar contenido.
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

  // Maneja el contenido generado por el asistente de IA
  const handleAiContentGenerated = useCallback((generatedContent: string) => {
    if (editor) {
      // Inserta el contenido generado en la posición actual del cursor
      editor.chain().focus().insertContent(generatedContent).run();
      
      // También actualiza el contenido en el almacenamiento
      handleUpdate(editor.getHTML());
    }
  }, [editor, handleUpdate]);

  return (
    <Card className={`w-full overflow-hidden ${isActive ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <RichTextEditor 
          editor={editor} 
          isActive={isActive} 
          readOnly={readOnly} 
          onAiContentGenerated={handleAiContentGenerated}
        />
      </CardContent>
    </Card>
  );
};

export default memo(RichTextBlock);