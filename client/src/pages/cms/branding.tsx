import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { 
  Palette, 
  Image, 
  Type, 
  Loader2, 
  Check, 
  Upload,
  Save,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import MediaUpload from "@/components/media-upload";

interface BrandingSettings {
  id?: number;
  companyId: number;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontPrimary: string;
  fontSecondary: string;
  companyName: string;
  tagline: string;
  description: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  footerText: string;
  customCss?: string;
  useCustomFonts: boolean;
  customFontUrls?: {
    primary?: string;
    secondary?: string;
  };
  updatedAt?: string;
}

// Esquema de validación para el formulario de branding
const brandingFormSchema = z.object({
  companyName: z.string().min(1, "El nombre de la empresa es obligatorio"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  primaryColor: z.string().min(4, "El color primario es obligatorio"),
  secondaryColor: z.string().min(4, "El color secundario es obligatorio"),
  accentColor: z.string().min(4, "El color de acento es obligatorio"),
  fontPrimary: z.string().min(1, "La fuente primaria es obligatoria"),
  fontSecondary: z.string().min(1, "La fuente secundaria es obligatoria"),
  useCustomFonts: z.boolean().default(false),
  footerText: z.string().optional(),
  logoUrl: z.string().min(1, "El logo es obligatorio"),
  faviconUrl: z.string().min(1, "El favicon es obligatorio"),
  customCss: z.string().optional(),
  socialMedia: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
  }).optional(),
  customFontUrls: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
  }).optional(),
});

type BrandingFormValues = z.infer<typeof brandingFormSchema>;

// Lista de fuentes comunes
const commonFonts = [
  "Arial",
  "Helvetica",
  "Georgia", 
  "Times New Roman", 
  "Roboto", 
  "Open Sans", 
  "Lato", 
  "Montserrat", 
  "Source Sans Pro",
  "PT Sans",
  "Raleway",
  "Ubuntu",
  "Poppins",
  "Playfair Display",
  "Merriweather",
];

