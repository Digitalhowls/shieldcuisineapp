import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  PiggyBank,
  CreditCard,
  ChevronRight,
  RefreshCw,
  BanknoteIcon,
  LayoutGrid,
  LayoutList,
  Filter,
  Search,
  PlusCircle,
  Landmark,
  ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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

// Vista de cuentas bancarias
export default function CuentasBancarias() {
  const [_, navigate] = useLocation();
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [bankFilter, setBankFilter] = useState<string>("");
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("name");

  // Consulta para obtener las cuentas bancarias
  const { data: accounts, isLoading, error } = useQuery<BankAccount[]>({
    queryKey: ["/api/banking/accounts"],
    enabled: true,
  });

  // Consulta para obtener conexiones bancarias (para filtros)
  const { data: connections } = useQuery<BankConnection[]>({
    queryKey: ["/api/banking/connections/1"],
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

  // Datos de ejemplo si no hay conexión a la API
  const bankAccounts: BankAccount[] = accounts || [
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
    },
    {
      id: 4,
      accountNumber: "1357924680",
      iban: "ES1357924680135792468013",
      name: "Cuenta Nómina",
      type: "checking",
      balance: 1850.30,
      availableBalance: 1850.30,
      currency: "EUR",
      lastUpdated: "2025-03-22T10:30:00Z",
      bankName: "BBVA",
      connectionId: 1
    },
    {
      id: 5,
      accountNumber: "2468013579",
      iban: "ES2468013579246801357924",
      name: "Tarjeta Business",
      type: "credit",
      balance: -450.25,
      availableBalance: 4549.75,
      currency: "EUR",
      lastUpdated: "2025-03-22T10:30:00Z",
      bankName: "Santander",
      connectionId: 2
    }
  ];

  const bankConnections: BankConnection[] = connections || [
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
    },
    {
      id: 3,
      companyId: 1,
      bankName: "CaixaBank",
      apiUrl: "https://api.caixabank.com/psd2",
      status: "valid",
      consentId: "consent-24680-caixa",
      createdAt: "2025-02-15T09:45:00Z",
      updatedAt: "2025-02-15T09:45:00Z",
      expiresAt: "2025-03-15T09:45:00Z"
    }
  ];

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

  // Filtrar y ordenar cuentas
  const filteredSortedAccounts = bankAccounts
    .filter(account => {
      // Filtro de búsqueda
      if (searchQuery && !account.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !account.iban.includes(searchQuery)) {
        return false;
      }
      // Filtro por banco
      if (bankFilter && account.bankName !== bankFilter) {
        return false;
      }
      // Filtro por tipo de cuenta
      if (accountTypeFilter && account.type !== accountTypeFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Ordenar
      switch (sortOption) {
        case "name":
          return a.name.localeCompare(b.name);
        case "bankName":
          return a.bankName.localeCompare(b.bankName);
        case "balanceAsc":
          return a.balance - b.balance;
        case "balanceDesc":
          return b.balance - a.balance;
        default:
          return 0;
      }
    });

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Cuentas Bancarias</h1>
          <p className="text-muted-foreground">
            Gestione todas sus cuentas bancarias conectadas por PSD2/Open Banking
          </p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={() => navigate("/banca/configuracion")}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Añadir Cuenta
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre o IBAN..." 
            className="pl-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={bankFilter} onValueChange={setBankFilter}>
            <SelectTrigger className="w-[180px]">
              <Landmark className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por banco" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los bancos</SelectItem>
              {bankConnections.map(conn => (
                <SelectItem key={conn.id} value={conn.bankName}>{conn.bankName}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tipo de cuenta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los tipos</SelectItem>
              <SelectItem value="checking">Cuentas Corrientes</SelectItem>
              <SelectItem value="savings">Cuentas de Ahorro</SelectItem>
              <SelectItem value="credit">Tarjetas de Crédito</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[180px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Ordenar por
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Criterio de ordenación</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem 
                checked={sortOption === "name"}
                onCheckedChange={() => setSortOption("name")}
              >
                Nombre
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                checked={sortOption === "bankName"}
                onCheckedChange={() => setSortOption("bankName")}
              >
                Banco
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                checked={sortOption === "balanceAsc"}
                onCheckedChange={() => setSortOption("balanceAsc")}
              >
                Saldo (menor a mayor)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                checked={sortOption === "balanceDesc"}
                onCheckedChange={() => setSortOption("balanceDesc")}
              >
                Saldo (mayor a menor)
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex rounded-md border">
            <Button
              variant={viewType === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewType("grid")}
              className="rounded-r-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewType === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewType("list")}
              className="rounded-l-none"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Cuentas - Vista de Grid */}
      {viewType === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredSortedAccounts.map(account => (
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
                <CardDescription className="flex flex-col">
                  <span className="text-xs">{account.bankName}</span>
                  <span className="text-xs font-mono">{account.iban}</span>
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
                <div className="text-xs text-muted-foreground mt-2">
                  Actualizado: {formatDate(account.lastUpdated)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cuentas - Vista de Lista */}
      {viewType === "list" && (
        <div className="mb-8">
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
                    <TableHead className="text-right">Última actualización</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSortedAccounts.map(account => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {getAccountIcon(account.type)}
                          {account.name}
                        </div>
                      </TableCell>
                      <TableCell>{account.bankName}</TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10">
                          {getAccountTypeName(account.type)}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{account.iban}</TableCell>
                      <TableCell className={`text-right font-medium ${account.balance < 0 ? 'text-destructive' : ''}`}>
                        {formatCurrency(account.balance, account.currency)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {formatDate(account.lastUpdated)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => navigate(`/banca/cuenta/${account.id}`)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resumen */}
      <div className="mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Resumen de cuentas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Cuentas</h3>
                <p className="text-2xl font-bold">
                  {filteredSortedAccounts.length}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Balance total</h3>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    filteredSortedAccounts.reduce((sum, account) => sum + account.balance, 0),
                    "EUR"
                  )}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Bancos conectados</h3>
                <p className="text-2xl font-bold">
                  {new Set(filteredSortedAccounts.map(account => account.bankName)).size}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Última actualización</h3>
                <p className="text-base font-medium">
                  {filteredSortedAccounts.length > 0 ? formatDate(
                    filteredSortedAccounts.reduce((latest, account) => {
                      return new Date(latest) > new Date(account.lastUpdated) ? latest : account.lastUpdated;
                    }, "1970-01-01T00:00:00Z")
                  ) : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}