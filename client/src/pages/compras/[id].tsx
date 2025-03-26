import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  FileText,
  Calendar,
  MapPin,
  Truck,
  Building,
  Package,
  ShoppingCart,
  AlertCircle,
  Check,
  FileDown,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Tipos para los objetos relacionados
type Supplier = {
  id: number;
  name: string;
  taxId: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
};

type Location = {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  postalCode: string | null;
};

type Warehouse = {
  id: number;
  name: string;
  locationId: number;
};

type User = {
  id: number;
  name: string;
  email: string;
};

type PurchaseOrderItem = {
  id: number;
  purchaseOrderId: number;
  productId: number;
  productName: string;
  productSku: string | null;
  quantity: number;
  receivedQuantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  tax: number;
  subtotal: number;
  notes: string | null;
};

type GoodsReceiptItem = {
  id: number;
  goodsReceiptId: number;
  purchaseOrderItemId: number;
  productName: string;
  quantity: number;
  unit: string;
  batchNumber: string | null;
  expiryDate: string | null;
  notes: string | null;
};

type GoodsReceipt = {
  id: number;
  purchaseOrderId: number;
  receiptNumber: string;
  receivedBy: number;
  receiverName: string;
  receiptDate: string;
  deliveryNote: string | null;
  notes: string | null;
  items: GoodsReceiptItem[];
};

