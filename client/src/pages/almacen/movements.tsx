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
  ArrowUpRight, 
  ArrowDownLeft, 
  MoveHorizontal, 
  Eye 
} from "lucide-react";

// Dummy movements data for UI display
const movementsData = [
  { 
    id: 1, 
    date: "2025-03-25T10:30:00", 
    type: "entrada", 
    product: "Harina de Trigo", 
    quantity: 25, 
    unit: "kg", 
    origin: "Harinas García S.L.", 
    destination: "Almacén Central", 
    user: "Carlos Sánchez",
    document: "ALB-2025-0125" 
  },
  { 
    id: 2, 
    date: "2025-03-25T09:15:00", 
    type: "traslado", 
    product: "Queso Manchego", 
    quantity: 5, 
    unit: "kg", 
    origin: "Almacén Central", 
    destination: "Cocina", 
    user: "María Rodriguez",
    document: "MOV-2025-0087" 
  },
  { 
    id: 3, 
    date: "2025-03-25T08:45:00", 
    type: "salida", 
    product: "Tomates", 
    quantity: 2, 
    unit: "kg", 
    origin: "Almacén Central", 
    destination: "Cocina", 
    user: "Juan Pérez",
    document: "MOV-2025-0086" 
  },
  { 
    id: 4, 
    date: "2025-03-24T16:20:00", 
    type: "entrada", 
    product: "Leche Entera", 
    quantity: 48, 
    unit: "L", 
    origin: "Lácteos del Norte S.A.", 
    destination: "Cámara Refrigeración", 
    user: "Carlos Sánchez",
    document: "ALB-2025-0124" 
  },
  { 
    id: 5, 
    date: "2025-03-24T14:10:00", 
    type: "salida", 
    product: "Carne Picada", 
    quantity: 3, 
    unit: "kg", 
    origin: "Cámara Congelación", 
    destination: "Cocina", 
    user: "María Rodriguez",
    document: "MOV-2025-0085" 
  },
  { 
    id: 6, 
    date: "2025-03-24T11:30:00", 
    type: "traslado", 
    product: "Aceite de Oliva", 
    quantity: 5, 
    unit: "L", 
    origin: "Almacén Principal", 
    destination: "Almacén Secundario", 
    user: "Juan Pérez",
    document: "MOV-2025-0084" 
  },
];

export default function Movements() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter movement items based on search query
  const filteredItems = movementsData.filter(
    item => item.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.document.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.user.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Format date to display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get movement type badge
  const getMovementTypeBadge = (type: string) => {
    switch(type) {
      case "entrada":
        return (
          <Badge variant="outline" className="bg-success bg-opacity-10 text-success border-success flex items-center">
            <ArrowDownLeft className="h-3 w-3 mr-1" />
            Entrada
          </Badge>
        );
      case "salida":
        return (
          <Badge variant="outline" className="bg-error bg-opacity-10 text-error border-error flex items-center">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            Salida
          </Badge>
        );
      case "traslado":
        return (
          <Badge variant="outline" className="bg-info bg-opacity-10 text-info border-info flex items-center">
            <MoveHorizontal className="h-3 w-3 mr-1" />
            Traslado
          </Badge>
        );
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Movimientos</h2>
            <p className="text-neutral-500">Registro de entradas, salidas y traslados</p>
          </div>
          <div className="mt-4 md:mt-0 space-x-2">
            <Button variant="outline">
              Imprimir
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Movimiento
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
                  placeholder="Buscar movimientos..."
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
        
        {/* Movements Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Historial de Movimientos</CardTitle>
            <CardDescription>Total: {filteredItems.length} movimientos</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha/Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDate(item.date)}</TableCell>
                    <TableCell>{getMovementTypeBadge(item.type)}</TableCell>
                    <TableCell className="font-medium">{item.product}</TableCell>
                    <TableCell>{item.quantity} {item.unit}</TableCell>
                    <TableCell>{item.origin}</TableCell>
                    <TableCell>{item.destination}</TableCell>
                    <TableCell>{item.document}</TableCell>
                    <TableCell>{item.user}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
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