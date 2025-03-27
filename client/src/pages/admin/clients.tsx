import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Building2,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  Filter,
} from "lucide-react";

// Tipo para los datos de clientes
interface Client {
  id: number;
  name: string;
  type: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  contactPerson: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
  employeeCount: number;
  modules: string[];
}

// Datos de ejemplo para clientes
const mockClients: Client[] = [
  {
    id: 1,
    name: "Restaurante La Marina",
    type: "restaurant",
    email: "info@lamarina.com",
    phone: "912345678",
    address: "Calle del Mar 123",
    city: "Barcelona",
    contactPerson: "María López",
    status: "active",
    createdAt: "2025-01-10",
    employeeCount: 12,
    modules: ["appcc", "cms", "inventory", "banking"],
  },
  {
    id: 2,
    name: "Panadería El Horno",
    type: "bakery",
    email: "contacto@elhorno.es",
    phone: "934567890",
    address: "Av. de los Panes 45",
    city: "Madrid",
    contactPerson: "José Martínez",
    status: "active",
    createdAt: "2025-01-15",
    employeeCount: 8,
    modules: ["appcc", "inventory"],
  },
  {
    id: 3,
    name: "Supermercado Fresco",
    type: "supermarket",
    email: "admin@fresco.com",
    phone: "915678901",
    address: "Plaza Mayor 7",
    city: "Valencia",
    contactPerson: "Ana García",
    status: "active",
    createdAt: "2025-01-20",
    employeeCount: 25,
    modules: ["appcc", "cms", "inventory", "transparency", "banking", "elearning"],
  },
  {
    id: 4,
    name: "Cafetería Sol",
    type: "cafe",
    email: "info@cafesol.es",
    phone: "936789012",
    address: "Calle del Sol 22",
    city: "Sevilla",
    contactPerson: "Carlos Ruiz",
    status: "pending",
    createdAt: "2025-02-05",
    employeeCount: 6,
    modules: ["appcc", "inventory"],
  },
  {
    id: 5,
    name: "Hotel Costa Azul",
    type: "hotel",
    email: "reservas@costaazul.com",
    phone: "950123456",
    address: "Paseo Marítimo 56",
    city: "Málaga",
    contactPerson: "Lucía Fernández",
    status: "inactive",
    createdAt: "2025-02-10",
    employeeCount: 45,
    modules: ["appcc", "cms", "inventory", "elearning"],
  },
  {
    id: 6,
    name: "Comidas Rápidas Express",
    type: "fastfood",
    email: "pedidos@express.com",
    phone: "912876543",
    address: "Ronda Norte 78",
    city: "Zaragoza",
    contactPerson: "Pedro Sánchez",
    status: "active",
    createdAt: "2025-02-15",
    employeeCount: 15,
    modules: ["appcc", "inventory", "transparency"],
  },
  {
    id: 7,
    name: "Cervecería El Barril",
    type: "brewery",
    email: "info@elbarril.es",
    phone: "934321098",
    address: "Calle Cerveza 12",
    city: "Bilbao",
    contactPerson: "Miguel Torres",
    status: "active",
    createdAt: "2025-02-20",
    employeeCount: 10,
    modules: ["appcc", "cms"],
  },
];