type PurchaseOrder = {
  id: number;
  companyId: number;
  supplierId: number;
  locationId: number;
  warehouseId: number;
  orderNumber: string;
  orderDate: string;
  expectedDeliveryDate: string | null;
  paymentTerms: string | null;
  shippingMethod: string | null;
  notes: string | null;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  createdBy: number;
  approvedBy: number | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Relaciones expandidas
  supplier: Supplier;
  location: Location;
  warehouse: Warehouse;
  createdBy: User;
  approvedBy: User | null;
  items: PurchaseOrderItem[];
  // Recepciones
  receipts?: GoodsReceipt[];
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

// Mapeo de términos de pago
const paymentTermsLabels: Record<string, string> = {
  immediate: "Al contado",
  "15days": "15 días",
  "30days": "30 días",
  "60days": "60 días",
};

// Mapeo de métodos de envío
const shippingMethodLabels: Record<string, string> = {
  supplier: "Transporte del proveedor",
  collect: "Recogida en proveedor",
  courier: "Mensajería",
};

export default function PurchaseOrderDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const orderId = parseInt(params.id, 10);
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [newStatus, setNewStatus] = React.useState<string>("");
  
  const {
    data: purchaseOrder,
    isLoading,
    error,
    refetch,
  } = useQuery<PurchaseOrder>({
    queryKey: ["/api/purchase-orders", orderId],
    enabled: !isNaN(orderId),
  });
  
  // Mutación para actualizar el estado
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest("PUT", `/api/purchase-orders/${orderId}/status`, { status });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      toast({
        title: "Estado actualizado",
        description: "El estado de la orden se ha actualizado correctamente",
      });
      setStatusDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el estado: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (error || !purchaseOrder) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[40vh]">
            <p className="text-red-500 mb-2">Error al cargar la orden de compra</p>
            <Button onClick={() => refetch()}>Reintentar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Determinar las acciones disponibles según el estado
  const availableStatusChanges: string[] = (() => {
    switch (purchaseOrder.status) {
      case 'draft':
        return ['sent', 'cancelled'];
      case 'sent':
        return ['confirmed', 'cancelled'];
      case 'confirmed':
        // No permitir "partially_received" directamente, se actualiza al registrar una recepción
        return ['cancelled'];
      case 'partially_received':
        // No permitir "completed" directamente, se actualiza al completar todas las recepciones
        return ['cancelled'];
      default:
        return [];
    }
  })();
  
  // Calcular el progreso de recepción
  const calculateReceiptProgress = () => {
    if (!purchaseOrder.items || purchaseOrder.items.length === 0) {
      return { percentage: 0, totalReceived: 0, totalOrdered: 0 };
    }
    
    let totalOrdered = 0;
    let totalReceived = 0;
    
    purchaseOrder.items.forEach(item => {
      totalOrdered += item.quantity;
      totalReceived += item.receivedQuantity || 0;
    });
    
    const percentage = totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0;
    
    return {
      percentage: Math.min(100, Math.round(percentage)),
      totalReceived,
      totalOrdered,
    };
  };
  
  const receiptProgress = calculateReceiptProgress();
  
  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };
  
  // Fecha formateada
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('es-ES');
  };
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/compras")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Orden de compra {purchaseOrder.orderNumber}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>
                {formatDate(purchaseOrder.orderDate)}
              </span>
              <span>•</span>
              <span>
                {getStatusBadge(purchaseOrder.status)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => { /* Exportar a PDF */ }}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          
          {availableStatusChanges.length > 0 && (
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  Cambiar estado
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cambiar estado de la orden</DialogTitle>
                  <DialogDescription>
                    Selecciona el nuevo estado para la orden de compra {purchaseOrder.orderNumber}.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Estado actual:</h4>
                    <div>
                      {getStatusBadge(purchaseOrder.status)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Nuevo estado:</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableStatusChanges.map((status) => (
                        <Badge
                          key={status}
                          className={`${statusConfig[status as keyof typeof statusConfig].color} cursor-pointer ${
                            newStatus === status ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => setNewStatus(status)}
                        >
                          {statusConfig[status as keyof typeof statusConfig].label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setStatusDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => updateStatusMutation.mutate(newStatus)}
                    disabled={!newStatus || updateStatusMutation.isPending}
                  >
                    {updateStatusMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Cambiar estado
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {(purchaseOrder.status === 'confirmed' || purchaseOrder.status === 'partially_received') && (
            <Button 
              onClick={() => navigate(`/compras/${orderId}/recepcion`)}
              variant="default"
            >
              <Plus className="mr-2 h-4 w-4" />
              Registrar recepción
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid gap-6 mb-6 md:grid-cols-3">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Fecha de pedido</p>
                <p className="text-muted-foreground">{formatDate(purchaseOrder.orderDate)}</p>
              </div>
            </div>
            
            {purchaseOrder.expectedDeliveryDate && (
              <div className="flex items-start gap-2">
                <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Entrega estimada</p>
                  <p className="text-muted-foreground">{formatDate(purchaseOrder.expectedDeliveryDate)}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-2">
              <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Proveedor</p>
                <p className="text-muted-foreground">{purchaseOrder.supplier.name}</p>
                {purchaseOrder.supplier.taxId && (
                  <p className="text-xs text-muted-foreground">CIF/NIF: {purchaseOrder.supplier.taxId}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Ubicación</p>
                <p className="text-muted-foreground">{purchaseOrder.location.name}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Almacén</p>
                <p className="text-muted-foreground">{purchaseOrder.warehouse.name}</p>
              </div>
            </div>
            
            {purchaseOrder.paymentTerms && (
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Condiciones de pago</p>
                  <p className="text-muted-foreground">
                    {paymentTermsLabels[purchaseOrder.paymentTerms] || purchaseOrder.paymentTerms}
                  </p>
                </div>
              </div>
            )}
            
            {purchaseOrder.shippingMethod && (
              <div className="flex items-start gap-2">
                <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Método de envío</p>
                  <p className="text-muted-foreground">
                    {shippingMethodLabels[purchaseOrder.shippingMethod] || purchaseOrder.shippingMethod}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Estado y progreso */}
        <Card>
          <CardHeader>
            <CardTitle>Estado y progreso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="font-medium">Estado actual</p>
              <div>
                {getStatusBadge(purchaseOrder.status)}
              </div>
            </div>
            
            {(purchaseOrder.status === 'confirmed' || 
              purchaseOrder.status === 'partially_received' || 
              purchaseOrder.status === 'completed') && (
              <div className="space-y-2">
                <p className="font-medium">Progreso de recepción</p>
                <div className="space-y-1">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${receiptProgress.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recibido: {receiptProgress.totalReceived} de {receiptProgress.totalOrdered} ({receiptProgress.percentage}%)
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <p className="font-medium">Creado por</p>
              <div className="flex items-center gap-1">
                <span>{purchaseOrder.createdBy.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({formatDate(purchaseOrder.createdAt)})
                </span>
              </div>
            </div>
            
            {purchaseOrder.approvedBy && (
              <div className="space-y-2">
                <p className="font-medium">Aprobado por</p>
                <div className="flex items-center gap-1">
                  <span>{purchaseOrder.approvedBy.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({formatDate(purchaseOrder.approvedAt)})
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Resumen de precios */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen financiero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">
                {new Intl.NumberFormat('es-ES', { 
                  style: 'currency', 
                  currency: 'EUR' 
                }).format(purchaseOrder.subtotal)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">IVA:</span>
              <span className="font-medium">
                {new Intl.NumberFormat('es-ES', { 
                  style: 'currency', 
                  currency: 'EUR' 
                }).format(purchaseOrder.tax)}
              </span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-lg">
                {new Intl.NumberFormat('es-ES', { 
                  style: 'currency', 
                  currency: 'EUR' 
                }).format(purchaseOrder.total)}
              </span>
            </div>
            
            {purchaseOrder.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="font-medium">Notas</p>
                  <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                    {purchaseOrder.notes}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs para productos y recepciones */}
      <Tabs defaultValue="items" className="mb-6">
        <TabsList>
          <TabsTrigger value="items">
            Productos
            <Badge className="ml-2 bg-primary/20">{purchaseOrder.items.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="receipts">
            Recepciones
            <Badge className="ml-2 bg-primary/20">{purchaseOrder.receipts?.length || 0}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="items">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Recibido</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Dto.</TableHead>
                    <TableHead>IVA</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrder.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div>
                          {item.productName}
                          {item.productSku && (
                            <div className="text-xs text-muted-foreground">
                              SKU: {item.productSku}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity} {item.unit}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {item.receivedQuantity || 0} {item.unit}
                          
                          {item.receivedQuantity >= item.quantity ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : item.receivedQuantity > 0 ? (
                            <ShoppingCart className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-gray-300" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('es-ES', { 
                          style: 'currency', 
                          currency: 'EUR' 
                        }).format(item.unitPrice)}
                      </TableCell>
                      <TableCell>{item.discount}%</TableCell>
                      <TableCell>{item.tax}%</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('es-ES', { 
                          style: 'currency', 
                          currency: 'EUR' 
                        }).format(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="receipts">
          <Card>
            <CardContent className="pt-6">
              {purchaseOrder.receipts && purchaseOrder.receipts.length > 0 ? (
                <div className="space-y-6">
                  {purchaseOrder.receipts.map((receipt) => (
                    <div key={receipt.id} className="border rounded-lg overflow-hidden">
                      <div className="bg-muted p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{receipt.receiptNumber}</h3>
                            <p className="text-sm text-muted-foreground">
                              Recibido el {formatDate(receipt.receiptDate)} por {receipt.receiverName}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => {
                            // Ver detalles completos
                          }}>
                            Ver detalles
                          </Button>
                        </div>
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Lote</TableHead>
                            <TableHead>Caducidad</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {receipt.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                {item.productName}
                              </TableCell>
                              <TableCell>{item.quantity} {item.unit}</TableCell>
                              <TableCell>{item.batchNumber || "-"}</TableCell>
                              <TableCell>{formatDate(item.expiryDate) || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      {receipt.notes && (
                        <div className="p-4 bg-muted/50">
                          <p className="text-sm font-medium">Notas:</p>
                          <p className="text-sm text-muted-foreground">
                            {receipt.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <p className="text-muted-foreground mb-4">No se han registrado recepciones de mercancía para esta orden</p>
                  
                  {(purchaseOrder.status === 'confirmed' || purchaseOrder.status === 'partially_received') && (
                    <Button 
                      onClick={() => navigate(`/compras/${orderId}/recepcion`)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Registrar recepción
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}