import React, { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  FileText, 
  Truck, 
  Building, 
  Package, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ShoppingCart,
  Clock,
  AlertTriangle
} from "lucide-react";

// Schema para validación del formulario de actualización de estado
const updateOrderSchema = z.object({
  status: z.string().min(1, "Debe seleccionar un estado"),
  notes: z.string().optional(),
});

// Schema para formulario de recepción de mercancía
const goodsReceiptItemSchema = z.object({
  purchaseOrderItemId: z.number(),
  productId: z.number(),
  receivedQuantity: z.string().min(1, "Debe especificar una cantidad"),
  notes: z.string().optional(),
});

const goodsReceiptSchema = z.object({
  purchaseOrderId: z.number(),
  warehouseId: z.number(),
  notes: z.string().optional(),
  items: z.array(goodsReceiptItemSchema),
});

type UpdateOrderFormValues = z.infer<typeof updateOrderSchema>;
type GoodsReceiptFormValues = z.infer<typeof goodsReceiptSchema>;

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "draft":
      return <FileText className="h-5 w-5" />;
    case "sent":
      return <ShoppingCart className="h-5 w-5" />;
    case "confirmed":
      return <CheckCircle2 className="h-5 w-5" />;
    case "partially_received":
      return <Clock className="h-5 w-5" />;
    case "completed":
      return <Truck className="h-5 w-5" />;
    case "cancelled":
      return <XCircle className="h-5 w-5" />;
    default:
      return <AlertTriangle className="h-5 w-5" />;
  }
};

