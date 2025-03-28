import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Eye,
  EyeOff,
  ArrowLeft,
  Layout,
  Settings,
  Layers,
  CopyCheck,
  Calendar,
  Clock,
  ExternalLink,
  BookOpen,
  FileImage,
  Sparkles,
  Split,
  Smartphone,
  GitBranch,
  History,
} from "lucide-react";

// Importar componentes
import { AIAssistantPanel } from "./ai-assistant";
import PreviewPanel from "./page-editor/PreviewPanel";
import PrePublicationCheck from "./page-editor/pre-publication-check";
import DraftComparisonDialog from "./page-editor/draft-comparison-dialog";
import VersionHistoryDialog from "./page-editor/version-history-dialog";
import PagePreview from "./page-preview";

// Componentes del editor
import BlockEditor from "./block-editor"; // Importar del archivo index.tsx estandarizado
import { PageContent } from "./block-editor";

interface PageEditorProps {
  isNew?: boolean;
  pageId?: number;
}

interface PageData {
  id?: number;
  title: string;
  slug: string;
  content: string;
  status: "draft" | "published" | "archived" | "scheduled";
  visibility: "public" | "private" | "internal";
  type: "page" | "blog_post" | "course_page" | "landing_page";
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  thumbnailUrl?: string;
  publishedAt?: string;
  scheduledAt?: string;
  companyId: number;
  author?: string;
  featured?: boolean;
  recurrencePattern?: "none" | "daily" | "weekly" | "monthly";
  recurrenceEndDate?: string;
}

