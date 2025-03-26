import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, FileDown, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PurchaseOrder = {
  id: number;
  orderNumber: string;
  status: string;
  supplierName: string;
  locationName: string;
  warehouseName: string;
  orderDate: string;
  expectedDeliveryDate: string | null;
  total: number;
  createdByName: string;
};

// Mapeo de estados a colores y etiquetas
const statusConfig = {
  draft: { 
    color: "bg-gray-100 text-gray-800 hover:bg-gray-200", 
    label: "Borrador" 
  },
  sent: { 
    color: "bg-blue-100 text-blue-800 hover:bg-blue-200", 
    label: "Enviado" 
  },
  confirmed: { 
    color: "bg-green-100 text-green-800 hover:bg-green-200", 
    label: "Confirmado" 
  },
  partially_received: { 
    color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200", 
    label: "Recibido parcialmente" 
  },
  completed: { 
    color: "bg-purple-100 text-purple-800 hover:bg-purple-200", 
    label: "Completado" 
  },
  cancelled: { 
    color: "bg-red-100 text-red-800 hover:bg-red-200", 
    label: "Cancelado" 
  },
};

export default function PurchaseOrdersPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | undefined>(undefined);
  const [tab, setTab] = React.useState("all");
  
  // Consulta de órdenes de compra
  const {
    data: purchaseOrders,
    isLoading,
    error,
    refetch,
  } = useQuery<PurchaseOrder[]>({
    queryKey: ["/api/purchase-orders"],
  });
  
  // Filtrar órdenes de compra según tab, búsqueda y filtro de estado
  const filteredOrders = React.useMemo(() => {
    if (!purchaseOrders) return [];
    
    let filtered = [...purchaseOrders];
    
    // Filtrar por tab
    if (tab === "draft") {
      filtered = filtered.filter(po => po.status === "draft");
    } else if (tab === "active") {
      filtered = filtered.filter(po => ["sent", "confirmed", "partially_received"].includes(po.status));
    } else if (tab === "completed") {
      filtered = filtered.filter(po => po.status === "completed");
    } else if (tab === "cancelled") {
      filtered = filtered.filter(po => po.status === "cancelled");
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(po => 
        po.orderNumber.toLowerCase().includes(term) ||
        po.supplierName.toLowerCase().includes(term) ||
        po.locationName.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por estado
    if (statusFilter) {
      filtered = filtered.filter(po => po.status === statusFilter);
    }
    
    return filtered;
  }, [purchaseOrders, tab, searchTerm, statusFilter]);
  
  // Stats
  const stats = React.useMemo(() => {
    if (!purchaseOrders) return { total: 0, draft: 0, active: 0, completed: 0, cancelled: 0 };
    
    return {
      total: purchaseOrders.length,
      draft: purchaseOrders.filter(po => po.status === "draft").length,
      active: purchaseOrders.filter(po => ["sent", "confirmed", "partially_received"].includes(po.status)).length,
      completed: purchaseOrders.filter(po => po.status === "completed").length,
      cancelled: purchaseOrders.filter(po => po.status === "cancelled").length,
    };
  }, [purchaseOrders]);
  
  // Columnas para tabla
  const columns = [
    {
      header: "Nº",
      accessorKey: "orderNumber" as const,
      cell: ({ row }: any) => (
        <Button 
          variant="link" 
          className="p-0 h-auto font-medium"
          onClick={() => navigate(`/compras/${row.original.id}`)}
        >
          {row.original.orderNumber}
        </Button>
      ),
    },
    {
      header: "Estado",
      accessorKey: "status" as const,
      cell: ({ row }: any) => {
        const status = row.original.status;
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
        return (
          <Badge className={config.color}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      header: "Proveedor",
      accessorKey: "supplierName" as const,
    },
    {
      header: "Ubicación",
      accessorKey: "locationName" as const,
    },
    {
      header: "Fecha",
      accessorKey: "orderDate" as const,
      cell: ({ row }: any) => {
        const date = new Date(row.original.orderDate);
        return date.toLocaleDateString('es-ES');
      },
    },
    {
      header: "Entrega estimada",
      accessorKey: "expectedDeliveryDate" as const,
      cell: ({ row }: any) => {
        if (!row.original.expectedDeliveryDate) return "-";
        const date = new Date(row.original.expectedDeliveryDate);
        return date.toLocaleDateString('es-ES');
      },
    },
    {
      header: "Total",
      accessorKey: "total" as const,
      cell: ({ row }: any) => {
        return new Intl.NumberFormat('es-ES', { 
          style: 'currency', 
          currency: 'EUR' 
        }).format(row.original.total);
      },
    },
  ];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[40vh]">
            <p className="text-red-500 mb-2">Error al cargar órdenes de compra</p>
            <Button onClick={() => refetch()}>Reintentar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Órdenes de compra</h1>
          <p className="text-muted-foreground">
            Gestiona las compras a proveedores y recepciones de mercancía
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => { /* Exportar a Excel */ }}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button 
            onClick={() => navigate("/compras/nueva")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva orden
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Resumen</CardTitle>
              <CardDescription>
                Estado de las órdenes de compra
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="font-medium">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Borrador:</span>
                <Badge variant="outline">{stats.draft}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Activas:</span>
                <Badge className="bg-blue-100 text-blue-800">{stats.active}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Completadas:</span>
                <Badge className="bg-green-100 text-green-800">{stats.completed}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Canceladas:</span>
                <Badge className="bg-red-100 text-red-800">{stats.cancelled}</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Nº orden, proveedor..." 
                    className="pl-8" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los estados</SelectItem>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Tabs defaultValue="all" value={tab} onValueChange={setTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                Todas
                <Badge className="ml-2 bg-muted text-muted-foreground">{stats.total}</Badge>
              </TabsTrigger>
              <TabsTrigger value="draft">
                Borradores
                <Badge className="ml-2 bg-gray-100 text-gray-800">{stats.draft}</Badge>
              </TabsTrigger>
              <TabsTrigger value="active">
                Activas
                <Badge className="ml-2 bg-blue-100 text-blue-800">{stats.active}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completadas
                <Badge className="ml-2 bg-green-100 text-green-800">{stats.completed}</Badge>
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Canceladas
                <Badge className="ml-2 bg-red-100 text-red-800">{stats.cancelled}</Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={tab}>
              <Card>
                <CardContent className="pt-6">
                  {filteredOrders.length > 0 ? (
                    <DataTable
                      columns={columns}
                      data={filteredOrders}
                      pageSize={10}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                      <p className="text-lg mb-2">No hay órdenes de compra</p>
                      <p className="text-sm text-center max-w-md mb-4">
                        {searchTerm || statusFilter
                          ? "No hay resultados para los filtros seleccionados."
                          : "Comienza creando una nueva orden de compra."}
                      </p>
                      <Button 
                        onClick={() => navigate("/compras/nueva")}
                        variant="outline"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva orden
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}