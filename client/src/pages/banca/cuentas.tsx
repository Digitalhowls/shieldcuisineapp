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
import { Input } from "@/components/ui/input";
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
  BanknoteIcon,
  CreditCard,
  PiggyBank,
  Eye,
  FileText,
  Download,
  Plus,
  Filter,
  Settings,
  Search,
  MoreHorizontal,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
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
  swift?: string;
  holderName?: string;
  openDate?: string;
}

export default function Cuentas() {
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");

  // Consulta para obtener cuentas bancarias
  const { data: accounts, isLoading } = useQuery<BankAccount[]>({
    queryKey: ['/api/banking/accounts'],
  });

  // Manejo de estado de carga
  if (isLoading) {
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
      bankName: "BBVA",
      connectionId: 1,
      swift: "BBVAESMM",
      holderName: "Restaurante Ejemplo, S.L.",
      openDate: "2020-01-15T00:00:00Z"
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
      bankName: "Santander",
      connectionId: 1,
      swift: "SANTESMM",
      holderName: "Restaurante Ejemplo, S.L.",
      openDate: "2021-05-10T00:00:00Z"
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
      bankName: "CaixaBank",
      connectionId: 2,
      swift: "CAIXESBB",
      holderName: "Restaurante Ejemplo, S.L.",
      openDate: "2022-03-05T00:00:00Z"
    },
    {
      id: 4,
      accountNumber: "1357908642",
      iban: "ES1357908642135790864213",
      name: "Cuenta Nóminas",
      type: "checking",
      balance: 2350.20,
      availableBalance: 2350.20,
      currency: "EUR",
      lastUpdated: "2025-03-22T10:30:00Z",
      bankName: "ING Direct",
      connectionId: 3,
      swift: "INGDESM1",
      holderName: "Restaurante Ejemplo, S.L.",
      openDate: "2023-01-15T00:00:00Z"
    },
    {
      id: 5,
      accountNumber: "2468013579",
      iban: "ES2468013579246801357924",
      name: "Cuenta Proveedores",
      type: "checking",
      balance: 8750.50,
      availableBalance: 8750.50,
      currency: "EUR",
      lastUpdated: "2025-03-22T10:30:00Z",
      bankName: "Sabadell",
      connectionId: 4,
      swift: "BSABESBB",
      holderName: "Restaurante Ejemplo, S.L.",
      openDate: "2021-11-20T00:00:00Z"
    }
  ];

  // Aplicar filtrado por pestaña activa
  const filteredAccounts = accountsData.filter(account => {
    // Filtro por tipo de cuenta
    if (activeTab !== "todos" && account.type !== activeTab) {
      return false;
    }

    // Filtro por búsqueda
    if (searchQuery && !account.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !account.bankName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !account.iban.includes(searchQuery)) {
      return false;
    }

    return true;
  });

  // Calcular sumas
  const totalBalance = filteredAccounts.reduce((sum, account) => sum + account.balance, 0);
  const totalAvailable = filteredAccounts.reduce((sum, account) => sum + account.availableBalance, 0);

  // Función para formatear números monetarios
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

  // Formateo de fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cuentas Bancarias</h1>
        <div>
          <Button variant="outline" className="mr-2" onClick={() => navigate("/banca")}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button variant="outline" className="mr-2" onClick={() => {}}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => navigate("/banca/configuracion")}>
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full sm:w-1/3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cuentas..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="todos">Todas</TabsTrigger>
            <TabsTrigger value="checking">Corrientes</TabsTrigger>
            <TabsTrigger value="savings">Ahorro</TabsTrigger>
            <TabsTrigger value="credit">Crédito</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Indicadores de Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Balance Total</CardTitle>
            <CardDescription>Saldo de todas las cuentas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Disponible Total</CardTitle>
            <CardDescription>Incluye líneas de crédito</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAvailable)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pestañas de Vista */}
      <Tabs defaultValue="cards" className="mb-6">
        <TabsList>
          <TabsTrigger value="cards">Vista Tarjetas</TabsTrigger>
          <TabsTrigger value="table">Vista Tabla</TabsTrigger>
        </TabsList>
        <TabsContent value="cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccounts.map((account) => (
              <Card key={account.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getAccountIcon(account.type)}
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                    </div>
                    <Badge>{getAccountTypeName(account.type)}</Badge>
                  </div>
                  <CardDescription className="flex items-center">
                    {account.bankName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Saldo</div>
                      <div className={`font-medium ${account.balance < 0 ? 'text-red-600' : ''}`}>
                        {formatCurrency(account.balance, account.currency)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Disponible</div>
                      <div className="font-medium">
                        {formatCurrency(account.availableBalance, account.currency)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground flex justify-between">
                    <div>IBAN: {account.iban.substring(0, 6)}...{account.iban.substring(account.iban.length - 4)}</div>
                    <div>Actualizado: {formatDate(account.lastUpdated)}</div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/banca/cuenta/${account.id}`)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(`/banca/cuenta/${account.id}/movimientos`)}>
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Exportar Movimientos</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/banca/cuenta/${account.id}/acceso`)}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        <span>Acceso Directo Banco</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="table">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>IBAN</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-right">Disponible</TableHead>
                    <TableHead className="text-right">Actualizado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.id} className="cursor-pointer" onClick={() => navigate(`/banca/cuenta/${account.id}`)}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {getAccountIcon(account.type)}
                          {account.name}
                        </div>
                      </TableCell>
                      <TableCell>{account.bankName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getAccountTypeName(account.type)}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {account.iban.substring(0, 6)}...{account.iban.substring(account.iban.length - 4)}
                      </TableCell>
                      <TableCell className={`text-right ${account.balance < 0 ? 'text-red-600' : ''}`}>
                        {formatCurrency(account.balance, account.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(account.availableBalance, account.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatDate(account.lastUpdated)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/banca/cuenta/${account.id}`);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              <span>Ver Detalles</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/banca/cuenta/${account.id}/movimientos`);
                            }}>
                              <FileText className="h-4 w-4 mr-2" />
                              <span>Exportar Movimientos</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/banca/cuenta/${account.id}/acceso`);
                            }}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              <span>Acceso Directo Banco</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}