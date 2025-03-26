import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brush,
  Upload,
  FileImage,
  Save,
  Check,
  Globe,
  Mail,
  MapPin,
  Phone,
  Users,
  Building,
  Palette,
  Paintbrush,
  Type,
  Eye,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

// Tipos para marca
interface Branding {
  id: number;
  companyId: number;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  companyName: string;
  companyTagline: string;
  companyDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: Record<string, string>;
  footerText: string;
  customCss: string;
  createdAt: string;
  updatedAt: string;
}

// Esquema de validación para la pestaña de identidad
const identitySchema = z.object({
  companyName: z.string().min(2, { message: "El nombre de la empresa es requerido" }),
  companyTagline: z.string().optional(),
  companyDescription: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
});

// Esquema de validación para la pestaña de contacto
const contactSchema = z.object({
  contactEmail: z.string().email({ message: "Ingresa un email válido" }).optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  socialLinks: z.record(z.string(), z.string()).optional(),
  footerText: z.string().optional(),
});

// Esquema de validación para la pestaña de diseño
const designSchema = z.object({
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { 
    message: "Formato de color hexadecimal inválido" 
  }),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { 
    message: "Formato de color hexadecimal inválido" 
  }),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { 
    message: "Formato de color hexadecimal inválido" 
  }).optional(),
  fontHeading: z.string(),
  fontBody: z.string(),
  customCss: z.string().optional(),
});

type IdentityFormValues = z.infer<typeof identitySchema>;
type ContactFormValues = z.infer<typeof contactSchema>;
type DesignFormValues = z.infer<typeof designSchema>;

// Social media platforms
const socialPlatforms = [
  { id: "facebook", name: "Facebook", placeholder: "https://facebook.com/..." },
  { id: "twitter", name: "Twitter", placeholder: "https://twitter.com/..." },
  { id: "instagram", name: "Instagram", placeholder: "https://instagram.com/..." },
  { id: "linkedin", name: "LinkedIn", placeholder: "https://linkedin.com/company/..." },
  { id: "youtube", name: "YouTube", placeholder: "https://youtube.com/..." },
];

// Font options
const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Poppins", label: "Poppins" },
  { value: "Raleway", label: "Raleway" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Merriweather", label: "Merriweather" },
  { value: "Source Sans Pro", label: "Source Sans Pro" },
];

