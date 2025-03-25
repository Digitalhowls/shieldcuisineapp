import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import AIAnalysis from "@/components/ai-analysis";
import { 
  Calendar, 
  Clock, 
  ClipboardCheck, 
  ClipboardList, 
  FileText, 
  ArrowLeft,
  User,
  Download,
  Printer,
  BarChart4,
  Shield,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface ControlDetail {
  id: number;
  templateId: number;
  templateName: string;
  type: "checklist" | "form";
  status: "pending" | "completed" | "delayed" | "scheduled";
  scheduledFor: string;
  completedAt?: string;
  responsibleName?: string;
  locationName: string;
  formData: {
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
    summary?: {
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
  };
}

export default function ControlDetail() {
  const params = useParams<{ id: string }>();
  const controlId = params?.id ? parseInt(params.id) : 0;
  const [_, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();
  
  // Query to fetch control record details
  const { 
    data: control, 
    isLoading, 
    isError,
    error 
  } = useQuery<ControlDetail>({
    queryKey: [`/api/control-records/${controlId}`],
    enabled: !!controlId,
  });
  
  // Sample control data for development
  const sampleControl: ControlDetail = {
    id: controlId,
    templateId: 1,
    templateName: "Control Temperatura Cámaras",
    type: "checklist",
    status: "completed",
    scheduledFor: "2023-10-12T10:00:00Z",
    completedAt: "2023-10-12T10:30:00Z",
    responsibleName: "Jefe de Cocina",
    locationName: "Cocina Principal",
    formData: {
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
              value: 3.1,
              required: true,
              status: "ok"
            },
            {
              id: "f3",
              type: "temperature",
              label: "Temperatura Cámara 3",
              value: 5.2,
              required: true,
              status: "warning",
              notes: "Ligeramente elevada, revisar"
            }
          ]
        },
        {
          id: "s2",
          title: "Estado de las instalaciones",
          fields: [
            {
              id: "f4",
              type: "checkbox",
              label: "Limpieza adecuada",
              value: true,
              required: true,
              status: "ok"
            },
            {
              id: "f5",
              type: "checkbox",
              label: "Ausencia de condensación",
              value: true,
              required: true,
              status: "ok"
            },
            {
              id: "f6",
              type: "text",
              label: "Observaciones",
              value: "Todas las cámaras funcionan correctamente",
              required: false
            }
          ]
        }
      ],
      summary: {
        score: 95,
        passedItems: 5,
        totalItems: 6,
        issues: ["Temperatura Cámara 3 ligeramente por encima del rango establecido"],
        correctiveActions: ["Revisar sistema de refrigeración de Cámara 3", "Verificar calibración de termómetros"],
        notes: "Control realizado durante inspección rutinaria",
        responsible: "Juan Pérez",
        responsibleRole: "Jefe de Cocina",
        signatureTimestamp: "2023-10-12T10:30:00Z"
      }
    }
  };
  
  const displayedControl = control || sampleControl;
  
  const handleExportPDF = () => {
    toast({
      title: "Exportando PDF",
      description: "El documento se está generando...",
    });
    // In a real implementation, this would trigger a PDF export
  };
  
  const handlePrint = () => {
    toast({
      title: "Imprimiendo",
      description: "Enviando a impresora...",
    });
    // In a real implementation, this would trigger printing
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-success bg-opacity-10 text-success border-success">Completado</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-warning bg-opacity-10 text-warning border-warning">Pendiente</Badge>;
      case 'delayed':
        return <Badge variant="outline" className="bg-error bg-opacity-10 text-error border-error">Retrasado</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="bg-neutral-100 text-neutral-600 border-neutral-200">Programado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const renderFieldValue = (field: any) => {
    const { type, value, status } = field;
    
    // Add status indicator
    const statusIndicator = status ? (
      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
        status === 'ok' ? 'bg-success' : 
        status === 'warning' ? 'bg-warning' : 
        status === 'error' ? 'bg-error' : ''
      }`} />
    ) : null;
    
    // Render different types of values
    switch (type) {
      case 'temperature':
        return (
          <div className="flex items-center">
            {statusIndicator}
            <span className={`font-medium ${
              status === 'warning' ? 'text-warning' : 
              status === 'error' ? 'text-error' : ''
            }`}>{value}°C</span>
          </div>
        );
      case 'checkbox':
        return (
          <div className="flex items-center">
            {statusIndicator}
            <span>{value ? 'Sí' : 'No'}</span>
          </div>
        );
      case 'text':
      case 'textarea':
        return <div>{statusIndicator}<span>{value}</span></div>;
      default:
        return <div>{statusIndicator}<span>{value}</span></div>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="mx-auto max-w-7xl">
        <CardContent className="py-10 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-error" />
          <h3 className="mt-2 text-lg font-semibold text-neutral-900">Error al cargar el control</h3>
          <p className="mt-1 text-neutral-500">
            {error instanceof Error ? error.message : "No se pudo cargar la información del control"}
          </p>
          <Button
            className="mt-4"
            onClick={() => setLocation("/appcc/records")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a registros
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <div className="mb-4">
          <Button variant="ghost" onClick={() => setLocation("/appcc/records")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a registros
          </Button>
        </div>
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-800">{displayedControl.templateName}</h2>
              <p className="text-neutral-500">
                Control #{displayedControl.id} • {displayedControl.locationName}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="h-9" onClick={handleExportPDF}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button variant="outline" className="h-9" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
        
        {/* Information Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between">
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-4 sm:mb-0">
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm text-neutral-500">Estado</p>
                  <div className="mt-1">{getStatusBadge(displayedControl.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Responsable</p>
                  <p className="font-medium">{displayedControl.responsibleName || "Sin asignar"}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Fecha programada</p>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-neutral-400" />
                    {format(new Date(displayedControl.scheduledFor), "d MMM yyyy", { locale: es })}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Hora programada</p>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-neutral-400" />
                    {format(new Date(displayedControl.scheduledFor), "HH:mm", { locale: es })}
                  </div>
                </div>
                {displayedControl.completedAt && (
                  <div>
                    <p className="text-sm text-neutral-500">Completado</p>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-neutral-400" />
                      {format(new Date(displayedControl.completedAt), "d MMM yyyy HH:mm", { locale: es })}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm text-neutral-500">Tipo</p>
                  <div className="flex items-center">
                    {displayedControl.type === "checklist" ? (
                      <>
                        <ClipboardCheck className="h-4 w-4 mr-1 text-neutral-400" />
                        <span>Checklist</span>
                      </>
                    ) : (
                      <>
                        <ClipboardList className="h-4 w-4 mr-1 text-neutral-400" />
                        <span>Formulario</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {displayedControl.formData.summary?.score !== undefined && (
                <div className="border-t pt-4 sm:pt-0 sm:border-t-0 sm:border-l sm:pl-8 flex flex-col items-center justify-center">
                  <p className="text-sm text-neutral-500 mb-2">Puntuación</p>
                  <div className="flex flex-col items-center">
                    <div className={`text-3xl font-bold ${
                      displayedControl.formData.summary.score >= 90 ? 'text-success' : 
                      displayedControl.formData.summary.score >= 70 ? 'text-warning' : 
                      'text-error'
                    }`}>
                      {displayedControl.formData.summary.score}%
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {displayedControl.formData.summary.passedItems} de {displayedControl.formData.summary.totalItems} ítems correctos
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details">
              <ClipboardList className="h-4 w-4 mr-2" />
              Detalles
            </TabsTrigger>
            <TabsTrigger value="analysis">
              <BarChart4 className="h-4 w-4 mr-2" />
              Análisis
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            {/* Sections */}
            {displayedControl.formData.sections.map((section) => (
              <Card key={section.id} className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  {section.description && (
                    <CardDescription>{section.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {section.fields.map((field) => (
                      <div key={field.id} className="grid grid-cols-3 gap-4 items-center">
                        <div className="col-span-1 text-neutral-600">{field.label}</div>
                        <div className="col-span-2">
                          {renderFieldValue(field)}
                          {field.notes && (
                            <p className="text-sm text-neutral-500 mt-1">{field.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Summary with issues and corrective actions */}
            {displayedControl.formData.summary && (
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Resumen</CardTitle>
                </CardHeader>
                <CardContent>
                  {displayedControl.formData.summary.notes && (
                    <div className="mb-6">
                      <p>{displayedControl.formData.summary.notes}</p>
                    </div>
                  )}
                  
                  {displayedControl.formData.summary.issues.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Problemas detectados:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {displayedControl.formData.summary.issues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {displayedControl.formData.summary.correctiveActions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Acciones correctivas:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {displayedControl.formData.summary.correctiveActions.map((action, idx) => (
                          <li key={idx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
                
                {displayedControl.formData.summary.signatureTimestamp && (
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div>
                      <p className="text-sm text-neutral-500">
                        Firmado por: <span className="font-medium">{displayedControl.formData.summary.responsible}</span>
                      </p>
                      <p className="text-sm text-neutral-500">
                        Cargo: {displayedControl.formData.summary.responsibleRole}
                      </p>
                    </div>
                    <div className="text-sm text-neutral-500">
                      {format(new Date(displayedControl.formData.summary.signatureTimestamp), "d MMM yyyy, HH:mm", { locale: es })}
                    </div>
                  </CardFooter>
                )}
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="analysis">
            {displayedControl.status === "completed" ? (
              <AIAnalysis 
                controlId={displayedControl.id} 
                controlName={displayedControl.templateName} 
              />
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <Shield className="mx-auto h-12 w-12 text-neutral-300" />
                  <h3 className="mt-2 text-sm font-semibold text-neutral-900">Análisis no disponible</h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    El análisis de IA solo está disponible para controles completados.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}