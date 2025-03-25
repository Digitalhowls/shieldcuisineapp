import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface FormControlProps {
  title: string;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function FormControl({ title, onClose, onSubmit }: FormControlProps) {
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
    ]
  });

  const handleInputChange = (cameraId: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      cameras: prev.cameras.map(camera => 
        camera.id === cameraId ? { ...camera, [field]: value } : camera
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
              <Label htmlFor="date">Fecha y Hora</Label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.date}
                readOnly
                className="bg-neutral-50"
              />
            </div>
            <div>
              <Label htmlFor="responsible">Responsable</Label>
              <Input
                id="responsible"
                value={formData.responsible}
                readOnly
                className="bg-neutral-50"
              />
            </div>
          </div>
          
          {/* Repeating Section for Each Camera */}
          <div className="space-y-4">
            {formData.cameras.map((camera) => (
              <div key={camera.id} className="border border-neutral-100 rounded-md p-4">
                <h4 className="font-medium text-neutral-800 mb-3">{camera.name}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor={`temp-${camera.id}`}>Temperatura (°C)</Label>
                    <Input
                      id={`temp-${camera.id}`}
                      type="number"
                      step="0.1"
                      placeholder="Ej: 2.5"
                      value={camera.temperature}
                      onChange={(e) => handleInputChange(camera.id, "temperature", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>¿En rango aceptable? {camera.id === 1 ? "(1-4°C)" : "(-18 a -22°C)"}</Label>
                    <RadioGroup
                      value={camera.inRange}
                      onValueChange={(value) => handleInputChange(camera.id, "inRange", value)}
                      className="flex space-x-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id={`range-yes-${camera.id}`} />
                        <Label htmlFor={`range-yes-${camera.id}`}>Sí</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id={`range-no-${camera.id}`} />
                        <Label htmlFor={`range-no-${camera.id}`}>No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                
                <div className="mb-4">
                  <Label>Estado de limpieza</Label>
                  <RadioGroup
                    value={camera.cleanState}
                    onValueChange={(value) => handleInputChange(camera.id, "cleanState", value)}
                    className="flex flex-wrap space-x-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="correct" id={`clean-correct-${camera.id}`} />
                      <Label htmlFor={`clean-correct-${camera.id}`}>Correcto</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="attention" id={`clean-attention-${camera.id}`} />
                      <Label htmlFor={`clean-attention-${camera.id}`}>Requiere atención</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unacceptable" id={`clean-unacceptable-${camera.id}`} />
                      <Label htmlFor={`clean-unacceptable-${camera.id}`}>Inaceptable</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label htmlFor={`observations-${camera.id}`}>Observaciones</Label>
                  <Textarea
                    id={`observations-${camera.id}`}
                    rows={2}
                    placeholder="Añada cualquier observación relevante"
                    value={camera.observations}
                    onChange={(e) => handleInputChange(camera.id, "observations", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Signature Section */}
          <div className="mt-6">
            <Label htmlFor="signature">Firma del Responsable</Label>
            <div className="border border-neutral-200 rounded-md bg-neutral-50 h-24 flex items-center justify-center">
              <p className="text-neutral-400 text-sm">Toque aquí para firmar</p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t flex justify-end space-x-3 p-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            Guardar Control
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
