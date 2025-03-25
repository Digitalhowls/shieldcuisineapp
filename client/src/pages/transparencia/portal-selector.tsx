import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
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
  Search, 
  AlertCircle,
  ChevronRight,
  Lock,
  Key,
  User,
  FileKey
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { businessTypeEnum } from "@shared/schema";

interface Portal {
  id: number;
  companyId: number;
  companyName: string;
  businessType: typeof businessTypeEnum.enumValues[number];
  description: string;
  requiresLogin: boolean;
  accessMethod: "public" | "login" | "token" | "invite";
  lastUpdated: string;
  logo?: string;
}

export default function PortalSelector() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch available portals
  const { data: portals, isLoading, isError } = useQuery<Portal[]>({
    queryKey: ["/api/transparency-portals"],
    queryFn: async () => {
      try {
        // Simulamos que estamos obteniendo datos reales (se reemplazará con la llamada API real)
        return [
          {
            id: 1,
            companyId: 1,
            companyName: "Restaurante La Huerta",
            businessType: "restaurant",
            description: "Portal de transparencia alimentaria de Restaurante La Huerta, con información completa sobre controles APPCC y seguridad de alimentos.",
            requiresLogin: true,
            accessMethod: "login",
            lastUpdated: "2025-03-22T10:15:00Z",
            logo: "/logos/lahuerta.png"
          },
          {
            id: 2,
            companyId: 2,
            companyName: "Pastelería Dulce Momento",
            businessType: "store",
            description: "Acceda a nuestros controles de calidad y seguridad alimentaria actualizados diariamente.",
            requiresLogin: false,
            accessMethod: "token",
            lastUpdated: "2025-03-23T08:40:00Z"
          },
          {
            id: 3,
            companyId: 3,
            companyName: "Catering Escolar Nutritivo",
            businessType: "catering",
            description: "Información nutricional y de seguridad alimentaria para padres y centros educativos.",
            requiresLogin: true,
            accessMethod: "invite",
            lastUpdated: "2025-03-24T09:25:00Z"
          }
        ];
      } catch (error) {
        console.error("Error fetching portals:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  // Filter portals based on search
  const filteredPortals = portals?.filter(portal => {
    return portal.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           portal.description.toLowerCase().includes(searchTerm.toLowerCase());
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
  
  // Get access method icon and label
  const getAccessMethodInfo = (portal: Portal) => {
    switch (portal.accessMethod) {
      case "public":
        return { 
          icon: <User className="h-4 w-4 text-success" />,
          label: "Acceso público",
          color: "text-success"
        };
      case "login":
        return { 
          icon: <Lock className="h-4 w-4 text-warning" />,
          label: "Requiere inicio de sesión",
          color: "text-warning"
        };
      case "token":
        return { 
          icon: <Key className="h-4 w-4 text-info" />,
          label: "Acceso con token",
          color: "text-info"
        };
      case "invite":
        return { 
          icon: <FileKey className="h-4 w-4 text-primary" />,
          label: "Solo por invitación",
          color: "text-primary"
        };
      default:
        return { 
          icon: <Lock className="h-4 w-4" />,
          label: "Acceso restringido",
          color: "text-neutral-500"
        };
    }
  };
  
  // Format date for display
  const formatUpdatedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const formattedDate = new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
    return `Actualizado: ${formattedDate}`;
  };
  
  // Render portal card
  const renderPortalCard = (portal: Portal) => {
    const accessInfo = getAccessMethodInfo(portal);
    
    return (
      <Card key={portal.id} className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{portal.companyName}</CardTitle>
              <CardDescription>
                <Badge variant="outline" className="mt-1">
                  {getBusinessTypeLabel(portal.businessType)}
                </Badge>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {accessInfo.icon}
              <span className={`text-xs font-medium ${accessInfo.color}`}>
                {accessInfo.label}
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          <p className="text-sm text-neutral-600">{portal.description}</p>
        </CardContent>
        
        <CardFooter className="border-t bg-muted/50 flex justify-between">
          <div className="text-xs text-neutral-500">
            {formatUpdatedDate(portal.lastUpdated)}
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/transparencia/portal/${portal.companyId}`}>
              Acceder al portal
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <div className="space-y-4 p-4 pt-0">
      <div className="flex flex-col space-y-2 mt-2">
        <h2 className="text-2xl font-bold">Portales de Transparencia</h2>
        <p className="text-muted-foreground">
          Acceda a información de seguridad alimentaria de nuestras empresas colaboradoras
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
            Ha ocurrido un error al cargar los portales. Por favor, inténtelo de nuevo.
          </AlertDescription>
        </Alert>
      ) : filteredPortals?.length === 0 ? (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No se encontraron portales</h3>
          <p className="text-muted-foreground">
            No hay portales que coincidan con su búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredPortals?.map(portal => renderPortalCard(portal))}
        </div>
      )}
    </div>
  );
}