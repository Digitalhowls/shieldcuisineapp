import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data
  const products = [
    { id: 1, name: "Pollo entero", category: "Carne", stock: 35, unit: "kg", minStock: 20, price: 3.25, expiryDate: "2025-04-15" },
    { id: 2, name: "Patatas", category: "Verduras", stock: 48, unit: "kg", minStock: 30, price: 0.85, expiryDate: "2025-04-05" },
    { id: 3, name: "Aceite de oliva", category: "Aceites", stock: 25, unit: "L", minStock: 10, price: 4.50, expiryDate: "2025-06-10" },
    { id: 4, name: "Queso manchego", category: "Lácteos", stock: 12, unit: "kg", minStock: 15, price: 8.90, expiryDate: "2025-04-18" },
    { id: 5, name: "Tomate", category: "Verduras", stock: 26, unit: "kg", minStock: 20, price: 1.20, expiryDate: "2025-04-02" },
    { id: 6, name: "Vino tinto", category: "Bebidas", stock: 42, unit: "bot.", minStock: 20, price: 6.75, expiryDate: "2025-12-15" },
  ];
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: "Sin stock", variant: "destructive" };
    if (stock < minStock) return { label: "Bajo mínimo", variant: "warning" };
    return { label: "Correcto", variant: "outline" };
  };
  
  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Search and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-800 mb-4 sm:mb-0">Inventario</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
            <Button>
              <i className="fas fa-plus mr-2"></i>
              Añadir Producto
            </Button>
          </div>
        </div>
        
        {/* Inventory Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Precio Unit.</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Caducidad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(product => {
                  const status = getStockStatus(product.stock, product.minStock);
                  const expiryDate = new Date(product.expiryDate);
                  const formattedDate = expiryDate.toLocaleDateString('es-ES');
                  
                  // Check if expiry date is less than 7 days away
                  const today = new Date();
                  const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const isExpiryClose = daysToExpiry <= 7 && daysToExpiry > 0;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right">{product.stock} {product.unit}</TableCell>
                      <TableCell className="text-right">{product.price.toFixed(2)} €</TableCell>
                      <TableCell>
                        <Badge variant={status.variant as any}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {isExpiryClose ? (
                          <span className="text-warning flex items-center">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            {formattedDate}
                          </span>
                        ) : formattedDate}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <i className="fas fa-history"></i>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-neutral-500">
                      No se encontraron productos que coincidan con la búsqueda.
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