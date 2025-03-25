import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Movements() {
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data
  const movements = [
    { id: 1, type: "entrada", date: "2025-03-20", time: "09:30", product: "Pollo entero", quantity: 15, unit: "kg", source: "Proveedor: Carnes del Norte", user: "Ana García" },
    { id: 2, type: "salida", date: "2025-03-21", time: "14:15", product: "Patatas", quantity: 8, unit: "kg", source: "Cocina", user: "Carlos López" },
    { id: 3, type: "ajuste", date: "2025-03-22", time: "16:45", product: "Aceite de oliva", quantity: 2, unit: "L", source: "Inventario: Corrección", user: "María Sánchez" },
    { id: 4, type: "entrada", date: "2025-03-23", time: "10:00", product: "Tomate", quantity: 12, unit: "kg", source: "Proveedor: Huerta Fresca", user: "Ana García" },
    { id: 5, type: "salida", date: "2025-03-24", time: "11:30", product: "Queso manchego", quantity: 2.5, unit: "kg", source: "Cocina", user: "Carlos López" },
    { id: 6, type: "entrada", date: "2025-03-24", time: "15:45", product: "Vino tinto", quantity: 12, unit: "bot.", source: "Proveedor: Bodegas Rioja", user: "Ana García" },
  ];
  
  const filteredMovements = movements.filter(movement => {
    // Filter by type
    if (filterType !== "all" && movement.type !== filterType) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !movement.product.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !movement.source.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  const getTypeData = (type: string) => {
    switch(type) {
      case "entrada":
        return { label: "Entrada", variant: "success", icon: "fas fa-arrow-right" };
      case "salida":
        return { label: "Salida", variant: "warning", icon: "fas fa-arrow-left" };
      case "ajuste":
        return { label: "Ajuste", variant: "outline", icon: "fas fa-exchange-alt" };
      default:
        return { label: type, variant: "outline", icon: "fas fa-question" };
    }
  };
  
  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Filters and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-800 mb-4 sm:mb-0">Movimientos de Inventario</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="entrada">Entradas</SelectItem>
                  <SelectItem value="salida">Salidas</SelectItem>
                  <SelectItem value="ajuste">Ajustes</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
            
            <Button>
              <i className="fas fa-plus mr-2"></i>
              Nuevo Movimiento
            </Button>
          </div>
        </div>
        
        {/* Movements Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead>Origen/Destino</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map(movement => {
                  const typeData = getTypeData(movement.type);
                  const formattedDate = new Date(movement.date + "T" + movement.time).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  
                  return (
                    <TableRow key={movement.id}>
                      <TableCell>{formattedDate}</TableCell>
                      <TableCell>
                        <Badge variant={typeData.variant as any} className="flex items-center w-fit gap-1">
                          <i className={typeData.icon}></i>
                          {typeData.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{movement.product}</TableCell>
                      <TableCell className="text-right">
                        {movement.quantity} {movement.unit}
                      </TableCell>
                      <TableCell>{movement.source}</TableCell>
                      <TableCell>{movement.user}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <i className="fas fa-eye"></i>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <i className="fas fa-print"></i>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredMovements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-neutral-500">
                      No se encontraron movimientos que coincidan con los filtros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}