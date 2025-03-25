import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  SendIcon, 
  CircleDollarSign,
  CreditCard,
  Building,
  User,
  EuroIcon
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Tipos
interface BankAccount {
  id: number;
  companyId: number;
  connectionId: number;
  name: string;
  iban: string;
  currency: string;
  balance: number;
  availableBalance: number | null;
  active: boolean;
  lastSyncAt: string | null;
}

// Esquema de validación para el formulario de pago
const paymentSchema = z.object({
  accountId: z.string().min(1, { message: "Seleccione una cuenta" }),
  creditorName: z.string().min(2, { message: "Nombre del beneficiario requerido" }),
  creditorIban: z.string().min(5, { message: "IBAN del beneficiario requerido" }).regex(/^[A-Z]{2}[0-9]{2}[a-zA-Z0-9]{1,30}$/, {
    message: "IBAN inválido",
  }),
  amount: z.string().min(1, { message: "Importe requerido" }).refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "El importe debe ser un número positivo",
  }),
  currency: z.string().min(1, { message: "Seleccione una moneda" }),
  description: z.string().optional(),
});

// Tipo para el formulario
type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function Pagos() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(1); // Hardcodeado para demo
  const [formValues, setFormValues] = useState<PaymentFormValues | null>(null);
  
  // Parsear parámetros de URL
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const accountIdFromUrl = searchParams.get('accountId');
  
  // Consulta para obtener las cuentas bancarias
  const accountsQuery = useQuery<BankAccount[]>({
    queryKey: ['/api/banking/companies', selectedCompanyId, 'dashboard'],
    queryFn: async () => {
      const response = await fetch(`/api/banking/companies/${selectedCompanyId}/dashboard`);
      if (!response.ok) {
        throw new Error('Error al cargar las cuentas bancarias');
      }
      const data = await response.json();
      return data.accounts;
    }
  });
  
  // Definir el formulario con React Hook Form
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      accountId: accountIdFromUrl || "",
      creditorName: "",
      creditorIban: "",
      amount: "",
      currency: "EUR",
      description: "",
    },
  });
  
  // Manejar envío del formulario
  const onSubmit = (values: PaymentFormValues) => {
    setFormValues(values);
    setConfirmingPayment(true);
  };
  
  // Ejecutar el pago
  const executePayment = async () => {
    if (!formValues) return;
    
    setPaymentStatus('loading');
    
    try {
      const response = await fetch(`/api/banking/accounts/${formValues.accountId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creditorName: formValues.creditorName,
          creditorIban: formValues.creditorIban,
          amount: formValues.amount,
          currency: formValues.currency,
          description: formValues.description || 'Pago realizado desde ShieldCuisine',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al realizar el pago');
      }
      
      setPaymentStatus('success');
      
      toast({
        title: "Pago iniciado correctamente",
        description: "El pago se ha iniciado correctamente y está siendo procesado",
      });
      
      // Reiniciar el formulario
      form.reset();
      
      // Cerrar el diálogo de confirmación después de un delay
      setTimeout(() => {
        setConfirmingPayment(false);
        setPaymentStatus('idle');
      }, 2000);
    } catch (error) {
      setPaymentStatus('error');
      
      toast({
        title: "Error al realizar el pago",
        description: "Se produjo un error al intentar realizar el pago. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      });
    }
  };
  
  // Formatear IBAN para mostrar
  const formatIban = (iban: string): string => {
    return iban.replace(/(.{4})/g, '$1 ').trim();
  };
  
  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => navigate("/banca")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Realizar Pago</CardTitle>
          <CardDescription>Inicie un pago desde sus cuentas bancarias</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="nuevo" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="nuevo">Nuevo Pago</TabsTrigger>
              <TabsTrigger value="historial">Historial de Pagos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="nuevo">
              {accountsQuery.isLoading ? (
                <div className="space-y-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : accountsQuery.error ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p className="mb-4">Error al cargar las cuentas bancarias.</p>
                  <Button onClick={() => accountsQuery.refetch()}>
                    Reintentar
                  </Button>
                </div>
              ) : !accountsQuery.data || accountsQuery.data.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p className="mb-4">No se encontraron cuentas bancarias activas.</p>
                  <Button onClick={() => navigate("/banca/configuracion")}>
                    Configurar Cuenta
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Selección de cuenta */}
                      <FormField
                        control={form.control}
                        name="accountId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cuenta de origen</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione una cuenta" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {accountsQuery.data.map((account) => (
                                  <SelectItem key={account.id} value={account.id.toString()}>
                                    {account.name} - {formatIban(account.iban)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              La cuenta desde la que se realizará el pago
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Campo de importe */}
                      <div className="grid gap-4 grid-cols-3">
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Importe</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01" 
                                    min="0.01" 
                                    placeholder="0.00" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Moneda</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="EUR" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="EUR">EUR</SelectItem>
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="GBP">GBP</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Nombre del beneficiario */}
                      <FormField
                        control={form.control}
                        name="creditorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del beneficiario</FormLabel>
                            <FormControl>
                              <Input placeholder="Introduzca el nombre del beneficiario" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* IBAN del beneficiario */}
                      <FormField
                        control={form.control}
                        name="creditorIban"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IBAN del beneficiario</FormLabel>
                            <FormControl>
                              <Input placeholder="Introduzca el IBAN del beneficiario" {...field} />
                            </FormControl>
                            <FormDescription>
                              Ejemplo: ES91 2100 0418 4502 0005 1332
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Descripción o concepto */}
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Concepto</FormLabel>
                            <FormControl>
                              <Input placeholder="Introduzca el concepto del pago (opcional)" {...field} />
                            </FormControl>
                            <FormDescription>
                              Una descripción o referencia para este pago
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      <SendIcon className="mr-2 h-4 w-4" /> Iniciar Pago
                    </Button>
                  </form>
                </Form>
              )}
            </TabsContent>
            
            <TabsContent value="historial">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de pagos</CardTitle>
                  <CardDescription>
                    Pagos realizados y en curso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10 text-muted-foreground">
                    <p>No hay pagos registrados en el historial.</p>
                    <p className="mt-2">Los pagos que realice aparecerán listados aquí.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Diálogo de confirmación de pago */}
      <AlertDialog open={confirmingPayment} onOpenChange={setConfirmingPayment}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Pago</AlertDialogTitle>
            <AlertDialogDescription>
              {paymentStatus === 'idle' && "Por favor, revise los detalles del pago antes de confirmar."}
              {paymentStatus === 'loading' && "Procesando su pago..."}
              {paymentStatus === 'success' && "¡Pago iniciado con éxito!"}
              {paymentStatus === 'error' && "Error al procesar el pago. Por favor, inténtelo de nuevo."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {paymentStatus === 'idle' && formValues && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Cuenta</Label>
                  <div className="font-medium">
                    {accountsQuery.data?.find(a => a.id.toString() === formValues.accountId)?.name || 'Cuenta seleccionada'}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Importe</Label>
                  <div className="font-medium">
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: formValues.currency
                    }).format(Number(formValues.amount))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-muted-foreground">Beneficiario</Label>
                <div className="font-medium">{formValues.creditorName}</div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-muted-foreground">IBAN del beneficiario</Label>
                <div className="font-medium font-mono">{formatIban(formValues.creditorIban)}</div>
              </div>
              
              {formValues.description && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Concepto</Label>
                  <div className="font-medium">{formValues.description}</div>
                </div>
              )}
            </div>
          )}
          
          {paymentStatus === 'loading' && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          
          {paymentStatus === 'success' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-green-100 p-3 text-green-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>El pago se ha iniciado correctamente.</p>
            </div>
          )}
          
          {paymentStatus === 'error' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-red-100 p-3 text-red-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p>Se produjo un error al procesar el pago.</p>
            </div>
          )}
          
          <AlertDialogFooter>
            {paymentStatus === 'idle' && (
              <>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={executePayment}>Confirmar Pago</AlertDialogAction>
              </>
            )}
            
            {paymentStatus === 'loading' && (
              <AlertDialogCancel disabled>Cancelar</AlertDialogCancel>
            )}
            
            {(paymentStatus === 'success' || paymentStatus === 'error') && (
              <AlertDialogAction onClick={() => {
                setConfirmingPayment(false);
                setPaymentStatus('idle');
              }}>
                Cerrar
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}