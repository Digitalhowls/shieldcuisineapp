import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { 
  PiggyBank,
  CreditCard,
  ChevronLeft,
  RefreshCw,
  BanknoteIcon,
  Download,
  Filter,
  Calendar,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Landmark,
  CalendarRange,
  Copy,
  LineChart,
  Clock,
  Share,
  Pencil,
  MoreHorizontal
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

type DateRange = {
  from: Date;
  to?: Date;
}

// Vista de detalle de cuenta bancaria
export default function CuentaDetalle() {
  const [_, navigate] = useLocation();
  const params = useParams();
  const accountId = parseInt(params.id);
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
              
              <div className="flex flex-col md:flex-row justify-between gap-4">
                {accountData.holderName && (
                  <div>
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
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Última actualización</div>
                  <div>{formatDate(accountData.lastUpdated)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${accountData.balance < 0 ? 'text-destructive' : ''}`}>
                {formatCurrency(accountData.balance, accountData.currency)}
              </div>
              
              {accountData.type === "credit" && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Límite disponible</span>
                    <span>{formatCurrency(accountData.availableBalance, accountData.currency)}</span>
                  </div>
                  <Progress 
                    value={Math.min(100, (accountData.availableBalance / 5000) * 100)} 
                    className="h-2" 
                  />
                </div>
              )}
              
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => navigate("/banca/transferencia")}>
                  <Share className="h-4 w-4 mr-2" />
                  Transferir
                </Button>
                <Button variant="outline" onClick={() => navigate(`/banca/cuenta/${accountId}/editar`)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resumen del período seleccionado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CalendarRange className="h-5 w-5 mr-2 text-primary" />
              Período seleccionado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <DatePickerWithRange 
                date={dateRange} 
                setDate={setDateRange} 
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setDateRange({
                    from: subDays(new Date(), 7),
                    to: new Date()
                  })}
                >
                  7D
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setDateRange({
                    from: subDays(new Date(), 30),
                    to: new Date()
                  })}
                >
                  1M
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setDateRange({
                    from: subDays(new Date(), 90),
                    to: new Date()
                  })}
                >
                  3M
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ArrowUpRight className="h-5 w-5 mr-2 text-success" />
              Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(periodIncome, accountData.currency)}
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredTransactions.filter(tx => tx.amount > 0).length} transacciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ArrowDownRight className="h-5 w-5 mr-2 text-destructive" />
              Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(periodExpense, accountData.currency)}
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredTransactions.filter(tx => tx.amount < 0).length} transacciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros de transacciones */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar en transacciones..." 
            className="pl-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las categorías</SelectItem>
              {uniqueCategories.map(category => (
                <SelectItem key={category} value={category as string}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Clock className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los tipos</SelectItem>
              <SelectItem value="payment">Pagos</SelectItem>
              <SelectItem value="charge">Cargos</SelectItem>
              <SelectItem value="transfer">Transferencias</SelectItem>
              <SelectItem value="deposit">Depósitos</SelectItem>
              <SelectItem value="withdrawal">Retiradas</SelectItem>
              <SelectItem value="fee">Comisiones</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transacciones */}
      <Tabs defaultValue="list" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="chart">Gráfico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Movimientos</CardTitle>
              <CardDescription>
                Mostrando {filteredTransactions.length} transacciones
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map(transaction => (
                    <TableRow key={transaction.id} className="group">
                      <TableCell className="text-xs">
                        <div>{formatDate(transaction.date, false)}</div>
                        <div className="text-muted-foreground">Valor: {formatDate(transaction.valueDate, false)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{transaction.description}</div>
                        {transaction.counterparty && (
                          <div className="text-xs text-muted-foreground">{transaction.counterparty}</div>
                        )}
                        {transaction.reference && (
                          <div className="text-xs font-mono text-muted-foreground">Ref: {transaction.reference}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction.category ? (
                          <Badge variant="outline">{transaction.category}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground bg-muted">Sin categoría</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getTransactionTypeName(transaction.type)}</Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${transaction.amount < 0 ? 'text-destructive' : 'text-success'}`}>
                        {transaction.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount), accountData.currency)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {transaction.balance !== undefined && 
                          formatCurrency(transaction.balance, accountData.currency)
                        }
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              Categorizar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Añadir notas
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Exportar detalle
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Balance inicial: {
                  filteredTransactions.length > 0 && filteredTransactions[filteredTransactions.length - 1].balance !== undefined ? 
                  formatCurrency(
                    (filteredTransactions[filteredTransactions.length - 1].balance || 0) - 
                    (filteredTransactions[filteredTransactions.length - 1].amount || 0), 
                    accountData.currency
                  ) : 
                  "N/A"
                }
              </div>
              <div className="text-sm">
                Balance final: {
                  filteredTransactions.length > 0 && filteredTransactions[0].balance !== undefined ? 
                  formatCurrency(filteredTransactions[0].balance || 0, accountData.currency) : 
                  "N/A"
                }
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <LineChart className="h-5 w-5 mr-2 text-primary" />
                Evolución del saldo
              </CardTitle>
              <CardDescription>
                Gráfico de movimientos en el período seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <LineChart className="h-16 w-16 mx-auto mb-4 text-muted" />
                <p>La visualización gráfica estará disponible próximamente</p>
                <p className="text-sm">Utilice la vista de lista para ver el detalle de transacciones</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}