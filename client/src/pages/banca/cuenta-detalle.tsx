import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { 
  ArrowUpRight, 
  ArrowDownRight,
  AlertCircle,
  PiggyBank,
  BanknoteIcon,
  CreditCard,
  ChevronLeft,
  Download,
  Filter,
  CalendarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { bankAccountTypeEnum } from "@shared/schema";

// Tipos para los detalles de cuenta bancaria
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
}

interface Transaction {
  id: number;
  date: string;
  amount: number;
  description: string;
  category?: string;
  isExpense: boolean;
  reference?: string;
  status: "pending" | "settled";
}

interface AccountDetail {
  account: BankAccount;
  transactions: Transaction[];
}

export default function CuentaDetalle() {
  const [_, navigate] = useLocation();
  const params = useParams();
  const accountId = params.id;

  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");

  // Consulta para obtener los detalles de la cuenta bancaria
  const { data, isLoading, error } = useQuery<AccountDetail>({
    queryKey: ["/api/banking/accounts", accountId, dateFrom, dateTo],
    enabled: !!accountId,
  });

  // Categorías para filtrado
  const categories = [
    "Alimentación",
    "Transporte",
    "Restaurantes",
    "Servicios",
    "Electrónica",
    "Salud",
    "Ocio",
    "Educación",
    "Ingresos",
    "Transferencias"
  ];

  // Manejo de estado de carga y errores
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error al cargar detalles de la cuenta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No se pudieron cargar los detalles de la cuenta bancaria.
            </p>
            <Button 
              className="mt-4" 
              onClick={() => navigate("/banca/cuentas")}
            >
              Volver a Cuentas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Datos de ejemplo si no hay conexión a la API
  const accountData: AccountDetail = data || {
    account: {
      id: Number(accountId) || 1,
      accountNumber: "1234567890",
      iban: "ES1234567890123456789012",
      name: "Cuenta Corriente Principal",
      type: "checking",
      balance: 5250.75,
      availableBalance: 5250.75,
      currency: "EUR",
      lastUpdated: "2025-03-22T10:30:00Z",
      bankName: "BBVA",
      connectionId: 1
    },
    transactions: [
      {
        id: 1,
        date: "2025-03-24T14:23:00Z",
        amount: -120.50,
        description: "Supermercado El Corte",
        category: "Alimentación",
        isExpense: true,
        reference: "REF123456789",
        status: "settled"
      },
      {
        id: 2,
        date: "2025-03-23T11:45:00Z",
        amount: -35.00,
        description: "Gasolinera Shell",
        category: "Transporte",
        isExpense: true,
        reference: "REF987654321",
        status: "settled"
      },
      {
        id: 3,
        date: "2025-03-22T09:15:00Z",
        amount: 1450.00,
        description: "Transferencia recibida",
        category: "Ingresos",
        isExpense: false,
        reference: "REF456789123",
        status: "settled"
      },
      {
        id: 4,
        date: "2025-03-21T18:30:00Z",
        amount: -78.25,
        description: "Restaurante La Mesa",
        category: "Restaurantes",
        isExpense: true,
        reference: "REF741852963",
        status: "settled"
      },
      {
        id: 5,
        date: "2025-03-20T16:45:00Z",
        amount: -249.99,
        description: "Media Markt",
        category: "Electrónica",
        isExpense: true,
        reference: "REF369258147",
        status: "settled"
      },
      {
        id: 6,
        date: "2025-03-19T10:00:00Z",
        amount: -60.00,
        description: "Netflix",
        category: "Servicios",
        isExpense: true,
        reference: "REF147258369",
        status: "pending"
      },
      {
        id: 7,
        date: "2025-03-18T14:30:00Z",
        amount: -45.00,
        description: "Farmacia Sana",
        category: "Salud",
        isExpense: true,
        reference: "REF258369147",
        status: "settled"
      },
      {
        id: 8,
        date: "2025-03-17T09:00:00Z",
        amount: 750.00,
        description: "Devolución Hacienda",
        category: "Ingresos",
        isExpense: false,
        reference: "REF963852741",
        status: "settled"
      }
    ]
  };

  // Filtrar transacciones
  const filteredTransactions = accountData.transactions.filter(transaction => {
    // Filtro por categoría
    if (categoryFilter && transaction.category !== categoryFilter) {
      return false;
    }
    
    // Filtro por tipo (ingreso/gasto)
    if (typeFilter === "income" && transaction.isExpense) {
      return false;
    }
    if (typeFilter === "expense" && !transaction.isExpense) {
      return false;
    }
    
    // Filtro por fecha
    if (dateFrom || dateTo) {
      const transactionDate = new Date(transaction.date);
      if (dateFrom && transactionDate < dateFrom) {
        return false;
      }
      if (dateTo) {
        const nextDay = new Date(dateTo);
        nextDay.setDate(nextDay.getDate() + 1);
        if (transactionDate >= nextDay) {
          return false;
        }
      }
    }
    
    return true;
  });

  // Calcular estadísticas filtradas
  const totalIncome = filteredTransactions
    .filter(t => !t.isExpense)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = filteredTransactions
    .filter(t => t.isExpense)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
  const balance = totalIncome - totalExpense;

  // Función para formatear números monetarios
  const formatCurrency = (amount: number, currency: string = "EUR") => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency 
    }).format(amount);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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

  return (
    <div className="container mx-auto py-8">
      <div className="flex mb-6">
        <Button variant="outline" onClick={() => navigate("/banca/cuentas")} className="mr-2">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Volver a Cuentas
        </Button>
      </div>

      {/* Detalles de la cuenta */}
      <Card className="mb-8">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center">
                {getAccountIcon(accountData.account.type)}
                <CardTitle className="text-2xl">{accountData.account.name}</CardTitle>
              </div>
              <CardDescription className="mt-1">
                {accountData.account.bankName} - {getAccountTypeName(accountData.account.type)}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-xl font-bold">
                {formatCurrency(accountData.account.balance, accountData.account.currency)}
              </div>
              <div className="text-xs text-muted-foreground">
                IBAN: {accountData.account.iban}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Última actualización</span>
              <span className="font-medium">
                {formatDate(accountData.account.lastUpdated)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Número de cuenta</span>
              <span className="font-medium font-mono">
                {accountData.account.accountNumber}
              </span>
            </div>
            {accountData.account.type === "credit" && (
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Disponible</span>
                <span className="font-medium">
                  {formatCurrency(accountData.account.availableBalance, accountData.account.currency)}
                </span>
                <Progress 
                  value={Math.min(100, (accountData.account.availableBalance / 5000) * 100)} 
                  className="h-2 mt-2" 
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filtros para transacciones */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2 text-primary" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Fecha Desde</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Fecha Hasta</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Categoría</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={undefined as any}>Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo</label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="income">Ingresos</SelectItem>
                  <SelectItem value="expense">Gastos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ArrowUpRight className="h-5 w-5 mr-2 text-success" />
              Ingresos Filtrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(totalIncome, accountData.account.currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ArrowDownRight className="h-5 w-5 mr-2 text-destructive" />
              Gastos Filtrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(totalExpense, accountData.account.currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BanknoteIcon className="h-5 w-5 mr-2 text-primary" />
              Balance Filtrado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(balance, accountData.account.currency)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Transacciones */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transacciones</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableCaption>Transacciones filtradas para la cuenta {accountData.account.name}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Importe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map(transaction => (
                <TableRow key={transaction.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell className="font-medium max-w-[250px] truncate">
                    {transaction.description}
                  </TableCell>
                  <TableCell>
                    {transaction.category || "No categorizado"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {transaction.reference || "-"}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transaction.status === "pending" 
                        ? "bg-warning/20 text-warning" 
                        : "bg-success/20 text-success"
                    }`}>
                      {transaction.status === "pending" ? "Pendiente" : "Liquidado"}
                    </span>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${transaction.isExpense ? 'text-destructive' : 'text-success'}`}>
                    {transaction.isExpense ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount), accountData.account.currency)}
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No se encontraron transacciones con los filtros seleccionados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}