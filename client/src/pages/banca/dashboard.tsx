import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  ArrowUpFromLine, 
  ArrowDownToLine, 
  CreditCard, 
  EuroIcon,
  RefreshCw,
  AlertTriangle,
  CircleDollarSign,
  PiggyBank,
  Eye
} from "lucide-react";

// Colores para el gráfico de categorías
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1'];

interface DashboardData {
  summary: {
    totalAccounts: number;
    totalBalance: number;
    totalAvailableBalance: number;
    lastSyncDate: number;
  };
  accounts: Array<{
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
  }>;
  recentTransactions: Array<{
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
  }>;
  categoryData: Array<{
    name: string;
    amount: number;
  }>;
}

export default function Dashboard() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(1); // Hardcodeado para demo, normalmente vendría de un selector
  
  // Consulta para obtener los datos del dashboard
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<DashboardData>({
    queryKey: ['/api/banking/companies', selectedCompanyId, 'dashboard'],
    queryFn: async () => {
      const response = await fetch(`/api/banking/companies/${selectedCompanyId}/dashboard`);
      if (!response.ok) {
        throw new Error('Error al cargar el dashboard bancario');
      }
      return response.json();
    }
  });

  // Refrescar datos manualmente
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Actualizando datos",
      description: "Obteniendo la información bancaria más reciente..."
    });
  };

  // Convertir datos para gráfico de categorías
  const formattedCategoryData = data?.categoryData?.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length]
  })) || [];

  // Si hay un error, mostrar un mensaje
  if (error) {
    return (
      <Card className="mx-auto my-10 max-w-5xl">
        <CardHeader>
          <CardTitle className="flex items-center text-red-500">
            <AlertTriangle className="mr-2" /> Error al cargar los datos bancarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>No se pudieron cargar los datos del dashboard bancario. Por favor, inténtelo de nuevo.</p>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard Bancario</h1>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Actualizando...' : 'Actualizar datos'}
        </Button>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard 
          title="Cuentas Activas" 
          value={data?.summary.totalAccounts || 0}
          icon={<CreditCard className="h-5 w-5" />}
          isLoading={isLoading}
          footer={
            <div className="text-xs text-muted-foreground">
              Última sincronización: {data?.summary.lastSyncDate ? new Date(data.summary.lastSyncDate).toLocaleString() : 'Nunca'}
            </div>
          }
        />
        
        <SummaryCard 
          title="Saldo Total" 
          value={formatCurrency(data?.summary.totalBalance || 0)}
          icon={<EuroIcon className="h-5 w-5" />}
          isLoading={isLoading}
          footer={
            <div className="text-xs text-muted-foreground">
              Todas las cuentas activas
            </div>
          }
        />
        
        <SummaryCard 
          title="Saldo Disponible" 
          value={formatCurrency(data?.summary.totalAvailableBalance || 0)}
          icon={<PiggyBank className="h-5 w-5" />}
          isLoading={isLoading}
          footer={
            <div className="text-xs text-muted-foreground">
              Fondos disponibles para uso
            </div>
          }
        />
        
        <SummaryCard 
          title="Transacciones Recientes" 
          value={data?.recentTransactions.length || 0}
          icon={<ArrowUpFromLine className="h-5 w-5" />}
          isLoading={isLoading}
          footer={
            <div className="text-xs text-muted-foreground">
              Últimos 10 movimientos
            </div>
          }
        />
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Transacciones Recientes</CardTitle>
            <CardDescription>Últimos movimientos en todas sus cuentas</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data?.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <p className="font-medium truncate max-w-xs">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.transactionDate).toLocaleDateString()} - {transaction.category || 'Sin categorizar'}
                      </p>
                    </div>
                    <span className={`font-bold ${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))}
                {(!data?.recentTransactions || data.recentTransactions.length === 0) && (
                  <div className="text-center py-6 text-muted-foreground">
                    No se encontraron transacciones recientes
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline" size="sm" onClick={() => navigate("/banca/cuenta/1")}>
              <Eye className="mr-2 h-4 w-4" /> Ver todas
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Categorías</CardTitle>
            <CardDescription>Gastos agrupados por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-48 w-48 rounded-full" />
              </div>
            ) : (
              <div className="h-64">
                {formattedCategoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={formattedCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="amount"
                        nameKey="name"
                        label={(entry) => entry.name}
                      >
                        {formattedCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No hay datos de categorías disponibles
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline" size="sm" onClick={() => navigate("/banca/categorias")}>
              <Eye className="mr-2 h-4 w-4" /> Gestionar categorías
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Cuentas bancarias */}
      <Card>
        <CardHeader>
          <CardTitle>Cuentas Bancarias</CardTitle>
          <CardDescription>Listado de todas sus cuentas bancarias conectadas</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-40 mb-1" />
                    <Skeleton className="h-4 w-60" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-32" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data?.accounts.map((account) => (
                <Card key={account.id} className="border border-muted">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{account.name}</CardTitle>
                    <CardDescription className="text-xs font-mono truncate">{account.iban}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Saldo:</span>
                      <span className="font-bold">{formatCurrency(account.balance)}</span>
                    </div>
                    {account.availableBalance !== null && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-muted-foreground text-sm">Disponible:</span>
                        <span className="font-medium">{formatCurrency(account.availableBalance)}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`/banca/cuenta/${account.id}`)}>
                      <Eye className="mr-2 h-4 w-4" /> Ver transacciones
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {(!data?.accounts || data.accounts.length === 0) && (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                  No se encontraron cuentas bancarias. Configure una nueva conexión bancaria.
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="outline" onClick={() => navigate("/banca/cuentas")}>
            <Eye className="mr-2 h-4 w-4" /> Ver todas las cuentas
          </Button>
          <Button className="ml-2" onClick={() => navigate("/banca/configuracion")}>
            <CircleDollarSign className="mr-2 h-4 w-4" /> Añadir cuenta
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Componente para las tarjetas de resumen
interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isLoading: boolean;
  footer?: React.ReactNode;
}

function SummaryCard({ title, value, icon, isLoading, footer }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-1 bg-primary/10 rounded-full text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
      {footer && (
        <CardFooter className="pt-0">
          {isLoading ? (
            <Skeleton className="h-3 w-32" />
          ) : (
            footer
          )}
        </CardFooter>
      )}
    </Card>
  );
}

// Utilidad para formatear moneda
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}