import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Suppliers() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data
  const suppliers = [
    { id: 1, name: "Carnes del Norte, S.L.", type: "Carne", contact: "José Martínez", phone: "612345678", email: "info@carnesdelnorte.es", active: true },
    { id: 2, name: "Huerta Fresca", type: "Verduras", contact: "María Gómez", phone: "623456789", email: "pedidos@huertafresca.com", active: true },
    { id: 3, name: "Distribuciones Lácteas", type: "Lácteos", contact: "Pedro Sánchez", phone: "634567890", email: "ventas@distlacteas.es", active: true },
    { id: 4, name: "Bodegas Rioja", type: "Bebidas", contact: "Laura Ruiz", phone: "645678901", email: "comercial@bodegasrioja.es", active: true },
    { id: 5, name: "Suministros Hostelería", type: "Varios", contact: "Carlos Pérez", phone: "656789012", email: "info@sumhosteleria.com", active: false },
    { id: 6, name: "Aceites del Sur", type: "Aceites", contact: "Ana Jiménez", phone: "667890123", email: "pedidos@aceitesdelsur.es", active: true },
  ];
  
  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Search and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-800 mb-4 sm:mb-0">Proveedores</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar proveedor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
            <Button>
              <i className="fas fa-plus mr-2"></i>
              Añadir Proveedor
            </Button>
          </div>
        </div>
        
        {/* Suppliers Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map(supplier => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.type}</TableCell>
                    <TableCell>{supplier.contact}</TableCell>
                    <TableCell>
                      <a href={`tel:${supplier.phone}`} className="text-primary hover:underline">
                        {supplier.phone}
                      </a>
                    </TableCell>
                    <TableCell>
                      <a href={`mailto:${supplier.email}`} className="text-primary hover:underline">
                        {supplier.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      {supplier.active ? (
                        <Badge variant="success">Activo</Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <i className="fas fa-box"></i>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <i className="fas fa-history"></i>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSuppliers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-neutral-500">
                      No se encontraron proveedores que coincidan con la búsqueda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-sm font-medium text-neutral-500">Proveedores Totales</h3>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold">{suppliers.length}</p>
                <div className="h-8 w-8 rounded-full bg-primary-light bg-opacity-20 flex items-center justify-center">
                  <i className="fas fa-truck text-primary"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-sm font-medium text-neutral-500">Proveedores Activos</h3>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold">{suppliers.filter(s => s.active).length}</p>
                <div className="h-8 w-8 rounded-full bg-success bg-opacity-20 flex items-center justify-center">
                  <i className="fas fa-check text-success"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-sm font-medium text-neutral-500">Pedidos Pendientes</h3>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold">3</p>
                <div className="h-8 w-8 rounded-full bg-warning bg-opacity-20 flex items-center justify-center">
                  <i className="fas fa-clock text-warning"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}