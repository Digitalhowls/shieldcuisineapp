import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Wand2,
  Star,
  MessageSquare,
  Copy,
  CheckCircle,
  Plus,
  Search,
  Trash2,
  Edit,
  Save,
  X,
} from 'lucide-react';

type SavedPrompt = {
  id: string;
  text: string;
  category?: string;
  isFavorite?: boolean;
};

interface SavedPromptsProps {
  contextualPrompts?: string[];
  onSelectPrompt?: (prompt: string) => void;
}

export function SavedPrompts({
  contextualPrompts = [],
  onSelectPrompt,
}: SavedPromptsProps) {
  // En una aplicación real, estos prompts vendrían de una API o almacenamiento persistente
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>(() => {
    // Intenta cargar los prompts guardados del almacenamiento local
    const storedPrompts = localStorage.getItem('savedPrompts');
    if (storedPrompts) {
      try {
        return JSON.parse(storedPrompts);
      } catch (e) {
        console.error('Error al parsear prompts guardados:', e);
      }
    }
    
    // Prompts predeterminados
    return [
      {
        id: '1',
        text: 'Genera un párrafo introductorio para una página sobre seguridad alimentaria',
        category: 'Contenido',
        isFavorite: true,
      },
      {
        id: '2',
        text: 'Crea una lista de beneficios de implementar un sistema APPCC',
        category: 'Contenido',
        isFavorite: false,
      },
      {
        id: '3',
        text: 'Escribe una meta descripción SEO optimizada para una página sobre certificaciones de seguridad alimentaria',
        category: 'SEO',
        isFavorite: true,
      },
      {
        id: '4',
        text: 'Genera una conclusión persuasiva con llamada a la acción para una página de productos',
        category: 'Marketing',
        isFavorite: false,
      },
    ];
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [newPromptText, setNewPromptText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  
  const { toast } = useToast();
  
  // Guardar prompts en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts));
  }, [savedPrompts]);
  
  // Filtrar prompts basados en la búsqueda
  const filteredPrompts = savedPrompts.filter(prompt => 
    prompt.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (prompt.category && prompt.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Agrupar por categoría
  const groupedPrompts: Record<string, SavedPrompt[]> = {};
  
  // Primero agregamos los favoritos
  const favorites = filteredPrompts.filter(p => p.isFavorite);
  if (favorites.length > 0) {
    groupedPrompts['Favoritos'] = favorites;
  }
  
  // Luego agrupamos por categoría
  filteredPrompts.forEach(prompt => {
    const category = prompt.category || 'General';
    if (category !== 'Favoritos') {  // Evitamos duplicar los favoritos
      if (!groupedPrompts[category]) {
        groupedPrompts[category] = [];
      }
      if (!prompt.isFavorite || (prompt.isFavorite && category !== 'Favoritos')) {
        groupedPrompts[category].push(prompt);
      }
    }
  });
  
  const addNewPrompt = () => {
    if (!newPromptText.trim()) return;
    
    const newPrompt: SavedPrompt = {
      id: `prompt-${Date.now()}`,
      text: newPromptText.trim(),
      category: 'General',
      isFavorite: false,
    };
    
    setSavedPrompts([...savedPrompts, newPrompt]);
    setNewPromptText('');
    
    toast({
      title: 'Prompt guardado',
      description: 'El prompt se ha guardado correctamente',
    });
  };
  
  const deletePrompt = (id: string) => {
    setSavedPrompts(savedPrompts.filter(p => p.id !== id));
    
    toast({
      title: 'Prompt eliminado',
      description: 'El prompt se ha eliminado correctamente',
    });
  };
  
  const toggleFavorite = (id: string) => {
    setSavedPrompts(
      savedPrompts.map(p => 
        p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
      )
    );
  };
  
  const startEditing = (prompt: SavedPrompt) => {
    setEditingPromptId(prompt.id);
    setEditingText(prompt.text);
  };
  
  const saveEditing = () => {
    if (!editingPromptId || !editingText.trim()) return;
    
    setSavedPrompts(
      savedPrompts.map(p => 
        p.id === editingPromptId ? { ...p, text: editingText.trim() } : p
      )
    );
    
    setEditingPromptId(null);
    setEditingText('');
    
    toast({
      title: 'Prompt actualizado',
      description: 'El prompt se ha actualizado correctamente',
    });
  };
  
  const cancelEditing = () => {
    setEditingPromptId(null);
    setEditingText('');
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
  
  const handleSelectPrompt = (prompt: string) => {
    if (onSelectPrompt) {
      onSelectPrompt(prompt);
      
      toast({
        title: 'Prompt seleccionado',
        description: 'El prompt ha sido seleccionado',
      });
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Prompts Guardados</CardTitle>
          <CardDescription>
            Guarda y organiza tus prompts favoritos para reutilizarlos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar prompts..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => setSearchQuery('')}
              disabled={!searchQuery}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              placeholder="Añadir nuevo prompt..."
              className="flex-1"
              value={newPromptText}
              onChange={(e) => setNewPromptText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newPromptText.trim()) {
                  e.preventDefault();
                  addNewPrompt();
                }
              }}
            />
            <Button 
              size="icon"
              onClick={addNewPrompt}
              disabled={!newPromptText.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {contextualPrompts && contextualPrompts.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Sugerencias para esta página</h3>
                <ScrollArea className="h-28 rounded-md border p-2">
                  <div className="space-y-2">
                    {contextualPrompts.map((prompt, index) => (
                      <div key={index} className="flex items-center gap-2 group">
                        <Wand2 className="h-4 w-4 text-primary shrink-0" />
                        <p className="text-sm flex-1 truncate" title={prompt}>
                          {prompt}
                        </p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyToClipboard(prompt, `suggestion-${index}`)}
                          >
                            {copiedId === `suggestion-${index}` ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleSelectPrompt(prompt)}
                          >
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
          
          <Separator />
          
          <ScrollArea className="h-64 rounded-md border p-2">
            {Object.keys(groupedPrompts).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
                <Wand2 className="h-10 w-10 mb-2 opacity-20" />
                <p>No hay prompts guardados que coincidan con tu búsqueda.</p>
                <p className="text-sm">Añade nuevos prompts o cambia los criterios de búsqueda.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedPrompts).map(([category, prompts]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center gap-1">
                      {category === 'Favoritos' && <Star className="h-3.5 w-3.5 text-yellow-500" />}
                      {category}
                    </h3>
                    <div className="space-y-2 pl-1">
                      {prompts.map((prompt) => (
                        <div key={prompt.id} className="group">
                          {editingPromptId === prompt.id ? (
                            <div className="flex gap-2">
                              <Input
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="flex-1 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && editingText.trim()) {
                                    e.preventDefault();
                                    saveEditing();
                                  } else if (e.key === 'Escape') {
                                    cancelEditing();
                                  }
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={saveEditing}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={cancelEditing}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-6 w-6 p-0 ${prompt.isFavorite ? 'text-yellow-500' : 'text-muted-foreground opacity-30 hover:opacity-100'}`}
                                onClick={() => toggleFavorite(prompt.id)}
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                              <p 
                                className="text-sm flex-1 cursor-pointer"
                                onClick={() => handleSelectPrompt(prompt.text)}
                              >
                                {prompt.text}
                              </p>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => copyToClipboard(prompt.text, prompt.id)}
                                >
                                  {copiedId === prompt.id ? (
                                    <CheckCircle className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => startEditing(prompt)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => deletePrompt(prompt.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}