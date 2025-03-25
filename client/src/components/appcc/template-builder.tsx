import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Trash2, Plus, MoveUp, MoveDown, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define types for template form fields
type FieldType = 
  | "text" 
  | "number" 
  | "textarea" 
  | "select" 
  | "checkbox" 
  | "radio" 
  | "temperature" 
  | "date" 
  | "time"
  | "datetime"
  | "signature";

interface FieldOption {
  label: string;
  value: string;
}

interface TemplateField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  required: boolean;
  placeholder?: string;
  options?: FieldOption[];
  validations?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  // For temperature fields
  temperatureRange?: {
    min: number;
    max: number;
    unit: "C" | "F";
  };
}

interface TemplateSection {
  id: string;
  title: string;
  description?: string;
  fields: TemplateField[];
}

export interface TemplateData {
  name: string;
  description: string;
  type: "checklist" | "form";
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "custom";
  customFrequency?: string;
  active: boolean;
  requiredRole?: string;
  sections: TemplateSection[];
}

interface TemplateBuilderProps {
  initialData?: TemplateData;
  onSave: (template: TemplateData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Helper functions
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

const createEmptyField = (type: FieldType): TemplateField => {
  return {
    id: generateId(),
    type,
    label: "",
    required: false,
  };
};

const createEmptySection = (): TemplateSection => {
  return {
    id: generateId(),
    title: "",
    fields: []
  };
};

const defaultTemplate: TemplateData = {
  name: "",
  description: "",
  type: "checklist",
  frequency: "daily",
  active: true,
  sections: [createEmptySection()]
};

export default function TemplateBuilder({ 
  initialData, 
  onSave, 
  onCancel, 
  isLoading = false 
}: TemplateBuilderProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("editor");
  const [template, setTemplate] = useState<TemplateData>(initialData || defaultTemplate);
  
  // Handle general template info changes
  const handleTemplateChange = (key: keyof TemplateData, value: any) => {
    setTemplate(prev => ({ ...prev, [key]: value }));
  };
  
  // Add a new section to the template
  const addSection = () => {
    setTemplate(prev => ({
      ...prev,
      sections: [...prev.sections, createEmptySection()]
    }));
  };
  
  // Update a section
  const updateSection = (sectionId: string, key: keyof TemplateSection, value: any) => {
    setTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section => 
        section.id === sectionId ? { ...section, [key]: value } : section
      )
    }));
  };
  
  // Delete a section
  const deleteSection = (sectionId: string) => {
    if (template.sections.length <= 1) {
      toast({
        title: "Error",
        description: "El template debe tener al menos una sección",
        variant: "destructive"
      });
      return;
    }
    
    setTemplate(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  };
  
  // Add a field to a section
  const addField = (sectionId: string, type: FieldType) => {
    setTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section => 
        section.id === sectionId 
          ? { ...section, fields: [...section.fields, createEmptyField(type)] } 
          : section
      )
    }));
  };
  
  // Update a field
  const updateField = (sectionId: string, fieldId: string, key: keyof TemplateField, value: any) => {
    setTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id !== sectionId) return section;
        
        return {
          ...section,
          fields: section.fields.map(field => 
            field.id === fieldId ? { ...field, [key]: value } : field
          )
        };
      })
    }));
  };
  
  // Delete a field
  const deleteField = (sectionId: string, fieldId: string) => {
    setTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id !== sectionId) return section;
        
        return {
          ...section,
          fields: section.fields.filter(field => field.id !== fieldId)
        };
      })
    }));
  };
  
  // Move a field up or down
  const moveField = (sectionId: string, fieldId: string, direction: "up" | "down") => {
    setTemplate(prev => {
      // Find the section
      const sectionIndex = prev.sections.findIndex(s => s.id === sectionId);
      if (sectionIndex === -1) return prev;
      
      const section = prev.sections[sectionIndex];
      const fields = [...section.fields];
      
      // Find the field
      const fieldIndex = fields.findIndex(f => f.id === fieldId);
      if (fieldIndex === -1) return prev;
      
      // Determine new index
      const newIndex = direction === "up" 
        ? Math.max(0, fieldIndex - 1) 
        : Math.min(fields.length - 1, fieldIndex + 1);
        
      // Don't do anything if we're already at the boundary
      if (newIndex === fieldIndex) return prev;
      
      // Swap the fields
      [fields[fieldIndex], fields[newIndex]] = [fields[newIndex], fields[fieldIndex]];
      
      // Update the state
      const newSections = [...prev.sections];
      newSections[sectionIndex] = { ...section, fields };
      
      return { ...prev, sections: newSections };
    });
  };
  
  // Validate the template before saving
  const validateTemplate = (): boolean => {
    // Check basic fields
    if (!template.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la plantilla es obligatorio",
        variant: "destructive"
      });
      return false;
    }
    
    // Check for custom frequency
    if (template.frequency === "custom" && !template.customFrequency?.trim()) {
      toast({
        title: "Error",
        description: "Debe especificar una frecuencia personalizada",
        variant: "destructive"
      });
      return false;
    }
    
    // Validate sections
    for (const section of template.sections) {
      // Check section title
      if (!section.title.trim()) {
        toast({
          title: "Error",
          description: "Todas las secciones deben tener un título",
          variant: "destructive"
        });
        return false;
      }
      
      // Check fields have labels
      for (const field of section.fields) {
        if (!field.label.trim()) {
          toast({
            title: "Error",
            description: `Campo sin etiqueta en sección "${section.title}"`,
            variant: "destructive"
          });
          return false;
        }
        
        // Validate select/radio options
        if ((field.type === "select" || field.type === "radio") && (!field.options || field.options.length < 1)) {
          toast({
            title: "Error",
            description: `Campo "${field.label}" necesita al menos una opción`,
            variant: "destructive"
          });
          return false;
        }
        
        // Validate temperature range
        if (field.type === "temperature" && (!field.temperatureRange || field.temperatureRange.min >= field.temperatureRange.max)) {
          toast({
            title: "Error",
            description: `Rango de temperatura inválido para campo "${field.label}"`,
            variant: "destructive"
          });
          return false;
        }
      }
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTemplate()) return;
    
    // Convert template to the expected format for the backend
    const formattedTemplate = {
      ...template,
      // If using custom frequency, use the customFrequency value
      frequency: template.frequency === "custom" ? template.customFrequency! : template.frequency,
      // Format the template structure as JSON for the backend
      formStructure: JSON.stringify({
        sections: template.sections
      })
    };
    
    onSave(formattedTemplate as TemplateData);
  };
  
  // Render preview of the template
  const renderTemplatePreview = () => {
    return (
      <div className="bg-white p-6 border rounded-lg">
        <h2 className="text-xl font-bold mb-2">{template.name || "Sin nombre"}</h2>
        {template.description && <p className="text-neutral-600 mb-4">{template.description}</p>}
        
        <div className="flex items-center space-x-2 mb-6">
          <Badge variant="outline" className="bg-primary bg-opacity-10 text-primary border-primary">
            {template.type === "checklist" ? "Checklist" : "Formulario"}
          </Badge>
          <Badge variant="outline" className="bg-secondary bg-opacity-10 text-secondary border-secondary">
            {template.frequency === "custom" ? template.customFrequency : template.frequency}
          </Badge>
          {template.active ? (
            <Badge variant="outline" className="bg-success bg-opacity-10 text-success border-success">Activo</Badge>
          ) : (
            <Badge variant="outline" className="bg-neutral-200 text-neutral-500">Inactivo</Badge>
          )}
        </div>
        
        {template.sections.map((section, idx) => (
          <div key={section.id} className="mb-6">
            <h3 className="text-lg font-semibold mb-2">{section.title || `Sección ${idx + 1}`}</h3>
            {section.description && <p className="text-neutral-500 text-sm mb-3">{section.description}</p>}
            
            <div className="space-y-4 border-l-2 border-neutral-100 pl-4">
              {section.fields.map((field) => {
                const requiredAsterisk = field.required ? <span className="text-red-500">*</span> : null;
                
                return (
                  <div key={field.id} className="mb-3">
                    <div className="font-medium text-sm mb-1">
                      {field.label || "Campo sin nombre"} {requiredAsterisk}
                    </div>
                    {field.description && <p className="text-xs text-neutral-500 mb-2">{field.description}</p>}
                    
                    {/* Render appropriate field type */}
                    {renderFieldPreview(field)}
                  </div>
                );
              })}
              
              {section.fields.length === 0 && (
                <p className="text-neutral-400 italic text-sm">No hay campos en esta sección</p>
              )}
            </div>
          </div>
        ))}
        
        {template.sections.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Esta plantilla no tiene secciones definidas</AlertDescription>
          </Alert>
        )}
      </div>
    );
  };
  
  // Render preview of a field based on its type
  const renderFieldPreview = (field: TemplateField) => {
    const placeholder = field.placeholder || `Introduzca ${field.label.toLowerCase()}`;
    
    switch (field.type) {
      case "text":
        return <Input placeholder={placeholder} disabled className="bg-neutral-50 max-w-md" />;
        
      case "number":
        return <Input type="number" placeholder={placeholder} disabled className="bg-neutral-50 max-w-xs" />;
        
      case "textarea":
        return <Textarea placeholder={placeholder} disabled className="bg-neutral-50 max-w-md" rows={3} />;
        
      case "select":
        return (
          <Select disabled>
            <SelectTrigger className="bg-neutral-50 max-w-xs">
              <SelectValue placeholder="Seleccione una opción" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <input type="checkbox" disabled className="h-4 w-4 rounded border-neutral-300" />
            <span className="text-sm text-neutral-500">Marcar si aplica</span>
          </div>
        );
        
      case "radio":
        return (
          <RadioGroup disabled className="flex space-x-4">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`preview-${field.id}-${option.value}`} />
                <Label htmlFor={`preview-${field.id}-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
        
      case "temperature":
        return (
          <div>
            <div className="flex items-center space-x-2 max-w-xs">
              <Input type="number" disabled placeholder="0.0" className="bg-neutral-50" />
              <span>{field.temperatureRange?.unit || "°C"}</span>
            </div>
            {field.temperatureRange && (
              <p className="text-xs text-neutral-500 mt-1">
                Rango aceptable: {field.temperatureRange.min} - {field.temperatureRange.max}{field.temperatureRange.unit}
              </p>
            )}
          </div>
        );
        
      case "date":
        return <Input type="date" disabled className="bg-neutral-50 max-w-xs" />;
        
      case "time":
        return <Input type="time" disabled className="bg-neutral-50 max-w-xs" />;
        
      case "datetime":
        return <Input type="datetime-local" disabled className="bg-neutral-50 max-w-md" />;
        
      case "signature":
        return (
          <div className="border border-neutral-200 rounded-md bg-neutral-50 h-20 flex items-center justify-center max-w-md">
            <p className="text-neutral-400 text-sm">Área para firma</p>
          </div>
        );
        
      default:
        return <Input disabled className="bg-neutral-50 max-w-md" />;
    }
  };
  
  // Field options editor component
  const FieldOptionsEditor = ({ 
    sectionId, 
    field 
  }: { 
    sectionId: string; 
    field: TemplateField 
  }) => {
    const [newOption, setNewOption] = useState({ label: "", value: "" });
    
    const addOption = () => {
      if (!newOption.label.trim()) return;
      
      // Create a value from label if not provided
      const value = newOption.value.trim() || newOption.label.trim().toLowerCase().replace(/\s+/g, '_');
      
      const updatedOptions = [...(field.options || []), { label: newOption.label, value }];
      updateField(sectionId, field.id, "options", updatedOptions);
      setNewOption({ label: "", value: "" });
    };
    
    const removeOption = (value: string) => {
      const updatedOptions = field.options?.filter(opt => opt.value !== value);
      updateField(sectionId, field.id, "options", updatedOptions);
    };
    
    return (
      <div className="mt-3 border rounded-md p-3 bg-neutral-50">
        <Label className="text-sm font-medium mb-2">Opciones</Label>
        
        <div className="space-y-2 mb-3">
          {field.options?.map((option) => (
            <div key={option.value} className="flex items-center justify-between bg-white p-2 rounded border">
              <span className="text-sm truncate">{option.label}</span>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => removeOption(option.value)}
                className="h-6 w-6 text-neutral-500 hover:text-error"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {(!field.options || field.options.length === 0) && (
            <p className="text-neutral-400 text-xs italic">No hay opciones definidas</p>
          )}
        </div>
        
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Label htmlFor={`new-option-${field.id}`} className="text-xs">Etiqueta</Label>
            <Input
              id={`new-option-${field.id}`}
              value={newOption.label}
              onChange={(e) => setNewOption(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Nueva opción"
              className="h-8 text-sm"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor={`new-value-${field.id}`} className="text-xs">Valor (opcional)</Label>
            <Input
              id={`new-value-${field.id}`}
              value={newOption.value}
              onChange={(e) => setNewOption(prev => ({ ...prev, value: e.target.value }))}
              placeholder="Generado automáticamente"
              className="h-8 text-sm"
            />
          </div>
          <Button size="sm" variant="outline" onClick={addOption} className="mb-0.5">
            <Plus className="h-3 w-3 mr-1" />
            Añadir
          </Button>
        </div>
      </div>
    );
  };
  
  // Temperature range editor component
  const TemperatureRangeEditor = ({ 
    sectionId, 
    field 
  }: { 
    sectionId: string; 
    field: TemplateField 
  }) => {
    const range = field.temperatureRange || { min: 0, max: 10, unit: "C" };
    
    const updateRange = (key: keyof typeof range, value: any) => {
      const updatedRange = { ...range, [key]: value };
      updateField(sectionId, field.id, "temperatureRange", updatedRange);
    };
    
    return (
      <div className="mt-3 border rounded-md p-3 bg-neutral-50">
        <Label className="text-sm font-medium mb-2">Rango de temperatura</Label>
        
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor={`temp-min-${field.id}`} className="text-xs">Mínimo</Label>
            <Input
              id={`temp-min-${field.id}`}
              type="number"
              step="0.1"
              value={range.min}
              onChange={(e) => updateRange("min", parseFloat(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label htmlFor={`temp-max-${field.id}`} className="text-xs">Máximo</Label>
            <Input
              id={`temp-max-${field.id}`}
              type="number"
              step="0.1"
              value={range.max}
              onChange={(e) => updateRange("max", parseFloat(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label htmlFor={`temp-unit-${field.id}`} className="text-xs">Unidad</Label>
            <Select 
              value={range.unit} 
              onValueChange={(value) => updateRange("unit", value as "C" | "F")}
            >
              <SelectTrigger id={`temp-unit-${field.id}`} className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="C">°C</SelectItem>
                <SelectItem value="F">°F</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  };
  
  // Field type options for the dropdown
  const fieldTypeOptions = [
    { value: "text", label: "Texto" },
    { value: "number", label: "Número" },
    { value: "textarea", label: "Texto multilínea" },
    { value: "select", label: "Selección" },
    { value: "checkbox", label: "Casilla de verificación" },
    { value: "radio", label: "Opción múltiple" },
    { value: "temperature", label: "Temperatura" },
    { value: "date", label: "Fecha" },
    { value: "time", label: "Hora" },
    { value: "datetime", label: "Fecha y hora" },
    { value: "signature", label: "Firma" }
  ];
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Vista previa</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="mt-4">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Información de la plantilla</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Basic template info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Nombre <span className="text-red-500">*</span></Label>
                    <Input
                      id="template-name"
                      value={template.name}
                      onChange={(e) => handleTemplateChange("name", e.target.value)}
                      placeholder="Control temperatura cámaras"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="template-type">Tipo de plantilla <span className="text-red-500">*</span></Label>
                    <Select
                      value={template.type}
                      onValueChange={(value) => handleTemplateChange("type", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="template-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checklist">Checklist</SelectItem>
                        <SelectItem value="form">Formulario</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-description">Descripción</Label>
                  <Textarea
                    id="template-description"
                    value={template.description}
                    onChange={(e) => handleTemplateChange("description", e.target.value)}
                    placeholder="Describa el propósito de esta plantilla"
                    rows={2}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-frequency">Frecuencia <span className="text-red-500">*</span></Label>
                    <Select
                      value={template.frequency}
                      onValueChange={(value) => handleTemplateChange("frequency", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="template-frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diaria</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="custom">Personalizada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {template.frequency === "custom" && (
                    <div className="space-y-2">
                      <Label htmlFor="template-custom-frequency">
                        Frecuencia personalizada <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="template-custom-frequency"
                        value={template.customFrequency || ""}
                        onChange={(e) => handleTemplateChange("customFrequency", e.target.value)}
                        placeholder="Ej: Dos veces al día, cada 3 días..."
                        disabled={isLoading}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="template-role">Rol requerido</Label>
                    <Select
                      value={template.requiredRole || ""}
                      onValueChange={(value) => handleTemplateChange("requiredRole", value || undefined)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="template-role">
                        <SelectValue placeholder="Cualquier rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Cualquier rol</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="company_admin">Admin. Empresa</SelectItem>
                        <SelectItem value="location_manager">Gerente Local</SelectItem>
                        <SelectItem value="area_supervisor">Supervisor Área</SelectItem>
                        <SelectItem value="employee">Empleado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="template-active"
                      checked={template.active}
                      onCheckedChange={(checked) => handleTemplateChange("active", checked)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="template-active">Plantilla activa</Label>
                  </div>
                </div>
              </CardContent>
              
              <Separator />
              
              {/* Sections and fields */}
              <CardContent className="mt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium">Secciones y campos</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addSection} disabled={isLoading}>
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Añadir sección
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {template.sections.map((section, idx) => (
                    <Card key={section.id} className="border-primary/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1.5">
                            <div className="flex items-center">
                              <Input
                                value={section.title}
                                onChange={(e) => updateSection(section.id, "title", e.target.value)}
                                placeholder={`Sección ${idx + 1}`}
                                className="font-medium"
                                disabled={isLoading}
                              />
                            </div>
                            <div>
                              <Input
                                value={section.description || ""}
                                onChange={(e) => updateSection(section.id, "description", e.target.value)}
                                placeholder="Descripción de la sección (opcional)"
                                className="text-sm text-neutral-500"
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                          
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-neutral-400 hover:text-error"
                            onClick={() => deleteSection(section.id)}
                            disabled={isLoading || template.sections.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-3">
                          {section.fields.map((field, fieldIdx) => (
                            <div 
                              key={field.id} 
                              className="border rounded-md p-3 bg-white relative"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label htmlFor={`field-label-${field.id}`}>
                                    Etiqueta <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id={`field-label-${field.id}`}
                                    value={field.label}
                                    onChange={(e) => updateField(section.id, field.id, "label", e.target.value)}
                                    placeholder="Etiqueta del campo"
                                    disabled={isLoading}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor={`field-type-${field.id}`}>
                                    Tipo de campo <span className="text-red-500">*</span>
                                  </Label>
                                  <Select
                                    value={field.type}
                                    onValueChange={(value) => updateField(
                                      section.id, 
                                      field.id, 
                                      "type", 
                                      value as FieldType
                                    )}
                                    disabled={isLoading}
                                  >
                                    <SelectTrigger id={`field-type-${field.id}`}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {fieldTypeOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                <div className="space-y-2">
                                  <Label htmlFor={`field-desc-${field.id}`}>Descripción</Label>
                                  <Input
                                    id={`field-desc-${field.id}`}
                                    value={field.description || ""}
                                    onChange={(e) => updateField(section.id, field.id, "description", e.target.value)}
                                    placeholder="Información adicional"
                                    disabled={isLoading}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor={`field-placeholder-${field.id}`}>Texto de ayuda</Label>
                                  <Input
                                    id={`field-placeholder-${field.id}`}
                                    value={field.placeholder || ""}
                                    onChange={(e) => updateField(section.id, field.id, "placeholder", e.target.value)}
                                    placeholder="Ej: Introduzca un valor..."
                                    disabled={isLoading}
                                  />
                                </div>
                                
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id={`field-required-${field.id}`}
                                      checked={field.required}
                                      onCheckedChange={(checked) => updateField(section.id, field.id, "required", checked)}
                                      disabled={isLoading}
                                    />
                                    <Label htmlFor={`field-required-${field.id}`}>Obligatorio</Label>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Field type specific settings */}
                              {(field.type === "select" || field.type === "radio") && (
                                <FieldOptionsEditor sectionId={section.id} field={field} />
                              )}
                              
                              {field.type === "temperature" && (
                                <TemperatureRangeEditor sectionId={section.id} field={field} />
                              )}
                              
                              {/* Field controls */}
                              <div className="absolute right-3 top-3 flex space-x-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-neutral-400 hover:text-primary"
                                        onClick={() => moveField(section.id, field.id, "up")}
                                        disabled={isLoading || fieldIdx === 0}
                                      >
                                        <MoveUp className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Mover arriba</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-neutral-400 hover:text-primary"
                                        onClick={() => moveField(section.id, field.id, "down")}
                                        disabled={isLoading || fieldIdx === section.fields.length - 1}
                                      >
                                        <MoveDown className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Mover abajo</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-neutral-400 hover:text-error"
                                        onClick={() => deleteField(section.id, field.id)}
                                        disabled={isLoading}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Eliminar campo</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          ))}
                          
                          {/* Add field button */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Select
                              onValueChange={(value) => addField(section.id, value as FieldType)}
                              disabled={isLoading}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Añadir campo" />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldTypeOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="border-t flex justify-end space-x-3 p-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin">⟳</span>
                      Guardando...
                    </>
                  ) : (
                    "Guardar Plantilla"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Vista previa de la plantilla</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTemplatePreview()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}