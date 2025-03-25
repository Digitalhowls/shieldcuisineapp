import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Warehouse, Package, TrendingUp, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Dashboard de Almacén</h2>
            <p className="text-neutral-500">Resumen y estado general del inventario</p>
          </div>
          <div className="mt-4 md:mt-0 space-x-2">
            <Button variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Generar Informe
            </Button>
            <Button size="sm">
              <Package className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Total Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="text-2xl font-bold">1,247</div>
                <div className="ml-2 px-2 py-1 text-xs bg-success bg-opacity-10 text-success rounded-full">
                  +3% mes
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Valor Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="text-2xl font-bold">€24,500</div>
                <div className="ml-2 px-2 py-1 text-xs bg-info bg-opacity-10 text-info rounded-full">
                  Actualizado
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Productos Bajos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="text-2xl font-bold">7</div>
                <div className="ml-2 px-2 py-1 text-xs bg-warning bg-opacity-10 text-warning rounded-full">
                  Atención
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Caducidades Próximas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="text-2xl font-bold">3</div>
                <div className="ml-2 px-2 py-1 text-xs bg-error bg-opacity-10 text-error rounded-full">
                  Crítico
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activity & Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Recent Inventory Movements */}
          <Card>
            <CardHeader>
              <CardTitle>Movimientos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-800">
                      <span className="font-medium">Entrada</span> de <span className="font-medium">25kg de Harina de Trigo</span>
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">Hace 30 minutos - Por: Carlos Sánchez</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 rounded-full bg-info bg-opacity-10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-info" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-800">
                      <span className="font-medium">Traslado</span> de <span className="font-medium">5kg de Queso</span> a Cocina
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">Hace 2 horas - Por: María Rodriguez</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 rounded-full bg-warning bg-opacity-10 flex items-center justify-center">
                      <Package className="h-4 w-4 text-warning" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-800">
                      <span className="font-medium">Salida</span> de <span className="font-medium">2kg de Tomates</span>
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">Hace 4 horas - Por: Juan Pérez</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Inventory Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 rounded-full bg-error bg-opacity-10 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-error" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-800 font-medium">
                      Stock crítico: Aceite de Oliva (2L)
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">Quedan 2 unidades (mínimo: 5)</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 rounded-full bg-warning bg-opacity-10 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-800 font-medium">
                      Caducidad próxima: Leche Entera
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">Caduca en 3 días (10 unidades)</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 rounded-full bg-warning bg-opacity-10 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-800 font-medium">
                      Stock bajo: Azúcar
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">Quedan 5kg (mínimo: 10kg)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Inventory Performance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Rendimiento de Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center border border-dashed border-neutral-200 rounded-md">
              <p className="text-neutral-500">Gráfico de rendimiento del inventario (simulado)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}