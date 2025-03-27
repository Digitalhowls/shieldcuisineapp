import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { PlusCircle, Truck, ShoppingBag, Package, ArrowUpDown, Search, BarChartHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helpers para estado de órden
const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case "draft":
      return "bg-gray-200 text-gray-800 hover:bg-gray-300";
    case "sent":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "confirmed":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "partially_received":
      return "bg-amber-100 text-amber-800 hover:bg-amber-200";
    case "completed":
      return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200";
    case "cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    draft: "Borrador",
    sent: "Enviada",
    confirmed: "Confirmada",
    partially_received: "Recibida parcialmente",
    completed: "Completada",
    cancelled: "Cancelada",
  };
  return statusMap[status] || status;
};

function ComprasIndex() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");

  // Obtener las órdenes de compra
  const { data: ordenes = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/purchase-orders"],
  });

  // Filtrar órdenes según criterios
  const filteredOrders = ordenes.filter((orden) => {
    // Filtro por texto de búsqueda
    const matchesSearch =
      searchQuery === "" ||
      orden.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orden.supplierName?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filtro por proveedor
    const matchesSupplier =
      supplierFilter === "todos" || orden.supplierId.toString() === supplierFilter;

    // Filtro por estado
    const matchesStatus = statusFilter === "todos" || orden.status === statusFilter;

    // Filtro por pestaña
    let matchesTab = true;
    if (activeTab === "pendientes") {
      matchesTab = ["draft", "sent", "confirmed"].includes(orden.status);
    } else if (activeTab === "recibidas") {
      matchesTab = ["partially_received", "completed"].includes(orden.status);
    }

    return matchesSearch && matchesSupplier && matchesStatus && matchesTab;
  });

  // Definición de columnas para la tabla
  const columns = [
    {
      header: "Ref.",
      accessorKey: "referenceNumber",
    },
    {
      header: "Proveedor",
      accessorKey: "supplierName",
    },
    {
      header: "Fecha",
      accessorKey: "createdAt",
      cell: ({ row }: { row: { original: any } }) => {
        const date = new Date(row.original.createdAt);
        return <span>{formatDistanceToNow(date, { addSuffix: true, locale: es })}</span>;
      },
    },
    {
      header: "Total",
      accessorKey: "totalAmount",
      cell: ({ row }: { row: { original: any } }) => {
        return <span>{Number(row.original.totalAmount).toFixed(2)} €</span>;
      },
    },
    {
      header: "Estado",
      accessorKey: "status",
      cell: ({ row }: { row: { original: any } }) => {
        return (
          <Badge className={getStatusBadgeStyle(row.original.status)}>
            {getStatusText(row.original.status)}
          </Badge>
        );
      },
    },
  ];

  // Obtener proveedores únicos para el filtro
  const uniqueSuppliers = React.useMemo(() => {
    const suppliers = new Set<any>();
    ordenes.forEach((orden) => {
      if (orden.supplierId) {
        suppliers.add({
          id: orden.supplierId,
          name: orden.supplierName,
        });
      }
    });
    return Array.from(suppliers);
  }, [ordenes]);

  // Handler para redireccionar al detalle de la orden
  const handleRowClick = (row: any) => {
    setLocation(`/compras/${row.id}`);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Compras</h1>
          <p className="text-muted-foreground">
            Administra órdenes de compra, recepciones y proveedores
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setLocation("/compras/analisis")}
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
          >
            <BarChartHorizontal className="mr-2 h-4 w-4" />
            Análisis IA
          </Button>
          <Button onClick={() => setLocation("/compras/nueva")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Orden
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Pendientes</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ordenes.filter((o) => ["draft", "sent", "confirmed"].includes(o.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {ordenes.filter((o) => o.status === "sent").length} enviadas,{" "}
              {ordenes.filter((o) => o.status === "confirmed").length} confirmadas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recepciones Pendientes</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ordenes.filter((o) => o.status === "confirmed").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Órdenes confirmadas listas para recepción
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Compras (30 días)</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ordenes
                .filter((o) => {
                  const date = new Date(o.createdAt);
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return date > thirtyDaysAgo && o.status !== "cancelled";
                })
                .reduce((sum, o) => sum + Number(o.totalAmount), 0)
                .toFixed(2)}{" "}
              €
            </div>
            <p className="text-xs text-muted-foreground">
              {
                ordenes.filter((o) => {
                  const date = new Date(o.createdAt);
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return date > thirtyDaysAgo && o.status !== "cancelled";
                }).length
              }{" "}
              órdenes en los últimos 30 días
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="todas"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
            <TabsTrigger value="recibidas">Recibidas</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative w-[180px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar órdenes..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={supplierFilter}
              onValueChange={setSupplierFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los proveedores</SelectItem>
                {uniqueSuppliers.map((supplier: any) => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="sent">Enviada</SelectItem>
                <SelectItem value="confirmed">Confirmada</SelectItem>
                <SelectItem value="partially_received">Recibida parcialmente</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <TabsContent value="todas" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <DataTable
                columns={columns}
                data={filteredOrders}
                onRowClick={handleRowClick}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pendientes" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <DataTable
                columns={columns}
                data={filteredOrders}
                onRowClick={handleRowClick}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recibidas" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <DataTable
                columns={columns}
                data={filteredOrders}
                onRowClick={handleRowClick}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ComprasIndex;