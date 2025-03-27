import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  Mail,
  Globe,
  ShieldCheck,
  Database,
  BellRing,
  Clock,
  UploadCloud,
  Key,
  RefreshCw,
  Lock,
  Trash2,
  FileWarning,
  AlarmClock,
  Server,
  CloudOff,
} from "lucide-react";

// Esquema para validación del formulario general
const generalFormSchema = z.object({
  siteName: z.string().min(2, {
    message: "El nombre del sitio debe tener al menos 2 caracteres.",
  }),
  siteUrl: z.string().url({
    message: "Por favor ingrese una URL válida.",
  }),
  adminEmail: z.string().email({
    message: "Por favor ingrese un correo electrónico válido.",
  }),
  language: z.string(),
  timezone: z.string(),
  dateFormat: z.string(),
  maintenance: z.boolean(),
  debugMode: z.boolean(),
});

// Esquema para validación del formulario de notificaciones
const notificationsFormSchema = z.object({
  emailNotifications: z.boolean(),
  adminAlerts: z.boolean(),
  userSignups: z.boolean(),
  securityAlerts: z.boolean(),
  appccReminders: z.boolean(),
  dailyReports: z.boolean(),
  emailSender: z.string().email().optional(),
  emailService: z.string(),
  smsNotifications: z.boolean(),
  smsProvider: z.string().optional(),
  notificationFrequency: z.string(),
});

// Esquema para validación del formulario de almacenamiento
const storageFormSchema = z.object({
  maxUploadSize: z.string(),
  allowedFileTypes: z.string(),
  storageProvider: z.string(),
  imageCompression: z.boolean(),
  backupFrequency: z.string(),
  backupRetention: z.string(),
  cloudStorage: z.boolean(),
  storagePath: z.string(),
});

// Esquema para validación del formulario de seguridad
const securityFormSchema = z.object({
  twoFactorAuth: z.boolean(),
  passwordPolicy: z.string(),
  sessionTimeout: z.string(),
  ipRestrictions: z.boolean(),
  auditLogging: z.boolean(),
  securityHeaders: z.boolean(),
  apiRateLimiting: z.boolean(),
  maxLoginAttempts: z.string(),
});

// Tipo para el plan de precios
type PricePlan = {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: number;
  isDefault: boolean;
  moduleAccess: string[];
  userLimit: number;
  storageLimit: number;
  supportLevel: string;
};

