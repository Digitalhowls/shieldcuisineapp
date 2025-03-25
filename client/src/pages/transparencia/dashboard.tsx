import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  CheckSquare, 
  Shield, 
  Users, 
  CheckCircle2, 
  Award,
  BarChart 
} from "lucide-react";
import SummaryCard from "@/components/dashboard/summary-card";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("resumen");
  
  // Fetch public statistics
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["/api/public/statistics"],
    queryFn: async () => {
      try {
        // Mock data for now - will be replaced with actual API call
        // const res = await apiRequest("GET", "/api/public/statistics");
        // return await res.json();
        return {
          totalCompanies: 12,
          totalLocations: 32,
          totalCertifications: 8,
          totalControls: 456,
          totalCompletedControls: 398,
          complianceRate: 87.3,
          controlsByType: [
            { type: "Temperatura", count: 124 },
            { type: "Limpieza", count: 89 },
            { type: "Recepción", count: 76 },
            { type: "Mantenimiento", count: 58 },
            { type: "Auditorías", count: 43 }
          ],
          recentCertifications: [
            { company: "Restaurante Modelo", certification: "ISO 22000", date: "2025-01-15" },
            { company: "Pastelería Artesana", certification: "FSSC 22000", date: "2024-11-22" },
            { company: "Catering Escolar", certification: "IFS Food", date: "2024-10-09" }
          ]
        };
      } catch (error) {
        console.error("Error fetching statistics:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  return (
    <div className="space-y-4 p-4 pt-0">
      <div className="flex flex-col space-y-2 mt-2">
        <h2 className="text-2xl font-bold">Panel de Transparencia Alimentaria</h2>
        <p className="text-muted-foreground">
          Consulta información sobre la seguridad alimentaria de nuestras empresas colaboradoras.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="certificaciones">Certificaciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resumen" className="space-y-4 py-4">
          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Empresas"
              value={stats?.totalCompanies?.toString() || "0"}
              icon="Building"
              color="primary"
              footer={<Link href="/transparencia/empresas">Ver detalles</Link>}
            />
            <SummaryCard
              title="Establecimientos"
              value={stats?.totalLocations?.toString() || "0"}
              icon="MapPin"
              color="warning"
            />
            <SummaryCard
              title="Controles APPCC"
              value={stats?.totalControls?.toString() || "0"}
              icon="ClipboardCheck"
              color="success"
              progressValue={stats?.complianceRate}
              footer={<span>Cumplimiento: {stats?.complianceRate}%</span>}
            />
            <SummaryCard
              title="Certificaciones"
              value={stats?.totalCertifications?.toString() || "0"}
              icon="Award"
              color="info"
              footer={<Link href="/transparencia/certificaciones">Ver todas</Link>}
            />
          </div>
          
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-primary" />
                  <span>Compromiso con la Seguridad Alimentaria</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    Todas nuestras empresas colaboradoras mantienen un estricto control de 
                    sus procesos de seguridad alimentaria, conforme a la legislación vigente
                    y a las normas internacionales.
                  </p>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                      <span>Sistema APPCC implementado al 100%</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                      <span>Auditorías de terceras partes</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                      <span>Formación continua del personal</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-success mr-2" />
                      <span>Control de proveedores y materias primas</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href="/transparencia/controles">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Ver controles realizados
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="mr-2 h-5 w-5 text-primary" />
                  <span>Controles por Tipo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.controlsByType?.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.type}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${(item.count / (stats?.totalControls || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="certificaciones" className="space-y-4 py-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-primary" />
                <span>Empresas Certificadas</span>
              </CardTitle>
              <CardDescription>
                Nuestras empresas cuentan con las siguientes certificaciones de seguridad alimentaria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentCertifications?.map((cert, index) => (
                  <div key={index} className="border-b pb-2 last:border-b-0 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{cert.company}</p>
                      <p className="text-sm text-muted-foreground">{cert.certification}</p>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      {new Date(cert.date).toLocaleDateString('es-ES')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Ver todas las certificaciones
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}