import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SummaryCard from "@/components/dashboard/summary-card";
import ControlsTable from "@/components/dashboard/controls-table";
import FormControl from "@/components/ui/form-control";
import { ControlItem, ActivityItem, TemplateItem } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function Dashboard() {
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedControlId, setSelectedControlId] = useState<number | null>(null);
  
  // Sample data
  const currentDate = format(new Date(), "d 'de' MMMM, yyyy", { locale: es });
  const locationName = "Restaurante El Jardín - Sede Central";
  
  const todayControls: ControlItem[] = [
    {
      id: 1,
      name: "Control Temperatura Cámaras",
      type: "checklist",
      responsible: "Jefe de Cocina",
      time: "10:00 AM",
      status: "completed"
    },
    {
      id: 2,
      name: "Limpieza Zona Preparación",
      type: "checklist",
      responsible: "Personal Limpieza",
      time: "12:00 PM",
      status: "pending"
    },
    {
      id: 3,
      name: "Control Recepción Mercancía",
      type: "form",
      responsible: "Encargado Almacén",
      time: "09:00 AM",
      status: "delayed"
    },
    {
      id: 4,
      name: "Control Trazabilidad Producto",
      type: "form",
      responsible: "Jefe de Cocina",
      time: "16:00 PM",
      status: "scheduled"
    }
  ];
  
  const recentActivities: ActivityItem[] = [
    {
      id: 1,
      type: "check",
      userName: "María Rodriguez",
      action: "completó el control",
      target: "Temperatura Cámaras",
      time: "Hace 45 minutos"
    },
    {
      id: 2,
      type: "warning",
      userName: "Sistema",
      action: "detectó temperatura fuera de rango en",
      target: "Cámara 2",
      time: "Hace 1 hora"
    },
    {
      id: 3,
      type: "edit",
      userName: "Carlos Sánchez",
      action: "modificó la plantilla",
      target: "Control Recepción",
      time: "Hace 3 horas"
    },
    {
      id: 4,
      type: "create",
      userName: "Ana Belén",
      action: "creó un nuevo registro de",
      target: "Limpieza Profunda",
      time: "Ayer, 18:30"
    }
  ];
  
  const templates: TemplateItem[] = [
    {
      id: 1,
      name: "Control Temperatura",
      description: "Checklist diario",
      icon: "fas fa-clipboard-list",
      color: "primary"
    },
    {
      id: 2,
      name: "Limpieza y Desinfección",
      description: "Formulario completo",
      icon: "fas fa-broom",
      color: "secondary"
    },
    {
      id: 3,
      name: "Recepción Mercancía",
      description: "Registro con trazabilidad",
      icon: "fas fa-truck",
      color: "accent"
    }
  ];
  
  const handleViewControl = (id: number) => {
    setSelectedControlId(id);
    setFormModalOpen(true);
  };
  
  const handlePerformControl = (id: number) => {
    setSelectedControlId(id);
    setFormModalOpen(true);
  };
  
  const handleSubmitForm = (data: any) => {
    console.log("Form submitted:", data);
    setFormModalOpen(false);
  };
  
  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header with Date and Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-800">Dashboard APPCC</h2>
            <p className="text-neutral-500">
              {currentDate} · {locationName}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button variant="outline" className="flex items-center">
              <i className="fas fa-download mr-2 text-neutral-500"></i>
              <span>Exportar</span>
            </Button>
            <Button className="flex items-center">
              <i className="fas fa-plus mr-2"></i>
              <span>Nuevo Control</span>
            </Button>
          </div>
        </div>
        
        {/* Summary Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SummaryCard
            title="Controles Pendientes Hoy"
            value="5 de 12"
            icon="fas fa-clipboard-list"
            color="primary"
            progressValue={42}
          />
          
          <SummaryCard
            title="Alertas Activas"
            value="3"
            icon="fas fa-exclamation-triangle"
            color="warning"
            footer={
              <div className="text-xs font-medium text-neutral-500 flex justify-between">
                <span>2 temperaturas fuera de rango</span>
                <span>1 limpieza vencida</span>
              </div>
            }
          />
          
          <SummaryCard
            title="Tasa de Cumplimiento"
            value="92%"
            icon="fas fa-check-circle"
            color="success"
            footer={
              <div className="text-xs font-medium text-success">
                <i className="fas fa-arrow-up"></i> 3% respecto al mes anterior
              </div>
            }
          />
        </div>
        
        {/* Today's Controls Section */}
        <Card className="mb-6">
          <CardHeader className="flex justify-between items-center py-4">
            <h3 className="font-semibold text-neutral-800">Controles para Hoy</h3>
            <Button variant="link">Ver todos</Button>
          </CardHeader>
          
          <ControlsTable 
            controls={todayControls}
            onView={handleViewControl}
            onPerform={handlePerformControl}
          />
        </Card>
        
        {/* Two-Column Layout for Recent Activity and Template Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity Feed */}
          <Card className="lg:col-span-2">
            <CardHeader className="py-4">
              <h3 className="font-semibold text-neutral-800">Actividad Reciente</h3>
            </CardHeader>
            <CardContent className="divide-y divide-neutral-100">
              {recentActivities.map((activity) => {
                const getIconClass = (type: string) => {
                  switch (type) {
                    case 'check': return "h-8 w-8 rounded-full bg-primary-light bg-opacity-20 flex items-center justify-center";
                    case 'warning': return "h-8 w-8 rounded-full bg-warning bg-opacity-20 flex items-center justify-center";
                    case 'edit': return "h-8 w-8 rounded-full bg-info bg-opacity-20 flex items-center justify-center";
                    case 'create': return "h-8 w-8 rounded-full bg-success bg-opacity-20 flex items-center justify-center";
                    default: return "h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center";
                  }
                };
                
                const getIconContent = (type: string) => {
                  switch (type) {
                    case 'check': return <i className="fas fa-check text-primary"></i>;
                    case 'warning': return <i className="fas fa-exclamation-triangle text-warning"></i>;
                    case 'edit': return <i className="fas fa-pencil-alt text-info"></i>;
                    case 'create': return <i className="fas fa-file-medical text-success"></i>;
                    default: return <i className="fas fa-question text-neutral-500"></i>;
                  }
                };
                
                return (
                  <div key={activity.id} className="py-3 flex">
                    <div className="flex-shrink-0 mr-3">
                      <div className={getIconClass(activity.type)}>
                        {getIconContent(activity.type)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-800">
                        <span className="font-medium">{activity.userName}</span> {activity.action} <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          
          {/* Quick Tools / Template Access */}
          <Card>
            <CardHeader className="py-4">
              <h3 className="font-semibold text-neutral-800">Plantillas Frecuentes</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates.map((template) => {
                  const getColorClass = (color: string) => {
                    switch (color) {
                      case 'primary': return "bg-primary-light bg-opacity-20 text-primary";
                      case 'secondary': return "bg-secondary bg-opacity-20 text-secondary";
                      case 'accent': return "bg-accent bg-opacity-20 text-accent";
                      default: return "bg-neutral-100 text-neutral-500";
                    }
                  };
                  
                  return (
                    <Link key={template.id} href={`/appcc/templates/${template.id}`}>
                      <a className="block p-3 border border-neutral-100 rounded-md hover:bg-neutral-50 transition duration-150">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            <div className={`h-8 w-8 rounded ${getColorClass(template.color)} flex items-center justify-center`}>
                              <i className={template.icon}></i>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-800">{template.name}</p>
                            <p className="text-xs text-neutral-500">{template.description}</p>
                          </div>
                        </div>
                      </a>
                    </Link>
                  );
                })}
                
                <div className="mt-4">
                  <Link href="/appcc/templates/new">
                    <Button variant="outline" className="w-full">
                      <i className="fas fa-plus mr-1"></i> Nueva Plantilla
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Form Modal */}
      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="max-w-3xl p-0">
          <FormControl 
            title={selectedControlId === 3 ? "Control Recepción Mercancía" : "Control Temperatura Cámaras"} 
            onClose={() => setFormModalOpen(false)}
            onSubmit={handleSubmitForm}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
