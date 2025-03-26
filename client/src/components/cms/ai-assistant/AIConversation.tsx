import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Send,
  User,
  Bot,
  Copy,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Tag,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { generateContent } from '@/lib/openai-service';

type MessageType = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

interface PageContext {
  title?: string;
  description?: string;
  type?: string;
}

interface AIConversationProps {
  contextualPrompts?: string[];
  pageContext?: PageContext;
  onApplyContent?: (content: string) => void;
  onApplySeoTitle?: (title: string) => void;
  onApplySeoDescription?: (description: string) => void;
  onApplySeoKeywords?: (keywords: string) => void;
}

export function AIConversation({
  contextualPrompts = [],
  pageContext = {},
  onApplyContent,
  onApplySeoTitle,
  onApplySeoDescription,
  onApplySeoKeywords,
}: AIConversationProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // El ID inicial de bienvenida del sistema
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome-message',
        role: 'assistant' as const,
        content: `¡Hola! Soy tu asistente de IA para el editor de contenido. ${
          pageContext.title 
            ? `Veo que estás trabajando en "${pageContext.title}".` 
            : 'Estoy aquí para ayudarte con tu contenido.'
        } Puedo ayudarte con:
        
• Generar contenido para tus páginas
• Reescribir o mejorar textos existentes
• Crear meta descripciones y títulos SEO
• Sugerir palabras clave relevantes
• Analizar la calidad del contenido

¿Cómo puedo ayudarte hoy?`,
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
    }
  }, []);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Create and add user message
    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setError(null);
    setIsLoading(true);
    
    try {
      // Agregar contexto de la página actual a la solicitud
      const contextInfo = pageContext.title 
        ? `Información de contexto:
          - Título de la página: ${pageContext.title}
          - Tipo de contenido: ${pageContext.type || 'página'}
          ${pageContext.description ? `- Descripción: ${pageContext.description}` : ''}
          
          Con este contexto, responde a la siguiente consulta:`
        : '';
      
      const prompt = contextInfo ? `${contextInfo}\n\n${inputValue}` : inputValue;
      
      // Llamada a la API de OpenAI
      const responseContent = await generateContent(prompt);
      
      // Create and add assistant message
      const assistantMessage: MessageType = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error al comunicarse con la IA:', err);
      setError('Hubo un error al comunicarse con la IA. Por favor, inténtalo de nuevo.');
      
      toast({
        title: 'Error',
        description: 'No se pudo obtener respuesta de la IA. Verifica tu conexión o la clave API.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    
    // Reset copied status after 2 seconds
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
    
    toast({
      title: 'Copiado al portapapeles',
      description: 'El texto ha sido copiado correctamente',
    });
  };
  
  const applyContent = (content: string) => {
    if (onApplyContent) {
      onApplyContent(content);
      
      toast({
        title: 'Contenido aplicado',
        description: 'El contenido generado ha sido aplicado',
      });
    }
  };
  
  // Renderizar un mensaje
  const renderMessage = (message: MessageType) => {
    const isUser = message.role === 'user';
    
    return (
      <div
        key={message.id}
        className={cn(
          'flex gap-3 p-4',
          isUser ? 'bg-muted/50' : 'bg-background'
        )}
      >
        <div className={cn(
          'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
          isUser ? 'bg-background' : 'bg-primary text-primary-foreground'
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="prose-sm">
            {message.content.split('\n').map((paragraph, i) => (
              <p key={i} className={i > 0 ? 'mt-2' : ''}>
                {paragraph}
              </p>
            ))}
          </div>
          
          {!isUser && (
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                onClick={() => copyToClipboard(message.content, message.id)}
              >
                {copiedId === message.id ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                onClick={() => applyContent(message.content)}
              >
                <ArrowRight className="h-3.5 w-3.5" />
                <span>Aplicar</span>
              </Button>
              
              {onApplySeoTitle && onApplySeoDescription && onApplySeoKeywords && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      <Tag className="h-3.5 w-3.5" />
                      <span>Aplicar como...</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onApplySeoTitle(message.content)}>
                      Título SEO
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onApplySeoDescription(message.content)}>
                      Meta Descripción
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onApplySeoKeywords(message.content)}>
                      Palabras Clave
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-[500px] max-h-[500px]">
      <ScrollArea className="flex-1 border rounded-md">
        <div className="flex flex-col">
          {messages.map(renderMessage)}
          
          {isLoading && (
            <div className="flex items-center gap-3 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-primary text-primary-foreground shadow">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <Spinner className="h-5 w-5" />
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-3 p-4 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="mt-4 space-y-4">
        {contextualPrompts && contextualPrompts.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Sugerencias de prompts:</p>
            <div className="flex flex-wrap gap-2">
              {contextualPrompts.slice(0, 5).map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => setInputValue(prompt)}
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate max-w-[150px]">{prompt}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex space-x-2">
          <Input
            placeholder="Escribe tu mensaje..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !inputValue.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}