// Datos de ejemplo para planes de precios
const pricePlans: PricePlan[] = [
  {
    id: "basic",
    name: "Básico",
    description: "Para pequeñas empresas con necesidades básicas de seguridad alimentaria",
    features: [
      "Módulo APPCC básico",
      "Gestión de inventario básica",
      "Portal de transparencia básico",
      "Soporte por email",
    ],
    price: 29.99,
    isDefault: true,
    moduleAccess: ["appcc", "inventory"],
    userLimit: 5,
    storageLimit: 5,
    supportLevel: "email",
  },
  {
    id: "professional",
    name: "Profesional",
    description: "Para empresas medianas con necesidades completas de gestión",
    features: [
      "Módulo APPCC completo",
      "Gestión de inventario avanzada",
      "Portal de transparencia completo",
      "Integración bancaria",
      "Soporte telefónico",
    ],
    price: 79.99,
    isDefault: false,
    moduleAccess: ["appcc", "inventory", "transparency", "banking"],
    userLimit: 20,
    storageLimit: 20,
    supportLevel: "phone",
  },
  {
    id: "enterprise",
    name: "Empresa",
    description: "Para grandes empresas con múltiples ubicaciones",
    features: [
      "Todos los módulos incluidos",
      "Gestión avanzada de usuarios",
      "Integraciones personalizadas",
      "Almacenamiento ilimitado",
      "Soporte prioritario 24/7",
      "Gerente de cuenta dedicado",
    ],
    price: 199.99,
    isDefault: false,
    moduleAccess: ["appcc", "inventory", "transparency", "banking", "elearning", "cms"],
    userLimit: 100,
    storageLimit: 100,
    supportLevel: "premium",
  },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("general");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activePlan, setActivePlan] = useState("professional");
  
  // Estados para acciones
  const [isResettingLogs, setIsResettingLogs] = useState(false);
  const [isRegeneratingKeys, setIsRegeneratingKeys] = useState(false);
  const [isRebuildingIndex, setIsRebuildingIndex] = useState(false);
  const [isTestingBackup, setIsTestingBackup] = useState(false);

  // Formulario General
  const generalForm = useForm<z.infer<typeof generalFormSchema>>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: {
      siteName: "ShieldCuisine",
      siteUrl: "https://shieldcuisine.com",
      adminEmail: "admin@shieldcuisine.com",
      language: "es",
      timezone: "Europe/Madrid",
      dateFormat: "DD/MM/YYYY",
      maintenance: false,
      debugMode: false,
    },
  });

  // Formulario Notificaciones
  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
      adminAlerts: true,
      userSignups: true,
      securityAlerts: true,
      appccReminders: true,
      dailyReports: true,
      emailSender: "notificaciones@shieldcuisine.com",
      emailService: "smtp",
      smsNotifications: false,
      smsProvider: "",
      notificationFrequency: "instant",
    },
  });

  // Formulario Almacenamiento
  const storageForm = useForm<z.infer<typeof storageFormSchema>>({
    resolver: zodResolver(storageFormSchema),
    defaultValues: {
      maxUploadSize: "10",
      allowedFileTypes: "jpg,png,pdf,doc,docx,xls,xlsx,csv",
      storageProvider: "local",
      imageCompression: true,
      backupFrequency: "daily",
      backupRetention: "30",
      cloudStorage: false,
      storagePath: "/var/www/storage",
    },
  });

  // Formulario Seguridad
  const securityForm = useForm<z.infer<typeof securityFormSchema>>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      twoFactorAuth: false,
      passwordPolicy: "medium",
      sessionTimeout: "60",
      ipRestrictions: false,
      auditLogging: true,
      securityHeaders: true,
      apiRateLimiting: true,
      maxLoginAttempts: "5",
    },
  });

  // Manejador para guardar formulario general
  function onGeneralSubmit(values: z.infer<typeof generalFormSchema>) {
    toast({
      title: "Configuración guardada",
      description: "La configuración general ha sido actualizada correctamente.",
    });
    console.log(values);
  }

  // Manejador para guardar formulario de notificaciones
  function onNotificationsSubmit(values: z.infer<typeof notificationsFormSchema>) {
    toast({
      title: "Configuración de notificaciones guardada",
      description: "La configuración de notificaciones ha sido actualizada correctamente.",
    });
    console.log(values);
  }

  // Manejador para guardar formulario de almacenamiento
  function onStorageSubmit(values: z.infer<typeof storageFormSchema>) {
    toast({
      title: "Configuración de almacenamiento guardada",
      description: "La configuración de almacenamiento ha sido actualizada correctamente.",
    });
    console.log(values);
  }

  // Manejador para guardar formulario de seguridad
  function onSecuritySubmit(values: z.infer<typeof securityFormSchema>) {
    toast({
      title: "Configuración de seguridad guardada",
      description: "La configuración de seguridad ha sido actualizada correctamente.",
    });
    console.log(values);
  }

  // Función para activar un plan
  const handleActivatePlan = (planId: string) => {
    setActivePlan(planId);
    toast({
      title: "Plan actualizado",
      description: `El plan ${planId} ha sido activado correctamente.`,
    });
  };

  // Función para borrar todos los datos
  const handleDeleteAllData = () => {
    toast({
      title: "Datos eliminados",
      description: "Todos los datos han sido eliminados correctamente.",
      variant: "destructive",
    });
    setConfirmDelete(false);
  };

  // Función para simular reconstrucción de índice
  const handleRebuildIndex = () => {
    setIsRebuildingIndex(true);
    setTimeout(() => {
      setIsRebuildingIndex(false);
      toast({
        title: "Índice reconstruido",
        description: "El índice de búsqueda ha sido reconstruido correctamente.",
      });
    }, 2000);
  };

  // Función para simular limpieza de logs
  const handleCleanLogs = () => {
    setIsResettingLogs(true);
    setTimeout(() => {
      setIsResettingLogs(false);
      toast({
        title: "Logs limpiados",
        description: "Los logs han sido limpiados correctamente.",
      });
    }, 2000);
  };

  // Función para simular regeneración de claves API
  const handleRegenerateKeys = () => {
    setIsRegeneratingKeys(true);
    setTimeout(() => {
      setIsRegeneratingKeys(false);
      toast({
        title: "Claves regeneradas",
        description: "Las claves API han sido regeneradas correctamente.",
      });
    }, 2000);
  };

  // Función para simular prueba de backup
  const handleTestBackup = () => {
    setIsTestingBackup(true);
    setTimeout(() => {
      setIsTestingBackup(false);
      toast({
        title: "Backup probado",
        description: "La prueba de backup se ha completado correctamente.",
      });
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
          <p className="text-muted-foreground">
            Administre las configuraciones globales de la plataforma.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200"
          >
            Versión 2.5.0
          </Badge>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-1">
                <Trash2 className="h-4 w-4 mr-1" />
                Reiniciar Sistema
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Está seguro de reiniciar el sistema?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará todos los datos y configuraciones. El sistema
                  volverá a su estado original. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => setConfirmDelete(true)}
                  className="bg-destructive text-destructive-foreground"
                >
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {confirmDelete && (
            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirme la eliminación</AlertDialogTitle>
                  <AlertDialogDescription>
                    Por favor, escriba "ELIMINAR" para confirmar que desea eliminar todos
                    los datos del sistema. Esta acción es irreversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Input placeholder="Escriba ELIMINAR para confirmar" />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAllData}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Eliminar todos los datos
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:w-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="storage">Almacenamiento</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="subscription">Suscripción</TabsTrigger>
        </TabsList>

        {/* Sección General */}
        <TabsContent value="general" className="pt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Configure los ajustes básicos de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form
                  onSubmit={generalForm.handleSubmit(onGeneralSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={generalForm.control}
                      name="siteName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Sitio</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            El nombre que se mostrará en toda la plataforma.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="siteUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL del Sitio</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            La dirección web de la plataforma.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="adminEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email de Administrador</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Se utilizará para notificaciones del sistema.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idioma</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un idioma" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="es">Español</SelectItem>
                              <SelectItem value="en">Inglés</SelectItem>
                              <SelectItem value="fr">Francés</SelectItem>
                              <SelectItem value="de">Alemán</SelectItem>
                              <SelectItem value="it">Italiano</SelectItem>
                              <SelectItem value="pt">Portugués</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Idioma predeterminado del sistema.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zona Horaria</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione una zona horaria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Europe/Madrid">
                                Europa/Madrid (GMT+1)
                              </SelectItem>
                              <SelectItem value="Europe/London">
                                Europa/Londres (GMT+0)
                              </SelectItem>
                              <SelectItem value="America/New_York">
                                América/Nueva York (GMT-5)
                              </SelectItem>
                              <SelectItem value="America/Los_Angeles">
                                América/Los Ángeles (GMT-8)
                              </SelectItem>
                              <SelectItem value="Asia/Tokyo">
                                Asia/Tokio (GMT+9)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Zona horaria para fechas y horas.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="dateFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Formato de Fecha</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un formato" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DD/MM/YYYY">
                                DD/MM/YYYY (31/12/2025)
                              </SelectItem>
                              <SelectItem value="MM/DD/YYYY">
                                MM/DD/YYYY (12/31/2025)
                              </SelectItem>
                              <SelectItem value="YYYY-MM-DD">
                                YYYY-MM-DD (2025-12-31)
                              </SelectItem>
                              <SelectItem value="DD-MM-YYYY">
                                DD-MM-YYYY (31-12-2025)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Formato para mostrar fechas en el sistema.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={generalForm.control}
                      name="maintenance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Modo de Mantenimiento
                            </FormLabel>
                            <FormDescription>
                              Activa el modo de mantenimiento para todos los usuarios.
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

                    <FormField
                      control={generalForm.control}
                      name="debugMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Modo de Depuración
                            </FormLabel>
                            <FormDescription>
                              Activa el modo de depuración para información detallada de errores.
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
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" className="gap-1">
                      <Save className="h-4 w-4 mr-1" />
                      Guardar Cambios
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Herramientas de Mantenimiento</CardTitle>
              <CardDescription>
                Herramientas para el mantenimiento del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Reconstruir Índice de Búsqueda</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Regenera el índice de búsqueda para mejorar el rendimiento.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleRebuildIndex}
                      disabled={isRebuildingIndex}
                    >
                      {isRebuildingIndex ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Reconstruyendo...
                        </>
                      ) : (
                        <>
                          <Database className="h-4 w-4 mr-2" />
                          Reconstruir Índice
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Limpiar Registros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Elimina los archivos de registro antiguos para liberar espacio.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleCleanLogs}
                      disabled={isResettingLogs}
                    >
                      {isResettingLogs ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Limpiando...
                        </>
                      ) : (
                        <>
                          <FileWarning className="h-4 w-4 mr-2" />
                          Limpiar Logs
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Regenerar Claves API</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Regenera todas las claves API del sistema.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleRegenerateKeys}
                      disabled={isRegeneratingKeys}
                    >
                      {isRegeneratingKeys ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Regenerando...
                        </>
                      ) : (
                        <>
                          <Key className="h-4 w-4 mr-2" />
                          Regenerar Claves
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Probar Backup</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Realiza una prueba de backup y restauración.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleTestBackup}
                      disabled={isTestingBackup}
                    >
                      {isTestingBackup ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Probando...
                        </>
                      ) : (
                        <>
                          <Server className="h-4 w-4 mr-2" />
                          Probar Backup
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sección Notificaciones */}
        <TabsContent value="notifications" className="pt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>
                Configure las opciones de notificaciones del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationsForm}>
                <form
                  onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notificaciones por Email</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={notificationsForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Notificaciones por Email
                              </FormLabel>
                              <FormDescription>
                                Activar envío de notificaciones por email.
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

                      <FormField
                        control={notificationsForm.control}
                        name="emailSender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Remitente</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Dirección desde la que se enviarán los emails.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationsForm.control}
                        name="emailService"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Servicio de Email</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione un servicio" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="smtp">SMTP</SelectItem>
                                <SelectItem value="mailgun">Mailgun</SelectItem>
                                <SelectItem value="sendgrid">SendGrid</SelectItem>
                                <SelectItem value="ses">Amazon SES</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Servicio para enviar emails.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationsForm.control}
                        name="notificationFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frecuencia de Notificaciones</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione frecuencia" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="instant">Instantánea</SelectItem>
                                <SelectItem value="hourly">Cada hora</SelectItem>
                                <SelectItem value="daily">Diaria</SelectItem>
                                <SelectItem value="weekly">Semanal</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Frecuencia de envío de notificaciones.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Tipos de Notificaciones</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={notificationsForm.control}
                        name="adminAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Alertas de Administrador
                              </FormLabel>
                              <FormDescription>
                                Notificaciones para administradores del sistema.
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

                      <FormField
                        control={notificationsForm.control}
                        name="userSignups"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Registros de Usuarios
                              </FormLabel>
                              <FormDescription>
                                Notificaciones de nuevos registros de usuarios.
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

                      <FormField
                        control={notificationsForm.control}
                        name="securityAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Alertas de Seguridad
                              </FormLabel>
                              <FormDescription>
                                Notificaciones sobre eventos de seguridad.
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

                      <FormField
                        control={notificationsForm.control}
                        name="appccReminders"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Recordatorios APPCC
                              </FormLabel>
                              <FormDescription>
                                Recordatorios para controles pendientes.
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

                      <FormField
                        control={notificationsForm.control}
                        name="dailyReports"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Informes Diarios
                              </FormLabel>
                              <FormDescription>
                                Envío de informes diarios de actividad.
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

                      <FormField
                        control={notificationsForm.control}
                        name="smsNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Notificaciones SMS
                              </FormLabel>
                              <FormDescription>
                                Activar envío de notificaciones por SMS.
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
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Plantilla de Emails</h3>
                    <div>
                      <FormItem>
                        <FormLabel>Plantilla de Email</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Plantilla HTML para los emails"
                            className="h-40"
                            defaultValue={'<!DOCTYPE html>\n<html>\n<head>\n  <title>{{subject}}</title>\n</head>\n<body>\n  <h1>{{title}}</h1>\n  <p>{{content}}</p>\n  <footer>© 2025 ShieldCuisine</footer>\n</body>\n</html>'}
                          />
                        </FormControl>
                        <FormDescription>
                          Plantilla HTML para los emails. Use {{variable}} para campos dinámicos.
                        </FormDescription>
                      </FormItem>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" className="gap-1">
                      <Save className="h-4 w-4 mr-1" />
                      Guardar Cambios
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Previsualización de Notificaciones</CardTitle>
              <CardDescription>
                Visualice cómo se verán las diferentes notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Email de Bienvenida</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <div className="space-y-2">
                        <div className="font-medium">Asunto: Bienvenido a ShieldCuisine</div>
                        <div className="text-sm">
                          <p>Estimado [Nombre del Usuario],</p>
                          <br />
                          <p>
                            ¡Bienvenido a ShieldCuisine! Su cuenta ha sido creada exitosamente.
                          </p>
                          <br />
                          <p>
                            Puede acceder a la plataforma con sus credenciales en cualquier momento.
                          </p>
                          <br />
                          <p>Saludos cordiales,<br />El equipo de ShieldCuisine</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-1" />
                        Enviar Prueba
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Alerta de Seguridad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <div className="space-y-2">
                        <div className="font-medium">
                          Asunto: Alerta de Seguridad - Inicio de Sesión Inusual
                        </div>
                        <div className="text-sm">
                          <p>Estimado [Nombre del Administrador],</p>
                          <br />
                          <p>
                            Se ha detectado un inicio de sesión inusual en la cuenta [Usuario].
                          </p>
                          <br />
                          <p>
                            Detalles: IP 192.168.1.1, Ubicación: Madrid, España, Fecha: 20/03/2025 15:30
                          </p>
                          <br />
                          <p>Si no reconoce esta actividad, por favor contacte al soporte.</p>
                          <br />
                          <p>El equipo de Seguridad</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-1" />
                        Enviar Prueba
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sección Almacenamiento */}
        <TabsContent value="storage" className="pt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Almacenamiento</CardTitle>
              <CardDescription>
                Configure las opciones de almacenamiento del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...storageForm}>
                <form
                  onSubmit={storageForm.handleSubmit(onStorageSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={storageForm.control}
                      name="maxUploadSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tamaño Máximo de Subida (MB)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" max="100" />
                          </FormControl>
                          <FormDescription>
                            Tamaño máximo de archivo en MB.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={storageForm.control}
                      name="allowedFileTypes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipos de Archivo Permitidos</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Extensiones separadas por comas (jpg,png,pdf).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={storageForm.control}
                      name="storageProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proveedor de Almacenamiento</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un proveedor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="local">Almacenamiento Local</SelectItem>
                              <SelectItem value="s3">Amazon S3</SelectItem>
                              <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                              <SelectItem value="azure">Azure Blob Storage</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Donde se almacenarán los archivos.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={storageForm.control}
                      name="storagePath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ruta de Almacenamiento</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Ruta para almacenamiento local o bucket para cloud.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={storageForm.control}
                      name="backupFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frecuencia de Backup</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione frecuencia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hourly">Cada hora</SelectItem>
                              <SelectItem value="daily">Diaria</SelectItem>
                              <SelectItem value="weekly">Semanal</SelectItem>
                              <SelectItem value="monthly">Mensual</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Frecuencia de realización de backups.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={storageForm.control}
                      name="backupRetention"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Retención de Backups (días)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" max="365" />
                          </FormControl>
                          <FormDescription>
                            Días que se conservarán los backups antiguos.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={storageForm.control}
                      name="imageCompression"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Compresión de Imágenes
                            </FormLabel>
                            <FormDescription>
                              Comprimir automáticamente imágenes al subirlas.
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

                    <FormField
                      control={storageForm.control}
                      name="cloudStorage"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Almacenamiento en la Nube
                            </FormLabel>
                            <FormDescription>
                              Usar almacenamiento en la nube para mayor escalabilidad.
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
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" className="gap-1">
                      <Save className="h-4 w-4 mr-1" />
                      Guardar Cambios
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado del Almacenamiento</CardTitle>
              <CardDescription>
                Información sobre el estado actual del almacenamiento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Espacio Utilizado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">15.4 GB</div>
                      <div className="text-sm text-muted-foreground">
                        de 50 GB disponibles (30.8%)
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: "30.8%" }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Archivos Almacenados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">12,458</div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Imágenes: 8,293</span>
                        <span>PDFs: 3,124</span>
                        <span>Otros: 1,041</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Último Backup</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">hace 4 horas</div>
                      <div className="text-sm text-muted-foreground">
                        26/03/2025 09:32:15
                      </div>
                      <div className="text-xs text-green-600">Completado exitosamente</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Distribución de Almacenamiento</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Imágenes", value: 8.2 },
                          { name: "PDFs", value: 5.1 },
                          { name: "Videos", value: 1.3 },
                          { name: "Otros", value: 0.8 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline">
                <UploadCloud className="h-4 w-4 mr-1" />
                Backup Manual
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Sección Seguridad */}
        <TabsContent value="security" className="pt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Seguridad</CardTitle>
              <CardDescription>
                Configure las opciones de seguridad del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form
                  onSubmit={securityForm.handleSubmit(onSecuritySubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={securityForm.control}
                      name="passwordPolicy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Política de Contraseñas</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione una política" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="basic">
                                Básica (mínimo 8 caracteres)
                              </SelectItem>
                              <SelectItem value="medium">
                                Media (mínimo 10 caracteres, 1 número)
                              </SelectItem>
                              <SelectItem value="strong">
                                Fuerte (mínimo 12 caracteres, mayúsculas, números y símbolos)
                              </SelectItem>
                              <SelectItem value="custom">
                                Personalizada
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Política para la creación de contraseñas.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={securityForm.control}
                      name="sessionTimeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tiempo de Sesión (minutos)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="5" max="1440" />
                          </FormControl>
                          <FormDescription>
                            Tiempo de inactividad antes de cerrar sesión.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={securityForm.control}
                      name="maxLoginAttempts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intentos Máximos de Login</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="3" max="10" />
                          </FormControl>
                          <FormDescription>
                            Intentos fallidos antes de bloquear.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={securityForm.control}
                      name="twoFactorAuth"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Autenticación de Dos Factores
                            </FormLabel>
                            <FormDescription>
                              Requerir 2FA para todos los usuarios.
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

                    <FormField
                      control={securityForm.control}
                      name="ipRestrictions"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Restricciones de IP
                            </FormLabel>
                            <FormDescription>
                              Limitar acceso por rangos de IP.
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

                    <FormField
                      control={securityForm.control}
                      name="auditLogging"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Registro de Auditoría
                            </FormLabel>
                            <FormDescription>
                              Registrar todas las acciones de usuarios.
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

                    <FormField
                      control={securityForm.control}
                      name="securityHeaders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Cabeceras de Seguridad
                            </FormLabel>
                            <FormDescription>
                              Habilitar cabeceras HTTP de seguridad.
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

                    <FormField
                      control={securityForm.control}
                      name="apiRateLimiting"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Limitación de Tasa API
                            </FormLabel>
                            <FormDescription>
                              Limitar número de peticiones a la API.
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
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Certificados SSL</h3>
                    <div className="rounded-lg border p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Certificado SSL Activo</div>
                          <div className="text-sm text-muted-foreground">
                            Emitido para: *.shieldcuisine.com
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Válido hasta: 15/04/2026
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 hover:bg-green-50"
                        >
                          Activo
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" className="gap-1">
                      <Save className="h-4 w-4 mr-1" />
                      Guardar Cambios
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registro de Actividad de Seguridad</CardTitle>
              <CardDescription>
                Últimos eventos de seguridad registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Detalles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>26/03/2025 14:32</TableCell>
                    <TableCell>Inicio de sesión exitoso</TableCell>
                    <TableCell>admin@shieldcuisine.com</TableCell>
                    <TableCell>192.168.1.1</TableCell>
                    <TableCell>Madrid, ES</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>26/03/2025 13:45</TableCell>
                    <TableCell>
                      <span className="text-red-500">Intento de inicio de sesión fallido</span>
                    </TableCell>
                    <TableCell>admin@shieldcuisine.com</TableCell>
                    <TableCell>83.45.127.89</TableCell>
                    <TableCell>Desconocido</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>26/03/2025 12:15</TableCell>
                    <TableCell>Cambio de contraseña</TableCell>
                    <TableCell>maria@lamarina.com</TableCell>
                    <TableCell>192.168.1.45</TableCell>
                    <TableCell>Barcelona, ES</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>26/03/2025 10:05</TableCell>
                    <TableCell>
                      <span className="text-amber-500">Alerta de seguridad</span>
                    </TableCell>
                    <TableCell>Sistema</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>Múltiples intentos fallidos desde la misma IP</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>25/03/2025 18:32</TableCell>
                    <TableCell>Generación de API Key</TableCell>
                    <TableCell>jose@elhorno.es</TableCell>
                    <TableCell>192.168.1.78</TableCell>
                    <TableCell>Madrid, ES</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-1" />
                Exportar Logs
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Sección Suscripción */}
        <TabsContent value="subscription" className="pt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Planes de Suscripción</CardTitle>
              <CardDescription>
                Gestione los planes de suscripción disponibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pricePlans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`${
                      activePlan === plan.id
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                  >
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-3xl font-bold">
                        {plan.price}€{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                          / mes
                        </span>
                      </div>
                      <div className="space-y-2">
                        {plan.features.map((feature, i) => (
                          <div key={i} className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Usuarios:</span>
                          <span className="font-medium">{plan.userLimit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Almacenamiento:</span>
                          <span className="font-medium">{plan.storageLimit} GB</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Soporte:</span>
                          <span className="font-medium">
                            {plan.supportLevel === "email"
                              ? "Email"
                              : plan.supportLevel === "phone"
                              ? "Teléfono"
                              : "Premium 24/7"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      {activePlan === plan.id ? (
                        <Button className="w-full" disabled>
                          Plan Actual
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleActivatePlan(plan.id)}
                        >
                          Seleccionar Plan
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Detalles de Facturación</h3>
                <div className="rounded-lg border p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Método de Pago</h4>
                      <div className="flex items-center space-x-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <rect
                              x="3"
                              y="5"
                              width="18"
                              height="14"
                              rx="2"
                              strokeWidth="2"
                            />
                            <line
                              x1="3"
                              y1="10"
                              x2="21"
                              y2="10"
                              strokeWidth="2"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Visa terminada en 4242</div>
                          <div className="text-sm text-muted-foreground">
                            Expira: 12/27
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Datos de Facturación</h4>
                      <div className="text-sm">
                        <p>ShieldCuisine S.L.</p>
                        <p>NIF: B12345678</p>
                        <p>Calle Ejemplo 123</p>
                        <p>28001 Madrid, España</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Historial de Facturación</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Factura</TableHead>
                      <TableHead>Importe</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>01/03/2025</TableCell>
                      <TableCell>INV-2025-0012</TableCell>
                      <TableCell>79.99€</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Pagado
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Descargar</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>01/02/2025</TableCell>
                      <TableCell>INV-2025-0008</TableCell>
                      <TableCell>79.99€</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Pagado
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Descargar</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>01/01/2025</TableCell>
                      <TableCell>INV-2025-0001</TableCell>
                      <TableCell>79.99€</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Pagado
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Descargar</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}