// Componente para el modal de creación/edición de cliente
function ClientFormDialog({
  client,
  onSave,
  isOpen,
  setIsOpen,
}: {
  client?: Client;
  onSave: (client: any) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const [formData, setFormData] = useState<Partial<Client>>(
    client || {
      name: "",
      type: "restaurant",
      email: "",
      phone: "",
      address: "",
      city: "",
      contactPerson: "",
      status: "pending",
      modules: [],
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleModuleToggle = (module: string) => {
    const modules = formData.modules || [];
    if (modules.includes(module)) {
      setFormData({
        ...formData,
        modules: modules.filter((m) => m !== module),
      });
    } else {
      setFormData({
        ...formData,
        modules: [...modules, module],
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{client ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
          <DialogDescription>
            {client
              ? "Actualice los datos del cliente"
              : "Rellene el formulario para crear un nuevo cliente"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la empresa</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de negocio</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurante</SelectItem>
                  <SelectItem value="bakery">Panadería</SelectItem>
                  <SelectItem value="supermarket">Supermercado</SelectItem>
                  <SelectItem value="cafe">Cafetería</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="fastfood">Comida rápida</SelectItem>
                  <SelectItem value="brewery">Cervecería</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Persona de contacto</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  handleSelectChange("status", value as "active" | "inactive" | "pending")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Módulos activados</Label>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="button"
                  variant={formData.modules?.includes("appcc") ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleModuleToggle("appcc")}
                >
                  APPCC
                </Button>
                <Button
                  type="button"
                  variant={formData.modules?.includes("inventory") ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleModuleToggle("inventory")}
                >
                  Inventario
                </Button>
                <Button
                  type="button"
                  variant={formData.modules?.includes("cms") ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleModuleToggle("cms")}
                >
                  CMS
                </Button>
                <Button
                  type="button"
                  variant={formData.modules?.includes("transparency") ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleModuleToggle("transparency")}
                >
                  Transparencia
                </Button>
                <Button
                  type="button"
                  variant={formData.modules?.includes("banking") ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleModuleToggle("banking")}
                >
                  Banca
                </Button>
                <Button
                  type="button"
                  variant={formData.modules?.includes("elearning") ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleModuleToggle("elearning")}
                >
                  E-Learning
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ClientsPage() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | undefined>();
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Filtrado de clientes
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    const matchesType = typeFilter === "all" || client.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Función para añadir/editar cliente
  const handleSaveClient = (clientData: Partial<Client>) => {
    if (currentClient) {
      // Edición
      const updatedClients = clients.map((client) =>
        client.id === currentClient.id
          ? { ...client, ...clientData, updatedAt: new Date().toISOString() }
          : client
      );
      setClients(updatedClients);
      toast({
        title: "Cliente actualizado",
        description: `Se ha actualizado ${clientData.name} correctamente`,
      });
    } else {
      // Creación
      const newClient = {
        ...clientData,
        id: clients.length + 1,
        createdAt: new Date().toISOString(),
        employeeCount: 0,
      } as Client;
      setClients([...clients, newClient]);
      toast({
        title: "Cliente creado",
        description: `Se ha creado ${clientData.name} correctamente`,
      });
    }
    setCurrentClient(undefined);
  };

  // Función para eliminar cliente
  const handleDeleteClient = () => {
    if (clientToDelete) {
      setClients(clients.filter((client) => client.id !== clientToDelete.id));
      toast({
        title: "Cliente eliminado",
        description: `Se ha eliminado ${clientToDelete.name} correctamente`,
        variant: "destructive",
      });
      setClientToDelete(null);
    }
  };

  // Función para editar cliente
  const handleEditClient = (client: Client) => {
    setCurrentClient(client);
    setIsFormOpen(true);
  };

  // Función para abrir modal de creación
  const handleNewClient = () => {
    setCurrentClient(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h1>
          <p className="text-muted-foreground">
            Administre las empresas y organizaciones registradas en la plataforma.
          </p>
        </div>
        <Button onClick={handleNewClient}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre, email o contacto..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>Estado</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>Tipo</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="restaurant">Restaurantes</SelectItem>
                  <SelectItem value="bakery">Panaderías</SelectItem>
                  <SelectItem value="supermarket">Supermercados</SelectItem>
                  <SelectItem value="cafe">Cafeterías</SelectItem>
                  <SelectItem value="hotel">Hoteles</SelectItem>
                  <SelectItem value="fastfood">Comida rápida</SelectItem>
                  <SelectItem value="brewery">Cervecerías</SelectItem>
                  <SelectItem value="other">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Clientes</CardTitle>
          <CardDescription>
            Mostrando {filteredClients.length} de {clients.length} clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Módulos</TableHead>
                <TableHead>Empleados</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div>{client.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {client.type === "restaurant"
                            ? "Restaurante"
                            : client.type === "bakery"
                            ? "Panadería"
                            : client.type === "supermarket"
                            ? "Supermercado"
                            : client.type === "cafe"
                            ? "Cafetería"
                            : client.type === "hotel"
                            ? "Hotel"
                            : client.type === "fastfood"
                            ? "Comida Rápida"
                            : client.type === "brewery"
                            ? "Cervecería"
                            : "Otro"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="text-sm">{client.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="text-sm">{client.phone}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{client.contactPerson}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span className="text-sm">
                        {client.city} - {client.address}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.status === "active" ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Activo
                      </Badge>
                    ) : client.status === "inactive" ? (
                      <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactivo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                        ⏱️ Pendiente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {client.modules.map((module) => (
                        <Badge key={module} variant="secondary" className="text-xs">
                          {module === "appcc"
                            ? "APPCC"
                            : module === "inventory"
                            ? "Inventario"
                            : module === "cms"
                            ? "CMS"
                            : module === "transparency"
                            ? "Transparencia"
                            : module === "banking"
                            ? "Banca"
                            : "E-Learning"}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{client.employeeCount}</Badge>
                  </TableCell>
                  <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditClient(client)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setClientToDelete(client)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              ¿Está seguro de eliminar este cliente?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente a {clientToDelete?.name} y
                              todos sus datos asociados. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setClientToDelete(null)}>
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteClient}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredClients.length} de {clients.length} resultados
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button size="sm" variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Modal para crear/editar cliente */}
      <ClientFormDialog
        client={currentClient}
        onSave={handleSaveClient}
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
      />
    </div>
  );
}