// Componente principal
const BrandingPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [previewColor, setPreviewColor] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Obtener configuración de branding
  const { data: brandingSettings, isLoading, error } = useQuery<BrandingSettings>({
    queryKey: ["/api/cms/branding"],
    queryFn: async () => {
      if (!user?.companyId) {
        throw new Error("No se pudo identificar la compañía");
      }
      
      const response = await fetch(`/api/cms/branding?companyId=${user.companyId}`);
      
      if (response.status === 404) {
        // Si no existe, retornamos un objeto por defecto
        return {
          companyId: user.companyId,
          logoUrl: "",
          faviconUrl: "",
          primaryColor: "#3B82F6",
          secondaryColor: "#10B981",
          accentColor: "#F59E0B",
          fontPrimary: "Roboto",
          fontSecondary: "Georgia",
          companyName: "",
          tagline: "",
          description: "",
          socialMedia: {},
          footerText: `© ${new Date().getFullYear()} Todos los derechos reservados.`,
          useCustomFonts: false
        };
      }
      
      if (!response.ok) {
        throw new Error("Error al cargar la configuración de branding");
      }
      
      return response.json();
    },
  });

  // Mutación para guardar configuración de branding
  const updateBrandingMutation = useMutation({
    mutationFn: async (data: BrandingSettings) => {
      const endpoint = data.id 
        ? `/api/cms/branding/${data.id}` 
        : "/api/cms/branding";
      const method = data.id ? "PUT" : "POST";
      
      return apiRequest(method, endpoint, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/branding"] });
      toast({
        title: "Configuración guardada",
        description: "La configuración de branding ha sido guardada correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración de branding",
        variant: "destructive",
      });
    },
  });

  // Formulario para edición de branding
  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingFormSchema),
    defaultValues: {
      companyName: "",
      tagline: "",
      description: "",
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981",
      accentColor: "#F59E0B",
      fontPrimary: "Roboto",
      fontSecondary: "Georgia",
      useCustomFonts: false,
      footerText: `© ${new Date().getFullYear()} Todos los derechos reservados.`,
      logoUrl: "",
      faviconUrl: "",
      customCss: "",
      socialMedia: {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
      },
      customFontUrls: {
        primary: "",
        secondary: "",
      },
    },
  });

  // Actualizar valores del formulario cuando se cargan los datos
  React.useEffect(() => {
    if (brandingSettings) {
      form.reset({
        companyName: brandingSettings.companyName || "",
        tagline: brandingSettings.tagline || "",
        description: brandingSettings.description || "",
        primaryColor: brandingSettings.primaryColor,
        secondaryColor: brandingSettings.secondaryColor,
        accentColor: brandingSettings.accentColor,
        fontPrimary: brandingSettings.fontPrimary,
        fontSecondary: brandingSettings.fontSecondary,
        useCustomFonts: brandingSettings.useCustomFonts,
        footerText: brandingSettings.footerText,
        logoUrl: brandingSettings.logoUrl,
        faviconUrl: brandingSettings.faviconUrl,
        customCss: brandingSettings.customCss || "",
        socialMedia: {
          facebook: brandingSettings.socialMedia?.facebook || "",
          twitter: brandingSettings.socialMedia?.twitter || "",
          instagram: brandingSettings.socialMedia?.instagram || "",
          linkedin: brandingSettings.socialMedia?.linkedin || "",
        },
        customFontUrls: {
          primary: brandingSettings.customFontUrls?.primary || "",
          secondary: brandingSettings.customFontUrls?.secondary || "",
        },
      });
    }
  }, [brandingSettings, form]);

  // Manejar el envío del formulario
  const onSubmit = (values: BrandingFormValues) => {
    if (!user?.companyId) {
      toast({
        title: "Error",
        description: "No se pudo identificar la compañía",
        variant: "destructive",
      });
      return;
    }
    
    updateBrandingMutation.mutate({
      ...values,
      id: brandingSettings?.id,
      companyId: user.companyId,
    });
  };

  // Renderizar el estado de carga
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-6 w-3/4 mt-2" />
        </div>
        
        <div className="grid gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </div>
    );
  }

  // Renderizar el estado de error
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No se pudo cargar la configuración de branding. Por favor, inténtelo de nuevo.</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/cms/branding"] })}
            >
              Reintentar
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Vista de previsualización de branding
  const BrandingPreview = () => {
    const values = form.getValues();
    
    return (
      <div className="border rounded-md overflow-hidden">
        <div className="p-4 bg-muted border-b">
          <h3 className="font-medium">Vista previa</h3>
        </div>
        <div className="p-6 space-y-6">
          {/* Header Preview */}
          <div className="border rounded-md p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {values.logoUrl ? (
                <img src={values.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
              ) : (
                <div className="h-10 w-10 bg-muted flex items-center justify-center rounded">
                  <Image className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <h2 className="font-medium" style={{ fontFamily: values.fontPrimary }}>
                  {values.companyName || "Nombre de la empresa"}
                </h2>
                {values.tagline && (
                  <p className="text-xs text-muted-foreground" style={{ fontFamily: values.fontSecondary }}>
                    {values.tagline}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-20 rounded-md border flex items-center justify-center text-xs font-medium">Menú</div>
              <div 
                className="h-8 px-3 rounded-md flex items-center justify-center text-xs font-medium text-white" 
                style={{ backgroundColor: values.primaryColor }}
              >
                Botón
              </div>
            </div>
          </div>
          
          {/* Color Palette */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div 
                className="h-20 rounded-md mb-2" 
                style={{ backgroundColor: values.primaryColor }}
              ></div>
              <p className="text-xs text-center">Color Primario</p>
              <p className="text-xs text-center text-muted-foreground">{values.primaryColor}</p>
            </div>
            <div>
              <div 
                className="h-20 rounded-md mb-2" 
                style={{ backgroundColor: values.secondaryColor }}
              ></div>
              <p className="text-xs text-center">Color Secundario</p>
              <p className="text-xs text-center text-muted-foreground">{values.secondaryColor}</p>
            </div>
            <div>
              <div 
                className="h-20 rounded-md mb-2" 
                style={{ backgroundColor: values.accentColor }}
              ></div>
              <p className="text-xs text-center">Color de Acento</p>
              <p className="text-xs text-center text-muted-foreground">{values.accentColor}</p>
            </div>
          </div>
          
          {/* Typography Preview */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg mb-1" style={{ fontFamily: values.fontPrimary }}>
                Tipografía Principal: {values.fontPrimary}
              </h3>
              <p style={{ fontFamily: values.fontPrimary }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.
              </p>
            </div>
            <div>
              <h3 className="text-lg mb-1" style={{ fontFamily: values.fontSecondary }}>
                Tipografía Secundaria: {values.fontSecondary}
              </h3>
              <p style={{ fontFamily: values.fontSecondary }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.
              </p>
            </div>
          </div>
          
          {/* Footer Preview */}
          <div className="border-t pt-4 mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground" style={{ fontFamily: values.fontSecondary }}>
                {values.footerText}
              </p>
              <div className="flex gap-2">
                {values.socialMedia?.facebook && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs">FB</span>
                  </div>
                )}
                {values.socialMedia?.twitter && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs">TW</span>
                  </div>
                )}
                {values.socialMedia?.instagram && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs">IG</span>
                  </div>
                )}
                {values.socialMedia?.linkedin && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs">LI</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Configuración de Marca</h1>
        <p className="text-muted-foreground">
          Personaliza la apariencia y estilo visual de tu plataforma
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel de navegación */}
            <div className="col-span-1">
              <Tabs 
                defaultValue="general" 
                orientation="vertical" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="flex flex-col h-auto items-stretch bg-transparent space-y-1">
                  <TabsTrigger 
                    value="general" 
                    className="justify-start text-left px-3 py-2 data-[state=active]:bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      <span>Información General</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="colors" 
                    className="justify-start text-left px-3 py-2 data-[state=active]:bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      <span>Colores y Tipografía</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="media" 
                    className="justify-start text-left px-3 py-2 data-[state=active]:bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      <span>Logotipos e Imágenes</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="mt-8">
                <Button 
                  type="submit" 
                  className="w-full gap-2"
                  disabled={updateBrandingMutation.isPending}
                >
                  {updateBrandingMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Guardar Configuración</span>
                    </>
                  )}
                </Button>
              </div>

              {brandingSettings?.updatedAt && (
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Última actualización: {new Date(brandingSettings.updatedAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* Paneles de contenido */}
            <div className="col-span-1 lg:col-span-2">
              <Card>
                <CardContent className="pt-6">
                  <TabsContent value="general" className="space-y-6 mt-0">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Información de la Empresa</h3>
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre de la Empresa</FormLabel>
                            <FormControl>
                              <Input placeholder="Tu Empresa S.A." {...field} />
                            </FormControl>
                            <FormDescription>
                              Nombre oficial que aparecerá en tu sitio web
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tagline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Eslogan</FormLabel>
                            <FormControl>
                              <Input placeholder="Tu eslogan o frase distintiva" {...field} />
                            </FormControl>
                            <FormDescription>
                              Una frase breve que describa tu negocio
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
                                placeholder="Breve descripción de tu empresa..." 
                                {...field} 
                                rows={4}
                              />
                            </FormControl>
                            <FormDescription>
                              Descripción general para SEO y metadatos
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Redes Sociales</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="socialMedia.facebook"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Facebook</FormLabel>
                              <FormControl>
                                <Input placeholder="https://facebook.com/tuempresa" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="socialMedia.twitter"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Twitter</FormLabel>
                              <FormControl>
                                <Input placeholder="https://twitter.com/tuempresa" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="socialMedia.instagram"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instagram</FormLabel>
                              <FormControl>
                                <Input placeholder="https://instagram.com/tuempresa" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="socialMedia.linkedin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>LinkedIn</FormLabel>
                              <FormControl>
                                <Input placeholder="https://linkedin.com/company/tuempresa" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Pie de Página</h3>
                      <FormField
                        control={form.control}
                        name="footerText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Texto del Pie de Página</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="© 2025 Tu Empresa. Todos los derechos reservados." 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Texto legal o informativo que aparecerá en el pie de página
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="colors" className="space-y-6 mt-0">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Paleta de Colores</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="primaryColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Color Primario</FormLabel>
                              <FormControl>
                                <div className="flex">
                                  <div 
                                    className="w-10 h-10 border rounded-l-md flex items-center justify-center"
                                    style={{ backgroundColor: field.value }}
                                  />
                                  <Input 
                                    type="text" 
                                    className="rounded-l-none"
                                    {...field}
                                    onFocus={() => setPreviewColor(field.value)} 
                                    onBlur={() => setPreviewColor("")}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Color principal de la marca
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="secondaryColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Color Secundario</FormLabel>
                              <FormControl>
                                <div className="flex">
                                  <div 
                                    className="w-10 h-10 border rounded-l-md flex items-center justify-center"
                                    style={{ backgroundColor: field.value }}
                                  />
                                  <Input 
                                    type="text" 
                                    className="rounded-l-none"
                                    {...field}
                                    onFocus={() => setPreviewColor(field.value)} 
                                    onBlur={() => setPreviewColor("")}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Color complementario
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="accentColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Color de Acento</FormLabel>
                              <FormControl>
                                <div className="flex">
                                  <div 
                                    className="w-10 h-10 border rounded-l-md flex items-center justify-center"
                                    style={{ backgroundColor: field.value }}
                                  />
                                  <Input 
                                    type="text" 
                                    className="rounded-l-none"
                                    {...field}
                                    onFocus={() => setPreviewColor(field.value)} 
                                    onBlur={() => setPreviewColor("")}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Color para destacar elementos
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Tipografía</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fontPrimary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fuente Principal</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una fuente" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {commonFonts.map((font) => (
                                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                      {font}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Fuente para títulos y elementos destacados
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="fontSecondary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fuente Secundaria</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una fuente" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {commonFonts.map((font) => (
                                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                      {font}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Fuente para textos de cuerpo
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="useCustomFonts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Usar Fuentes Personalizadas</FormLabel>
                              <FormDescription>
                                Activar para usar fuentes web personalizadas (Google Fonts, etc.)
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {form.watch("useCustomFonts") && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <FormField
                            control={form.control}
                            name="customFontUrls.primary"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL Fuente Principal</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://fonts.googleapis.com/css2?family=..." {...field} />
                                </FormControl>
                                <FormDescription>
                                  URL de la fuente personalizada principal
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="customFontUrls.secondary"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL Fuente Secundaria</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://fonts.googleapis.com/css2?family=..." {...field} />
                                </FormControl>
                                <FormDescription>
                                  URL de la fuente personalizada secundaria
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">CSS Personalizado</h3>
                      <FormField
                        control={form.control}
                        name="customCss"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CSS Personalizado</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder=":root { --custom-color: #f5f5f5; } ..." 
                                {...field} 
                                rows={6}
                                className="font-mono text-sm"
                              />
                            </FormControl>
                            <FormDescription>
                              CSS adicional para personalización avanzada
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="media" className="space-y-6 mt-0">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Logotipos</h3>

                      <FormField
                        control={form.control}
                        name="logoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo Principal</FormLabel>
                            <FormControl>
                              <div className="space-y-4">
                                {field.value ? (
                                  <div className="relative border rounded-md p-4 flex items-center justify-center">
                                    <img 
                                      src={field.value} 
                                      alt="Logo" 
                                      className="max-h-32 object-contain"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-2 right-2"
                                      onClick={() => form.setValue("logoUrl", "")}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="border border-dashed rounded-md p-8 flex flex-col items-center justify-center bg-muted/30">
                                    <Image className="h-16 w-16 text-muted-foreground mb-4" />
                                    <p className="text-sm text-muted-foreground">
                                      Sube tu logo principal
                                    </p>
                                  </div>
                                )}

                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button type="button" variant="outline" className="w-full gap-2">
                                      <Upload className="h-4 w-4" />
                                      <span>{field.value ? "Cambiar Logo" : "Subir Logo"}</span>
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Subir Logo Principal</DialogTitle>
                                      <DialogDescription>
                                        Sube una imagen para usar como logo principal de tu marca
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <MediaUpload
                                        multiple={false}
                                        accept="image/*"
                                        onSuccess={(media) => {
                                          form.setValue("logoUrl", media.url);
                                        }}
                                        onError={(error) => {
                                          toast({
                                            title: "Error",
                                            description: error.message,
                                            variant: "destructive",
                                          });
                                        }}
                                      />
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Logo principal que se mostrará en cabeceras y páginas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="faviconUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Favicon</FormLabel>
                            <FormControl>
                              <div className="space-y-4">
                                {field.value ? (
                                  <div className="relative border rounded-md p-4 flex items-center justify-center">
                                    <img 
                                      src={field.value} 
                                      alt="Favicon" 
                                      className="h-16 w-16 object-contain"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-2 right-2"
                                      onClick={() => form.setValue("faviconUrl", "")}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="border border-dashed rounded-md p-8 flex flex-col items-center justify-center bg-muted/30">
                                    <Image className="h-16 w-16 text-muted-foreground mb-4" />
                                    <p className="text-sm text-muted-foreground">
                                      Sube un icono para el favicon
                                    </p>
                                  </div>
                                )}

                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button type="button" variant="outline" className="w-full gap-2">
                                      <Upload className="h-4 w-4" />
                                      <span>{field.value ? "Cambiar Favicon" : "Subir Favicon"}</span>
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Subir Favicon</DialogTitle>
                                      <DialogDescription>
                                        Sube una imagen cuadrada para usar como favicon (icono de pestaña)
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <MediaUpload
                                        multiple={false}
                                        accept="image/*"
                                        onSuccess={(media) => {
                                          form.setValue("faviconUrl", media.url);
                                        }}
                                        onError={(error) => {
                                          toast({
                                            title: "Error",
                                            description: error.message,
                                            variant: "destructive",
                                          });
                                        }}
                                      />
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Icono pequeño que aparece en la pestaña del navegador
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                </CardContent>
              </Card>
              
              <div className="mt-6">
                <BrandingPreview />
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BrandingPage;