import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Building2, 
  Plus, 
  Store, 
  ChevronRight, 
  CheckCircle2, 
  XCircle,
  Filter
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { businessTypeEnum } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Cliente {
  id: number;
  nombre: string;
  tipo: typeof businessTypeEnum.enumValues[number];
  activo: boolean;
  fechaAlta: string;
  suscripcion: "basic" | "professional" | "enterprise";
  modulosActivos: string[];
  usuariosRegistrados: number;
  ubicaciones: number;
}

export default function Clientes() {
  // Estado para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Obtener lista de clientes
  const { data: clientes, isLoading, isError } = useQuery<Cliente[]>({
    queryKey: ["/api/admin/clientes"],
    queryFn: async () => {
      // Simular obtención de datos
      return [
        {
          id: 1,
          nombre: "Restaurante La Plaza",
          tipo: "restaurant",
          activo: true,
          fechaAlta: "2024-12-15",
          suscripcion: "professional",
          modulosActivos: ["APPCC", "Almacén", "Transparencia"],
          usuariosRegistrados: 8,
          ubicaciones: 1
        },
        {
          id: 2,
          nombre: "Supermercados Rivera",
          tipo: "store",
          activo: true,
          fechaAlta: "2025-01-10",
          suscripcion: "enterprise",
          modulosActivos: ["APPCC", "Almacén", "Transparencia", "E-learning"],
          usuariosRegistrados: 24,
          ubicaciones: 5
        },
        {
          id: 3,
          nombre: "Catering Eventos Deluxe",
          tipo: "catering",
          activo: true,
          fechaAlta: "2025-02-20",
          suscripcion: "professional",
          modulosActivos: ["APPCC", "Transparencia"],
          usuariosRegistrados: 6,
          ubicaciones: 1
        },
        {
          id: 4,
          nombre: "Alimentos Congelados S.L.",
          tipo: "production",
          activo: false,
          fechaAlta: "2024-11-05",
          suscripcion: "basic",
          modulosActivos: ["APPCC"],
          usuariosRegistrados: 3,
          ubicaciones: 1
        },
        {
          id: 5,
          nombre: "Distribuidora Alimentaria Norte",
          tipo: "wholesale",
          activo: true,
          fechaAlta: "2025-03-01",
          suscripcion: "enterprise",
          modulosActivos: ["APPCC", "Almacén", "Transparencia", "E-learning"],
          usuariosRegistrados: 18,
          ubicaciones: 3
        }
      ];
    }
  });
  
  // Aplicar filtros
  const clientesFiltrados = clientes?.filter(cliente => {
    const matchSearch = cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = tipoFilter === "all" || cliente.tipo === tipoFilter;
    const matchStatus = statusFilter === "all" || 
      (statusFilter === "active" && cliente.activo) || 
      (statusFilter === "inactive" && !cliente.activo);
    
    return matchSearch && matchTipo && matchStatus;
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
  
  // Obtener color de suscripción
  const getSuscripcionColor = (suscripcion: string) => {
    switch (suscripcion) {
      case "basic": return "bg-neutral-100 text-neutral-700";
      case "professional": return "bg-blue-100 text-blue-700";
      case "enterprise": return "bg-purple-100 text-purple-700";
      default: return "bg-neutral-100 text-neutral-700";
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !clientes) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription>
          No se ha podido cargar la información de clientes. Por favor, inténtelo de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Gestión de Empresas</h1>
          <p className="text-neutral-500">
            Administre las empresas clientes y sus suscripciones
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nueva Empresa
        </Button>
      </div>
      
      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empresa..."
                className="pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Tipo de negocio" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="restaurant">Restaurante</SelectItem>
                  <SelectItem value="store">Tienda</SelectItem>
                  <SelectItem value="production">Producción</SelectItem>
                  <SelectItem value="catering">Catering</SelectItem>
                  <SelectItem value="wholesale">Mayorista</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Estado" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Lista de empresas */}
      {clientesFiltrados?.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No se encontraron empresas</h3>
          <p className="text-muted-foreground">
            No hay empresas que coincidan con los criterios de búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {clientesFiltrados?.map(cliente => (
            <Card key={cliente.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 border-b">
                <CardHeader className="md:col-span-2 pb-3">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cliente.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                    >
                      {cliente.activo ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Activo</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> Inactivo</>
                      )}
                    </Badge>
                    <Badge variant="outline" className={getSuscripcionColor(cliente.suscripcion)}>
                      {getSuscripcionNombre(cliente.suscripcion)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">
                    {cliente.nombre}
                  </CardTitle>
                  <CardDescription className="flex items-center">
                    <Store className="h-3.5 w-3.5 mr-1" />
                    {getTipoNegocio(cliente.tipo)}
                    <span className="mx-2">•</span>
                    Alta: {formatFecha(cliente.fechaAlta)}
                  </CardDescription>
                </CardHeader>
                
                <div className="p-4 md:flex md:flex-col md:justify-center border-t md:border-t-0 md:border-l">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-neutral-500">Módulos</p>
                      <p className="font-medium">{cliente.modulosActivos.length}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-500">Usuarios</p>
                      <p className="font-medium">{cliente.usuariosRegistrados}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 md:flex md:flex-col md:justify-center border-t md:border-t-0 md:border-l bg-neutral-50">
                  <div className="flex justify-center">
                    <Button variant="outline" asChild>
                      <Link href={`/admin/clientes/${cliente.id}`}>
                        Ver detalles <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4 pt-3">
                <div className="flex flex-wrap gap-2">
                  {cliente.modulosActivos.map((modulo, index) => (
                    <Badge key={index} variant="secondary">{modulo}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}