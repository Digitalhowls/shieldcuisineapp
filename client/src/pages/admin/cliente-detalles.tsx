import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronLeft,
  Building2,
  Users,
  Package,
  CreditCard,
  Settings,
  Map,
  FileText,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { businessTypeEnum } from "@shared/schema";

interface ClienteDetalle {
  id: number;
  nombre: string;
  tipo: typeof businessTypeEnum.enumValues[number];
  activo: boolean;
  fechaAlta: string;
  fechaUltimoAcceso?: string;
  suscripcion: string;
  renovacion?: string;
  modulosActivos: {
    id: string;
    nombre: string;
    activo: boolean;
    fechaActivacion: string;
  }[];
  informacionContacto: {
    nombreContacto: string;
    email: string;
    telefono: string;
    direccion: string;
    codigoPostal: string;
    ciudad: string;
    pais: string;
  };
  ubicaciones: {
    id: number;
    nombre: string;
    direccion: string;
    tipo: string;
  }[];
  usuarios: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    ultimoAcceso?: string;
  }[];
  facturas: {
    id: string;
    fecha: string;
    importe: number;
    pagada: boolean;
    concepto: string;
  }[];
}

export default function Detalles() {
  const params = useParams<{ clienteId: string }>();
  const clienteId = params?.clienteId;
  
  const { data: cliente, isLoading, isError } = useQuery<ClienteDetalle>({
    queryKey: [`/api/admin/clientes/${clienteId}`],
    queryFn: async () => {
      // Simular obtención de datos
      return {
        id: 1,
        nombre: "Restaurante La Plaza",
        tipo: "restaurant",
        activo: true,
        fechaAlta: "2024-12-15",
        fechaUltimoAcceso: "2025-03-24T10:45:00Z",
        suscripcion: "professional",
        renovacion: "2025-12-15",
        modulosActivos: [
          {
            id: "appcc",
            nombre: "APPCC",
            activo: true,
            fechaActivacion: "2024-12-15"
          },
          {
            id: "almacen",
            nombre: "Almacén",
            activo: true,
            fechaActivacion: "2024-12-15"
          },
          {
            id: "transparencia",
            nombre: "Transparencia",
            activo: true,
            fechaActivacion: "2025-01-10"
          },
          {
            id: "elearning",
            nombre: "E-learning",
            activo: false,
            fechaActivacion: ""
          }
        ],
        informacionContacto: {
          nombreContacto: "Ana López Martínez",
          email: "contacto@restaurantelaplaza.es",
          telefono: "+34 912 345 678",
          direccion: "Calle Gran Vía, 50",
          codigoPostal: "28013",
          ciudad: "Madrid",
          pais: "España"
        },
        ubicaciones: [
          {
            id: 1,
            nombre: "Sede Central",
            direccion: "Calle Gran Vía, 50, 28013, Madrid",
            tipo: "restaurant"
          }
        ],
        usuarios: [
          {
            id: 1,
            nombre: "Ana López",
            email: "ana@restaurantelaplaza.es",
            rol: "admin",
            ultimoAcceso: "2025-03-24T10:45:00Z"
          },
          {
            id: 2,
            nombre: "Carlos Sánchez",
            email: "carlos@restaurantelaplaza.es",
            rol: "location_manager",
            ultimoAcceso: "2025-03-23T16:20:00Z"
          },
          {
            id: 3,
            nombre: "María García",
            email: "maria@restaurantelaplaza.es",
            rol: "employee",
            ultimoAcceso: "2025-03-24T09:15:00Z"
          }
        ],
        facturas: [
          {
            id: "FAC-2025-001",
            fecha: "2025-01-15",
            importe: 199.99,
            pagada: true,
            concepto: "Suscripción mensual - Plan Profesional"
          },
          {
            id: "FAC-2025-002",
            fecha: "2025-02-15",
            importe: 199.99,
            pagada: true,
            concepto: "Suscripción mensual - Plan Profesional"
          },
          {
            id: "FAC-2025-003",
            fecha: "2025-03-15",
            importe: 199.99,
            pagada: true,
            concepto: "Suscripción mensual - Plan Profesional"
          }
        ]
      };
    },
    enabled: !!clienteId
  });
  
  // Formatear fecha
  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Formatear fecha y hora
  const formatFechaHora = (fechaStr: string) => {
    if (!fechaStr) return "-";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Formatear moneda
  const formatMoneda = (importe: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(importe);
  };
  
  // Traducir tipo de negocio
  const getTipoNegocio = (tipo: typeof businessTypeEnum.enumValues[number]) => {
    switch (tipo) {
      case "restaurant": return "Restaurante";
      case "store": return "Tienda";
      case "production": return "Producción";
      case "catering": return "Catering";
      case "wholesale": return "Mayorista";
      default: return tipo;
    }
  };
  
  // Traducir suscripción
  const getSuscripcionNombre = (suscripcion: string) => {
    switch (suscripcion) {
      case "basic": return "Básica";
      case "professional": return "Profesional";
      case "enterprise": return "Empresarial";
      default: return suscripcion;
    }
  };
  
  // Traducir rol de usuario
  const getRolUsuario = (rol: string) => {
    switch (rol) {
      case "admin": return "Administrador";
      case "company_admin": return "Admin. empresa";
      case "location_manager": return "Gestor ubicación";
      case "area_supervisor": return "Supervisor área";
      case "employee": return "Empleado";
      case "external": return "Externo";
      default: return rol;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !cliente) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription>
          No se ha podido cargar la información del cliente. Por favor, inténtelo de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera y navegación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button 
            variant="outline" 
            size="sm"
            asChild
            className="mb-2"
          >
            <Link href="/admin/clientes">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Volver a clientes
            </Link>
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {cliente.nombre}
            <Badge 
              variant="outline" 
              className={cliente.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
            >
              {cliente.activo ? "Activo" : "Inactivo"}
            </Badge>
          </h1>
          <p className="text-neutral-500">
            {getTipoNegocio(cliente.tipo)} • Alta: {formatFecha(cliente.fechaAlta)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Editar
          </Button>
          {cliente.activo ? (
            <Button variant="destructive">
              <XCircle className="mr-2 h-4 w-4" />
              Desactivar
            </Button>
          ) : (
            <Button variant="success">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Activar
            </Button>
          )}
        </div>
      </div>
      
      {/* Pestañas de información */}
      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="general">
            <Building2 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="modulos">
            <Package className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Módulos</span>
          </TabsTrigger>
          <TabsTrigger value="usuarios">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Usuarios</span>
          </TabsTrigger>
          <TabsTrigger value="ubicaciones">
            <Map className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Ubicaciones</span>
          </TabsTrigger>
          <TabsTrigger value="facturacion">
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Facturación</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Información general */}
        <TabsContent value="general" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información de la empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3">
                  <span className="text-neutral-500">Nombre</span>
                  <span className="col-span-2 font-medium">{cliente.nombre}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-neutral-500">Tipo</span>
                  <span className="col-span-2">{getTipoNegocio(cliente.tipo)}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-neutral-500">Estado</span>
                  <Badge 
                    variant="outline" 
                    className={cliente.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                  >
                    {cliente.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-neutral-500">Alta</span>
                  <span className="col-span-2">{formatFecha(cliente.fechaAlta)}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-neutral-500">Último acceso</span>
                  <span className="col-span-2">{cliente.fechaUltimoAcceso ? formatFechaHora(cliente.fechaUltimoAcceso) : "-"}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3">
                  <span className="text-neutral-500">Contacto</span>
                  <span className="col-span-2 font-medium">{cliente.informacionContacto.nombreContacto}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-neutral-500">Email</span>
                  <span className="col-span-2">{cliente.informacionContacto.email}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-neutral-500">Teléfono</span>
                  <span className="col-span-2">{cliente.informacionContacto.telefono}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-neutral-500">Dirección</span>
                  <span className="col-span-2">
                    {cliente.informacionContacto.direccion}<br />
                    {cliente.informacionContacto.codigoPostal}, {cliente.informacionContacto.ciudad}<br />
                    {cliente.informacionContacto.pais}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suscripción</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3">
                  <span className="text-neutral-500">Plan</span>
                  <span className="col-span-2 font-medium">{getSuscripcionNombre(cliente.suscripcion)}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-neutral-500">Renovación</span>
                  <span className="col-span-2">{cliente.renovacion ? formatFecha(cliente.renovacion) : "-"}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-neutral-500">Módulos</span>
                  <span className="col-span-2">{cliente.modulosActivos.filter(m => m.activo).length}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-neutral-500">Usuarios</span>
                  <span className="col-span-2">{cliente.usuarios.length}</span>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-end">
                <Button variant="outline" size="sm">Cambiar plan</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Módulos */}
        <TabsContent value="modulos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Módulos activados</CardTitle>
              <CardDescription>
                Gestión de módulos disponibles para este cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cliente.modulosActivos.map(modulo => (
                  <div 
                    key={modulo.id} 
                    className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{modulo.nombre}</h4>
                        <Badge 
                          variant="outline" 
                          className={modulo.activo ? "bg-green-100 text-green-700" : "bg-neutral-100"}
                        >
                          {modulo.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      {modulo.activo && modulo.fechaActivacion && (
                        <p className="text-sm text-neutral-500">
                          Activo desde: {formatFecha(modulo.fechaActivacion)}
                        </p>
                      )}
                    </div>
                    <div>
                      {modulo.activo ? (
                        <Button size="sm" variant="outline">Desactivar</Button>
                      ) : (
                        <Button size="sm">Activar</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Usuarios */}
        <TabsContent value="usuarios" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div>
                <CardTitle className="text-lg">Usuarios</CardTitle>
                <CardDescription>
                  Gestión de usuarios de la empresa
                </CardDescription>
              </div>
              <Button className="mt-2 sm:mt-0">Añadir usuario</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cliente.usuarios.map(usuario => (
                  <div 
                    key={usuario.id} 
                    className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4"
                  >
                    <div className="col-span-2">
                      <h4 className="font-medium">{usuario.nombre}</h4>
                      <p className="text-sm text-neutral-500">{usuario.email}</p>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="secondary">{getRolUsuario(usuario.rol)}</Badge>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-2">
                      <span className="text-xs text-neutral-500">
                        {usuario.ultimoAcceso ? `Último acceso: ${formatFechaHora(usuario.ultimoAcceso)}` : ""}
                      </span>
                      <Button size="sm" variant="outline">Editar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Ubicaciones */}
        <TabsContent value="ubicaciones" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div>
                <CardTitle className="text-lg">Ubicaciones</CardTitle>
                <CardDescription>
                  Gestión de ubicaciones de la empresa
                </CardDescription>
              </div>
              <Button className="mt-2 sm:mt-0">Añadir ubicación</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cliente.ubicaciones.map(ubicacion => (
                  <div 
                    key={ubicacion.id} 
                    className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className="col-span-2">
                      <h4 className="font-medium">{ubicacion.nombre}</h4>
                      <p className="text-sm text-neutral-500">{ubicacion.direccion}</p>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-2">
                      <Badge variant="secondary">{getTipoNegocio(ubicacion.tipo as any)}</Badge>
                      <Button size="sm" variant="outline">Editar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Facturación */}
        <TabsContent value="facturacion" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Facturas</CardTitle>
              <CardDescription>
                Historial de facturación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cliente.facturas.map(factura => (
                  <div 
                    key={factura.id} 
                    className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4"
                  >
                    <div>
                      <p className="text-sm font-medium">{factura.id}</p>
                      <p className="text-sm text-neutral-500">{formatFecha(factura.fecha)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p>{factura.concepto}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{formatMoneda(factura.importe)}</p>
                      <Badge 
                        variant="outline" 
                        className={factura.pagada ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}
                      >
                        {factura.pagada ? "Pagada" : "Pendiente"}
                      </Badge>
                      <Button size="sm" variant="outline" className="ml-auto">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}