// Componente principal
const ComprasDetalle = () => {
  const [, params] = useRoute('/compras/:id');
  const orderId = params?.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isReceivingGoods, setIsReceivingGoods] = useState(false);
  
  // Estado local para manejar cantidades a recibir
  const [receiptItems, setReceiptItems] = useState<{
    purchaseOrderItemId: number;
    productId: number;
    productName: string;
    pendingQuantity: number;
    receivedQuantity: string;
    notes: string;
  }[]>([]);

  // Consultar la orden
  const { data: order, isLoading: isLoadingOrder } = useQuery<any>({
    queryKey: [`/api/purchase-orders/${orderId}`],
    enabled: !!orderId,
    onSuccess: (data) => {
      if (data && data.items) {
        // Inicializar el estado de receiptItems
        const items = data.items.map((item: any) => ({
          purchaseOrderItemId: item.id,
          productId: item.productId,
          productName: item.productName,
          pendingQuantity: item.pendingQuantity,
          receivedQuantity: "0",
          notes: "",
        }));
        setReceiptItems(items);
      }
    },
  });

  // Configurar formulario para actualizar estado
  const statusForm = useForm<UpdateOrderFormValues>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: {
      status: order?.status || "",
      notes: "",
    },
  });

  // Configurar formulario para recepción de mercancía
  const receiptForm = useForm<GoodsReceiptFormValues>({
    resolver: zodResolver(goodsReceiptSchema),
    defaultValues: {
      purchaseOrderId: orderId,
      warehouseId: order?.warehouseId || 0,
      notes: "",
      items: [],
    },
  });

  // Mutación para actualizar estado de la orden
  const updateOrderMutation = useMutation({
    mutationFn: async (data: UpdateOrderFormValues) => {
      const response = await apiRequest(
        "PUT", 
        `/api/purchase-orders/${orderId}/status`, 
        data
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Estado actualizado",
        description: "El estado de la orden se ha actualizado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/purchase-orders/${orderId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el estado: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutación para registrar recepción de mercancía
  const receiveGoodsMutation = useMutation({
    mutationFn: async (data: GoodsReceiptFormValues) => {
      const response = await apiRequest(
        "POST", 
        `/api/purchase-orders/${orderId}/receipts`, 
        data
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Recepción registrada",
        description: "La recepción de mercancía se ha registrado correctamente",
      });
      setIsReceivingGoods(false);
      queryClient.invalidateQueries({ queryKey: [`/api/purchase-orders/${orderId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo registrar la recepción: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Enviar formulario de actualización de estado
  const onSubmitStatusUpdate = (data: UpdateOrderFormValues) => {
    updateOrderMutation.mutate(data);
  };

  // Enviar formulario de recepción de mercancía
  const onSubmitGoodsReceipt = () => {
    const filteredItems = receiptItems
      .filter(item => parseFloat(item.receivedQuantity) > 0)
      .map(item => ({
        purchaseOrderItemId: item.purchaseOrderItemId,
        productId: item.productId,
        receivedQuantity: item.receivedQuantity,
        notes: item.notes,
      }));

    if (filteredItems.length === 0) {
      toast({
        title: "Error",
        description: "Debe ingresar al menos una cantidad a recibir",
        variant: "destructive",
      });
      return;
    }

    const data: GoodsReceiptFormValues = {
      purchaseOrderId: orderId,
      warehouseId: order?.warehouseId,
      notes: receiptForm.getValues("notes"),
      items: filteredItems,
    };

    receiveGoodsMutation.mutate(data);
  };

  // Actualizar cantidad a recibir en estado local
  const handleReceiptItemChange = (index: number, field: string, value: string) => {
    const newItems = [...receiptItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setReceiptItems(newItems);
  };

  // Validar si se puede cambiar a un estado específico
  const canChangeStatus = (currentStatus: string, newStatus: string) => {
    const statusFlow: { [key: string]: string[] } = {
      draft: ["sent", "cancelled"],
      sent: ["confirmed", "cancelled"],
      confirmed: ["partially_received", "cancelled"],
      partially_received: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };

    return statusFlow[currentStatus]?.includes(newStatus) || false;
  };

  // Renderizar pantalla de carga
  if (isLoadingOrder) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calcular totales
  const totalAmount = order?.items?.reduce(
    (sum: number, item: any) => sum + Number(item.totalPrice),
    0
  ) || 0;

  const totalReceived = order?.items?.reduce(
    (sum: number, item: any) => sum + Number(item.receivedQuantity || 0),
    0
  ) || 0;

  const totalOrdered = order?.items?.reduce(
    (sum: number, item: any) => sum + Number(item.quantity),
    0
  ) || 0;

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => setLocation("/compras")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Orden de Compra: {order?.referenceNumber || `#${orderId}`}
          </h1>
          <p className="text-muted-foreground">
            Detalles y seguimiento de la orden
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Datos generales */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Información General</CardTitle>
                  <CardDescription>Datos básicos de la orden</CardDescription>
                </div>
                <Badge className={getStatusBadgeStyle(order?.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(order?.status)}
                    {getStatusText(order?.status)}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Proveedor</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <p>{order?.supplierName}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Almacén de destino</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <p>{order?.warehouseName}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Fecha de creación</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p>
                        {order?.createdAt
                          ? format(new Date(order.createdAt), "PPP", { locale: es })
                          : "No disponible"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Fecha prevista de entrega</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p>
                        {order?.expectedDeliveryDate
                          ? format(new Date(order.expectedDeliveryDate), "PPP", { locale: es })
                          : "No especificada"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Creado por</h3>
                    <p className="mt-1">{order?.createdByName || "Usuario del sistema"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Última actualización</h3>
                    <p className="mt-1">
                      {order?.updatedAt
                        ? format(new Date(order.updatedAt), "PPP", { locale: es })
                        : "No disponible"}
                    </p>
                  </div>
                </div>
              </div>

              {order?.notes && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Notas</h3>
                    <p className="mt-1 whitespace-pre-line">{order.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
              <CardDescription>Artículos incluidos en esta orden</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio Unitario</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Recibido</TableHead>
                    <TableHead className="text-right">Pendiente</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order?.items?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{Number(item.unitPrice).toFixed(2)} €</TableCell>
                      <TableCell className="text-right">{Number(item.totalPrice).toFixed(2)} €</TableCell>
                      <TableCell className="text-right">{item.receivedQuantity || 0}</TableCell>
                      <TableCell className="text-right">{item.pendingQuantity || item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <div className="font-medium">Totales</div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="text-sm text-right">
                  <div>Ordenado</div>
                  <div className="font-medium text-foreground">{totalOrdered}</div>
                </div>
                <div className="text-sm text-right">
                  <div>Recibido</div>
                  <div className="font-medium text-foreground">{totalReceived}</div>
                </div>
                <div className="text-sm text-right">
                  <div>Total</div>
                  <div className="font-medium text-foreground">{totalAmount.toFixed(2)} €</div>
                </div>
              </div>
            </CardFooter>
          </Card>

          {/* Recepciones */}
          {order?.receipts && order.receipts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recepciones</CardTitle>
                <CardDescription>Histórico de recepciones de mercancía</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Recibido por</TableHead>
                      <TableHead className="text-right">Productos</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.receipts.map((receipt: any) => (
                      <TableRow key={receipt.id}>
                        <TableCell>{receipt.id}</TableCell>
                        <TableCell>
                          {format(new Date(receipt.createdAt), "PPP", { locale: es })}
                        </TableCell>
                        <TableCell>{receipt.receivedByName || "Usuario del sistema"}</TableCell>
                        <TableCell className="text-right">{receipt.itemCount}</TableCell>
                        <TableCell className="text-right">{receipt.totalQuantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
              <CardDescription>Gestiona esta orden</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Actualizar estado */}
              <div>
                <h3 className="font-medium mb-2">Actualizar estado</h3>
                <Form {...statusForm}>
                  <form
                    onSubmit={statusForm.handleSubmit(onSubmitStatusUpdate)}
                    className="space-y-4"
                  >
                    <FormField
                      control={statusForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nuevo estado</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["draft", "sent", "confirmed", "partially_received", "completed", "cancelled"].map(
                                (status) => (
                                  <SelectItem
                                    key={status}
                                    value={status}
                                    disabled={!canChangeStatus(order?.status, status)}
                                  >
                                    {getStatusText(status)}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={statusForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Notas adicionales..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={updateOrderMutation.isPending}
                    >
                      {updateOrderMutation.isPending ? "Actualizando..." : "Actualizar estado"}
                    </Button>
                  </form>
                </Form>
              </div>

              <Separator />

              {/* Registrar recepción */}
              <div>
                <h3 className="font-medium mb-2">Recepción de mercancía</h3>
                <Dialog open={isReceivingGoods} onOpenChange={setIsReceivingGoods}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled={order?.status !== "confirmed" && order?.status !== "partially_received"}
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Registrar recepción
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Recepción de mercancía</DialogTitle>
                      <DialogDescription>
                        Registre la recepción de productos para esta orden
                      </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                      <h3 className="font-medium mb-2">Productos a recibir</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-right">Pendiente</TableHead>
                            <TableHead className="text-right">Cantidad a recibir</TableHead>
                            <TableHead>Notas</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {receiptItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.productName}</TableCell>
                              <TableCell className="text-right">{item.pendingQuantity}</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  min="0"
                                  max={item.pendingQuantity}
                                  step="0.01"
                                  value={item.receivedQuantity}
                                  onChange={(e) => 
                                    handleReceiptItemChange(index, "receivedQuantity", e.target.value)
                                  }
                                  className="w-24 ml-auto"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  placeholder="Notas adicionales..."
                                  value={item.notes}
                                  onChange={(e) => 
                                    handleReceiptItemChange(index, "notes", e.target.value)
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <div className="mt-4">
                        <FormField
                          control={receiptForm.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notas generales</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Notas sobre la recepción..."
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsReceivingGoods(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="button" 
                        onClick={onSubmitGoodsReceipt}
                        disabled={receiveGoodsMutation.isPending}
                      >
                        {receiveGoodsMutation.isPending ? "Guardando..." : "Guardar recepción"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Separator />

              {/* Otras acciones */}
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    // En una implementación real, este botón podría generar un PDF
                    toast({
                      title: "Funcionalidad en desarrollo",
                      description: "La exportación a PDF está en desarrollo.",
                    });
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
              <CardDescription>Información de esta orden</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total productos:</span>
                <span className="font-medium">{order?.items?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cantidad total:</span>
                <span className="font-medium">{totalOrdered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recibido:</span>
                <span className="font-medium">{totalReceived} ({totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium">{totalAmount.toFixed(2)} €</span>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between">
                <span className="text-muted-foreground">Proveedor:</span>
                <span className="font-medium">{order?.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <Badge className={getStatusBadgeStyle(order?.status)}>
                  {getStatusText(order?.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ComprasDetalle;