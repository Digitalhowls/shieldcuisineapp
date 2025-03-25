import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  RefreshCw, 
  Search, 
  Loader2,
  CreditCard,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Calendar,
  CircleDollarSign
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
import { Skeleton } from "@/components/ui/skeleton";

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

interface BankConnection {
  id: number;
  companyId: number;
  name: string;
  status: string;
  consentId: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function Cuentas() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [filter, setFilter] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(1); // Hardcodeado para demo
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc" as "asc" | "desc"
  });

  // Consulta para obtener las conexiones bancarias
  const connectionsQuery = useQuery<BankConnection[]>({
    queryKey: ['/api/banking/connections', selectedCompanyId],
    queryFn: async () => {
      const response = await fetch(`/api/banking/connections/${selectedCompanyId}`);
      if (!response.ok) {
        throw new Error('Error al cargar las conexiones bancarias');
      }
      return response.json();
    }
  });

  // Array para almacenar todas las cuentas de todas las conexiones
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar las cuentas bancarias de cada conexión
  useEffect(() => {
    async function loadAccounts() {
      if (connectionsQuery.data && connectionsQuery.data.length > 0) {
        setLoading(true);
        setError(null);
        const allAccounts: BankAccount[] = [];
        
        try {
          // Para cada conexión, obtener sus cuentas
          for (const connection of connectionsQuery.data) {
            try {
              const response = await fetch(`/api/banking/connections/${connection.id}/accounts`);
              if (response.ok) {
                const connectionAccounts: BankAccount[] = await response.json();
                allAccounts.push(...connectionAccounts);
              }
            } catch (err) {
              console.error(`Error al cargar cuentas para conexión ${connection.id}:`, err);
            }
          }
          
          setAccounts(allAccounts);
        } catch (err) {
          setError("Error al cargar las cuentas bancarias");
          console.error("Error al cargar cuentas:", err);
        } finally {
          setLoading(false);
        }
      } else if (connectionsQuery.isSuccess) {
        setLoading(false);
      }
    }
    
    loadAccounts();
  }, [connectionsQuery.data, connectionsQuery.isSuccess]);

  // Función para refrescar el saldo de una cuenta
  const refreshBalance = async (accountId: number) => {
    toast({
      title: "Actualizando saldo",
      description: "Obteniendo el saldo actualizado de la cuenta..."
    });
    
    try {
      const response = await fetch(`/api/banking/accounts/${accountId}/balances`);
      if (!response.ok) {
        throw new Error('Error al actualizar el saldo');
      }
      
      const updatedAccount = await response.json();
      
      setAccounts(prev => prev.map(acc => 
        acc.id === accountId ? updatedAccount : acc
      ));
      
      toast({
        title: "Saldo actualizado",
        description: "El saldo de la cuenta ha sido actualizado correctamente",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el saldo de la cuenta",
        variant: "destructive"
      });
    }
  };

  // Función para ordenar las cuentas
  const handleSort = (key: keyof BankAccount) => {
    setSortConfig({
      key: key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc"
    });
  };

  // Filtrar y ordenar cuentas
  const filteredAccounts = accounts
    .filter(account => 
      filter === "" || 
      account.name.toLowerCase().includes(filter.toLowerCase()) ||
      account.iban.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortConfig.key as keyof BankAccount];
      const bValue = b[sortConfig.key as keyof BankAccount];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      
      return 0;
    });

  // Formatear moneda
  const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Formatear fecha
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Nunca';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Cuentas Bancarias</h1>
          <p className="text-muted-foreground">Gestione todas sus cuentas bancarias</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar cuenta..."
              className="pl-8"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          
          <Button onClick={() => navigate("/banca/configuracion")}>
            <CreditCard className="mr-2 h-4 w-4" /> Nueva Conexión
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cuentas Activas</CardTitle>
          <CardDescription>
            {connectionsQuery.isLoading || loading ? (
              <Skeleton className="h-4 w-48" />
            ) : (
              `${filteredAccounts.length} cuentas bancarias encontradas`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(connectionsQuery.isLoading || loading) ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-md">
                  <div className="space-y-2 flex-grow">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          ) : connectionsQuery.error || error ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="mb-4">Error al cargar las cuentas bancarias.</p>
              <Button onClick={() => connectionsQuery.refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
              </Button>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="mb-4">No se encontraron cuentas bancarias. Para comenzar, configure una conexión bancaria.</p>
              <Button onClick={() => navigate("/banca/configuracion")}>
                <CreditCard className="mr-2 h-4 w-4" /> Configurar Conexión
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('name')}
                        className="flex items-center font-medium"
                      >
                        Nombre de la Cuenta
                        {sortConfig.key === 'name' ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-2 h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>IBAN</TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('balance')}
                        className="flex items-center font-medium"
                      >
                        Saldo
                        {sortConfig.key === 'balance' ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-2 h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('lastSyncAt')}
                        className="flex items-center font-medium"
                      >
                        Última Actualización
                        {sortConfig.key === 'lastSyncAt' ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-2 h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell className="font-mono text-xs">{account.iban}</TableCell>
                      <TableCell>{formatCurrency(account.balance, account.currency)}</TableCell>
                      <TableCell>{formatDate(account.lastSyncAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <span className="sr-only">Abrir menú</span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate(`/banca/cuenta/${account.id}`)}>
                              <Eye className="mr-2 h-4 w-4" /> Ver transacciones
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => refreshBalance(account.id)}>
                              <RefreshCw className="mr-2 h-4 w-4" /> Actualizar saldo
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate(`/banca/pagos?accountId=${account.id}`)}>
                              <CircleDollarSign className="mr-2 h-4 w-4" /> Iniciar pago
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredAccounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No se encontraron cuentas que coincidan con su búsqueda
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}