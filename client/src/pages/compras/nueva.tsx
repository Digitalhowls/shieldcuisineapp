import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Save, ArrowLeft, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { insertPurchaseOrderSchema } from "@shared/schema";

// Tipo para proveedor
type Supplier = {
  id: number;
  name: string;
  taxId: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
};

// Tipo para ubicación
type Location = {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  postalCode: string | null;
};

// Tipo para almacén
type Warehouse = {
  id: number;
  name: string;
  locationId: number;
};

// Tipo para producto
type Product = {
  id: number;
  name: string;
  sku: string | null;
  description: string | null;
  price: number;
  unit: string;
  inStock?: number;
};

// Tipo para item de la orden
type OrderItem = {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  tax: number;
  subtotal: number;
  notes?: string;
};

// Esquema de validación para nueva orden
const createOrderSchema = z.object({
  supplierId: z.number({
    required_error: "Selecciona un proveedor",
    invalid_type_error: "Formato inválido"
  }),
  locationId: z.number({
    required_error: "Selecciona una ubicación",
    invalid_type_error: "Formato inválido"
  }),
  warehouseId: z.number({
    required_error: "Selecciona un almacén",
    invalid_type_error: "Formato inválido"
  }),
  orderDate: z.string({
    required_error: "La fecha es obligatoria"
  }),
  expectedDeliveryDate: z.string().optional(),
  paymentTerms: z.string().optional(),
  shippingMethod: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["draft", "sent"]),
});

type CreateOrderValues = z.infer<typeof createOrderSchema>;

