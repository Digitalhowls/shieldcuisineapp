import { useState } from "react";
import { useRoute, Link as WouterLink } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardCheck, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Building2,
  MapPin,
  ChevronLeft,
  Download,
  User,
  ThermometerIcon,
  Printer,
  Share2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { controlStatusEnum, controlTypeEnum } from "@shared/schema";

interface ControlDetail {
  id: number;
  templateId: number;
  templateName: string;
  type: typeof controlTypeEnum.enumValues[number];
  status: typeof controlStatusEnum.enumValues[number];
  scheduledFor: string;
  completedAt?: string;
  companyId: number;
  companyName: string;
  locationId: number;
  locationName: string;
  public: boolean;
  sections: {
    id: string;
    title: string;
    description?: string;
    fields: {
      id: string;
      type: string;
      label: string;
      value: any;
      required: boolean;
      status?: "ok" | "warning" | "error";
      notes?: string;
    }[];
  }[];
  summary: {
    score?: number;
    passedItems: number;
    totalItems: number;
    issues: string[];
    correctiveActions: string[];
    notes?: string;
    responsible: string;
    responsibleRole: string;
    signatureTimestamp?: string;
  };
}

export default function ControlDetalle() {
  const [_, params] = useRoute("/transparencia/control/:id");
  const controlId = params?.id ? parseInt(params.id) : 0;
  const [activeTab, setActiveTab] = useState("control");
  
  const { data: control, isLoading, isError } = useQuery<ControlDetail>({
    queryKey: [`/api/public/controls/${controlId}`],
    queryFn: async () => {
      try {
        // Mock data for now - will be replaced with actual API call
        // const res = await apiRequest("GET", `/api/public/controls/${controlId}`);
        // return await res.json();
        return {
          id: 1,
          templateId: 1,
          templateName: "Control Temperatura Cámaras",
          type: "checklist",
          status: "completed",
          scheduledFor: "2025-03-22T10:00:00Z",
          completedAt: "2025-03-22T10:15:00Z",
          companyId: 1,
          companyName: "Restaurante La Huerta",
          locationId: 1,
          locationName: "Sede Principal",
          public: true,
          sections: [
            {
              id: "s1",
              title: "Temperaturas de cámaras",
              fields: [
                {
                  id: "f1",
                  type: "temperature",
                  label: "Temperatura Cámara 1",
                  value: 2.4,
                  required: true,
                  status: "ok"
                },
                {
                  id: "f2",
                  type: "temperature",
                  label: "Temperatura Cámara 2",
                  value: -18.5,
                  required: true,
                  status: "ok"
                },
                {
                  id: "f3",
                  type: "temperature",
                  label: "Temperatura Cámara 3",
                  value: 3.1,
                  required: true,
                  status: "ok"
                }
              ]
            },
            {
              id: "s2",
              title: "Revisión general",
              fields: [
                {
                  id: "f4",
                  type: "checkbox",
                  label: "¿Funcionan correctamente los equipos de frío?",
                  value: true,
                  required: true,
                  status: "ok"
                },
                {
                  id: "f5",
                  type: "checkbox",
                  label: "¿Están limpias las cámaras?",
                  value: true,
                  required: true,
                  status: "ok"
                },
                {
                  id: "f6",
                  type: "text",
                  label: "Observaciones",
                  value: "Todo funciona correctamente",
                  required: false
                }
              ]
            }
          ],
          summary: {
            score: 100,
            passedItems: 5,
            totalItems: 5,
            issues: [],
            correctiveActions: [],
            responsible: "Carmen García",
            responsibleRole: "Responsable APPCC",
            signatureTimestamp: "2025-03-22T10:18:32Z"
          }
        };
      } catch (error) {
        console.error(`Error fetching control ${controlId}:`, error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success/20 text-success">Completado</Badge>;
      case "pending":
        return <Badge className="bg-warning/20 text-warning">Pendiente</Badge>;
      case "delayed":
        return <Badge className="bg-error/20 text-error">Retrasado</Badge>;
      case "scheduled":
        return <Badge className="bg-info/20 text-info">Programado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getValueDisplay = (field: ControlDetail["sections"][0]["fields"][0]) => {
    switch (field.type) {
      case "temperature":
        return (
          <div className="flex items-center">
            <ThermometerIcon className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="font-medium">{field.value}°C</span>
            {field.status && (
              <Badge className={`ml-2 ${getStatusColor(field.status)}`}>
                {field.status === "ok" ? "Correcto" : field.status === "warning" ? "Atención" : "Incorrecto"}
              </Badge>
            )}
          </div>
        );
      case "checkbox":
        return field.value ? (
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="ml-2">Sí</span>
          </div>
        ) : (
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-error" />
            <span className="ml-2">No</span>
          </div>
        );
      case "text":
      case "textarea":
        return <p className="text-sm">{field.value}</p>;
      default:
        return <span>{field.value?.toString() || "-"}</span>;
    }
  };

  const getStatusColor = (status: "ok" | "warning" | "error") => {
    switch (status) {
      case "ok": return "bg-success/20 text-success";
      case "warning": return "bg-warning/20 text-warning";
      case "error": return "bg-error/20 text-error";
      default: return "";
    }
  };

  const getScoreBadge = (score?: number) => {
    if (score === undefined) return null;
    
    let colorClass = "bg-success/20 text-success";
    if (score < 70) colorClass = "bg-error/20 text-error";
    else if (score < 90) colorClass = "bg-warning/20 text-warning";
    
    return <Badge className={colorClass}>{score}%</Badge>;
  };

  const formatDateTimeDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "dd MMMM yyyy - HH:mm", { locale: es });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  if (isError || !control) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se ha podido cargar la información del control. Por favor, inténtelo de nuevo.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <WouterLink href="/transparencia/controles">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver a controles
            </WouterLink>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 pt-0">
      <Breadcrumb className="py-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <WouterLink href="/transparencia">Transparencia</WouterLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <WouterLink href="/transparencia/controles">Controles</WouterLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detalle</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader className="flex-row justify-between items-start pb-2">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <CardTitle>{control.templateName}</CardTitle>
            </div>
            <CardDescription>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{control.companyName}</span>
                <MapPin className="h-3.5 w-3.5 text-muted-foreground ml-2" />
                <span>{control.locationName}</span>
              </div>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(control.status)}
            {getScoreBadge(control.summary.score)}
          </div>
        </CardHeader>

        <CardContent className="pb-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {control.status === "completed" ? (
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-success mr-2" />
                <div>
                  <span className="font-medium">Completado:</span>{" "}
                  {control.completedAt && formatDateTimeDisplay(control.completedAt)}
                </div>
              </div>
            ) : (
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                <div>
                  <span className="font-medium">Programado:</span>{" "}
                  {formatDateTimeDisplay(control.scheduledFor)}
                </div>
              </div>
            )}
            
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 text-muted-foreground mr-2" />
              <div>
                <span className="font-medium">Responsable:</span>{" "}
                {control.summary.responsible} ({control.summary.responsibleRole})
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="control">Control</TabsTrigger>
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>
            
            <TabsContent value="control" className="space-y-6 py-4">
              {control.sections.map((section) => (
                <div key={section.id} className="space-y-4">
                  <h3 className="text-lg font-medium">{section.title}</h3>
                  {section.description && (
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  )}
                  
                  <div className="space-y-4">
                    {section.fields.map((field) => (
                      <div key={field.id} className="border-b pb-3 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <label className="text-sm font-medium">
                            {field.label}
                            {field.required && <span className="text-red-500">*</span>}
                          </label>
                        </div>
                        <div className="mt-1">
                          {getValueDisplay(field)}
                        </div>
                        {field.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{field.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="resumen" className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Resultado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center items-center py-4">
                      {control.summary.score !== undefined ? (
                        <div className="text-center">
                          <div className={`text-5xl font-bold ${
                            control.summary.score >= 90 ? "text-success" : 
                            control.summary.score >= 70 ? "text-warning" : "text-error"
                          }`}>
                            {control.summary.score}%
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {control.summary.passedItems} de {control.summary.totalItems} ítems correctos
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <CheckCircle className="h-16 w-16 text-success mx-auto" />
                          <p className="text-sm text-muted-foreground mt-2">
                            {control.summary.passedItems} de {control.summary.totalItems} ítems correctos
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Firma y verificación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Responsable:</span>
                        <span className="font-medium">{control.summary.responsible}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Cargo:</span>
                        <span>{control.summary.responsibleRole}</span>
                      </div>
                      {control.summary.signatureTimestamp && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Firma digital:</span>
                          <Badge variant="outline" className="font-mono text-xs">
                            {new Date(control.summary.signatureTimestamp).toLocaleString()}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {(control.summary.issues.length > 0 || control.summary.correctiveActions.length > 0) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Incidencias y acciones correctivas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {control.summary.issues.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Incidencias detectadas:</h4>
                        <ul className="list-disc list-inside text-sm space-y-1 pl-2">
                          {control.summary.issues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {control.summary.correctiveActions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Acciones correctivas:</h4>
                        <ul className="list-disc list-inside text-sm space-y-1 pl-2">
                          {control.summary.correctiveActions.map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {control.summary.notes && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Notas adicionales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{control.summary.notes}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="historico" className="py-4">
              <div className="flex justify-center items-center py-12">
                <div className="text-center space-y-4">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-medium">Historial de controles</h3>
                  <p className="text-muted-foreground">
                    El historial de controles estará disponible próximamente.
                  </p>
                  <Button variant="outline" disabled>
                    Ver histórico
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" asChild>
            <WouterLink href="/transparencia/controles">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver a controles
            </WouterLink>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="hidden md:flex">
              <Share2 className="mr-2 h-4 w-4" />
              Compartir
            </Button>
            <Button variant="outline" className="hidden md:flex">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Descargar informe</span>
              <span className="md:hidden">Descargar</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}