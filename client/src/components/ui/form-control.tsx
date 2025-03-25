import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface FormControlProps {
  title: string;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function FormControl({ title, onClose, onSubmit, isLoading = false }: FormControlProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    responsible: "María Rodriguez",
    cameras: [
      {
        id: 1,
        name: "Cámara 1: Refrigeración Principal",
        temperature: "",
        inRange: "",
        cleanState: "",
        observations: ""
      },
      {
        id: 2,
        name: "Cámara 2: Congelación",
        temperature: "",
        inRange: "",
        cleanState: "",
        observations: ""
      }
    ],
    signatureComplete: false
  });

  const handleInputChange = (cameraId: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      cameras: prev.cameras.map(camera => 
        camera.id === cameraId ? { ...camera, [field]: value } : camera
      )
    }));
  };

  const handleSignature = () => {
    setFormData(prev => ({
      ...prev,
      signatureComplete: true
    }));
    toast({
      title: "Firma capturada",
      description: "La firma ha sido capturada correctamente"
    });
  };

  const validateForm = () => {
    // Check if all cameras have temperature, inRange and cleanState
    const isValid = formData.cameras.every(camera => 
      camera.temperature && camera.inRange && camera.cleanState
    ) && formData.signatureComplete;
    
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Formulario incompleto",
        description: "Por favor complete todos los campos obligatorios y firme el documento",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <Button variant="ghost" onClick={onClose} size="icon">
            <i className="fas fa-times"></i>
          </Button>
        </div>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          <p className="text-sm text-neutral-600 mb-4">
            Complete el siguiente control de temperatura para todas las cámaras frigoríficas. 
            Si alguna temperatura está fuera de rango, tome acción correctiva inmediata.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="date" className="text-sm font-medium">Fecha y Hora</Label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.date}
                readOnly
                className="bg-neutral-50"
              />
            </div>
            <div>
              <Label htmlFor="responsible" className="text-sm font-medium">Responsable</Label>
              <Input
                id="responsible"
                value={formData.responsible}
                readOnly
                className="bg-neutral-50"
              />
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Repeating Section for Each Camera */}
          <div className="space-y-6">
            {formData.cameras.map((camera) => (
              <div key={camera.id} className="border border-neutral-100 rounded-md p-4">
                <h4 className="font-medium text-neutral-800 mb-3">{camera.name}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor={`temp-${camera.id}`} className="text-sm font-medium">
                      Temperatura (°C) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`temp-${camera.id}`}
                      type="number"
                      step="0.1"
                      placeholder="Ej: 2.5"
                      value={camera.temperature}
                      onChange={(e) => handleInputChange(camera.id, "temperature", e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      ¿En rango aceptable? {camera.id === 1 ? "(1-4°C)" : "(-18 a -22°C)"} <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={camera.inRange}
                      onValueChange={(value) => handleInputChange(camera.id, "inRange", value)}
                      className="flex space-x-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id={`range-yes-${camera.id}`} disabled={isLoading} />
                        <Label htmlFor={`range-yes-${camera.id}`} className="text-sm">Sí</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id={`range-no-${camera.id}`} disabled={isLoading} />
                        <Label htmlFor={`range-no-${camera.id}`} className="text-sm">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                
                <div className="mb-4">
                  <Label className="text-sm font-medium">
                    Estado de limpieza <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={camera.cleanState}
                    onValueChange={(value) => handleInputChange(camera.id, "cleanState", value)}
                    className="flex flex-wrap gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="correct" id={`clean-correct-${camera.id}`} disabled={isLoading} />
                      <Label htmlFor={`clean-correct-${camera.id}`} className="text-sm">Correcto</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="attention" id={`clean-attention-${camera.id}`} disabled={isLoading} />
                      <Label htmlFor={`clean-attention-${camera.id}`} className="text-sm">Requiere atención</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unacceptable" id={`clean-unacceptable-${camera.id}`} disabled={isLoading} />
                      <Label htmlFor={`clean-unacceptable-${camera.id}`} className="text-sm">Inaceptable</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label htmlFor={`observations-${camera.id}`} className="text-sm font-medium">Observaciones</Label>
                  <Textarea
                    id={`observations-${camera.id}`}
                    rows={2}
                    placeholder="Añada cualquier observación relevante"
                    value={camera.observations}
                    onChange={(e) => handleInputChange(camera.id, "observations", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Signature Section */}
          <div className="mt-6">
            <Label htmlFor="signature" className="text-sm font-medium">
              Firma del Responsable <span className="text-red-500">*</span>
            </Label>
            <div 
              className="border border-neutral-200 rounded-md bg-neutral-50 h-24 flex items-center justify-center cursor-pointer hover:bg-neutral-100 transition-colors"
              onClick={handleSignature}
            >
              {formData.signatureComplete ? (
                <p className="text-success text-sm font-medium">Firmado digitalmente por {formData.responsible}</p>
              ) : (
                <p className="text-neutral-400 text-sm">Toque aquí para firmar</p>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t flex justify-end space-x-3 p-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
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
        </CardFooter>
      </form>
    </Card>
  );
}