export default function NuevaOrdenPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Estado para items de la orden
  const [orderItems, setOrderItems] = React.useState<OrderItem[]>([]);
  
  // Estado para producto seleccionado y panel lateral
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [itemQuantity, setItemQuantity] = React.useState("1");
  const [itemPrice, setItemPrice] = React.useState("0");
  const [itemDiscount, setItemDiscount] = React.useState("0");
  const [itemTax, setItemTax] = React.useState("21");
  const [sheetOpen, setSheetOpen] = React.useState(false);
  
  // Consultas
  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });
  
  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });
  
  const { data: warehouses, isLoading: isLoadingWarehouses } = useQuery<Warehouse[]>({
    queryKey: ["/api/warehouses"],
  });
  
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  // Formulario
  const form = useForm<CreateOrderValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      orderDate: new Date().toISOString().split("T")[0],
      status: "draft",
    },
  });
  
  // Filtrar almacenes por ubicación seleccionada
  const filteredWarehouses = React.useMemo(() => {
    const locationId = form.watch("locationId");
    if (!locationId || !warehouses) return [];
    return warehouses.filter(w => w.locationId === locationId);
  }, [form.watch("locationId"), warehouses]);

  // Si cambia la ubicación, resetear el almacén seleccionado
  React.useEffect(() => {
    form.setValue("warehouseId", undefined as any);
  }, [form.watch("locationId")]);
  
  // Calcular totales
  const totals = React.useMemo(() => {
    let subtotal = 0;
    let taxTotal = 0;
    let total = 0;
    
    orderItems.forEach(item => {
      subtotal += item.subtotal;
      taxTotal += (item.subtotal * item.tax) / 100;
    });
    
    total = subtotal + taxTotal;
    
    return { subtotal, taxTotal, total };
  }, [orderItems]);
  
  // Añadir item a la orden
  const addItemToOrder = () => {
    if (!selectedProduct) return;
    
    const quantity = parseFloat(itemQuantity) || 0;
    const unitPrice = parseFloat(itemPrice) || selectedProduct.price;
    const discount = parseFloat(itemDiscount) || 0;
    const tax = parseFloat(itemTax) || 21;
    
    if (quantity <= 0) {
      toast({
        title: "Cantidad inválida",
        description: "La cantidad debe ser mayor que cero",
        variant: "destructive",
      });
      return;
    }
    
    const subtotal = quantity * unitPrice * (1 - discount / 100);
    
    const newItem: OrderItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      unit: selectedProduct.unit,
      unitPrice,
      discount,
      tax,
      subtotal,
    };
    
    setOrderItems([...orderItems, newItem]);
    setSelectedProduct(null);
    setItemQuantity("1");
    setItemPrice("0");
    setItemDiscount("0");
    setItemTax("21");
    setSheetOpen(false);
  };
  
  // Eliminar item de la orden
  const removeItem = (index: number) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };
  
  // Mutación para crear la orden
  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/purchase-orders", data);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      toast({
        title: "Orden creada",
        description: "La orden de compra ha sido creada correctamente",
      });
      navigate(`/compras/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo crear la orden: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Enviar formulario
  const onSubmit = (values: CreateOrderValues) => {
    if (orderItems.length === 0) {
      toast({
        title: "Sin productos",
        description: "Debes añadir al menos un producto a la orden",
        variant: "destructive",
      });
      return;
    }
    
    const completeData = {
      ...values,
      orderNumber: `PO-${new Date().getTime().toString().substring(5)}`, // Generar número temporal
      subtotal: totals.subtotal,
      tax: totals.taxTotal,
      total: totals.total,
      items: orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        discount: item.discount,
        tax: item.tax,
        subtotal: item.subtotal,
        notes: item.notes || "",
      })),
    };
    
    createOrderMutation.mutate(completeData);
  };
  
  const isLoading = isLoadingSuppliers || isLoadingLocations || isLoadingWarehouses || isLoadingProducts;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
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
            <h1 className="text-3xl font-bold tracking-tight">Nueva orden de compra</h1>
            <p className="text-muted-foreground">
              Crea una nueva orden para solicitar productos a un proveedor
            </p>
          </div>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Datos básicos */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Información básica</CardTitle>
                <CardDescription>
                  Datos principales de la orden
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proveedor</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString()} 
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar proveedor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers?.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Proveedor al que realizarás el pedido
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString()} 
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar ubicación" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations?.map((location) => (
                            <SelectItem key={location.id} value={location.id.toString()}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Ubicación para la que haces el pedido
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="warehouseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Almacén</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString()} 
                        disabled={!form.watch("locationId") || filteredWarehouses.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar almacén" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredWarehouses.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                              {warehouse.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Almacén donde se recibirá la mercancía
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="orderDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de pedido</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="expectedDeliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha estimada de entrega</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* Productos */}
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Productos</CardTitle>
                  <CardDescription>
                    Artículos incluidos en esta orden
                  </CardDescription>
                </div>
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Añadir producto
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[400px] sm:w-[540px]">
                    <SheetHeader>
                      <SheetTitle>Añadir producto</SheetTitle>
                      <SheetDescription>
                        Selecciona un producto y define su cantidad y precio.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Producto</label>
                          <Select 
                            onValueChange={(value) => {
                              const product = products?.find(p => p.id === parseInt(value));
                              setSelectedProduct(product || null);
                              if (product) {
                                setItemPrice(product.price.toString());
                              }
                            }} 
                            value={selectedProduct?.id.toString()}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar producto" />
                            </SelectTrigger>
                            <SelectContent>
                              {products?.map((product) => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {selectedProduct && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Cantidad</label>
                                <Input 
                                  type="number" 
                                  min="0.01" 
                                  step="0.01"
                                  value={itemQuantity}
                                  onChange={(e) => setItemQuantity(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Unidad</label>
                                <Input 
                                  type="text"
                                  value={selectedProduct.unit}
                                  disabled
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Precio unitario (€)</label>
                                <Input 
                                  type="number" 
                                  min="0.01" 
                                  step="0.01"
                                  value={itemPrice}
                                  onChange={(e) => setItemPrice(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Descuento (%)</label>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  max="100" 
                                  step="0.1"
                                  value={itemDiscount}
                                  onChange={(e) => setItemDiscount(e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">IVA (%)</label>
                              <Select 
                                value={itemTax} 
                                onValueChange={setItemTax}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar tipo de IVA" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">0% - Exento</SelectItem>
                                  <SelectItem value="4">4% - Superreducido</SelectItem>
                                  <SelectItem value="10">10% - Reducido</SelectItem>
                                  <SelectItem value="21">21% - General</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Subtotal</label>
                              <Input 
                                type="text" 
                                value={`${(parseFloat(itemQuantity) * parseFloat(itemPrice) * (1 - parseFloat(itemDiscount) / 100)).toFixed(2)} €`}
                                disabled
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </SheetClose>
                      <Button 
                        onClick={addItemToOrder} 
                        disabled={!selectedProduct}
                      >
                        Añadir a la orden
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </CardHeader>
              <CardContent>
                {orderItems.length > 0 ? (
                  <ScrollArea className="h-[320px] rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>Cantidad</TableHead>
                          <TableHead>Precio</TableHead>
                          <TableHead>Dto.</TableHead>
                          <TableHead>IVA</TableHead>
                          <TableHead>Subtotal</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell>{item.quantity} {item.unit}</TableCell>
                            <TableCell>{item.unitPrice.toFixed(2)} €</TableCell>
                            <TableCell>{item.discount}%</TableCell>
                            <TableCell>{item.tax}%</TableCell>
                            <TableCell>{item.subtotal.toFixed(2)} €</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeItem(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 border rounded-md">
                    <p className="text-sm text-muted-foreground mb-2">Aún no has añadido productos a esta orden</p>
                    <Button 
                      variant="outline"
                      onClick={() => setSheetOpen(true)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Añadir producto
                    </Button>
                  </div>
                )}
                
                {orderItems.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Subtotal:</span>
                      <span className="font-medium text-right">{totals.subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">IVA:</span>
                      <span className="font-medium text-right">{totals.taxTotal.toFixed(2)} €</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold text-lg text-right">{totals.total.toFixed(2)} €</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Detalles adicionales */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles adicionales</CardTitle>
              <CardDescription>
                Información complementaria para la orden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condiciones de pago</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value} 
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar condiciones" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="immediate">Al contado</SelectItem>
                          <SelectItem value="15days">15 días</SelectItem>
                          <SelectItem value="30days">30 días</SelectItem>
                          <SelectItem value="60days">60 días</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="shippingMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de envío</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value} 
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar método" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="supplier">Transporte del proveedor</SelectItem>
                          <SelectItem value="collect">Recogida en proveedor</SelectItem>
                          <SelectItem value="courier">Mensajería</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Instrucciones especiales o comentarios para esta orden..." 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Acciones */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/compras")}
            >
              Cancelar
            </Button>
            
            <Button
              type="button"
              onClick={() => {
                form.setValue("status", "draft");
                form.handleSubmit(onSubmit)();
              }}
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Guardar como borrador
            </Button>
            
            <Button
              type="button"
              onClick={() => {
                form.setValue("status", "sent");
                form.handleSubmit(onSubmit)();
              }}
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Save className="mr-2 h-4 w-4" />
              Crear y enviar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}