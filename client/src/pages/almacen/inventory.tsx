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
  Package, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  Edit, 
  Trash2, 
  AlertTriangle 
} from "lucide-react";

// Dummy inventory data for UI display
const inventoryItems = [
  { 
    id: 1, 
    name: "Harina de Trigo", 
    category: "Harinas", 
    stock: 85, 
    unit: "kg", 
    minStock: 20, 
    location: "Almacén Central", 
    status: "ok" 
  },
  { 
    id: 2, 
    name: "Aceite de Oliva", 
    category: "Aceites", 
    stock: 2, 
    unit: "L", 
    minStock: 5, 
    location: "Almacén Central", 
    status: "critical" 
  },
  { 
    id: 3, 
    name: "Azúcar", 
    category: "Endulzantes", 
    stock: 5, 
    unit: "kg", 
    minStock: 10, 
    location: "Almacén Seco", 
    status: "warning" 
  },
  { 
    id: 4, 
    name: "Leche Entera", 
    category: "Lácteos", 
    stock: 45, 
    unit: "L", 
    minStock: 10, 
    location: "Cámara Refrigeración", 
    status: "expiring" 
  },
  { 
    id: 5, 
    name: "Queso Manchego", 
    category: "Lácteos", 
    stock: 12, 
    unit: "kg", 
    minStock: 3, 
    location: "Cámara Refrigeración", 
    status: "ok" 
  },
  { 
    id: 6, 
    name: "Tomates", 
    category: "Verduras", 
    stock: 18, 
    unit: "kg", 
    minStock: 5, 
    location: "Cámara Refrigeración", 
    status: "ok" 
  },
  { 
    id: 7, 
    name: "Carne Picada", 
    category: "Carnes", 
    stock: 8, 
    unit: "kg", 
    minStock: 2, 
    location: "Cámara Congelación", 
    status: "ok" 
  },
];

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter inventory items based on search query
  const filteredItems = inventoryItems.filter(
    item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get status badge color and text
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "critical":
        return <Badge variant="destructive">Stock Crítico</Badge>;
      case "warning":
        return <Badge variant="outline" className="bg-warning bg-opacity-10 text-warning border-warning">Stock Bajo</Badge>;
      case "expiring":
        return <Badge variant="outline" className="bg-warning bg-opacity-10 text-warning border-warning">Caducidad Próxima</Badge>;
      default:
        return <Badge variant="outline" className="bg-success bg-opacity-10 text-success border-success">OK</Badge>;
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Inventario</h2>
            <p className="text-neutral-500">Gestiona el stock de productos</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Producto
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
                  placeholder="Buscar productos..."
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
        
        {/* Inventory Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Listado de Productos</CardTitle>
            <CardDescription>Total: {filteredItems.length} productos</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className={item.stock < item.minStock ? "text-error" : ""}>
                          {item.stock} {item.unit}
                        </span>
                        {item.status === "critical" && (
                          <AlertTriangle className="h-4 w-4 text-error ml-2" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
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