import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Search, 
  AlertCircle,
  ChevronRight 
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { businessTypeEnum } from "@shared/schema";

interface Company {
  id: number;
  name: string;
  businessType: typeof businessTypeEnum.enumValues[number];
  address: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  active: boolean;
  logo?: string;
  description?: string;
  certifications?: {
    name: string;
    validUntil: string;
  }[];
  locationCount: number;
  complianceRate: number;
}

export default function Empresas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [businessType, setBusinessType] = useState("all");
  const [activeTab, setActiveTab] = useState("list");
  
  // Fetch public companies data
  const { data: companies, isLoading, isError } = useQuery<Company[]>({
    queryKey: ["/api/public/companies"],
    queryFn: async () => {
      try {
        // Mock data for now - will be replaced with actual API call
        // const res = await apiRequest("GET", "/api/public/companies");
        // return await res.json();
        return [
          {
            id: 1,
            name: "Restaurante La Huerta",
            businessType: "restaurant",
            address: "Calle Principal 123",
            city: "Madrid",
            phone: "+34 912 345 678",
            email: "info@lahuerta.com",
            website: "www.restaurantelahuerta.com",
            active: true,
            description: "Restaurante de comida mediterránea con productos de temporada y km 0.",
            certifications: [
              { name: "ISO 22000", validUntil: "2025-06-30" }
            ],
            locationCount: 2,
            complianceRate: 96.3
          },
          {
            id: 2,
            name: "Pastelería Dulce Momento",
            businessType: "store",
            address: "Avenida Comercial 45",
            city: "Barcelona",
            phone: "+34 933 456 789",
            email: "contacto@dulcemomento.es",
            website: "www.dulcemomento.es",
            active: true,
            description: "Pastelería artesanal especializada en repostería tradicional y moderna.",
            certifications: [
              { name: "FSSC 22000", validUntil: "2025-03-15" }
            ],
            locationCount: 3,
            complianceRate: 94.8
          },
          {
            id: 3,
            name: "Catering Escolar Nutritivo",
            businessType: "catering",
            address: "Polígono Industrial Este, 12",
            city: "Valencia",
            phone: "+34 963 567 890",
            email: "info@cateringnutritivo.com",
            website: "www.cateringnutritivo.com",
            active: true,
            description: "Servicio de catering especializado en alimentación saludable para centros educativos.",
            certifications: [
              { name: "ISO 22000", validUntil: "2025-09-22" },
              { name: "IFS Food", validUntil: "2024-12-10" }
            ],
            locationCount: 1,
            complianceRate: 98.2
          },
          {
            id: 4,
            name: "Panadería Tradicional",
            businessType: "production",
            address: "Calle Horno 7",
            city: "Sevilla",
            phone: "+34 954 678 901",
            email: "contacto@panaderiatradicional.es",
            website: "www.panaderiatradicional.es",
            active: true,
            description: "Panadería con más de 50 años de tradición familiar, elaborando pan y bollería artesanal.",
            certifications: [
              { name: "FSSC 22000", validUntil: "2024-11-05" }
            ],
            locationCount: 5,
            complianceRate: 91.7
          },
          {
            id: 5,
            name: "Distribución Alimentaria Norte",
            businessType: "wholesale",
            address: "Polígono Mercancías, 22",
            city: "Bilbao",
            phone: "+34 944 789 012",
            email: "contacto@distrialimentos.com",
            website: "www.distrialimentos.com",
            active: true,
            description: "Distribución mayorista de productos alimentarios a nivel nacional e internacional.",
            certifications: [
              { name: "IFS Logistics", validUntil: "2025-02-18" },
              { name: "ISO 9001", validUntil: "2025-05-20" }
            ],
            locationCount: 2,
            complianceRate: 95.4
          }
        ];
      } catch (error) {
        console.error("Error fetching companies:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Filter companies based on search and business type
  const filteredCompanies = companies?.filter(company => {
    return (
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (businessType === "all" || company.businessType === businessType)
    );
  });

  // Helper to convert business type to a more readable form
  const getBusinessTypeLabel = (type: string): string => {
    switch (type) {
      case "restaurant": return "Restaurante";
      case "store": return "Tienda";
      case "production": return "Producción";
      case "catering": return "Catering";
      case "wholesale": return "Distribución";
      default: return type;
    }
  };

  // Get a color based on compliance rate
  const getComplianceColor = (rate: number): string => {
    if (rate >= 95) return "text-success";
    if (rate >= 85) return "text-warning";
    return "text-error";
  };

  const renderCompanyCard = (company: Company) => (
    <Card key={company.id} className="overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{company.name}</CardTitle>
            <CardDescription>
              <Badge variant="outline" className="mt-1">
                {getBusinessTypeLabel(company.businessType)}
              </Badge>
            </CardDescription>
          </div>
          <div className={`text-right ${getComplianceColor(company.complianceRate)}`}>
            <span className="text-2xl font-bold">{company.complianceRate}%</span>
            <p className="text-xs font-medium">Cumplimiento</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
            <span>{company.address}, {company.city}</span>
          </div>
          {company.phone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{company.phone}</span>
            </div>
          )}
          {company.email && (
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{company.email}</span>
            </div>
          )}
          {company.website && (
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
              <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" 
                 className="text-primary hover:underline">
                {company.website}
              </a>
            </div>
          )}
        </div>
        
        {company.description && (
          <p className="mt-4 text-sm text-muted-foreground">{company.description}</p>
        )}
        
        {company.certifications && company.certifications.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Certificaciones:</p>
            <div className="flex flex-wrap gap-2">
              {company.certifications.map((cert, idx) => (
                <Badge key={idx} variant="outline" className="bg-primary/10">
                  {cert.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t bg-muted/50 flex justify-between">
        <div className="text-sm">
          <span className="font-medium">{company.locationCount}</span> establecimientos
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/transparencia/empresas/${company.id}`}>
            Ver controles
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-4 p-4 pt-0">
      <div className="flex flex-col space-y-2 mt-2">
        <h2 className="text-2xl font-bold">Empresas Comprometidas</h2>
        <p className="text-muted-foreground">
          Información pública sobre nuestras empresas colaboradoras y su compromiso con la seguridad alimentaria
        </p>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6 pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre de empresa..."
                className="pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Filtrar por tipo" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="restaurant">Restaurantes</SelectItem>
                  <SelectItem value="store">Tiendas</SelectItem>
                  <SelectItem value="production">Producción</SelectItem>
                  <SelectItem value="catering">Catering</SelectItem>
                  <SelectItem value="wholesale">Distribución</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ha ocurrido un error al cargar las empresas. Por favor, inténtelo de nuevo.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Lista</TabsTrigger>
              <TabsTrigger value="map">Mapa</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="space-y-4">
              {filteredCompanies?.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No se encontraron empresas</h3>
                  <p className="text-muted-foreground">
                    No hay empresas que coincidan con los criterios de búsqueda.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCompanies?.map(company => renderCompanyCard(company))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="map" className="min-h-[400px]">
              <div className="flex justify-center items-center border rounded-lg h-[400px] bg-muted/30">
                <div className="text-center p-4">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Mapa de Empresas</h3>
                  <p className="text-muted-foreground mb-4">
                    Visualización geográfica de empresas en desarrollo.
                  </p>
                  <Button variant="outline" disabled>
                    Próximamente
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}