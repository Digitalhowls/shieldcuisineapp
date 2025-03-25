import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell
} from "recharts";
import {
  BanknoteIcon,
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Plus,
  Settings,
  RefreshCw
} from "lucide-react";
import { bankAccountTypeEnum, bankTransactionTypeEnum } from "@shared/schema";

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
}

interface Transaction {
  id: number;
  accountId: number;
  date: string;
  amount: number;
  description: string;
  category?: string;
  type: typeof bankTransactionTypeEnum.enumValues[number];
}

interface MonthlyBalance {
  month: string;
  balance: number;
}

export default function Dashboard() {
  const [_, navigate] = useLocation();

  // Consulta para obtener cuentas bancarias
  const { data: accounts, isLoading: isLoadingAccounts } = useQuery<BankAccount[]>({
    queryKey: ['/api/banking/accounts'],
  });

  // Consulta para obtener transacciones recientes
  const { data: recentTransactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/banking/transactions/recent'],
  });

  // Consulta para obtener balances mensuales
  const { data: monthlyBalances, isLoading: isLoadingBalances } = useQuery<MonthlyBalance[]>({
    queryKey: ['/api/banking/balances/monthly'],
  });

  // Manejo de estado de carga
  if (isLoadingAccounts || isLoadingTransactions || isLoadingBalances) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Datos de ejemplo si no hay conexión a la API
  const accountsData: BankAccount[] = accounts || [
    {
      id: 1,
      accountNumber: "1234567890",
      iban: "ES1234567890123456789012",
      name: "Cuenta Corriente Principal",
      type: "checking",
      balance: 5250.75,
      availableBalance: 5250.75,
      currency: "EUR",
      lastUpdated: "2025-03-22T10:30:00Z",
      bankName: "BBVA"
    },
    {
      id: 2,
      accountNumber: "9876543210",
      iban: "ES9876543210987654321098",
      name: "Cuenta de Ahorro",
      type: "savings",
      balance: 12500.00,
      availableBalance: 12500.00,
      currency: "EUR",
      lastUpdated: "2025-03-22T10:30:00Z",
      bankName: "Santander"
    },
    {
      id: 3,
      accountNumber: "5432167890",
      iban: "ES5432167890543216789054",
      name: "Tarjeta de Crédito Empresarial",
      type: "credit",
      balance: -1250.30,
      availableBalance: 3749.70,
      currency: "EUR",
      lastUpdated: "2025-03-22T10:30:00Z",
      bankName: "CaixaBank"
    }
  ];

  const transactionsData: Transaction[] = recentTransactions || [
    {
      id: 1,
      accountId: 1,
      date: "2025-03-24T14:23:00Z",
      amount: -120.50,
      description: "Supermercado El Corte",
      category: "Alimentación",
      type: "payment"
    },
    {
      id: 2,
      accountId: 1,
      date: "2025-03-23T11:45:00Z",
      amount: -35.00,
      description: "Gasolinera Shell",
      category: "Transporte",
      type: "payment"
    },
    {
      id: 3,
      accountId: 2,
      date: "2025-03-22T09:15:00Z",
      amount: 1450.00,
      description: "Transferencia recibida",
      category: "Ingresos",
      type: "transfer"
    },
    {
      id: 4,
      accountId: 3,
      date: "2025-03-21T18:30:00Z",
      amount: -78.25,
      description: "Restaurante La Mesa",
      category: "Restaurantes",
      type: "payment"
    },
    {
      id: 5,
      accountId: 1,
      date: "2025-03-20T16:45:00Z",
      amount: -249.99,
      description: "Media Markt",
      category: "Electrónica",
      type: "payment"
    }
  ];

  const balancesData: MonthlyBalance[] = monthlyBalances || [
    { month: "Ene", balance: 3500 },
    { month: "Feb", balance: 3800 },
    { month: "Mar", balance: 4200 },
    { month: "Abr", balance: 4100 },
    { month: "May", balance: 4500 },
    { month: "Jun", balance: 4700 },
    { month: "Jul", balance: 5100 },
    { month: "Ago", balance: 5250 },
    { month: "Sep", balance: 5350 },
    { month: "Oct", balance: 5500 },
    { month: "Nov", balance: 5200 },
    { month: "Dic", balance: 5750 }
  ];

  // Cálculos para el dashboard
  const totalBalance = accountsData.reduce((sum, account) => sum + account.balance, 0);
  const incomingTransactions = transactionsData.filter(tx => tx.amount > 0);
  const outgoingTransactions = transactionsData.filter(tx => tx.amount < 0);
  const totalIncoming = incomingTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalOutgoing = outgoingTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  // Datos para gráfico circular de gastos por categoría
  const expensesByCategory = outgoingTransactions.reduce((acc, tx) => {
    const category = tx.category || "Otros";
    acc[category] = (acc[category] || 0) + Math.abs(tx.amount);
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value
  }));

  // Colores para el gráfico circular
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

  // Formateo de moneda
  const formatCurrency = (amount: number, currency: string = "EUR") => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency 
    }).format(amount);
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

  // Formateo de fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard Bancario</h1>
        <div>
          <Button variant="outline" className="mr-2" onClick={() => navigate("/banca/cuentas")}>
            <Plus className="h-4 w-4 mr-2" />
            Ver Cuentas
          </Button>
          <Button variant="outline" className="mr-2">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => navigate("/banca/configuracion")}>
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
        </div>
      </div>

      {/* Resumen de balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Balance Total</CardTitle>
            <CardDescription>En todas las cuentas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" onClick={() => navigate("/banca/cuentas")}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar balances
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Ingresos</CardTitle>
            <CardDescription>Últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncoming)}</div>
            <div className="flex items-center text-sm text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>{incomingTransactions.length} transacciones</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" onClick={() => navigate("/banca/configuracion/categorias")}>
              Gestionar categorías
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Gastos</CardTitle>
            <CardDescription>Últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOutgoing)}</div>
            <div className="flex items-center text-sm text-red-600">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              <span>{outgoingTransactions.length} transacciones</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" onClick={() => navigate("/banca/configuracion/reglas")}>
              Reglas de categorización
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Gráficos y tablas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolución de Balances</CardTitle>
            <CardDescription>Tendencia de los últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={balancesData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoría</CardTitle>
            <CardDescription>Distribución de gastos recientes</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cuentas y transacciones recientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cuentas Bancarias</CardTitle>
            <CardDescription>Listado de cuentas activas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accountsData.map((account) => (
                <div 
                  key={account.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                  onClick={() => navigate(`/banca/cuenta/${account.id}`)}
                >
                  <div className="flex items-center">
                    {getAccountIcon(account.type)}
                    <div>
                      <div className="font-medium">{account.name}</div>
                      <div className="text-sm text-muted-foreground">{account.bankName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${account.balance < 0 ? 'text-red-600' : ''}`}>
                      {formatCurrency(account.balance, account.currency)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {account.iban.substring(0, 6)}...{account.iban.substring(account.iban.length - 4)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate("/banca/cuentas")}>
              Ver Todas las Cuentas
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transacciones Recientes</CardTitle>
            <CardDescription>Últimas operaciones en todas las cuentas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactionsData.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                  onClick={() => navigate(`/banca/cuenta/${transaction.accountId}?tx=${transaction.id}`)}
                >
                  <div className="flex items-center">
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(transaction.date)} • 
                        {transaction.category && <span className="ml-1">{transaction.category}</span>}
                      </div>
                    </div>
                  </div>
                  <div className={`font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => {}}>
              Ver Más Transacciones
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}