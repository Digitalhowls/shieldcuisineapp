import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

// Definir los tipos para las propiedades del componente
export interface ContactFormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: { value: string; label: string }[];
}

interface ContactFormPublicProps {
  title?: string;
  description?: string;
  fields: ContactFormField[];
  submitText?: string;
  email?: string;
  showSuccess?: boolean;
  successMessage?: string;
  companyId: number;
  pageId?: number;
  formId: string;
}

export const ContactFormPublic: React.FC<ContactFormPublicProps> = ({
  title = 'Contacto',
  description = 'Complete el formulario para ponerse en contacto con nosotros.',
  fields = [],
  submitText = 'Enviar',
  email,
  showSuccess = true,
  successMessage = 'Gracias por su mensaje. Nos pondremos en contacto con usted a la brevedad.',
  companyId,
  pageId,
  formId
}) => {
  const [submitted, setSubmitted] = useState(false);

  // Crear un esquema dinámico basado en los campos del formulario
  const formSchema = z.object(
    fields.reduce((acc: Record<string, any>, field) => {
      switch (field.type) {
        case 'text':
        case 'email':
        case 'tel':
        case 'textarea':
        case 'select':
        case 'radio':
          acc[field.id] = field.required
            ? z.string().min(1, { message: 'Este campo es obligatorio' })
            : z.string().optional();
          break;
        case 'checkbox':
          acc[field.id] = field.required
            ? z.boolean().refine((val) => val === true, {
                message: 'Debe aceptar para continuar'
              })
            : z.boolean().optional();
          break;
        // Agregar más tipos según sea necesario
      }
      
      // Validaciones adicionales específicas por tipo
      if (field.type === 'email' && field.id in acc) {
        acc[field.id] = field.required
          ? z.string().min(1, { message: 'El email es obligatorio' }).email({ message: 'Email inválido' })
          : z.string().email({ message: 'Email inválido' }).optional();
      }
      
      if (field.type === 'tel' && field.id in acc) {
        acc[field.id] = field.required
          ? z.string().min(1, { message: 'El teléfono es obligatorio' }).regex(/^[0-9+\- ]+$/, { message: 'Teléfono inválido' })
          : z.string().regex(/^[0-9+\- ]*$/, { message: 'Teléfono inválido' }).optional();
      }
      
      return acc;
    }, {})
  );

  type FormValues = z.infer<typeof formSchema>;

  // Crear valores por defecto para el formulario
  const defaultValues = fields.reduce((acc: Record<string, any>, field) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'textarea':
      case 'select':
      case 'radio':
        acc[field.id] = '';
        break;
      case 'checkbox':
        acc[field.id] = false;
        break;
    }
    return acc;
  }, {});

  // Configurar el formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onBlur'
  });

  // Mutación para enviar el formulario
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest('POST', '/api/cms/forms/submit', {
        formData: data,
        metadata: {
          companyId,
          pageId,
          formId,
          email
        }
      });
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      form.reset();
    },
    onError: (error) => {
      console.error('Error al enviar formulario:', error);
    }
  });

  // Manejar envío del formulario
  const onSubmit = (data: FormValues) => {
    mutate(data);
  };

  // Renderizar mensaje de éxito
  if (submitted && showSuccess) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900 mb-8">
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-800 dark:text-green-300 font-medium text-lg">Enviado correctamente</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-400">
          {successMessage}
        </AlertDescription>
      </Alert>
    );
  }

  // Renderizar formulario
  return (
    <div className="w-full max-w-2xl mx-auto bg-card rounded-lg shadow-sm border p-6">
      {title && <h3 className="text-2xl font-bold mb-3">{title}</h3>}
      {description && <p className="text-muted-foreground mb-6">{description}</p>}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fields.map((field) => (
            <FormField
              key={field.id}
              control={form.control}
              name={field.id}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}{field.required && <span className="text-destructive ml-1">*</span>}</FormLabel>
                  <FormControl>
                    {/* Renderizar el campo según su tipo */}
                    {field.type === 'text' && (
                      <Input 
                        placeholder={field.placeholder}
                        {...formField}
                      />
                    )}
                    {field.type === 'email' && (
                      <Input 
                        type="email"
                        placeholder={field.placeholder} 
                        {...formField}
                      />
                    )}
                    {field.type === 'tel' && (
                      <Input 
                        type="tel"
                        placeholder={field.placeholder} 
                        {...formField}
                      />
                    )}
                    {field.type === 'textarea' && (
                      <Textarea 
                        placeholder={field.placeholder} 
                        {...formField}
                      />
                    )}
                    {field.type === 'checkbox' && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formField.value as boolean}
                          onCheckedChange={formField.onChange}
                        />
                        <span className="text-sm text-muted-foreground">
                          {field.placeholder}
                        </span>
                      </div>
                    )}
                    {field.type === 'select' && field.options && (
                      <Select
                        onValueChange={formField.onChange}
                        defaultValue={formField.value as string}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {field.type === 'radio' && field.options && (
                      <RadioGroup
                        onValueChange={formField.onChange}
                        defaultValue={formField.value as string}
                        className="flex flex-col space-y-1"
                      >
                        {field.options.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                            <label htmlFor={`${field.id}-${option.value}`} className="text-sm">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              submitText
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};