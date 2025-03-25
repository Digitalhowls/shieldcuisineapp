import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Trash2, 
  Eye, 
  ShoppingCart 
} from "lucide-react";

// Dummy suppliers data for UI display
const suppliersData = [
  { 
    id: 1, 
    name: "Harinas García S.L.", 
    contactName: "Antonio García",
    phone: "912345678",
    email: "pedidos@harinasgarcia.com",
    address: "Polígono Industrial Norte, 23, 28001 Madrid",
    category: "Harinas y Cereales",
    status: "active",
    lastOrder: "2025-03-20"
  },
  { 
    id: 2, 
    name: "Lácteos del Norte S.A.", 
    contactName: "María Fernández",
    phone: "934567890",
    email: "comercial@lacteosnorte.com",
    address: "Calle Industria, 45, 08012 Barcelona",
    category: "Lácteos",
    status: "active",
    lastOrder: "2025-03-24"
  },
  { 
    id: 3, 
    name: "Aceites Andaluces", 
    contactName: "José Rodríguez",
    phone: "954321098",
    email: "ventas@aceitesandaluces.com",
    address: "Carretera de Jaén, km 5, 41001 Sevilla",
    category: "Aceites",
    status: "active",
    lastOrder: "2025-03-15"
  },
  { 
    id: 4, 
    name: "Carnes Selectas S.L.", 
    contactName: "Carlos Martínez",
    phone: "963456789",
    email: "pedidos@carnesselectas.com",
    address: "Avenida del Cid, 78, 46018 Valencia",
    category: "Carnes",
    status: "inactive",
    lastOrder: "2025-02-28"
  },
  { 
    id: 5, 
    name: "Frutas y Verduras Martínez", 
    contactName: "Laura Sánchez",
    phone: "911234567",
    email: "laura@frutasmartinez.com",
    address: "Mercamadrid, Puesto 56, 28053 Madrid",
    category: "Frutas y Verduras",
    status: "active",
    lastOrder: "2025-03-22"
  },
];

export default function Suppliers() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter suppliers based on search query
  const filteredItems = suppliersData.filter(
    item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Format date to display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Get supplier status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "active":
        return <Badge variant="outline" className="bg-success bg-opacity-10 text-success border-success">Activo</Badge>;
      case "inactive":
        return <Badge variant="outline" className="bg-neutral-200 text-neutral-500 border-neutral-300">Inactivo</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Proveedores</h2>
            <p className="text-neutral-500">Gestión de proveedores y contactos comerciales</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proveedor
            </Button>
          </div>
        </div>
        
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Buscar proveedores..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="flex">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline">
                Exportar
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Suppliers Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Listado de Proveedores</CardTitle>
            <CardDescription>Total: {filteredItems.length} proveedores</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Último Pedido</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-neutral-500 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {item.address.substring(0, 30)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <div>
                        <div>{item.contactName}</div>
                        <div className="text-sm text-neutral-500 flex items-center mt-1">
                          <Phone className="h-3 w-3 mr-1" />
                          {item.phone}
                        </div>
                        <div className="text-sm text-neutral-500 flex items-center mt-1">
                          <Mail className="h-3 w-3 mr-1" />
                          {item.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(item.lastOrder)}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}