import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Import types
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

interface FormStructure {
  sections: TemplateSection[];
}

interface ControlTemplate {
  id: number;
  name: string;
  description?: string;
  type: "checklist" | "form";
  frequency: string;
  formStructure: string;
  requiredRole?: string;
  locationId?: number;
  companyId: number;
  active: boolean;
}

interface ControlRecord {
  id: number;
  templateId: number;
  templateName?: string;
  status: "pending" | "completed" | "delayed" | "scheduled";
  scheduledFor?: string;
  completedAt?: string;
  completedBy?: number;
  formData?: any;
  locationId: number;
  locationName?: string;
}

// Define types for form values and form context
type FormValues = Record<string, any>;

interface DynamicControlFormProps {
  template: ControlTemplate;
  record?: ControlRecord;
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
  isReadOnly?: boolean;
  isLoading?: boolean;
  currentUser?: {
    id: number;
    name: string;
    role: string;
  };
}

export default function DynamicControlForm({
  template,
  record,
  onSubmit,
  onCancel,
  isReadOnly = false,
  isLoading = false,
  currentUser
}: DynamicControlFormProps) {
  const { toast } = useToast();
  const [formValues, setFormValues] = useState<FormValues>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [signatureComplete, setSignatureComplete] = useState(false);
  const [parsedFormStructure, setParsedFormStructure] = useState<FormStructure | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  
  // Initialize the form structure and values
  useEffect(() => {
    try {
      // Parse the form structure
      const structure = JSON.parse(template.formStructure) as FormStructure;
      setParsedFormStructure(structure);
      
      // Initialize form values from record or with empty values
      let initialValues: FormValues = {
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        responsible: currentUser?.name || "",
        responsibleId: currentUser?.id || 0,
      };
      
      // If we have a record with form data, use that
      if (record?.formData) {
        try {
          const recordData = typeof record.formData === 'string' 
            ? JSON.parse(record.formData) 
            : record.formData;
          
          initialValues = { ...initialValues, ...recordData };
          
          // For completed records, set signature to complete
          if (record.status === "completed") {
            setSignatureComplete(true);
          }
        } catch (e) {
          console.error("Error parsing record form data:", e);
        }
      }
      
      setFormValues(initialValues);
    } catch (error) {
      console.error("Error parsing template structure:", error);
      setParseError("Error al cargar la estructura del formulario. Por favor, contacte con soporte técnico.");
    }
  }, [template, record, currentUser]);
  
  // Handle form field changes
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
    
    // Clear any errors for this field
    if (formErrors[fieldId]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[fieldId];
        return updated;
      });
    }
  };
  
  // Handle signature capture
  const handleSignature = () => {
    setSignatureComplete(true);
    toast({
      title: "Firma capturada",
      description: "La firma ha sido registrada correctamente"
    });
  };
  
  // Validate the form
  const validateForm = (): boolean => {
    if (!parsedFormStructure) return false;
    
    const errors: Record<string, string> = {};
    let isValid = true;
    
    // Validate each section and its fields
    parsedFormStructure.sections.forEach(section => {
      section.fields.forEach(field => {
        const fieldId = field.id;
        const value = formValues[fieldId];
        
        // Check required fields
        if (field.required && (value === undefined || value === null || value === "")) {
          errors[fieldId] = "Este campo es obligatorio";
          isValid = false;
        }
        
        // Validate field based on type
        if (value !== undefined && value !== null && value !== "") {
          switch (field.type) {
            case "number":
              // Validate number range if validations exist
              if (field.validations) {
                const numValue = parseFloat(value);
                if (field.validations.min !== undefined && numValue < field.validations.min) {
                  errors[fieldId] = `El valor debe ser mayor o igual a ${field.validations.min}`;
                  isValid = false;
                }
                if (field.validations.max !== undefined && numValue > field.validations.max) {
                  errors[fieldId] = `El valor debe ser menor o igual a ${field.validations.max}`;
                  isValid = false;
                }
              }
              break;
              
            case "temperature":
              // Validate temperature range
              if (field.temperatureRange) {
                const tempValue = parseFloat(value);
                const { min, max } = field.temperatureRange;
                if (tempValue < min || tempValue > max) {
                  errors[fieldId] = `La temperatura debe estar entre ${min} y ${max}°${field.temperatureRange.unit}`;
                  isValid = false;
                }
              }
              break;
              
            case "text":
              // Validate text length if validations exist
              if (field.validations) {
                if (field.validations.minLength !== undefined && value.length < field.validations.minLength) {
                  errors[fieldId] = `El texto debe tener al menos ${field.validations.minLength} caracteres`;
                  isValid = false;
                }
                if (field.validations.maxLength !== undefined && value.length > field.validations.maxLength) {
                  errors[fieldId] = `El texto debe tener como máximo ${field.validations.maxLength} caracteres`;
                  isValid = false;
                }
                // Validate pattern if exists
                if (field.validations.pattern && !new RegExp(field.validations.pattern).test(value)) {
                  errors[fieldId] = "El formato del texto no es válido";
                  isValid = false;
                }
              }
              break;
          }
        }
      });
    });
    
    // Validate signature
    if (!signatureComplete && !isReadOnly) {
      errors['signature'] = "Es necesario firmar el documento";
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isReadOnly) {
      onCancel();
      return;
    }
    
    if (!validateForm()) {
      toast({
        title: "Formulario incompleto",
        description: "Por favor complete todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }
    
    // Add signature and timestamp to the form data
    const submissionData = {
      ...formValues,
      signature: {
        name: currentUser?.name || "Usuario",
        timestamp: new Date().toISOString(),
        userId: currentUser?.id
      },
      completedAt: new Date().toISOString()
    };
    
    onSubmit(submissionData);
  };
  
  // Render fields based on type
  const renderField = (section: TemplateSection, field: TemplateField) => {
    const fieldId = field.id;
    const value = formValues[fieldId] !== undefined ? formValues[fieldId] : "";
    const error = formErrors[fieldId];
    const placeholder = field.placeholder || `Introduzca ${field.label.toLowerCase()}`;
    const isRequired = field.required && !isReadOnly;
    
    const commonProps = {
      id: fieldId,
      disabled: isLoading || isReadOnly,
      "aria-invalid": error ? true : undefined,
      "aria-errormessage": error ? `${fieldId}-error` : undefined
    };
    
    const renderErrorMessage = error ? (
      <p id={`${fieldId}-error`} className="text-sm text-error mt-1">{error}</p>
    ) : null;
    
    switch (field.type) {
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {field.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            {field.description && <p className="text-xs text-neutral-500">{field.description}</p>}
            <Input
              {...commonProps}
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              placeholder={placeholder}
              className={error ? "border-error" : ""}
            />
            {renderErrorMessage}
          </div>
        );
        
      case "number":
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {field.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            {field.description && <p className="text-xs text-neutral-500">{field.description}</p>}
            <Input
              {...commonProps}
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              placeholder={placeholder}
              className={error ? "border-error" : ""}
              step="any"
            />
            {renderErrorMessage}
          </div>
        );
        
      case "textarea":
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {field.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            {field.description && <p className="text-xs text-neutral-500">{field.description}</p>}
            <Textarea
              {...commonProps}
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              placeholder={placeholder}
              className={error ? "border-error" : ""}
              rows={3}
            />
            {renderErrorMessage}
          </div>
        );
        
      case "select":
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {field.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            {field.description && <p className="text-xs text-neutral-500">{field.description}</p>}
            <Select
              value={value?.toString() || ""}
              onValueChange={(newValue) => handleFieldChange(fieldId, newValue)}
              disabled={isLoading || isReadOnly}
            >
              <SelectTrigger id={fieldId} className={error ? "border-error" : ""}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderErrorMessage}
          </div>
        );
        
      case "checkbox":
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={fieldId}
                checked={!!value}
                onCheckedChange={(checked) => handleFieldChange(fieldId, !!checked)}
                disabled={isLoading || isReadOnly}
              />
              <Label htmlFor={fieldId} className="text-sm font-medium">
                {field.label} {isRequired && <span className="text-red-500">*</span>}
              </Label>
            </div>
            {field.description && <p className="text-xs text-neutral-500 ml-6">{field.description}</p>}
            {renderErrorMessage}
          </div>
        );
        
      case "radio":
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            {field.description && <p className="text-xs text-neutral-500">{field.description}</p>}
            <RadioGroup
              value={value?.toString() || ""}
              onValueChange={(newValue) => handleFieldChange(fieldId, newValue)}
              className="flex flex-wrap gap-4 mt-2"
              disabled={isLoading || isReadOnly}
            >
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${fieldId}-${option.value}`} />
                  <Label htmlFor={`${fieldId}-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {renderErrorMessage}
          </div>
        );
        
      case "temperature":
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {field.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            {field.description && <p className="text-xs text-neutral-500">{field.description}</p>}
            <div className="flex items-center space-x-2 max-w-xs">
              <Input
                {...commonProps}
                type="number"
                value={value}
                onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                placeholder="0.0"
                className={error ? "border-error" : ""}
                step="0.1"
              />
              <span>{field.temperatureRange?.unit === "F" ? "°F" : "°C"}</span>
            </div>
            {field.temperatureRange && (
              <p className="text-xs text-neutral-500">
                Rango aceptable: {field.temperatureRange.min} - {field.temperatureRange.max}
                {field.temperatureRange.unit === "F" ? "°F" : "°C"}
              </p>
            )}
            {renderErrorMessage}
          </div>
        );
        
      case "date":
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {field.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            {field.description && <p className="text-xs text-neutral-500">{field.description}</p>}
            <Input
              {...commonProps}
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              className={error ? "border-error" : ""}
            />
            {renderErrorMessage}
          </div>
        );
        
      case "time":
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {field.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            {field.description && <p className="text-xs text-neutral-500">{field.description}</p>}
            <Input
              {...commonProps}
              type="time"
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              className={error ? "border-error" : ""}
            />
            {renderErrorMessage}
          </div>
        );
        
      case "datetime":
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {field.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            {field.description && <p className="text-xs text-neutral-500">{field.description}</p>}
            <Input
              {...commonProps}
              type="datetime-local"
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              className={error ? "border-error" : ""}
            />
            {renderErrorMessage}
          </div>
        );
        
      case "signature":
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {field.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            {field.description && <p className="text-xs text-neutral-500">{field.description}</p>}
            <div 
              className={`border rounded-md ${isReadOnly ? 'bg-neutral-50' : 'bg-white'} h-24 flex items-center justify-center ${!isReadOnly && !signatureComplete ? 'cursor-pointer hover:bg-neutral-50' : ''} transition-colors ${error ? "border-error" : "border-neutral-200"}`}
              onClick={isReadOnly ? undefined : (!signatureComplete ? handleSignature : undefined)}
            >
              {isReadOnly && value ? (
                <p className="text-sm">{
                  typeof value === 'object' && value.name 
                    ? `Firmado por ${value.name} el ${format(new Date(value.timestamp), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}`
                    : "Documento firmado"
                }</p>
              ) : signatureComplete ? (
                <p className="text-success text-sm font-medium">
                  Firmado digitalmente por {formValues.responsible || currentUser?.name || "Usuario"}
                </p>
              ) : (
                <p className="text-neutral-400 text-sm">Toque aquí para firmar</p>
              )}
            </div>
            {renderErrorMessage || (formErrors['signature'] && !error ? (
              <p className="text-sm text-error mt-1">{formErrors['signature']}</p>
            ) : null)}
          </div>
        );
        
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {field.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            {field.description && <p className="text-xs text-neutral-500">{field.description}</p>}
            <Input
              {...commonProps}
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              placeholder={placeholder}
              className={error ? "border-error" : ""}
            />
            {renderErrorMessage}
          </div>
        );
    }
  };
  
  // If there was an error parsing the form structure
  if (parseError) {
    return (
      <Card className="max-w-3xl w-full">
        <CardHeader className="border-b">
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{parseError}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="border-t flex justify-end p-4">
          <Button variant="outline" onClick={onCancel}>
            Cerrar
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // If we're still loading the form structure
  if (!parsedFormStructure) {
    return (
      <Card className="max-w-3xl w-full">
        <CardHeader className="border-b">
          <CardTitle>{template.name}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <CardHeader className="border-b sticky top-0 bg-white z-10">
        <div className="flex justify-between items-center">
          <CardTitle>
            {isReadOnly ? (
              <span>
                Detalle: {template.name} {record?.status === "completed" && "(Completado)"}
              </span>
            ) : (
              <span>Realizar control: {template.name}</span>
            )}
          </CardTitle>
          <Button variant="ghost" onClick={onCancel} size="icon">
            <span className="sr-only">Cerrar</span>
            <span aria-hidden="true">×</span>
          </Button>
        </div>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          {/* Description */}
          {template.description && (
            <p className="text-sm text-neutral-600 mb-4">{template.description}</p>
          )}
          
          {/* Metadata fields (Date, Responsible) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">Fecha y Hora</Label>
              <Input
                id="date"
                type="datetime-local"
                value={formValues.date || format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => handleFieldChange("date", e.target.value)}
                className={isReadOnly ? "bg-neutral-50" : ""}
                readOnly={isReadOnly}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsible" className="text-sm font-medium">Responsable</Label>
              <Input
                id="responsible"
                value={formValues.responsible || currentUser?.name || ""}
                onChange={(e) => handleFieldChange("responsible", e.target.value)}
                className={isReadOnly ? "bg-neutral-50" : ""}
                readOnly={isReadOnly}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Form Sections */}
          <div className="space-y-8">
            {parsedFormStructure.sections.map((section) => (
              <div key={section.id}>
                <h3 className="font-medium text-neutral-800 mb-1">{section.title}</h3>
                {section.description && (
                  <p className="text-sm text-neutral-500 mb-3">{section.description}</p>
                )}
                
                <div className="grid grid-cols-1 gap-4 mt-3">
                  {section.fields.map((field) => (
                    <div key={field.id}>
                      {renderField(section, field)}
                    </div>
                  ))}
                </div>
                
                {section.fields.length === 0 && (
                  <p className="text-neutral-400 italic text-sm mt-2">No hay campos en esta sección</p>
                )}
              </div>
            ))}
          </div>
          
          {/* Signature Section if not already included */}
          {!parsedFormStructure.sections.some(section => 
            section.fields.some(field => field.type === "signature")
          ) && (
            <div className="mt-6">
              <Label htmlFor="signature" className="text-sm font-medium">
                Firma del Responsable {!isReadOnly && <span className="text-red-500">*</span>}
              </Label>
              <div 
                className={`border border-neutral-200 rounded-md ${isReadOnly ? 'bg-neutral-50' : 'bg-white'} h-24 flex items-center justify-center ${!isReadOnly && !signatureComplete ? 'cursor-pointer hover:bg-neutral-50' : ''} transition-colors ${formErrors['signature'] ? "border-error" : ""}`}
                onClick={isReadOnly ? undefined : (!signatureComplete ? handleSignature : undefined)}
              >
                {isReadOnly && record?.formData?.signature ? (
                  <p className="text-sm">{
                    typeof record.formData.signature === 'object' && record.formData.signature.name 
                      ? `Firmado por ${record.formData.signature.name} el ${format(new Date(record.formData.signature.timestamp), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}`
                      : "Documento firmado"
                  }</p>
                ) : signatureComplete ? (
                  <p className="text-success text-sm font-medium">
                    Firmado digitalmente por {formValues.responsible || currentUser?.name || "Usuario"}
                  </p>
                ) : (
                  <p className="text-neutral-400 text-sm">Toque aquí para firmar</p>
                )}
              </div>
              {formErrors['signature'] && (
                <p className="text-sm text-error mt-1">{formErrors['signature']}</p>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t flex justify-end space-x-3 p-4 sticky bottom-0 bg-white">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {isReadOnly ? "Cerrar" : "Cancelar"}
          </Button>
          {!isReadOnly && (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Control"
              )}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}