import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Dashboard() {
  const currentDate = format(new Date(), "d 'de' MMMM, yyyy", { locale: es });
  const locationName = "Restaurante El Jardín - Almacén Central";
  
  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header with Date and Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-800">Dashboard Almacén</h2>
            <p className="text-neutral-500">
              {currentDate} · {locationName}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button variant="outline" className="flex items-center">
              <i className="fas fa-download mr-2 text-neutral-500"></i>
              <span>Exportar</span>
            </Button>
            <Button className="flex items-center">
              <i className="fas fa-plus mr-2"></i>
              <span>Nuevo Producto</span>
            </Button>
          </div>
        </div>
        
        {/* Summary Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-sm font-medium text-neutral-500">Productos en Inventario</h3>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-neutral-800">245</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary-light bg-opacity-20 flex items-center justify-center">
                  <i className="fas fa-boxes text-primary"></i>
                </div>
              </div>
              <div className="mt-2 text-xs text-neutral-500">
                <span className="inline-flex items-center text-success">
                  <i className="fas fa-arrow-up mr-1"></i> 12% más que el mes pasado
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-sm font-medium text-neutral-500">Alertas de Stock</h3>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-neutral-800">8</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-warning bg-opacity-20 flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-warning"></i>
                </div>
              </div>
              <div className="mt-2 text-xs text-neutral-500">
                <span>5 productos por debajo del mínimo</span>
                <br />
                <span>3 productos caducando pronto</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-sm font-medium text-neutral-500">Valor del Inventario</h3>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-neutral-800">12.458 €</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-success bg-opacity-20 flex items-center justify-center">
                  <i className="fas fa-euro-sign text-success"></i>
                </div>
              </div>
              <div className="mt-2 text-xs text-neutral-500">
                <span className="inline-flex items-center text-success">
                  <i className="fas fa-arrow-down mr-1"></i> 3% menos que el mes pasado
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Placeholder for main content */}
        <Card className="mb-6">
          <CardHeader className="py-4">
            <h3 className="font-semibold text-neutral-800">Movimientos Recientes</h3>
          </CardHeader>
          <CardContent>
            <p className="text-center text-neutral-500 py-12">
              Los datos de movimientos se mostrarán aquí
            </p>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="py-4">
              <h3 className="font-semibold text-neutral-800">Productos Populares</h3>
            </CardHeader>
            <CardContent>
              <p className="text-center text-neutral-500 py-12">
                El gráfico de productos populares se mostrará aquí
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <h3 className="font-semibold text-neutral-800">Proveedores</h3>
            </CardHeader>
            <CardContent>
              <p className="text-center text-neutral-500 py-12">
                La lista de proveedores se mostrará aquí
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}