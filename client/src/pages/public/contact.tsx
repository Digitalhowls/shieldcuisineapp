import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MailCheck, MapPin, Phone, Mail } from 'lucide-react';

// Esquema de validación
const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'El nombre es demasiado corto' }),
  email: z.string().email({ message: 'Email inválido' }),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().min(1, { message: 'Selecciona un asunto' }),
  message: z.string().min(10, { message: 'El mensaje es demasiado corto' }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const ContactPage: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      subject: '',
      message: '',
    },
  });

  // Submit handler
  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);
    
    try {
      // Aquí iría la llamada a la API para enviar el formulario
      // Por ahora simulamos un envío exitoso
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Formulario enviado",
        description: "Hemos recibido tu mensaje. Te contactaremos pronto.",
      });
      
      setIsSuccess(true);
      form.reset();
    } catch (error) {
      toast({
        title: "Error al enviar",
        description: "Ha ocurrido un error al enviar el formulario. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container px-4 sm:px-6 lg:px-8 mx-auto py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">Contacto</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Estamos aquí para ayudarte. Contáctanos para resolver tus dudas o solicitar
          una demostración personalizada de ShieldCuisine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Formulario de contacto */}
        <div>
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Envíanos un mensaje</h2>
            
            {isSuccess ? (
              <div className="text-center py-8">
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MailCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">¡Mensaje enviado!</h3>
                <p className="text-muted-foreground mb-6">
                  Gracias por contactarnos. Hemos recibido tu mensaje y te 
                  responderemos lo antes posible.
                </p>
                <Button onClick={() => setIsSuccess(false)}>
                  Enviar otro mensaje
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre *</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu nombre completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input placeholder="tu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu número de teléfono" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empresa (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre de tu empresa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asunto *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un asunto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="informacion">Información general</SelectItem>
                            <SelectItem value="demo">Solicitud de demostración</SelectItem>
                            <SelectItem value="presupuesto">Solicitud de presupuesto</SelectItem>
                            <SelectItem value="soporte">Soporte técnico</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensaje *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Escribe tu mensaje aquí..."
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar mensaje'
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </Card>
        </div>
        
        {/* Información de contacto */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Información de contacto</h2>
          
          <div className="space-y-8 mb-10">
            <div className="flex items-start">
              <MapPin className="h-6 w-6 text-primary mr-4 mt-1" />
              <div>
                <h3 className="font-medium text-lg mb-1">Oficina central</h3>
                <p className="text-muted-foreground">
                  Calle Principal, 123<br/>
                  28001 Madrid, España
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="h-6 w-6 text-primary mr-4 mt-1" />
              <div>
                <h3 className="font-medium text-lg mb-1">Teléfono</h3>
                <p className="text-muted-foreground">
                  +34 912 345 678<br/>
                  Lunes a Viernes, 9:00 - 18:00
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Mail className="h-6 w-6 text-primary mr-4 mt-1" />
              <div>
                <h3 className="font-medium text-lg mb-1">Email</h3>
                <p className="text-muted-foreground">
                  info@shieldcuisine.com<br/>
                  soporte@shieldcuisine.com
                </p>
              </div>
            </div>
          </div>
          
          {/* Mapa */}
          <div className="rounded-lg overflow-hidden border h-[300px] bg-muted flex items-center justify-center">
            <p className="text-muted-foreground text-center p-4">
              Mapa de ubicación aquí
            </p>
          </div>
        </div>
      </div>

      {/* Preguntas frecuentes */}
      <section className="mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Preguntas frecuentes</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Encuentra respuestas a las preguntas más comunes sobre ShieldCuisine.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-3">¿Qué tipos de negocios pueden usar ShieldCuisine?</h3>
            <p className="text-muted-foreground">
              ShieldCuisine está diseñado para todo tipo de establecimientos alimentarios, 
              desde pequeños restaurantes hasta cadenas con múltiples ubicaciones, pasando
              por obradores, catering y tiendas de alimentación.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-3">¿Cómo puedo comenzar a utilizar la plataforma?</h3>
            <p className="text-muted-foreground">
              El proceso comienza con una demostración personalizada donde analizamos tus
              necesidades específicas. Después, realizamos una implementación a medida 
              y formación para tu equipo.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-3">¿Cuánto tiempo lleva la implementación?</h3>
            <p className="text-muted-foreground">
              El tiempo de implementación varía según el tamaño de tu negocio y los módulos
              que quieras utilizar. Generalmente, entre 1 y 4 semanas para estar completamente
              operativo.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-3">¿Ofrecen soporte técnico continuo?</h3>
            <p className="text-muted-foreground">
              Sí, todos nuestros planes incluyen soporte técnico. Dependiendo del plan elegido,
              ofrecemos diferentes niveles de soporte, desde horario laboral hasta 24/7 para 
              planes empresariales.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;