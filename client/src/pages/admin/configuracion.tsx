import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Mail, 
  Bell, 
  Shield, 
  Database, 
  CreditCard,
  Save
} from "lucide-react";

export default function Configuracion() {
  // Estados para los diferentes formularios
  const [generalForm, setGeneralForm] = useState({
    nombrePlataforma: "ShieldCuisine",
    urlPlataforma: "https://app.shieldcuisine.com",
    emailContacto: "soporte@shieldcuisine.com",
    telefonoContacto: "+34 912 345 678",
    logoUrl: "/logo.png"
  });
  
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: "smtp.shieldcuisine.com",
    smtpPort: "587",
    smtpUser: "no-reply@shieldcuisine.com",
    smtpPassword: "••••••••••••",
    emailDesde: "no-reply@shieldcuisine.com",
    nombreDesde: "ShieldCuisine"
  });
  
  const [notificacionesSettings, setNotificacionesSettings] = useState({
    enviarEmailNuevoUsuario: true,
    enviarEmailFactura: true,
    enviarEmailControlVencido: true,
    permitirNotificacionesPush: true,
    permitirSMS: false
  });
  
  const [seguridadSettings, setSeguridadSettings] = useState({
    tiempoSesion: "60",
    intentosLogin: "5",
    permitir2FA: true,
    requerir2FAAdmin: true,
    politicaPassword: "strong"
  });
  
  // Manejadores de cambios
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setGeneralForm({
      ...generalForm,
      [e.target.name]: e.target.value
    });
  };
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailSettings({
      ...emailSettings,
      [e.target.name]: e.target.value
    });
  };
  
  const handleNotificacionesChange = (key: string, value: boolean) => {
    setNotificacionesSettings({
      ...notificacionesSettings,
      [key]: value
    });
  };
  
  const handleSeguridadChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSeguridadSettings({
      ...seguridadSettings,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSeguridadSwitchChange = (key: string, value: boolean) => {
    setSeguridadSettings({
      ...seguridadSettings,
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Configuración</h1>
        <p className="text-neutral-500">
          Personaliza la configuración de la plataforma
        </p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="notificaciones">
            <Bell className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="seguridad">
            <Shield className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
          <TabsTrigger value="facturacion">
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Facturación</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Configuración general */}
        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración general</CardTitle>
              <CardDescription>
                Información básica de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombrePlataforma">Nombre de la plataforma</Label>
                <Input 
                  id="nombrePlataforma" 
                  name="nombrePlataforma" 
                  value={generalForm.nombrePlataforma} 
                  onChange={handleGeneralChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="urlPlataforma">URL de la plataforma</Label>
                <Input 
                  id="urlPlataforma" 
                  name="urlPlataforma" 
                  value={generalForm.urlPlataforma} 
                  onChange={handleGeneralChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailContacto">Email de contacto</Label>
                <Input 
                  id="emailContacto" 
                  name="emailContacto" 
                  type="email" 
                  value={generalForm.emailContacto} 
                  onChange={handleGeneralChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefonoContacto">Teléfono de contacto</Label>
                <Input 
                  id="telefonoContacto" 
                  name="telefonoContacto" 
                  value={generalForm.telefonoContacto} 
                  onChange={handleGeneralChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">URL del logotipo</Label>
                <Input 
                  id="logoUrl" 
                  name="logoUrl" 
                  value={generalForm.logoUrl} 
                  onChange={handleGeneralChange} 
                />
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Configuración de email */}
        <TabsContent value="email" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración de email</CardTitle>
              <CardDescription>
                Configura el servidor SMTP para el envío de correos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtpServer">Servidor SMTP</Label>
                <Input 
                  id="smtpServer" 
                  name="smtpServer" 
                  value={emailSettings.smtpServer} 
                  onChange={handleEmailChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">Puerto SMTP</Label>
                <Input 
                  id="smtpPort" 
                  name="smtpPort" 
                  value={emailSettings.smtpPort} 
                  onChange={handleEmailChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpUser">Usuario SMTP</Label>
                <Input 
                  id="smtpUser" 
                  name="smtpUser" 
                  value={emailSettings.smtpUser} 
                  onChange={handleEmailChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPassword">Contraseña SMTP</Label>
                <Input 
                  id="smtpPassword" 
                  name="smtpPassword" 
                  type="password" 
                  value={emailSettings.smtpPassword} 
                  onChange={handleEmailChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailDesde">Email de remitente</Label>
                <Input 
                  id="emailDesde" 
                  name="emailDesde" 
                  type="email" 
                  value={emailSettings.emailDesde} 
                  onChange={handleEmailChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombreDesde">Nombre de remitente</Label>
                <Input 
                  id="nombreDesde" 
                  name="nombreDesde" 
                  value={emailSettings.nombreDesde} 
                  onChange={handleEmailChange} 
                />
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Configuración de notificaciones */}
        <TabsContent value="notificaciones" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración de notificaciones</CardTitle>
              <CardDescription>
                Configura las notificaciones del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enviarEmailNuevoUsuario" className="font-medium">
                    Notificar nuevos usuarios
                  </Label>
                  <p className="text-sm text-neutral-500">
                    Enviar email cuando se registre un nuevo usuario
                  </p>
                </div>
                <Switch 
                  id="enviarEmailNuevoUsuario" 
                  checked={notificacionesSettings.enviarEmailNuevoUsuario} 
                  onCheckedChange={(value) => handleNotificacionesChange("enviarEmailNuevoUsuario", value)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enviarEmailFactura" className="font-medium">
                    Notificar facturas
                  </Label>
                  <p className="text-sm text-neutral-500">
                    Enviar email cuando se genere una factura
                  </p>
                </div>
                <Switch 
                  id="enviarEmailFactura" 
                  checked={notificacionesSettings.enviarEmailFactura} 
                  onCheckedChange={(value) => handleNotificacionesChange("enviarEmailFactura", value)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enviarEmailControlVencido" className="font-medium">
                    Notificar controles vencidos
                  </Label>
                  <p className="text-sm text-neutral-500">
                    Enviar email cuando un control APPCC esté vencido
                  </p>
                </div>
                <Switch 
                  id="enviarEmailControlVencido" 
                  checked={notificacionesSettings.enviarEmailControlVencido} 
                  onCheckedChange={(value) => handleNotificacionesChange("enviarEmailControlVencido", value)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="permitirNotificacionesPush" className="font-medium">
                    Notificaciones push
                  </Label>
                  <p className="text-sm text-neutral-500">
                    Permitir notificaciones push en navegadores
                  </p>
                </div>
                <Switch 
                  id="permitirNotificacionesPush" 
                  checked={notificacionesSettings.permitirNotificacionesPush} 
                  onCheckedChange={(value) => handleNotificacionesChange("permitirNotificacionesPush", value)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="permitirSMS" className="font-medium">
                    Notificaciones SMS
                  </Label>
                  <p className="text-sm text-neutral-500">
                    Permitir notificaciones por SMS
                  </p>
                </div>
                <Switch 
                  id="permitirSMS" 
                  checked={notificacionesSettings.permitirSMS} 
                  onCheckedChange={(value) => handleNotificacionesChange("permitirSMS", value)} 
                />
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Configuración de seguridad */}
        <TabsContent value="seguridad" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración de seguridad</CardTitle>
              <CardDescription>
                Configura los parámetros de seguridad de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tiempoSesion">Tiempo de sesión (minutos)</Label>
                <Input 
                  id="tiempoSesion" 
                  name="tiempoSesion" 
                  type="number" 
                  value={seguridadSettings.tiempoSesion} 
                  onChange={handleSeguridadChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="intentosLogin">Intentos de login fallidos permitidos</Label>
                <Input 
                  id="intentosLogin" 
                  name="intentosLogin" 
                  type="number" 
                  value={seguridadSettings.intentosLogin} 
                  onChange={handleSeguridadChange} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="permitir2FA" className="font-medium">
                    Autenticación de dos factores (2FA)
                  </Label>
                  <p className="text-sm text-neutral-500">
                    Permitir a los usuarios activar 2FA
                  </p>
                </div>
                <Switch 
                  id="permitir2FA" 
                  checked={seguridadSettings.permitir2FA} 
                  onCheckedChange={(value) => handleSeguridadSwitchChange("permitir2FA", value)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requerir2FAAdmin" className="font-medium">
                    Requerir 2FA para administradores
                  </Label>
                  <p className="text-sm text-neutral-500">
                    Hacer obligatorio 2FA para cuentas con permisos de administrador
                  </p>
                </div>
                <Switch 
                  id="requerir2FAAdmin" 
                  checked={seguridadSettings.requerir2FAAdmin} 
                  onCheckedChange={(value) => handleSeguridadSwitchChange("requerir2FAAdmin", value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="politicaPassword">Política de contraseñas</Label>
                <select 
                  id="politicaPassword" 
                  name="politicaPassword" 
                  className="w-full h-10 px-3 border border-input bg-background rounded-md"
                  value={seguridadSettings.politicaPassword} 
                  onChange={handleSeguridadChange}
                >
                  <option value="weak">Básica (mínimo 6 caracteres)</option>
                  <option value="medium">Media (8+ caracteres, alfanumérica)</option>
                  <option value="strong">Fuerte (8+ caracteres, mayúsculas, números y símbolos)</option>
                </select>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Configuración de facturación */}
        <TabsContent value="facturacion" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración de facturación</CardTitle>
              <CardDescription>
                Configura los parámetros para la generación de facturas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-6 text-neutral-500">
                Próximamente: configuración de parámetros de facturación e integración con pasarelas de pago.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}