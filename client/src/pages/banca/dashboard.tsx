import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  ArrowUpRight, 
  ArrowDownRight,
  AlertCircle,
  PiggyBank,
  PlusCircle,
  CreditCard,
  ChevronRight,
  RefreshCw,
  BanknoteIcon,
  LineChart,
  BarChart,
  PieChart,
  Settings,
  Landmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bankAccountTypeEnum } from "@shared/schema";

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

interface BankConnection {
  id: number;
  companyId: number;
  bankName: string;
  apiUrl: string;
  status: "received" | "valid" | "rejected" | "revoked" | "expired";
  consentId: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  description?: string;
}

interface BankingDashboard {
  accounts: BankAccount[];
  recentTransactions: Transaction[];
  connections: BankConnection[];
  summary: {
    totalBalance: number;
    totalIncome: number;
    totalExpense: number;
    currency: string;
    transactionsLastMonth: number;
    categorySummary: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
  };
}

export default function BancaDashboard() {
  const [_, navigate] = useLocation();

  // Consulta para obtener los datos del dashboard bancario
  const { data, isLoading, error } = useQuery<BankingDashboard>({
    queryKey: ["/api/banking/companies/1/dashboard"],
    enabled: true,
  });

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
              Error al cargar datos bancarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No se pudieron cargar los datos bancarios. Es posible que necesite configurar sus conexiones bancarias primero.
            </p>
            <Button 
              className="mt-4" 
              onClick={() => navigate("/banca/configuracion")}
            >
              Configurar Conexiones Bancarias
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Datos de ejemplo si no hay conexión a la API
  const dashboardData: BankingDashboard = data || {
    accounts: [
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
        bankName: "BBVA",
        connectionId: 1
      },
      {
        id: 2,
        accountNumber: "0987654321",
        iban: "ES0987654321098765432109",
        name: "Cuenta de Ahorro",
        type: "savings",
        balance: 12500.00,
        availableBalance: 12500.00,
        currency: "EUR",
        lastUpdated: "2025-03-22T10:30:00Z",
        bankName: "Santander",
        connectionId: 2
      },
      {
        id: 3,
        accountNumber: "5678901234",
        iban: "ES5678901234567890123456",
        name: "Tarjeta de Crédito",
        type: "credit",
        balance: -1230.45,
        availableBalance: 3769.55,
        currency: "EUR",
        lastUpdated: "2025-03-22T10:30:00Z",
        bankName: "CaixaBank",
        connectionId: 1
      }
    ],
    recentTransactions: [
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
      }
    ],
    connections: [
      {
        id: 1,
        companyId: 1,
        bankName: "BBVA",
        apiUrl: "https://api.bbva.com/psd2",
        status: "valid",
        consentId: "consent-12345-bbva",
        createdAt: "2025-03-01T10:00:00Z",
        updatedAt: "2025-03-01T10:00:00Z",
        expiresAt: "2025-06-01T10:00:00Z",
        description: "Conexión principal para cuentas corporativas"
      },
      {
        id: 2,
        companyId: 1,
        bankName: "Santander",
        apiUrl: "https://api.santander.com/psd2",
        status: "valid",
        consentId: "consent-67890-santander",
        createdAt: "2025-03-05T15:30:00Z",
        updatedAt: "2025-03-05T15:30:00Z",
        expiresAt: "2025-06-05T15:30:00Z",
        description: "Conexión para cuentas de gastos"
      }
    ],
    summary: {
      totalBalance: 16520.30,
      totalIncome: 2450.00,
      totalExpense: 533.74,
      currency: "EUR",
      transactionsLastMonth: 25,
      categorySummary: [
        { category: "Alimentación", amount: 150.50, percentage: 28.2 },
        { category: "Transporte", amount: 85.00, percentage: 15.9 },
        { category: "Restaurantes", amount: 98.25, percentage: 18.4 },
        { category: "Electrónica", amount: 249.99, percentage: 46.8 },
        { category: "Servicios", amount: 60.00, percentage: 11.2 }
      ]
    }
  };

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Bancario</h1>
          <p className="text-muted-foreground">
            Resumen y gestión de sus cuentas y transacciones bancarias
          </p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={() => navigate("/banca/configuracion")}>
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar Datos
          </Button>
        </div>
      </div>

      {/* Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BanknoteIcon className="h-5 w-5 mr-2 text-primary" />
              Balance Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(dashboardData.summary.totalBalance, dashboardData.summary.currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardData.accounts.length} cuentas bancarias activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ArrowUpRight className="h-5 w-5 mr-2 text-success" />
              Ingresos (Último mes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {formatCurrency(dashboardData.summary.totalIncome, dashboardData.summary.currency)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1 text-success" />
              <span>+8.5% vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ArrowDownRight className="h-5 w-5 mr-2 text-destructive" />
              Gastos (Último mes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {formatCurrency(dashboardData.summary.totalExpense, dashboardData.summary.currency)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowDownRight className="h-3 w-3 mr-1 text-destructive" />
              <span>-3.2% vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cuentas y Transacciones Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Cuentas */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Landmark className="h-5 w-5 mr-2 text-primary" />
            Cuentas Bancarias
          </h2>

          <div className="space-y-4">
            {dashboardData.accounts.map(account => (
              <Card key={account.id} className="hover:shadow-md transition-shadow cursor-pointer" 
                    onClick={() => navigate(`/banca/cuenta/${account.id}`)}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center">
                      {getAccountIcon(account.type)}
                      {account.name}
                    </CardTitle>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {getAccountTypeName(account.type)}
                    </span>
                  </div>
                  <CardDescription className="text-xs">
                    {account.bankName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-bold">
                      {formatCurrency(account.balance, account.currency)}
                    </div>
                    <Button variant="ghost" size="icon" onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/banca/cuenta/${account.id}`);
                    }}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                  {account.type === "credit" && (
                    <div className="mt-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Disponible</span>
                        <span>{formatCurrency(account.availableBalance, account.currency)}</span>
                      </div>
                      <Progress 
                        value={Math.min(100, (account.availableBalance / 5000) * 100)} 
                        className="h-1.5" 
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <Button 
              variant="outline" 
              className="w-full mt-2" 
              onClick={() => navigate("/banca/configuracion")}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Añadir Nueva Cuenta
            </Button>
          </div>
        </div>

        {/* Transacciones Recientes y Categorías */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="transactions">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <LineChart className="h-5 w-5 mr-2 text-primary" />
                Actividad Financiera
              </h2>
              <TabsList>
                <TabsTrigger value="transactions">Transacciones</TabsTrigger>
                <TabsTrigger value="categories">Categorías</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="transactions">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Transacciones Recientes</CardTitle>
                  <CardDescription>
                    Últimas {dashboardData.recentTransactions.length} transacciones de todas sus cuentas
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Fecha</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-right">Importe</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.recentTransactions.map(transaction => (
                        <TableRow key={transaction.id}>
                          <TableCell className="text-xs">
                            {formatDate(transaction.date)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {transaction.description}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs px-2 py-1 rounded-full bg-accent">
                              {transaction.category || "Sin categoría"}
                            </span>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${transaction.isExpense ? 'text-destructive' : 'text-success'}`}>
                            {transaction.isExpense ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount), dashboardData.summary.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex justify-between py-4">
                  <p className="text-sm text-muted-foreground">
                    {dashboardData.summary.transactionsLastMonth} transacciones este mes
                  </p>
                  <Button variant="outline" size="sm" onClick={() => navigate("/banca/cuentas")}>
                    Ver Todas
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-primary" />
                    Gastos por Categoría
                  </CardTitle>
                  <CardDescription>
                    Distribución de gastos del último mes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.summary.categorySummary.map((category, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span>{category.category}</span>
                          <span className="text-sm font-medium">
                            {formatCurrency(category.amount, dashboardData.summary.currency)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={category.percentage} className="h-2" />
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {category.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between py-4">
                  <p className="text-sm text-muted-foreground">
                    Total: {formatCurrency(dashboardData.summary.totalExpense, dashboardData.summary.currency)}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => navigate("/banca/categorias")}>
                    Administrar Categorías
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Estado de Conexiones Bancarias */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2 text-primary" />
          Estado de Conexiones Bancarias
        </h2>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banco</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>ID de Consentimiento</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead>Expiración</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.connections.map(connection => (
                  <TableRow key={connection.id}>
                    <TableCell className="font-medium">
                      {connection.bankName}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full 
                        ${connection.status === "valid" ? "bg-success/20 text-success" : ""}
                        ${connection.status === "expired" ? "bg-destructive/20 text-destructive" : ""}
                        ${connection.status === "rejected" ? "bg-destructive/20 text-destructive" : ""}
                        ${connection.status === "revoked" ? "bg-destructive/20 text-destructive" : ""}
                        ${connection.status === "received" ? "bg-warning/20 text-warning" : ""}
                      `}>
                        {connection.status === "valid" && "Válida"}
                        {connection.status === "expired" && "Expirada"}
                        {connection.status === "rejected" && "Rechazada"}
                        {connection.status === "revoked" && "Revocada"}
                        {connection.status === "received" && "Pendiente"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {connection.consentId}
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatDate(connection.updatedAt)}
                    </TableCell>
                    <TableCell className={`text-xs ${new Date(connection.expiresAt) < new Date() ? "text-destructive" : ""}`}>
                      {formatDate(connection.expiresAt)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate("/banca/configuracion")}
                      >
                        Gestionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}