const PageEditor: React.FC<PageEditorProps> = ({ isNew = false, pageId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/cms/pages/:id");
  
  const [activeTab, setActiveTab] = useState("content");
  const [previewMode, setPreviewMode] = useState(false);
  const [previewLayout, setPreviewLayout] = useState<'split' | 'full'>('split');
  const [showPrePublicationCheck, setShowPrePublicationCheck] = useState(false);
  const [showDraftComparison, setShowDraftComparison] = useState(false);
  const [showDevicePreview, setShowDevicePreview] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [pageData, setPageData] = useState<PageData>({
    title: "",
    slug: "",
    content: "",
    status: "draft",
    visibility: "public",
    type: "page",
    companyId: user?.companyId || 0,
    recurrencePattern: "none",
  });
  
  const [blocks, setBlocks] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Obtener datos de la página si estamos editando
  const { data: existingPage, isLoading, error } = useQuery({
    queryKey: ["/api/cms/pages", pageId],
    queryFn: async () => {
      if (isNew || !pageId) return null;
      
      const response = await fetch(`/api/cms/pages/${pageId}`);
      if (!response.ok) {
        throw new Error("Error al cargar la página");
      }
      return response.json();
    },
    enabled: !isNew && !!pageId,
  });
  
  // Cargar los datos existentes cuando se obtengan
  useEffect(() => {
    if (existingPage) {
      setPageData(existingPage);
      
      // Si hay contenido, intentar parsearlo como bloques
      if (existingPage.content) {
        try {
          const parsedBlocks = JSON.parse(existingPage.content);
          if (Array.isArray(parsedBlocks)) {
            setBlocks(parsedBlocks);
          }
        } catch (e) {
          console.error("Error al parsear el contenido como bloques:", e);
          // Si no es JSON, considerar el contenido como HTML plano
          setBlocks([{ 
            type: "html", 
            id: "legacy-content", 
            content: existingPage.content 
          }]);
        }
      }
    }
  }, [existingPage]);
  
  // Genera un slug basado en el título
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-");
  };
  
  // Mutación para guardar la página
  const saveMutation = useMutation({
    mutationFn: async (data: PageData) => {
      // Convertir los bloques a JSON y guardarlo como contenido
      const finalData = {
        ...data,
        content: JSON.stringify(blocks),
      };
      
      let response;
      if (isNew || !pageId) {
        response = await apiRequest("POST", "/api/cms/pages", finalData);
      } else {
        response = await apiRequest("PUT", `/api/cms/pages/${pageId}`, finalData);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      
      toast({
        title: isNew ? "Página creada" : "Página actualizada",
        description: isNew 
          ? "La página se ha creado correctamente" 
          : "Los cambios se han guardado correctamente",
      });
      
      // Si es nueva, redirigir a la edición
      if (isNew && data.id) {
        navigate(`/cms/pages/${data.id}`);
      }
      
      setHasChanges(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo guardar la página: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Manejar cambios en los campos del formulario
  const handleFieldChange = (field: string, value: any) => {
    setPageData(prev => ({
      ...prev,
      [field]: value
    }));
    
    setHasChanges(true);
    
    // Si se cambia el título y el slug aún no ha sido modificado manualmente, generar slug
    if (field === "title" && !pageData.slug) {
      setPageData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };
  
  // Manejar cambios en los bloques
  const handleBlocksChange = (newBlocks: any[]) => {
    setBlocks(newBlocks);
    setHasChanges(true);
  };
  
  // Guardar la página
  const handleSave = () => {
    if (!pageData.title) {
      toast({
        title: "Error",
        description: "El título de la página es obligatorio",
        variant: "destructive",
      });
      return;
    }
    
    if (!pageData.slug) {
      toast({
        title: "Error",
        description: "El slug de la página es obligatorio",
        variant: "destructive",
      });
      return;
    }
    
    saveMutation.mutate(pageData);
  };
  
  // Solicitar publicación y mostrar verificación pre-publicación
  const requestPublish = () => {
    // Verificar que los campos obligatorios estén completos
    if (!pageData.title || !pageData.slug) {
      toast({
        title: "Error",
        description: "Completa todos los campos obligatorios antes de publicar",
        variant: "destructive",
      });
      return;
    }
    
    // Mostrar el diálogo de verificación pre-publicación
    setShowPrePublicationCheck(true);
  };
  
  // Realizar la publicación después de la verificación
  const handlePublish = () => {
    // Actualizar estado y guardar
    const updatedData = {
      ...pageData,
      status: "published" as const,
      publishedAt: new Date().toISOString(),
    };
    
    setPageData(updatedData);
    saveMutation.mutate(updatedData);
    
    // Cerrar el diálogo de verificación
    setShowPrePublicationCheck(false);
    
    toast({
      title: "Página publicada",
      description: "La página ha sido publicada y ya está disponible para los usuarios",
    });
  };
  
  // Programar la publicación
  const handleSchedulePublication = () => {
    // Verificar que los campos obligatorios estén completos
    if (!pageData.title || !pageData.slug) {
      toast({
        title: "Error",
        description: "Completa todos los campos obligatorios antes de programar la publicación",
        variant: "destructive",
      });
      return;
    }
    
    // Verificar que se haya establecido una fecha de programación
    if (!pageData.scheduledAt) {
      toast({
        title: "Error",
        description: "Selecciona una fecha y hora para programar la publicación",
        variant: "destructive",
      });
      return;
    }
    
    // Programar la publicación
    const updatedData = {
      ...pageData,
      status: "scheduled" as const,
    };
    
    setPageData(updatedData);
    saveMutation.mutate(updatedData);
    
    toast({
      title: "Publicación programada",
      description: `La página se publicará automáticamente el ${new Date(pageData.scheduledAt).toLocaleString()}`,
    });
  };
  
  // Despublicar la página
  const handleUnpublish = () => {
    const updatedData = {
      ...pageData,
      status: "draft" as const,
    };
    
    setPageData(updatedData);
    saveMutation.mutate(updatedData);
  };
  
  // Volver a la lista de páginas
  const handleBack = () => {
    if (hasChanges) {
      if (window.confirm("Hay cambios sin guardar. ¿Deseas salir sin guardar?")) {
        navigate("/admin/cms/pages");
      }
    } else {
      navigate("/admin/cms/pages");
    }
  };
  
  // Mostrar esqueleto durante la carga
  if (isLoading && !isNew) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  
  // Mostrar error
  if (error && !isNew) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No se pudo cargar la página. Por favor, inténtalo de nuevo.</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin/cms/pages")}
            >
              Volver
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-6">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isNew ? "Nueva Página" : `Editar: ${pageData.title}`}
          </h1>
          {pageData.status && (
            <Badge
              variant={
                pageData.status === "published"
                  ? "default"
                  : pageData.status === "draft"
                  ? "outline"
                  : "secondary"
              }
              className="h-6"
            >
              {pageData.status === "published" ? "Publicada" : 
               pageData.status === "draft" ? "Borrador" : 
               pageData.status === "scheduled" ? "Programada" : "Archivada"}
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 justify-end">
          <Button 
            variant={previewMode ? "secondary" : "outline"}
            onClick={() => setPreviewMode(!previewMode)}
            className="gap-2"
          >
            {previewMode ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span>Cerrar Vista Previa</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>Vista Previa</span>
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setShowDevicePreview(true)}
            className="gap-2"
          >
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline">Ver en Dispositivos</span>
          </Button>
          
          {/* Botón historial de versiones, solo mostrar si la página ya existe */}
          {!isNew && pageData.id && (
            <Button 
              variant="outline"
              onClick={() => setShowVersionHistory(true)}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Historial de Versiones</span>
            </Button>
          )}
          
          {!isNew && pageData.id && pageData.status === "published" && (
            <Button 
              variant="outline"
              onClick={() => setShowDraftComparison(true)}
              className="gap-2"
            >
              <GitBranch className="h-4 w-4" />
              <span className="hidden sm:inline">Comparar Cambios</span>
            </Button>
          )}
          
          {pageData.id && pageData.status === "published" && (
            <Button 
              variant="outline" 
              onClick={() => window.open(`/cms/preview/${pageData.id}`, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Ver Publicado</span>
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={handleSave} 
            disabled={saveMutation.isPending || !hasChanges}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            <span>Guardar</span>
          </Button>
          
          {pageData.status === "published" ? (
            // Si está publicada, ofrecer despublicar
            <Button 
              variant="secondary" 
              onClick={handleUnpublish} 
              disabled={saveMutation.isPending}
              className="gap-2"
            >
              <span>Despublicar</span>
            </Button>
          ) : pageData.status === "scheduled" ? (
            // Si está programada para publicación
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={handleUnpublish} 
                disabled={saveMutation.isPending}
                className="gap-2"
              >
                <span>Cancelar Programación</span>
              </Button>
              <Button 
                onClick={handleSchedulePublication} 
                disabled={saveMutation.isPending || !pageData.scheduledAt}
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                <span>Actualizar Programación</span>
              </Button>
            </div>
          ) : (
            // Si está en borrador o archivada, ofrecer publicar o programar
            <div className="flex gap-2">
              <Button 
                onClick={requestPublish} 
                disabled={saveMutation.isPending}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                <span>Publicar Ahora</span>
              </Button>
              {pageData.scheduledAt && (
                <Button 
                  variant="outline" 
                  onClick={handleSchedulePublication} 
                  disabled={saveMutation.isPending}
                  className="gap-2"
                >
                  <Clock className="h-4 w-4" />
                  <span>Programar</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Tabs de edición */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            <span>Contenido</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Configuración</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <CopyCheck className="h-4 w-4" />
            <span>SEO</span>
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Asistente IA</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Tab de contenido */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detalles Básicos</CardTitle>
              <CardDescription>
                Introduce la información principal de la página
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    value={pageData.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    placeholder="Título de la página"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">
                    Slug (URL) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="slug"
                    value={pageData.slug}
                    onChange={(e) => handleFieldChange("slug", e.target.value)}
                    placeholder="url-amigable"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción corta</Label>
                <Textarea
                  id="description"
                  value={pageData.description || ""}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  placeholder="Breve descripción de la página"
                  className="resize-y"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Editor de Contenido</CardTitle>
              <CardDescription>
                Construye el contenido de tu página con el editor de bloques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[400px] border rounded-md">
                <BlockEditor 
                  blocks={blocks} 
                  onChange={handleBlocksChange} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tab de configuración */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Publicación</CardTitle>
              <CardDescription>
                Configura el estado y la visibilidad de la página
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={pageData.status}
                    onValueChange={(value) => handleFieldChange("status", value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="published">Publicada</SelectItem>
                      <SelectItem value="scheduled">Programada</SelectItem>
                      <SelectItem value="archived">Archivada</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Solo las páginas publicadas estarán visibles para los usuarios
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibilidad</Label>
                  <Select
                    value={pageData.visibility}
                    onValueChange={(value) => handleFieldChange("visibility", value)}
                  >
                    <SelectTrigger id="visibility">
                      <SelectValue placeholder="Selecciona la visibilidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Pública (todos pueden verla)</SelectItem>
                      <SelectItem value="private">Privada (solo acceso con link)</SelectItem>
                      <SelectItem value="internal">Interna (solo usuarios registrados)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Página</Label>
                  <Select
                    value={pageData.type}
                    onValueChange={(value) => handleFieldChange("type", value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="page">Página Normal</SelectItem>
                      <SelectItem value="blog_post">Entrada de Blog</SelectItem>
                      <SelectItem value="landing_page">Landing Page</SelectItem>
                      <SelectItem value="course_page">Página de Curso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="publishedAt">Fecha de Publicación</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="publishedAt"
                      type="datetime-local"
                      value={pageData.publishedAt ? new Date(pageData.publishedAt).toISOString().slice(0, 16) : ""}
                      onChange={(e) => handleFieldChange("publishedAt", e.target.value)}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleFieldChange("publishedAt", new Date().toISOString())}
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Define cuándo se publicó la página
                  </p>
                </div>
              </div>
              
              {pageData.status === "scheduled" && (
                <>
                  <Separator />
                  
                  <div className="bg-muted/30 p-4 rounded-md border border-muted">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Programación de Publicación
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="scheduledAt">Fecha Programada</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="scheduledAt"
                              type="datetime-local"
                              value={pageData.scheduledAt ? new Date(pageData.scheduledAt).toISOString().slice(0, 16) : ""}
                              onChange={(e) => handleFieldChange("scheduledAt", e.target.value)}
                            />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                // Programar para publicar en 24 horas
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                handleFieldChange("scheduledAt", tomorrow.toISOString());
                              }}
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            La página se publicará automáticamente en esta fecha y hora
                          </p>
                        </div>
                      
                        <div className="space-y-2">
                          <Label htmlFor="recurrencePattern">Patrón de Repetición</Label>
                          <Select
                            value={pageData.recurrencePattern || "none"}
                            onValueChange={(value) => handleFieldChange("recurrencePattern", value)}
                          >
                            <SelectTrigger id="recurrencePattern">
                              <SelectValue placeholder="Selecciona un patrón" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sin repetición</SelectItem>
                              <SelectItem value="daily">Diario</SelectItem>
                              <SelectItem value="weekly">Semanal</SelectItem>
                              <SelectItem value="monthly">Mensual</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Establece si la publicación se debe repetir periódicamente
                          </p>
                        </div>
                      </div>
                      
                      {pageData.recurrencePattern !== "none" && (
                        <div className="space-y-2">
                          <Label htmlFor="recurrenceEndDate">Fecha Final de Repetición</Label>
                          <Input
                            id="recurrenceEndDate"
                            type="date"
                            value={pageData.recurrenceEndDate ? new Date(pageData.recurrenceEndDate).toISOString().slice(0, 10) : ""}
                            onChange={(e) => handleFieldChange("recurrenceEndDate", e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            La programación recurrente terminará en esta fecha
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="author">Autor</Label>
                  <Input
                    id="author"
                    value={pageData.author || ""}
                    onChange={(e) => handleFieldChange("author", e.target.value)}
                    placeholder="Nombre del autor"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={pageData.featured || false}
                      onCheckedChange={(checked) => handleFieldChange("featured", checked)}
                    />
                    <label
                      htmlFor="featured"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Destacar esta página
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    Las páginas destacadas se muestran en secciones especiales del sitio
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="thumbnailUrl">Imagen de Portada</Label>
                <div className="flex gap-2">
                  <Input
                    id="thumbnailUrl"
                    value={pageData.thumbnailUrl || ""}
                    onChange={(e) => handleFieldChange("thumbnailUrl", e.target.value)}
                    placeholder="URL de la imagen de portada"
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => window.open("/cms/media", "_blank")}
                  >
                    <FileImage className="h-4 w-4" />
                  </Button>
                </div>
                
                {pageData.thumbnailUrl && (
                  <div className="mt-4 w-32 h-32 border rounded-md overflow-hidden">
                    <img 
                      src={pageData.thumbnailUrl} 
                      alt="Imagen de portada" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tab de SEO */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimización para Buscadores (SEO)</CardTitle>
              <CardDescription>
                Configura la información que verán los motores de búsqueda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Título para SEO</Label>
                <Input
                  id="metaTitle"
                  value={pageData.metaTitle || ""}
                  onChange={(e) => handleFieldChange("metaTitle", e.target.value)}
                  placeholder="Título optimizado para SEO (si es diferente del título de la página)"
                />
                <p className="text-xs text-muted-foreground">
                  Si lo dejas en blanco, se usará el título de la página
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Descripción</Label>
                <Textarea
                  id="metaDescription"
                  value={pageData.metaDescription || ""}
                  onChange={(e) => handleFieldChange("metaDescription", e.target.value)}
                  placeholder="Descripción corta para los resultados de búsqueda"
                  className="resize-y"
                />
                <p className="text-xs text-muted-foreground">
                  No debe exceder los 160 caracteres para mejor visualización en buscadores
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Palabras Clave (separadas por comas)</Label>
                <Input
                  id="metaKeywords"
                  value={pageData.metaKeywords || ""}
                  onChange={(e) => handleFieldChange("metaKeywords", e.target.value)}
                  placeholder="palabra1, palabra2, palabra3"
                />
              </div>
              
              <Separator />
              
              <div className="bg-card border rounded-md p-4">
                <p className="text-sm font-medium">Vista previa en Google</p>
                <div className="mt-3 space-y-1">
                  <p className="text-blue-600 text-lg truncate">
                    {pageData.metaTitle || pageData.title || "Título de la página"}
                  </p>
                  <p className="text-green-700 text-sm truncate">
                    {window.location.origin}/{pageData.slug || "url-de-la-pagina"}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {pageData.metaDescription || pageData.description || "Esta página no tiene una meta descripción establecida. Los motores de búsqueda mostrarán un fragmento extraído del contenido de la página."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tab de Asistente IA */}
        <TabsContent value="ai-assistant" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AIAssistantPanel 
              pageTitle={pageData.title}
              pageDescription={pageData.description || ""}
              pageType={pageData.type}
              onAddContent={(content) => {
                // Añadir un nuevo bloque con el contenido generado
                const newBlock = {
                  id: `ai-block-${Date.now()}`,
                  type: "ai",
                  content: content,
                };
                
                setBlocks([...blocks, newBlock]);
                setHasChanges(true);
                setActiveTab("content"); // Cambiar a la pestaña de contenido
                
                toast({
                  title: "Contenido añadido",
                  description: "El contenido generado por IA se ha añadido como un nuevo bloque",
                });
              }}
              onApplySeoTitle={(title) => {
                handleFieldChange("metaTitle", title);
                
                toast({
                  title: "Título SEO actualizado",
                  description: "El título SEO ha sido actualizado con la sugerencia de IA",
                });
              }}
              onApplySeoDescription={(description) => {
                handleFieldChange("metaDescription", description);
                
                toast({
                  title: "Descripción SEO actualizada",
                  description: "La descripción SEO ha sido actualizada con la sugerencia de IA",
                });
              }}
              onApplySeoKeywords={(keywords) => {
                handleFieldChange("metaKeywords", keywords);
                
                toast({
                  title: "Palabras clave actualizadas",
                  description: "Las palabras clave han sido actualizadas con la sugerencia de IA",
                });
              }}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Panel de vista previa */}
      {previewMode && (
        <div className={`fixed inset-0 bg-background z-50 flex ${previewLayout === 'split' ? 'p-4' : 'p-0'}`}>
          <div className={`${previewLayout === 'split' ? 'w-1/2 pr-2' : 'hidden'}`}>
            <div className="h-full overflow-auto rounded-md border">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="content" className="flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    <span>Contenido</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Configuración</span>
                  </TabsTrigger>
                  <TabsTrigger value="seo" className="flex items-center gap-2">
                    <CopyCheck className="h-4 w-4" />
                    <span>SEO</span>
                  </TabsTrigger>
                  <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Asistente IA</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  {/* Contenido del tab */}
                  <div className="min-h-[400px] border rounded-md p-4">
                    <BlockEditor 
                      blocks={blocks} 
                      onChange={handleBlocksChange} 
                    />
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  {/* Contenido resumido */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración Básica</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="preview-status">Estado</Label>
                          <Input id="preview-status" value={pageData.status} readOnly />
                        </div>
                        <div>
                          <Label htmlFor="preview-type">Tipo</Label>
                          <Input id="preview-type" value={pageData.type} readOnly />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>SEO</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label htmlFor="preview-meta-title">Título SEO</Label>
                        <Input
                          id="preview-meta-title"
                          value={pageData.metaTitle || pageData.title}
                          onChange={(e) => handleFieldChange("metaTitle", e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ai-assistant" className="space-y-4">
                  <AIAssistantPanel 
                    pageTitle={pageData.title}
                    pageDescription={pageData.description || ""}
                    pageType={pageData.type}
                    onAddContent={(content) => {
                      const newBlock = {
                        id: `ai-${Date.now()}`,
                        type: "ai",
                        content: content,
                      };
                      
                      setBlocks([...blocks, newBlock]);
                      setHasChanges(true);
                      setActiveTab("content");
                    }}
                    onApplySeoTitle={(title) => handleFieldChange("metaTitle", title)}
                    onApplySeoDescription={(description) => handleFieldChange("metaDescription", description)}
                    onApplySeoKeywords={(keywords) => handleFieldChange("metaKeywords", keywords)}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <div className={`${previewLayout === 'split' ? 'w-1/2 pl-2' : 'w-full'}`}>
            <PreviewPanel 
              pageData={pageData} 
              blocks={blocks} 
              onClose={() => setPreviewMode(false)} 
            />
          </div>

          {/* Botón para cambiar el layout */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPreviewLayout(previewLayout === 'split' ? 'full' : 'split')}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-10"
          >
            <Split className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Diálogo de verificación pre-publicación */}
      <PrePublicationCheck
        isOpen={showPrePublicationCheck}
        onClose={() => setShowPrePublicationCheck(false)}
        onPublish={handlePublish}
        pageTitle={pageData.title}
        pageSlug={pageData.slug}
        pageDescription={pageData.description}
        metaTitle={pageData.metaTitle}
        metaDescription={pageData.metaDescription}
        pageContent={{
          blocks: blocks,
          settings: {
            layout: 'boxed',
            spacing: 'normal'
          }
        }}
      />
      
      {/* Diálogo de comparación de borradores */}
      <DraftComparisonDialog
        isOpen={showDraftComparison}
        onClose={() => setShowDraftComparison(false)}
        onPublish={handlePublish}
        publishedData={
          existingPage && existingPage.status === 'published'
            ? {
                title: existingPage.title,
                content: existingPage.content,
                updatedAt: existingPage.updatedAt || new Date().toISOString(),
                publishedAt: existingPage.publishedAt
              }
            : undefined
        }
        draftData={{
          title: pageData.title,
          content: blocks,
          updatedAt: new Date().toISOString()
        }}
      />
      
      {/* Diálogo de vista previa en diferentes dispositivos */}
      <PagePreview
        isOpen={showDevicePreview}
        onClose={() => setShowDevicePreview(false)}
        pageContent={{
          blocks: blocks,
          settings: {
            layout: 'boxed',
            spacing: 'normal'
          }
        }}
        pageTitle={pageData.title}
        pageDescription={pageData.description}
      />
      
      {/* Diálogo de historial de versiones */}
      {!isNew && pageData.id && (
        <VersionHistoryDialog
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          pageId={pageData.id}
          currentContent={JSON.stringify(blocks)}
          currentTitle={pageData.title}
          currentStatus={pageData.status}
          onVersionRestore={(version) => {
            try {
              // Intentar parsear el contenido de la versión
              const restoredBlocks = JSON.parse(version.content);
              setBlocks(restoredBlocks);
              
              // Actualizar los datos de la página
              setPageData(prev => ({
                ...prev,
                title: version.title,
                status: version.status,
              }));
              
              setHasChanges(true);
              
              toast({
                title: "Versión restaurada",
                description: `Se ha restaurado la versión ${version.versionNumber}`,
              });
            } catch (error) {
              toast({
                title: "Error al restaurar versión",
                description: "No se pudo procesar el contenido de la versión",
                variant: "destructive",
              });
            }
          }}
        />
      )}
    </div>
  );
};

export default PageEditor;