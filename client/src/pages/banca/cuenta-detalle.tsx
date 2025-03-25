import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  RefreshCw, 
  Search, 
  Loader2,
  CreditCard,
  ArrowLeft,
  CalendarIcon,
  CircleDollarSign,
  Download,
  Filter,
  Tag,
  FileText,
  ReceiptIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

interface BankTransaction {
  id: number;
  accountId: number;
  amount: number;
  currency: string;
  transactionDate: string;
  valueDate: string | null;
  description: string;
  category: string | null;
  creditorName: string | null;
  debtorName: string | null;
  status: string;
  invoiceId: number | null;
}

interface CategoryRule {
  id: number;
  companyId: number;
  name: string;
  pattern: string;
  category: string;
  priority: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CuentaDetalle() {
  const params = useParams<{ id: string }>();
  const accountId = parseInt(params.id);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // Estados para filtros
  const [searchFilter, setSearchFilter] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [amountFilter, setAmountFilter] = useState<"all" | "positive" | "negative">("all");
  
  // Estado para el modal de categorización
  const [isCategorizingTransaction, setIsCategorizingTransaction] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  // Estado para el modal de vinculación con factura
  const [isLinkingTransaction, setIsLinkingTransaction] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  
  // Consulta para obtener los detalles de la cuenta
  const accountQuery = useQuery<BankAccount>({
    queryKey: ['/api/banking/accounts', accountId],
    queryFn: async () => {
      const response = await fetch(`/api/banking/accounts/${accountId}/balances`);
      if (!response.ok) {
        throw new Error('Error al cargar los detalles de la cuenta');
      }
      return response.json();
    }
  });
  
  // Consulta para obtener las transacciones de la cuenta
  const transactionsQuery = useQuery<BankTransaction[]>({
    queryKey: ['/api/banking/accounts', accountId, 'transactions', { from: dateRange.from, to: dateRange.to }],
    queryFn: async () => {
      let url = `/api/banking/accounts/${accountId}/transactions`;
      const params = new URLSearchParams();
      
      if (dateRange.from) {
        params.append('dateFrom', dateRange.from.toISOString().split('T')[0]);
      }
      
      if (dateRange.to) {
        params.append('dateTo', dateRange.to.toISOString().split('T')[0]);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al cargar las transacciones');
      }
      return response.json();
    }
  });
  
  // Consulta para obtener las categorías disponibles
  const categoriesQuery = useQuery<CategoryRule[]>({
    queryKey: ['/api/banking/companies', '1', 'category-rules'], // Hardcodeado para demo
    queryFn: async () => {
      const response = await fetch('/api/banking/companies/1/category-rules');
      if (!response.ok) {
        throw new Error('Error al cargar las categorías');
      }
      return response.json();
    }
  });
  
  // Función para actualizar saldo
  const refreshBalance = async () => {
    toast({
      title: "Actualizando saldo",
      description: "Obteniendo el saldo actualizado de la cuenta..."
    });
    
    try {
      await accountQuery.refetch();
      
      toast({
        title: "Saldo actualizado",
        description: "El saldo de la cuenta ha sido actualizado correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el saldo de la cuenta",
        variant: "destructive"
      });
    }
  };
  
  // Función para actualizar transacciones
  const refreshTransactions = async () => {
    toast({
      title: "Actualizando transacciones",
      description: "Obteniendo las transacciones más recientes..."
    });
    
    try {
      await transactionsQuery.refetch();
      
      toast({
        title: "Transacciones actualizadas",
        description: "Las transacciones han sido actualizadas correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar las transacciones",
        variant: "destructive"
      });
    }
  };
  
  // Función para formatear moneda
  const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  // Función para formatear fecha
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    return format(new Date(dateStr), 'dd/MM/yyyy', { locale: es });
  };
  
  // Función para categorizar una transacción
  const handleCategorizeTransaction = (transaction: BankTransaction) => {
    setSelectedTransaction(transaction);
    setSelectedCategory(transaction.category || "");
    setIsCategorizingTransaction(true);
  };
  