export default function AdminCMSBrandingPanel() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("identity");
  const [previewMode, setPreviewMode] = useState(false);
  
  // Formularios para cada pestaña
  const identityForm = useForm<IdentityFormValues>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      companyName: "",
      companyTagline: "",
      companyDescription: "",
      logoUrl: "",
      faviconUrl: "",
    },
  });

  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contactEmail: "",
      contactPhone: "",
      address: "",
      socialLinks: {},
      footerText: "",
    },
  });

  const designForm = useForm<DesignFormValues>({
    resolver: zodResolver(designSchema),
    defaultValues: {
      primaryColor: "#3b82f6",
      secondaryColor: "#10b981",
      accentColor: "#f59e0b",
      fontHeading: "Inter",
      fontBody: "Inter",
      customCss: "",
    },
  });

  // Obtener configuración de marca
  const { data: branding, isLoading, error } = useQuery<Branding>({
    queryKey: ["/api/cms/branding"],
    queryFn: async () => {
      if (!user?.companyId) {
        throw new Error("ID de empresa no disponible");
      }
      
      const response = await fetch(`/api/cms/branding?companyId=${user.companyId}`);
      
      if (response.status === 404) {
        // Si no existe, devolver un objeto por defecto
        return {
          id: 0,
          companyId: user.companyId,
          logoUrl: "",
          faviconUrl: "",
          primaryColor: "#3b82f6",
          secondaryColor: "#10b981",
          accentColor: "#f59e0b",
          fontHeading: "Inter",
          fontBody: "Inter",
          companyName: "",
          companyTagline: "",
          companyDescription: "",
          contactEmail: "",
          contactPhone: "",
          address: "",
          socialLinks: {},
          footerText: "",
          customCss: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      
      if (!response.ok) {
        throw new Error("Error al cargar la configuración de marca");
      }
      
      return response.json();
    },
  });

  // Actualizar los formularios cuando se carga la configuración
  useEffect(() => {
    if (branding) {
      // Actualizar formulario de identidad
      identityForm.reset({
        companyName: branding.companyName,
        companyTagline: branding.companyTagline,
        companyDescription: branding.companyDescription,
        logoUrl: branding.logoUrl,
        faviconUrl: branding.faviconUrl,
      });

      // Actualizar formulario de contacto
      contactForm.reset({
        contactEmail: branding.contactEmail,
        contactPhone: branding.contactPhone,
        address: branding.address,
        socialLinks: branding.socialLinks,
        footerText: branding.footerText,
      });

      // Actualizar formulario de diseño
      designForm.reset({
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        accentColor: branding.accentColor,
        fontHeading: branding.fontHeading,
        fontBody: branding.fontBody,
        customCss: branding.customCss,
      });
    }
  }, [branding]);

  // Mutación para guardar configuración
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Branding>) => {
      if (!user?.companyId) {
        throw new Error("ID de empresa no disponible");
      }
      
      let response;
      // Si el ID es 0, crear nuevo registro, de lo contrario, actualizar
      if (!branding || branding.id === 0) {
        response = await apiRequest("POST", "/api/cms/branding", {
          ...data,
          companyId: user.companyId,
        });
      } else {
        response = await apiRequest("PUT", `/api/cms/branding/${branding.id}`, data);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/branding"] });
      toast({
        title: "Configuración guardada",
        description: "Los cambios han sido guardados correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      });
    },
  });

  // Guardar la configuración de la pestaña activa
  const handleSaveTab = () => {
    if (activeTab === "identity") {
      const isValid = identityForm.trigger();
      if (isValid) {
        const values = identityForm.getValues();
        saveMutation.mutate(values);
      }
    } else if (activeTab === "contact") {
      const isValid = contactForm.trigger();
      if (isValid) {
        const values = contactForm.getValues();
        saveMutation.mutate(values);
      }
    } else if (activeTab === "design") {
      const isValid = designForm.trigger();
      if (isValid) {
        const values = designForm.getValues();
        saveMutation.mutate(values);
      }
    }
  };

  // Guardar toda la configuración
  const handleSaveAll = () => {
    // Combinar todos los formularios
    const identityValues = identityForm.getValues();
    const contactValues = contactForm.getValues();
    const designValues = designForm.getValues();

    const combinedData = {
      ...identityValues,
      ...contactValues,
      ...designValues,
    };

    saveMutation.mutate(combinedData);
  };

  // Estados de carga y error
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-6 w-3/4 mt-2" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No se pudo cargar la configuración de marca. Por favor, inténtelo de nuevo.</p>
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Marca y Diseño</h1>
        <p className="text-muted-foreground mt-2">
          Personaliza la apariencia y la identidad de tu sitio web
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Switch
            checked={previewMode}
            onCheckedChange={setPreviewMode}
            id="preview-mode"
          />
          <Label htmlFor="preview-mode" className="cursor-pointer">
            Vista previa
          </Label>
        </div>
        
        <div className="space-x-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleSaveTab}
            disabled={saveMutation.isPending}
          >
            <Save size={16} />
            <span>Guardar Tab</span>
          </Button>
          
          <Button 
            className="gap-2"
            onClick={handleSaveAll}
            disabled={saveMutation.isPending}
          >
            <Check size={16} />
            <span>Guardar Todo</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="identity" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>Identidad</span>
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Contacto</span>
                  </TabsTrigger>
                  <TabsTrigger value="design" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <span>Diseño</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent>
              {/* Formulario de Identidad */}
              {activeTab === "identity" && (
                <Form {...identityForm}>
                  <form className="space-y-6">
                    <FormField
                      control={identityForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Empresa</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nombre de tu empresa" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={identityForm.control}
                      name="companyTagline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Eslogan</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Tu eslogan o lema" />
                          </FormControl>
                          <FormDescription>
                            Una frase corta que describe tu negocio
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={identityForm.control}
                      name="companyDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Describe brevemente tu empresa" 
                              className="min-h-32 resize-y"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Esta descripción se utilizará en varias secciones del sitio web
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={identityForm.control}
                        name="logoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input {...field} placeholder="URL del logo" />
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  className="shrink-0"
                                  onClick={() => window.location.href = "/cms/media"}
                                >
                                  <Upload className="h-4 w-4" />
                                </Button>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Tamaño recomendado: 200×60px
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={identityForm.control}
                        name="faviconUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Favicon</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input {...field} placeholder="URL del favicon" />
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  className="shrink-0"
                                  onClick={() => window.location.href = "/cms/media"}
                                >
                                  <Upload className="h-4 w-4" />
                                </Button>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Tamaño recomendado: 32×32px
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              )}
              
              {/* Formulario de Contacto */}
              {activeTab === "contact" && (
                <Form {...contactForm}>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={contactForm.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email de Contacto</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <Input {...field} placeholder="tu@email.com" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={contactForm.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono de Contacto</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <Input {...field} placeholder="+34 600 000 000" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={contactForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección</FormLabel>
                          <FormControl>
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-2.5" />
                              <Textarea 
                                {...field} 
                                placeholder="Dirección completa" 
                                className="resize-y"
                                value={field.value || ""}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <Label className="mb-2 block">Redes Sociales</Label>
                      <div className="space-y-3">
                        {socialPlatforms.map((platform) => (
                          <div key={platform.id} className="flex items-center space-x-2">
                            <Label className="w-24">{platform.name}:</Label>
                            <Input
                              placeholder={platform.placeholder}
                              value={contactForm.watch(`socialLinks.${platform.id}`) || ""}
                              onChange={(e) => {
                                const currentLinks = contactForm.getValues("socialLinks") || {};
                                contactForm.setValue("socialLinks", {
                                  ...currentLinks,
                                  [platform.id]: e.target.value,
                                });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <FormField
                      control={contactForm.control}
                      name="footerText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Texto del Pie de Página</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="© 2025 Tu Empresa. Todos los derechos reservados."
                              className="resize-y"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Este texto se mostrará en el pie de página de tu sitio web
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              )}
              
              {/* Formulario de Diseño */}
              {activeTab === "design" && (
                <Form {...designForm}>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={designForm.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color Primario</FormLabel>
                            <FormControl>
                              <div className="flex space-x-2">
                                <div 
                                  className="w-10 h-10 rounded-md border" 
                                  style={{ backgroundColor: field.value }}
                                />
                                <Input 
                                  {...field} 
                                  placeholder="#3b82f6" 
                                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={designForm.control}
                        name="secondaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color Secundario</FormLabel>
                            <FormControl>
                              <div className="flex space-x-2">
                                <div 
                                  className="w-10 h-10 rounded-md border" 
                                  style={{ backgroundColor: field.value }}
                                />
                                <Input 
                                  {...field} 
                                  placeholder="#10b981" 
                                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={designForm.control}
                        name="accentColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color de Acento</FormLabel>
                            <FormControl>
                              <div className="flex space-x-2">
                                <div 
                                  className="w-10 h-10 rounded-md border" 
                                  style={{ backgroundColor: field.value }}
                                />
                                <Input 
                                  {...field} 
                                  placeholder="#f59e0b" 
                                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                  value={field.value || ""}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={designForm.control}
                        name="fontHeading"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fuente para Títulos</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona una fuente" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {fontOptions.map((font) => (
                                  <SelectItem 
                                    key={font.value} 
                                    value={font.value}
                                    style={{ fontFamily: font.value }}
                                  >
                                    {font.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Fuente para encabezados y títulos
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={designForm.control}
                        name="fontBody"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fuente para Texto</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona una fuente" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {fontOptions.map((font) => (
                                  <SelectItem 
                                    key={font.value} 
                                    value={font.value}
                                    style={{ fontFamily: font.value }}
                                  >
                                    {font.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Fuente para el texto principal del sitio
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={designForm.control}
                      name="customCss"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CSS Personalizado</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="/* Añade tus estilos CSS personalizados aquí */" 
                              className="min-h-32 font-mono resize-y"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            CSS avanzado para personalizar la apariencia del sitio
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Panel de Vista Previa */}
        {previewMode && (
          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Vista Previa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Logo y Favicon */}
                  {(identityForm.watch("logoUrl") || identityForm.watch("faviconUrl")) && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Branding</p>
                      <div className="flex items-center space-x-4">
                        {identityForm.watch("logoUrl") && (
                          <div className="p-2 border rounded-md">
                            <img 
                              src={identityForm.watch("logoUrl")} 
                              alt="Logo" 
                              className="max-h-12 object-contain"
                            />
                          </div>
                        )}
                        
                        {identityForm.watch("faviconUrl") && (
                          <div className="p-2 border rounded-md">
                            <img 
                              src={identityForm.watch("faviconUrl")} 
                              alt="Favicon" 
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Información de la Empresa */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Identidad</p>
                    <div className="p-4 border rounded-md bg-white shadow-sm">
                      <h3 className="font-bold text-lg" style={{ 
                        fontFamily: designForm.watch("fontHeading"),
                        color: designForm.watch("primaryColor"),
                      }}>
                        {identityForm.watch("companyName") || "Nombre de la Empresa"}
                      </h3>
                      
                      {identityForm.watch("companyTagline") && (
                        <p className="text-sm mt-1" style={{ 
                          fontFamily: designForm.watch("fontBody"),
                          color: designForm.watch("secondaryColor"),
                        }}>
                          {identityForm.watch("companyTagline")}
                        </p>
                      )}
                      
                      {identityForm.watch("companyDescription") && (
                        <p className="text-sm mt-3" style={{ 
                          fontFamily: designForm.watch("fontBody") 
                        }}>
                          {identityForm.watch("companyDescription")}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Información de Contacto */}
                  {activeTab === "contact" && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Contacto</p>
                      <div className="p-4 border rounded-md bg-white shadow-sm">
                        <div className="space-y-2">
                          {contactForm.watch("contactEmail") && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{contactForm.watch("contactEmail")}</span>
                            </div>
                          )}
                          
                          {contactForm.watch("contactPhone") && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{contactForm.watch("contactPhone")}</span>
                            </div>
                          )}
                          
                          {contactForm.watch("address") && (
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <span className="text-sm">{contactForm.watch("address")}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Redes Sociales */}
                        {contactForm.watch("socialLinks") && 
                          Object.keys(contactForm.watch("socialLinks") || {}).length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-medium mb-2">Redes Sociales:</p>
                            <div className="flex flex-wrap items-center gap-2">
                              {Object.entries(contactForm.watch("socialLinks") || {}).map(([key, value]) => (
                                value && (
                                  <div 
                                    key={key}
                                    className="px-2 py-1 bg-muted rounded-md text-xs"
                                  >
                                    {key}
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Footer */}
                        {contactForm.watch("footerText") && (
                          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                            {contactForm.watch("footerText")}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Paleta de Colores */}
                  {activeTab === "design" && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Paleta de Colores</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div 
                          className="aspect-square rounded-md flex items-center justify-center text-white text-xs font-medium"
                          style={{ backgroundColor: designForm.watch("primaryColor") }}
                        >
                          Primario
                        </div>
                        <div 
                          className="aspect-square rounded-md flex items-center justify-center text-white text-xs font-medium"
                          style={{ backgroundColor: designForm.watch("secondaryColor") }}
                        >
                          Secundario
                        </div>
                        <div 
                          className="aspect-square rounded-md flex items-center justify-center text-white text-xs font-medium"
                          style={{ backgroundColor: designForm.watch("accentColor") }}
                        >
                          Acento
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Tipografía */}
                  {activeTab === "design" && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Tipografía</p>
                      <div className="p-4 border rounded-md bg-white shadow-sm">
                        <h4 
                          className="text-lg font-bold"
                          style={{ 
                            fontFamily: designForm.watch("fontHeading"),
                            color: designForm.watch("primaryColor"),
                          }}
                        >
                          Encabezado en {designForm.watch("fontHeading")}
                        </h4>
                        <p 
                          className="mt-3"
                          style={{ 
                            fontFamily: designForm.watch("fontBody") 
                          }}
                        >
                          Texto normal en {designForm.watch("fontBody")}. 
                          Este es un ejemplo de texto que muestra cómo se verá 
                          el contenido principal de tu sitio web.
                        </p>
                        <a 
                          href="#" 
                          className="mt-2 inline-block"
                          style={{ 
                            fontFamily: designForm.watch("fontBody"),
                            color: designForm.watch("accentColor"),
                          }}
                        >
                          Este es un enlace
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}