import React from "react";
import { useNotificationPreferences } from "@/hooks/use-notification-preferences";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function NotificacionesPage() {
  const { 
    preferences, 
    isLoading, 
    updatePreferences, 
    isUpdating 
  } = useNotificationPreferences();
  
  const { toast } = useToast();
  
  const [formState, setFormState] = React.useState({
    // Canales de notificación
    emailNotifications: false,
    // Tipos de notificaciones
    appccNotifications: false,
    inventoryNotifications: false,
    learningNotifications: false,
    bankingNotifications: false,
    systemNotifications: false,
    securityNotifications: false,
    purchasingNotifications: false,
    // Frecuencia
    emailFrequency: "daily"
  });
  
  // Actualizar el estado del formulario cuando se cargan las preferencias
  React.useEffect(() => {
    if (preferences) {
      setFormState({
        emailNotifications: preferences.emailNotifications,
        appccNotifications: preferences.appccNotifications,
        inventoryNotifications: preferences.inventoryNotifications,
        learningNotifications: preferences.learningNotifications,
        bankingNotifications: preferences.bankingNotifications,
        systemNotifications: preferences.systemNotifications,
        securityNotifications: preferences.securityNotifications,
        purchasingNotifications: preferences.purchasingNotifications || false,
        emailFrequency: preferences.emailFrequency
      });
    }
  }, [preferences]);
  
  const handleSave = async () => {
    try {
      await updatePreferences(formState);
      toast({
        title: "Preferencias actualizadas",
        description: "Tus preferencias de notificaciones han sido actualizadas.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar tus preferencias.",
        variant: "destructive",
      });
    }
  };
  
  const handleToggle = (key: string) => (checked: boolean) => {
    setFormState((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };
  
  const handleFrequencyChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      emailFrequency: value,
    }));
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Preferencias de notificaciones</h1>
          <p className="text-muted-foreground">
            Ajusta cómo y cuándo quieres recibir notificaciones del sistema.
          </p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isUpdating}
          className="ml-auto"
        >
          {isUpdating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Guardar cambios
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Canales de notificación</CardTitle>
            <CardDescription>
              Configura dónde quieres recibir tus notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Notificaciones por correo</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe un resumen de notificaciones por correo electrónico
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={formState.emailNotifications}
                onCheckedChange={handleToggle('emailNotifications')}
              />
            </div>
            
            {formState.emailNotifications && (
              <div className="pt-4 pb-2">
                <Label htmlFor="email-frequency">Frecuencia de emails</Label>
                <Select 
                  value={formState.emailFrequency} 
                  onValueChange={handleFrequencyChange}
                >
                  <SelectTrigger id="email-frequency" className="mt-2">
                    <SelectValue placeholder="Seleccionar frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Inmediata</SelectItem>
                    <SelectItem value="daily">Diaria</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tipos de notificaciones</CardTitle>
            <CardDescription>
              Elige qué tipo de notificaciones deseas recibir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="appcc-notifications">APPCC</Label>
                <p className="text-sm text-muted-foreground">
                  Controles pendientes y recordatorios
                </p>
              </div>
              <Switch
                id="appcc-notifications"
                checked={formState.appccNotifications}
                onCheckedChange={handleToggle('appccNotifications')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="inventory-notifications">Inventario</Label>
                <p className="text-sm text-muted-foreground">
                  Alertas de stock y movimientos
                </p>
              </div>
              <Switch
                id="inventory-notifications"
                checked={formState.inventoryNotifications}
                onCheckedChange={handleToggle('inventoryNotifications')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="learning-notifications">Formación</Label>
                <p className="text-sm text-muted-foreground">
                  Nuevos cursos y recordatorios de formación
                </p>
              </div>
              <Switch
                id="learning-notifications"
                checked={formState.learningNotifications}
                onCheckedChange={handleToggle('learningNotifications')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="banking-notifications">Banca</Label>
                <p className="text-sm text-muted-foreground">
                  Transacciones y movimientos bancarios
                </p>
              </div>
              <Switch
                id="banking-notifications"
                checked={formState.bankingNotifications}
                onCheckedChange={handleToggle('bankingNotifications')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system-notifications">Sistema</Label>
                <p className="text-sm text-muted-foreground">
                  Actualizaciones y mantenimiento
                </p>
              </div>
              <Switch
                id="system-notifications"
                checked={formState.systemNotifications}
                onCheckedChange={handleToggle('systemNotifications')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="security-notifications">Seguridad</Label>
                <p className="text-sm text-muted-foreground">
                  Alertas de seguridad e inicios de sesión
                </p>
              </div>
              <Switch
                id="security-notifications"
                checked={formState.securityNotifications}
                onCheckedChange={handleToggle('securityNotifications')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="purchasing-notifications">Compras</Label>
                <p className="text-sm text-muted-foreground">
                  Pedidos y recepciones de mercancía
                </p>
              </div>
              <Switch
                id="purchasing-notifications"
                checked={formState.purchasingNotifications}
                onCheckedChange={handleToggle('purchasingNotifications')}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}