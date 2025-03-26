import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Code, Blocks, Eye } from "lucide-react";
import { slugify } from "@/lib/utils";
import BlockEditor, { PageContent } from "./block-editor";
import PagePreview from "./page-preview";

// Definición del esquema de validación
const pageFormSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  slug: z.string().min(1, "La URL amigable es obligatoria"),
  description: z.string().optional(),
  content: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
  visibility: z.enum(["public", "private", "internal"]),
  type: z.enum(["page", "blog_post", "course_page", "landing_page"]),
  featured: z.boolean().optional(),
  featuredImage: z.string().optional(),
  publishedAt: z.string().optional(),
});

type PageFormValues = z.infer<typeof pageFormSchema>;

interface PageEditorProps {
  pageId?: number;
  onSave?: (page: any) => void;
  onCancel?: () => void;
}

const PageEditor: React.FC<PageEditorProps> = ({
  pageId,
  onSave,
  onCancel,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [previewContent, setPreviewContent] = useState<PageContent | null>(null);

  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      content: "",
      metaTitle: "",
      metaDescription: "",
      status: "draft",
      visibility: "public",
      type: "page",
      featured: false,
      featuredImage: "",
      publishedAt: "",
    },
  });

  // Generar automáticamente el slug cuando cambia el título
  const watchTitle = form.watch("title");
  useEffect(() => {
    if (watchTitle && !form.getValues("slug")) {
      form.setValue("slug", slugify(watchTitle));
    }
  }, [watchTitle, form]);

  // Cargar datos si se está editando una página existente
  useEffect(() => {
    const fetchPageData = async () => {
      if (!pageId) return;

      setIsFetching(true);
      try {
        const response = await fetch(`/api/cms/pages/${pageId}`);
        if (!response.ok) throw new Error("Error al cargar la página");

        const pageData = await response.json();
        
        // Establecer valores en el formulario
        Object.entries(pageData).forEach(([key, value]) => {
          if (key in form.getValues()) {
            form.setValue(key as any, value as any);
          }
        });
      } catch (error) {
        console.error("Error fetching page:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la página",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchPageData();
  }, [pageId, form, toast]);

  const onSubmit = async (data: PageFormValues) => {
    if (!user?.companyId) {
      toast({
        title: "Error",
        description: "No se pudo identificar la empresa",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = pageId
        ? `/api/cms/pages/${pageId}`
        : "/api/cms/pages";
      const method = pageId ? "PUT" : "POST";

      // Si se publica por primera vez, establecer la fecha de publicación
      if (data.status === "published" && !data.publishedAt) {
        data.publishedAt = new Date().toISOString();
      }

      const response = await apiRequest(method, endpoint, {
        ...data,
        companyId: user.companyId,
      });

      if (!response.ok) {
        throw new Error("Error al guardar la página");
      }

      const savedPage = await response.json();

      // Actualizar caché de consultas
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });

      toast({
        title: "Éxito",
        description: `Página ${pageId ? "actualizada" : "creada"} correctamente`,
      });

      if (onSave) onSave(savedPage);
    } catch (error) {
      console.error("Error saving page:", error);
      toast({
        title: "Error",
        description: `Error al ${pageId ? "actualizar" : "crear"} la página`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando datos de la página...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>
                Detalles principales de la página
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título de la página" {...field} />
                    </FormControl>
                    <FormDescription>
                      El título que se mostrará en la página
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL amigable (slug)</FormLabel>
                    <FormControl>
                      <Input placeholder="url-amigable" {...field} />
                    </FormControl>
                    <FormDescription>
                      La URL para acceder a esta página
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Breve descripción de la página"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Un resumen corto del contenido
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>
                Opciones de publicación y visibilidad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                        <SelectItem value="archived">Archivado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Estado actual de la página
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibilidad</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la visibilidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Pública</SelectItem>
                        <SelectItem value="private">Privada</SelectItem>
                        <SelectItem value="internal">Interna</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Quién puede ver esta página
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="page">Página</SelectItem>
                        <SelectItem value="blog_post">Artículo de Blog</SelectItem>
                        <SelectItem value="course_page">Página de Curso</SelectItem>
                        <SelectItem value="landing_page">Landing Page</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Tipo de contenido
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contenido</CardTitle>
            <CardDescription>
              Contenido principal de la página
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <Tabs defaultValue="visual" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="visual">
                        <Blocks className="h-4 w-4 mr-2" />
                        Editor Visual
                      </TabsTrigger>
                      <TabsTrigger value="code">
                        <Code className="h-4 w-4 mr-2" />
                        Código HTML
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="visual" className="mt-0">
                      <BlockEditor
                        initialContent={field.value}
                        onChange={(pageContent) => {
                          field.onChange(JSON.stringify(pageContent));
                        }}
                        onSave={(pageContent) => {
                          field.onChange(JSON.stringify(pageContent));
                        }}
                      />
                      <FormDescription className="mt-4">
                        Construye tu página usando bloques visuales de contenido
                      </FormDescription>
                    </TabsContent>
                    <TabsContent value="code" className="mt-0">
                      <FormControl>
                        <Textarea
                          placeholder="Contenido de la página (HTML o JSON)"
                          {...field}
                          rows={10}
                          className="font-mono"
                        />
                      </FormControl>
                      <FormDescription className="mt-2">
                        Edita el contenido directamente en formato HTML o JSON
                      </FormDescription>
                    </TabsContent>
                  </Tabs>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
            <CardDescription>
              Configuración para motores de búsqueda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título Meta</FormLabel>
                  <FormControl>
                    <Input placeholder="Título para SEO" {...field} />
                  </FormControl>
                  <FormDescription>
                    Título que se mostrará en los resultados de búsqueda (si está vacío, se usará el título principal)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción Meta</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción para SEO"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Descripción que se mostrará en los resultados de búsqueda
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          )}
          
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              try {
                const contentStr = form.getValues("content");
                const content = contentStr ? JSON.parse(contentStr) : { blocks: [] };
                setPreviewContent(content);
                setIsPreviewOpen(true);
              } catch (error) {
                toast({
                  title: "Error",
                  description: "No se pudo generar la vista previa. Verifica el formato del contenido.",
                  variant: "destructive",
                });
              }
            }}
            disabled={isLoading}
          >
            <Eye className="mr-2 h-4 w-4" />
            Vista previa
          </Button>
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar {pageId ? "cambios" : "página"}
              </>
            )}
          </Button>
        </div>
      </form>
      
      {/* Modal de Vista Previa */}
      {previewContent && (
        <PagePreview
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          pageContent={previewContent}
          pageTitle={form.getValues("title") || "Sin título"}
          pageDescription={form.getValues("description")}
        />
      )}
    </Form>
  );
};

export default PageEditor;