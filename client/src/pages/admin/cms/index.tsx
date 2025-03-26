import React from "react";
import { Switch, Route, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  FileText,
  PlusCircle,
  MoreVertical,
  Edit,
  Trash2,
  FileImage,
  FolderTree,
  Layout,
  Brush,
  Clock,
  ExternalLink,
  Layers,
  Settings,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Componentes del CMS
import AdminCMSPagesPanel from "./pages";
import AdminCMSMediaPanel from "./media";
import AdminCMSCategoriesPanel from "./categories";
import AdminCMSBrandingPanel from "./branding";

interface DashboardItem {
  title: string;
  count: number;
  status: "draft" | "published" | "total";
  icon: React.ReactNode;
}

interface RecentPage {
  id: number;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  updatedAt: string;
}

// Componente para la dashboard del CMS
function AdminCMSDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();

  // Obtener estadísticas de páginas
  const { data: pagesStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/cms/stats"],
    queryFn: async () => {
      try {
        if (!user?.companyId) {
          return {
            totalPages: 0,
            publishedPages: 0,
            draftPages: 0,
            totalMedia: 0,
            totalCategories: 0,
            recentPages: []
          };
        }
        const response = await fetch(`/api/cms/stats?companyId=${user.companyId}`);
        if (!response.ok) {
          throw new Error("Error al cargar estadísticas");
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching CMS stats:", error);
        return {
          totalPages: 0,
          publishedPages: 0,
          draftPages: 0,
          totalMedia: 0,
          totalCategories: 0,
          recentPages: []
        };
      }
    },
  });

  // Datos para las tarjetas del dashboard
  const dashboardItems: DashboardItem[] = [
    {
      title: "Total Páginas",
      count: pagesStats?.totalPages || 0,
      status: "total",
      icon: <Layout className="h-5 w-5" />,
    },
    {
      title: "Páginas Publicadas",
      count: pagesStats?.publishedPages || 0,
      status: "published",
      icon: <Globe className="h-5 w-5" />,
    },
    {
      title: "Borradores",
      count: pagesStats?.draftPages || 0,
      status: "draft",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Archivos Multimedia",
      count: pagesStats?.totalMedia || 0,
      status: "total",
      icon: <FileImage className="h-5 w-5" />,
    },
  ];

  // Redirigir a las diferentes secciones
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard del CMS</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona el contenido de tu sitio web y aplicación
        </p>
      </div>

      {/* Sección de tarjetas de resumen */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {dashboardItems.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {item.title}
                </p>
                <p className="text-3xl font-bold">{item.count}</p>
              </div>
              <div className={`p-2 rounded-md ${
                item.status === 'published' 
                  ? 'bg-green-100 text-green-700'
                  : item.status === 'draft'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {item.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secciones principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sección de Acciones Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PlusCircle className="mr-2 h-5 w-5" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>
              Accede rápidamente a las funciones más utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center justify-center text-center"
                onClick={() => handleNavigate("/admin/cms/pages")}
              >
                <FileText className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Crear Nueva Página</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center justify-center text-center"
                onClick={() => handleNavigate("/admin/cms/media")}
              >
                <FileImage className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Subir Medios</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center justify-center text-center"
                onClick={() => handleNavigate("/admin/cms/categories")}
              >
                <FolderTree className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Gestionar Categorías</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center justify-center text-center"
                onClick={() => handleNavigate("/admin/cms/branding")}
              >
                <Brush className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Editar Apariencia</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sección de Páginas Recientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Páginas Recientes
              </CardTitle>
              <CardDescription>
                Últimas páginas creadas o modificadas
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="gap-1"
              onClick={() => handleNavigate("/admin/cms/pages")}
            >
              Ver todas
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {(!pagesStats?.recentPages || pagesStats.recentPages.length === 0) ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No hay páginas creadas todavía</p>
                <Button 
                  variant="link" 
                  onClick={() => handleNavigate("/admin/cms/pages")}
                  className="mt-2"
                >
                  Crear tu primera página
                </Button>
              </div>
            ) : (
              <Table>
                <TableBody>
                  {pagesStats.recentPages.slice(0, 5).map((page: RecentPage) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">
                        {page.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            page.status === "published"
                              ? "default"
                              : page.status === "draft"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {page.status === "published"
                            ? "Publicada"
                            : page.status === "draft"
                            ? "Borrador"
                            : "Archivada"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(page.updatedAt), "dd MMM yyyy", {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => window.location.href = `/admin/cms/pages?edit=${page.id}`}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => window.open(`/cms/preview/${page.id}`, '_blank')}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              <span>Vista previa</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sección de módulos del CMS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Layers className="mr-2 h-5 w-5" />
            Módulos del CMS
          </CardTitle>
          <CardDescription>
            Todos los componentes disponibles para gestionar tu sitio web
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center justify-center text-center"
              onClick={() => handleNavigate("/admin/cms/pages")}
            >
              <FileText className="h-10 w-10 mb-3" />
              <span className="text-sm font-medium">Páginas</span>
              <span className="text-xs text-muted-foreground mt-1">Gestiona las páginas de tu sitio</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center justify-center text-center"
              onClick={() => handleNavigate("/admin/cms/media")}
            >
              <FileImage className="h-10 w-10 mb-3" />
              <span className="text-sm font-medium">Medios</span>
              <span className="text-xs text-muted-foreground mt-1">Biblioteca de imágenes y archivos</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center justify-center text-center"
              onClick={() => handleNavigate("/admin/cms/categories")}
            >
              <FolderTree className="h-10 w-10 mb-3" />
              <span className="text-sm font-medium">Categorías</span>
              <span className="text-xs text-muted-foreground mt-1">Organiza tu contenido</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center justify-center text-center"
              onClick={() => handleNavigate("/admin/cms/branding")}
            >
              <Brush className="h-10 w-10 mb-3" />
              <span className="text-sm font-medium">Marca</span>
              <span className="text-xs text-muted-foreground mt-1">Personaliza la apariencia</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal que maneja el enrutamiento dentro del CMS
export default function AdminCMS() {
  const [location] = useLocation();

  return (
    <Switch>
      <Route path="/admin/cms/pages" component={AdminCMSPagesPanel} />
      <Route path="/admin/cms/media" component={AdminCMSMediaPanel} />
      <Route path="/admin/cms/categories" component={AdminCMSCategoriesPanel} />
      <Route path="/admin/cms/branding" component={AdminCMSBrandingPanel} />
      <Route path="/admin/cms" component={AdminCMSDashboard} />
      <Route path="/admin/cms/dashboard" component={AdminCMSDashboard} />
    </Switch>
  );
}