  // Función para guardar la categorización
  const saveCategory = async () => {
    if (!selectedTransaction) return;
    
    try {
      const response = await fetch(`/api/banking/transactions/${selectedTransaction.id}/categorize`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: selectedCategory })
      });
      
      if (!response.ok) {
        throw new Error('Error al categorizar la transacción');
      }
      
      // Actualizar la transacción en la lista
      transactionsQuery.refetch();
      
      toast({
        title: "Categoría actualizada",
        description: "La transacción ha sido categorizada correctamente"
      });
      
      setIsCategorizingTransaction(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo categorizar la transacción",
        variant: "destructive"
      });
    }
  };
  
  // Función para vincular una transacción con una factura
  const handleLinkToInvoice = (transaction: BankTransaction) => {
    setSelectedTransaction(transaction);
    setSelectedInvoiceId(transaction.invoiceId?.toString() || "");
    setIsLinkingTransaction(true);
  };
  
  // Función para guardar la vinculación
  const saveLinkToInvoice = async () => {
    if (!selectedTransaction) return;
    
    try {
      const response = await fetch(`/api/banking/transactions/${selectedTransaction.id}/link`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: parseInt(selectedInvoiceId) })
      });
      
      if (!response.ok) {
        throw new Error('Error al vincular la transacción');
      }
      
      // Actualizar la transacción en la lista
      transactionsQuery.refetch();
      
      toast({
        title: "Transacción vinculada",
        description: "La transacción ha sido vinculada correctamente a la factura"
      });
      
      setIsLinkingTransaction(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo vincular la transacción",
        variant: "destructive"
      });
    }
  };
  
  // Filtrar transacciones
  const filteredTransactions = transactionsQuery.data
    ? transactionsQuery.data.filter(transaction => {
        // Filtro de búsqueda
        if (searchFilter && !transaction.description.toLowerCase().includes(searchFilter.toLowerCase())) {
          return false;
        }
        
        // Filtro de categoría
        if (categoryFilter && transaction.category !== categoryFilter) {
          return false;
        }
        
        // Filtro de importe
        if (amountFilter === "positive" && transaction.amount <= 0) {
          return false;
        }
        if (amountFilter === "negative" && transaction.amount >= 0) {
          return false;
        }
        
        return true;
      })
    : [];
  
  // Obtener todas las categorías únicas
  const uniqueCategories = transactionsQuery.data
    ? Array.from(new Set(transactionsQuery.data.map(t => t.category || 'Sin categorizar')))
    : [];
  
  // Si hay un error en alguna de las consultas, mostrar mensaje
  if (accountQuery.error || transactionsQuery.error) {
    return (
      <div className="container mx-auto py-8">
        <Button variant="outline" onClick={() => navigate("/banca/cuentas")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a cuentas
        </Button>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>
              No se pudieron cargar los datos de la cuenta o las transacciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Se produjo un error al cargar la información. Por favor, inténtelo de nuevo.
            </p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => navigate("/banca/cuentas")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a cuentas
      </Button>
      
      {/* Detalles de la cuenta */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle>
                {accountQuery.isLoading ? (
                  <Skeleton className="h-8 w-48" />
                ) : (
                  accountQuery.data?.name
                )}
              </CardTitle>
              <CardDescription>
                {accountQuery.isLoading ? (
                  <Skeleton className="h-4 w-64 mt-1" />
                ) : (
                  <span className="font-mono">{accountQuery.data?.iban}</span>
                )}
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={refreshBalance} disabled={accountQuery.isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${accountQuery.isLoading ? 'animate-spin' : ''}`} />
                Actualizar saldo
              </Button>
              
              <Button onClick={() => navigate(`/banca/pagos?accountId=${accountId}`)}>
                <CircleDollarSign className="mr-2 h-4 w-4" /> Iniciar pago
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Saldo actual</CardTitle>
              </CardHeader>
              <CardContent>
                {accountQuery.isLoading ? (
                  <Skeleton className="h-6 w-32" />
                ) : (
                  <div className="text-2xl font-bold">
                    {formatCurrency(accountQuery.data?.balance || 0, accountQuery.data?.currency)}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Saldo disponible</CardTitle>
              </CardHeader>
              <CardContent>
                {accountQuery.isLoading ? (
                  <Skeleton className="h-6 w-32" />
                ) : (
                  <div className="text-2xl font-bold">
                    {formatCurrency(accountQuery.data?.availableBalance || accountQuery.data?.balance || 0, accountQuery.data?.currency)}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Última actualización</CardTitle>
              </CardHeader>
              <CardContent>
                {accountQuery.isLoading ? (
                  <Skeleton className="h-6 w-32" />
                ) : (
                  <div className="text-lg">
                    {accountQuery.data?.lastSyncAt 
                      ? new Date(accountQuery.data.lastSyncAt).toLocaleString() 
                      : 'Nunca'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      {/* Filtros de transacciones */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre las transacciones por diferentes criterios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search" className="mb-2 block">Búsqueda</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Buscar en descripciones..."
                  className="pl-8"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label className="mb-2 block">Rango de fechas</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                          {format(dateRange.to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      <span>Seleccione un rango</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(selectedRange) => {
                      if (selectedRange) {
                        setDateRange({
                          from: selectedRange.from,
                          to: selectedRange.to,
                        });
                      }
                    }}
                    numberOfMonths={2}
                  />
                  <div className="flex items-center justify-between px-4 pb-4">
                    <Button variant="outline" size="sm" onClick={() => setDateRange({ from: undefined, to: undefined })}>
                      Limpiar
                    </Button>
                    <Button size="sm" onClick={() => transactionsQuery.refetch()}>
                      Aplicar
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="category" className="mb-2 block">Categoría</Label>
              <Select value={categoryFilter || ''} onValueChange={(value) => setCategoryFilter(value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las categorías</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="amount" className="mb-2 block">Importe</Label>
              <Select value={amountFilter} onValueChange={(value: "all" | "positive" | "negative") => setAmountFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los importes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los importes</SelectItem>
                  <SelectItem value="positive">Solo ingresos</SelectItem>
                  <SelectItem value="negative">Solo gastos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => {
            setSearchFilter("");
            setDateRange({ from: undefined, to: undefined });
            setCategoryFilter(null);
            setAmountFilter("all");
          }}>
            Limpiar filtros
          </Button>
          
          <Button onClick={refreshTransactions}>
            <RefreshCw className={`mr-2 h-4 w-4 ${transactionsQuery.isLoading ? 'animate-spin' : ''}`} />
            Actualizar transacciones
          </Button>
        </CardFooter>
      </Card>
      
      {/* Listado de transacciones */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones</CardTitle>
          <CardDescription>
            {transactionsQuery.isLoading ? (
              <Skeleton className="h-4 w-48" />
            ) : (
              `${filteredTransactions.length} transacciones encontradas`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsQuery.isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <Skeleton className="h-5 w-48 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>No se encontraron transacciones que coincidan con los filtros aplicados.</p>
              <Button variant="outline" onClick={() => {
                setSearchFilter("");
                setDateRange({ from: undefined, to: undefined });
                setCategoryFilter(null);
                setAmountFilter("all");
              }} className="mt-4">
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="w-[300px]">Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell>
                        {transaction.category ? (
                          <Badge variant="outline">
                            <Tag className="mr-1 h-3 w-3" />
                            {transaction.category}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Sin categorizar</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <span className="sr-only">Abrir menú</span>
                              <Filter className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleCategorizeTransaction(transaction)}>
                              <Tag className="mr-2 h-4 w-4" /> Categorizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleLinkToInvoice(transaction)}>
                              <FileText className="mr-2 h-4 w-4" /> Vincular a factura
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredTransactions.length} de {transactionsQuery.data?.length || 0} transacciones
          </div>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
        </CardFooter>
      </Card>
      
      {/* Modal para categorizar transacción */}
      <Dialog open={isCategorizingTransaction} onOpenChange={setIsCategorizingTransaction}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Categorizar transacción</DialogTitle>
            <DialogDescription>
              Seleccione una categoría para esta transacción
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="transaction-desc">Descripción</Label>
              <Input
                id="transaction-desc"
                value={selectedTransaction?.description || ""}
                readOnly
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transaction-amount">Importe</Label>
              <Input
                id="transaction-amount"
                value={selectedTransaction ? formatCurrency(selectedTransaction.amount, selectedTransaction.currency) : ""}
                readOnly
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sin categorizar">Sin categorizar</SelectItem>
                  {categoriesQuery.data?.map((rule) => (
                    <SelectItem key={rule.id} value={rule.category}>{rule.category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategorizingTransaction(false)}>
              Cancelar
            </Button>
            <Button onClick={saveCategory} disabled={!selectedCategory}>
              Guardar categoría
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal para vincular a factura */}
      <Dialog open={isLinkingTransaction} onOpenChange={setIsLinkingTransaction}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular a factura</DialogTitle>
            <DialogDescription>
              Vincule esta transacción a una factura existente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="transaction-desc">Descripción</Label>
              <Input
                id="transaction-desc"
                value={selectedTransaction?.description || ""}
                readOnly
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transaction-amount">Importe</Label>
              <Input
                id="transaction-amount"
                value={selectedTransaction ? formatCurrency(selectedTransaction.amount, selectedTransaction.currency) : ""}
                readOnly
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invoice-id">ID de Factura</Label>
              <Input
                id="invoice-id"
                type="number"
                placeholder="Introduzca el ID de la factura"
                value={selectedInvoiceId}
                onChange={(e) => setSelectedInvoiceId(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkingTransaction(false)}>
              Cancelar
            </Button>
            <Button onClick={saveLinkToInvoice} disabled={!selectedInvoiceId}>
              Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}