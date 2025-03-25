import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BanknoteIcon,
  CreditCard,
  PiggyBank,
  Download,
  ChevronLeft,
  Filter,
  Search,
  Calendar,
  Copy,
  Landmark,
  ArrowDownRight,
  ArrowUpRight,
  MoreHorizontal,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange, DateRange } from "@/components/ui/date-range-picker";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { bankAccountTypeEnum, bankTransactionTypeEnum } from "@shared/schema";
import { addDays, format, subDays, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

// Interfaces para los datos bancarios
interface BankAccount {
  id: number;
  accountNumber: string;
  iban: string;
  name: string;
  type: typeof bankAccountTypeEnum.enumValues[number];
  balance: number;
  availableBalance: number;
  currency: string;
  lastUpdated: string;
  bankName: string;
  connectionId: number;
  swift?: string;
  holderName?: string;
  openDate?: string;
}

interface Transaction {
  id: number;
  accountId: number;
  date: string;
  valueDate: string;
  amount: number;
  description: string;
  category?: string;
  reference?: string;
  status: "pending" | "settled";
  type: typeof bankTransactionTypeEnum.enumValues[number];
  counterparty?: string;
  balance?: number;
  notes?: string;
}



// Vista de detalle de cuenta bancaria
export default function CuentaDetalle() {
  const [_, navigate] = useLocation();
  const params = useParams();
  const accountId = parseInt(params.id || "0");
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subMonths(new Date(), 1),
    to: new Date()
  });

  // Consulta para obtener los datos de la cuenta
  const { data: account, isLoading: isLoadingAccount } = useQuery<BankAccount>({
    queryKey: [`/api/banking/accounts/${accountId}`],
    enabled: !isNaN(accountId),
  });

  // Consulta para obtener las transacciones de la cuenta
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: [
      `/api/banking/accounts/${accountId}/transactions`, 
      dateRange.from, 
      dateRange.to
    ],
    enabled: !isNaN(accountId),
  });

  // Manejo de estado de carga
  if (isLoadingAccount || isLoadingTransactions) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Si no se encuentra el ID o hay error
  if (isNaN(accountId)) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Cuenta no encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No se ha podido encontrar la cuenta bancaria solicitada.</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate("/banca/cuentas")}
            >
              Ver todas las cuentas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Datos de ejemplo si no hay conexión a la API
  const accountData: BankAccount = account || {
    id: 1,
    accountNumber: "1234567890",
    iban: "ES1234567890123456789012",
    name: "Cuenta Corriente Principal",
    type: "checking",
    balance: 5250.75,
    availableBalance: 5250.75,
    currency: "EUR",
    lastUpdated: "2025-03-22T10:30:00Z",
    bankName: "BBVA",
    connectionId: 1,
    swift: "BBVAESMM",
    holderName: "Restaurante Ejemplo, S.L.",
    openDate: "2020-01-15T00:00:00Z"
  };

  // Transacciones de ejemplo si no hay conexión a la API
  const transactionData: Transaction[] = transactions || [
    {
      id: 1,
      accountId: 1,
      date: "2025-03-24T14:23:00Z",
      valueDate: "2025-03-24T00:00:00Z",
      amount: -120.50,
      description: "Supermercado El Corte",
      category: "Alimentación",
      reference: "REF123456789",
      status: "settled",
      type: "payment",
      counterparty: "Supermercado El Corte",
      balance: 5250.75
    },
    {
      id: 2,
      accountId: 1,
      date: "2025-03-23T11:45:00Z",
      valueDate: "2025-03-23T00:00:00Z",
      amount: -35.00,
      description: "Gasolinera Shell",
      category: "Transporte",
      reference: "REF987654321",
      status: "settled",
      type: "payment",
      counterparty: "Gasolinera Shell",
      balance: 5371.25
    },
    {
      id: 3,
      accountId: 1,
      date: "2025-03-22T09:15:00Z",
      valueDate: "2025-03-22T00:00:00Z",
      amount: 1450.00,
      description: "Transferencia recibida",
      category: "Ingresos",
      reference: "REF456789123",
      status: "settled",
      type: "transfer",
      counterparty: "Cliente Fidelidad",
      balance: 5406.25,
      notes: "Pago por evento catering"
    },
    {
      id: 4,
      accountId: 1,
      date: "2025-03-21T18:30:00Z",
      valueDate: "2025-03-21T00:00:00Z",
      amount: -78.25,
      description: "Restaurante La Mesa",
      category: "Restaurantes",
      reference: "REF741852963",
      status: "settled",
      type: "payment",
      counterparty: "Restaurante La Mesa",
      balance: 3956.25
    },
    {
      id: 5,
      accountId: 1,
      date: "2025-03-20T16:45:00Z",
      valueDate: "2025-03-20T00:00:00Z",
      amount: -249.99,
      description: "Media Markt",
      category: "Electrónica",
      reference: "REF369258147",
      status: "settled",
      type: "payment",
      counterparty: "Media Markt",
      balance: 4034.50
    },
    {
      id: 6,
      accountId: 1,
      date: "2025-03-18T12:30:00Z",
      valueDate: "2025-03-18T00:00:00Z",
      amount: -15.99,
      description: "Suscripción mensual",
      category: "Servicios",
      reference: "REFSUB123456",
      status: "settled",
      type: "fee",
      counterparty: "BBVA",
      balance: 4284.49
    },
    {
      id: 7,
      accountId: 1,
      date: "2025-03-15T09:00:00Z",
      valueDate: "2025-03-15T00:00:00Z",
      amount: 2500.00,
      description: "Transferencia recibida",
      category: "Ingresos",
      reference: "REF753159852",
      status: "settled",
      type: "transfer",
      counterparty: "Cliente Corporativo",
      balance: 4300.48,
      notes: "Contrato de servicios mensuales"
    },
    {
      id: 8,
      accountId: 1,
      date: "2025-03-10T14:00:00Z",
      valueDate: "2025-03-10T00:00:00Z",
      amount: -350.00,
      description: "Alquiler local",
      category: "Instalaciones",
      reference: "REFALQ202502",
      status: "settled",
      type: "payment",
      counterparty: "Inmobiliaria Central",
      balance: 1800.48
    },
    {
      id: 9,
      accountId: 1,
      date: "2025-03-05T10:45:00Z",
      valueDate: "2025-03-05T00:00:00Z",
      amount: -1200.00,
      description: "Nóminas personal",
      category: "Personal",
      reference: "REFNOM202502",
      status: "settled",
      type: "payment",
      counterparty: "Varios",
      balance: 2150.48
    },
    {
      id: 10,
      accountId: 1,
      date: "2025-03-01T09:30:00Z",
      valueDate: "2025-03-01T00:00:00Z",
      amount: 1500.00,
      description: "Transferencia recibida",
      category: "Ingresos",
      reference: "REF963852741",
      status: "settled",
      type: "transfer",
      counterparty: "Cliente Particular",
      balance: 3350.48
    }
  ];

  // Formateo de fecha
  const formatDate = (dateString: string, includeTime = true) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...(includeTime && { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }).format(date);
  };

  // Función para formatear números monetarios
  const formatCurrency = (amount: number, currency: string = "EUR") => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency 
    }).format(amount);
  };

  // Función para copiar texto al portapapeles
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        description: message,
      });
    });
  };

  // Función para obtener el ícono según el tipo de cuenta
  const getAccountIcon = (type: typeof bankAccountTypeEnum.enumValues[number]) => {
    switch (type) {
      case "checking":
        return <BanknoteIcon className="h-5 w-5 mr-2 text-primary" />;
      case "savings":
        return <PiggyBank className="h-5 w-5 mr-2 text-primary" />;
      case "credit":
        return <CreditCard className="h-5 w-5 mr-2 text-primary" />;
      default:
        return <BanknoteIcon className="h-5 w-5 mr-2 text-primary" />;
    }
  };

  // Función para obtener el nombre en español del tipo de cuenta
  const getAccountTypeName = (type: typeof bankAccountTypeEnum.enumValues[number]) => {
    switch (type) {
      case "checking":
        return "Cuenta Corriente";
      case "savings":
        return "Cuenta de Ahorro";
      case "credit":
        return "Tarjeta de Crédito";
      default:
        return "Cuenta";
    }
  };

  // Función para obtener el nombre en español del tipo de transacción
  const getTransactionTypeName = (type: typeof bankTransactionTypeEnum.enumValues[number]) => {
    switch (type) {
      case "payment":
        return "Pago";
      case "charge":
        return "Cargo";
      case "transfer":
        return "Transferencia";
      case "deposit":
        return "Depósito";
      case "withdrawal":
        return "Retirada";
      case "fee":
        return "Comisión";
      default:
        return "Transacción";
    }
  };

  // Filtrar transacciones
  const filteredTransactions = transactionData
    .filter(transaction => {
      // Filtro de búsqueda
      if (searchQuery && !transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !transaction.reference?.includes(searchQuery) &&
          !transaction.counterparty?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filtro por categoría
      if (categoryFilter && transaction.category !== categoryFilter) {
        return false;
      }
      
      // Filtro por tipo
      if (typeFilter && transaction.type !== typeFilter) {
        return false;
      }
      
      // Filtro por fecha
      const txDate = new Date(transaction.date);
      if (dateRange.from && txDate < dateRange.from) {
        return false;
      }
      if (dateRange.to && txDate > dateRange.to) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calcular ingresos y gastos para el período
  const periodIncome = filteredTransactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  const periodExpense = filteredTransactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  // Obtener categorías únicas para filtros
  const uniqueCategories = Array.from(
    new Set(transactionData.map(tx => tx.category).filter(Boolean))
  );

  return (
    <div className="container mx-auto py-8">
      {/* Cabecera */}
      <div className="flex mb-6">
        <Button variant="outline" onClick={() => navigate("/banca/cuentas")} className="mr-2">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Volver a Cuentas
        </Button>
        <Button variant="outline" onClick={() => navigate(`/banca/cuenta/${accountId}/movimientos`)} className="mr-2">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
        <Button>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Detalle de Cuenta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getAccountIcon(accountData.type)}
                  <CardTitle>{accountData.name}</CardTitle>
                </div>
                <Badge>{getAccountTypeName(accountData.type)}</Badge>
              </div>
              <CardDescription className="flex items-center">
                <Landmark className="h-4 w-4 mr-1" />
                {accountData.bankName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">IBAN</div>
                  <div className="flex items-center gap-1 font-mono">
                    {accountData.iban}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5" 
                            onClick={() => copyToClipboard(accountData.iban, "IBAN copiado al portapapeles")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copiar IBAN</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                {accountData.swift && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">SWIFT/BIC</div>
                    <div className="flex items-center gap-1 font-mono">
                      {accountData.swift}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5" 
                              onClick={() => copyToClipboard(accountData.swift!, "SWIFT copiado al portapapeles")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copiar SWIFT</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Número de cuenta</div>
                  <div className="font-mono">{accountData.accountNumber}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Saldo actual</div>
                  <div className={`text-2xl font-bold ${accountData.balance < 0 ? 'text-red-600' : ''}`}>
                    {formatCurrency(accountData.balance, accountData.currency)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Actualizado: {formatDate(accountData.lastUpdated)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Disponible</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(accountData.availableBalance, accountData.currency)}
                  </div>
                  {accountData.type === "credit" && (
                    <div className="text-xs text-muted-foreground">
                      Límite: {formatCurrency(accountData.availableBalance + Math.abs(accountData.balance), accountData.currency)}
                    </div>
                  )}
                </div>
              </div>
              
              {accountData.holderName && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-muted-foreground">Titular</div>
                  <div>{accountData.holderName}</div>
                </div>
              )}
              
              {accountData.openDate && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Fecha de apertura</div>
                  <div>{formatDate(accountData.openDate, false)}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Período</CardTitle>
              <CardDescription>
                {format(dateRange.from, "d MMM", { locale: es })} - {dateRange.to ? format(dateRange.to, "d MMM", { locale: es }) : "Hoy"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-muted-foreground">Ingresos</span>
                    <span className="text-sm font-medium text-green-600">{formatCurrency(periodIncome)}</span>
                  </div>
                  <Progress value={periodIncome > 0 ? (periodIncome / (periodIncome + periodExpense)) * 100 : 0} className="h-2 bg-slate-200" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-muted-foreground">Gastos</span>
                    <span className="text-sm font-medium text-red-600">{formatCurrency(periodExpense)}</span>
                  </div>
                  <Progress value={periodExpense > 0 ? (periodExpense / (periodIncome + periodExpense)) * 100 : 0} className="h-2 bg-slate-200" />
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="font-medium">Balance</span>
                    <span className={`font-medium ${periodIncome - periodExpense < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(periodIncome - periodExpense)}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {periodIncome - periodExpense >= 0 ? (
                      <>
                        <ArrowUpRight className="h-3 w-3 mr-1 text-green-600" />
                        <span>Saldo positivo en el período</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-3 w-3 mr-1 text-red-600" />
                        <span>Saldo negativo en el período</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <DatePickerWithRange
                className="w-full"
                date={dateRange}
                setDate={setDateRange}
              />
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Lista de Transacciones */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Movimientos</CardTitle>
              <CardDescription>
                {filteredTransactions.length} transacciones encontradas
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar transacciones..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filtros</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <div className="p-2">
                    <div className="mb-2 text-sm font-medium">Categoría</div>
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas las categorías</SelectItem>
                        {uniqueCategories.map((category) => (
                          <SelectItem key={category} value={category!}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="p-2">
                    <div className="mb-2 text-sm font-medium">Tipo</div>
                    <Select
                      value={typeFilter}
                      onValueChange={setTypeFilter}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los tipos</SelectItem>
                        {bankTransactionTypeEnum.enumValues.map((type) => (
                          <SelectItem key={type} value={type}>{getTransactionTypeName(type)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setCategoryFilter("");
                      setTypeFilter("");
                      setSearchQuery("");
                      setDateRange({
                        from: subMonths(new Date(), 1),
                        to: new Date()
                      });
                    }}
                  >
                    Limpiar filtros
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Importe</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No se encontraron transacciones con los filtros actuales
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium">{formatDate(transaction.date, false)}</div>
                      <div className="text-xs text-muted-foreground">Val: {formatDate(transaction.valueDate, false)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{transaction.description}</div>
                      {transaction.counterparty && (
                        <div className="text-xs text-muted-foreground">{transaction.counterparty}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.reference && (
                        <div className="text-xs font-mono">{transaction.reference}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.category ? (
                        <Badge variant="outline">{transaction.category}</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Sin categoría</Badge>
                      )}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(transaction.amount, accountData.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.balance !== undefined ? (
                        <div className={`font-medium ${transaction.balance < 0 ? 'text-red-600' : ''}`}>
                          {formatCurrency(transaction.balance, accountData.currency)}
                        </div>
                      ) : (
                        <div className="text-muted-foreground">-</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            // Mostrar detalles
                            toast({
                              title: "Detalles",
                              description: "Mostrando detalles de la transacción"
                            });
                          }}>
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            // Categorizar
                            toast({
                              title: "Categorizar",
                              description: "Categorizando transacción"
                            });
                          }}>
                            Categorizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            // Añadir nota
                            toast({
                              title: "Añadir nota",
                              description: "Añadiendo nota a la transacción"
                            });
                          }}>
                            Añadir nota
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredTransactions.length} de {transactionData.length} transacciones
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            // Cargar más
            toast({
              title: "Cargar más",
              description: "Cargando más transacciones"
            });
          }}>
            Cargar más
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}