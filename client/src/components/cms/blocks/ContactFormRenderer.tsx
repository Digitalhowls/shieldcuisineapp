import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Field {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface ContactFormRendererProps {
  title?: string;
  description?: string;
  fields: Field[];
  submitText?: string;
  email?: string;
  showSuccess?: boolean;
  successMessage?: string;
  companyId: number;
  pageId?: number;
  formId: string;
}

const ContactFormRenderer: React.FC<ContactFormRendererProps> = ({
  title,
  description,
  fields,
  submitText = 'Enviar',
  email,
  showSuccess = true,
  successMessage = 'Gracias por tu mensaje. Te responderemos lo antes posible.',
  companyId,
  pageId,
  formId
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error cuando el usuario comienza a editar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      if (field.required) {
        const value = formData[field.name];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          newErrors[field.name] = 'Este campo es obligatorio';
          isValid = false;
        } else if (field.type === 'email' && !/\S+@\S+\.\S+/.test(value)) {
          newErrors[field.name] = 'Por favor, introduce un email válido';
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Incluir el email de destino en los datos para que el backend sepa dónde enviar la notificación
      const submissionData = {
        companyId,
        pageId: pageId || null,
        formId,
        data: {
          ...formData,
          destinationEmail: email
        }
      };

      const response = await apiRequest('POST', '/api/cms/forms/submit', submissionData);
      const result = await response.json();

      if (response.ok) {
        if (showSuccess) {
          setIsSubmitted(true);
        } else {
          toast({
            title: 'Formulario enviado',
            description: successMessage,
          });
          // Resetear el formulario
          setFormData({});
        }
      } else {
        throw new Error(result.error || 'Error al enviar el formulario');
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar el formulario. Por favor, inténtalo de nuevo más tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-6 border rounded-md text-center">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
          <p className="text-green-800">{successMessage}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setIsSubmitted(false);
            setFormData({});
          }}
        >
          Enviar otro mensaje
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full border rounded-md p-6 space-y-4">
      {title && <h3 className="text-xl font-bold">{title}</h3>}
      {description && <p className="text-muted-foreground">{description}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field, index) => (
          <div key={index} className="space-y-2">
            <Label
              htmlFor={`form-${field.name}`}
              className="flex items-center"
            >
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            
            {field.type === 'textarea' ? (
              <Textarea
                id={`form-${field.name}`}
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.label}
                className={errors[field.name] ? 'border-destructive' : ''}
              />
            ) : field.type === 'select' ? (
              <Select
                value={formData[field.name] || ''}
                onValueChange={(value) => handleChange(field.name, value)}
              >
                <SelectTrigger 
                  className={errors[field.name] ? 'border-destructive' : ''}
                >
                  <SelectValue placeholder={`Seleccionar ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option, optIndex) => (
                    <SelectItem key={optIndex} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'checkbox' ? (
              <div className="flex items-center space-x-2">
                <Switch
                  id={`form-${field.name}`}
                  checked={formData[field.name] || false}
                  onCheckedChange={(checked) => handleChange(field.name, checked)}
                />
                <Label htmlFor={`form-${field.name}`}>{field.label}</Label>
              </div>
            ) : field.type === 'radio' && field.options ? (
              <div className="space-y-2">
                {field.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`${field.name}-${optIndex}`}
                      name={field.name}
                      value={option}
                      checked={formData[field.name] === option}
                      onChange={() => handleChange(field.name, option)}
                      className="h-4 w-4"
                    />
                    <label htmlFor={`${field.name}-${optIndex}`}>{option}</label>
                  </div>
                ))}
              </div>
            ) : (
              <Input
                id={`form-${field.name}`}
                type={field.type}
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.label}
                className={errors[field.name] ? 'border-destructive' : ''}
              />
            )}
            
            {errors[field.name] && (
              <p className="text-destructive text-sm">{errors[field.name]}</p>
            )}
          </div>
        ))}
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            submitText
          )}
        </Button>
      </form>
    </div>
  );
};

export default ContactFormRenderer;