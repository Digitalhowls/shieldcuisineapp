import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Settings, 
  Boxes, 
  Building2, 
  GraduationCap, 
  CreditCard,
  BarChart3,
  Check,
  Server,
  Users,
  ArrowRight,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Datos de los módulos
const modules = [
  {
    id: 'appcc',
    name: 'Módulo APPCC',
    description: 'Gestión completa de controles APPCC con checklist digitales, alertas y análisis automatizado.',
    icon: ShieldCheck,
    color: 'bg-blue-100 text-blue-700',
    price: {
      basic: 49,
      professional: 79,
      enterprise: 129
    },
    features: {
      basic: [
        'Checklist digitales configurables',
        'Programación de controles periódicos',
        'Alertas de tareas pendientes',
        'Registro digital de temperaturas',
        'Acceso para hasta 3 usuarios',
        'Soporte por email'
      ],
      professional: [
        'Todo lo incluido en Basic',
        'Control de puntos críticos avanzado',
        'Integración con dispositivos de medición',
        'Alertas en tiempo real de desviaciones',
        'Generación automática de informes',
        'Acceso para hasta 10 usuarios',
        'Soporte prioritario por email y teléfono'
      ],
      enterprise: [
        'Todo lo incluido en Professional',
        'Análisis predictivo con IA',
        'Personalización completa de flujos de trabajo',
        'Integración con sistemas de terceros (API)',
        'Gestión multiempresa y multiubicación',
        'Usuarios ilimitados',
        'Soporte 24/7 con gestor de cuenta dedicado'
      ]
    },
    benefits: [
      'Reduce el tiempo dedicado a controles APPCC hasta un 70%',
      'Minimiza el riesgo de errores humanos en registros',
      'Aumenta el cumplimiento normativo con alertas proactivas',
      'Facilita auditorías e inspecciones con informes automatizados',
      'Mejora la trazabilidad y el seguimiento de incidencias'
    ]
  },
  {
    id: 'inventory',
    name: 'Módulo Inventario',
    description: 'Control completo de inventario con trazabilidad, alertas de caducidad y optimización de stock.',
    icon: Boxes,
    color: 'bg-green-100 text-green-700',
    price: {
      basic: 39,
      professional: 69,
      enterprise: 119
    },
    features: {
      basic: [
        'Gestión básica de inventario',
        'Control de caducidades',
        'Alertas de stock mínimo',
        'Escaneo de códigos de barras',
        'Acceso para hasta 3 usuarios',
        'Soporte por email'
      ],
      professional: [
        'Todo lo incluido en Basic',
        'Trazabilidad completa de productos',
        'Gestión FIFO/FEFO automatizada',
        'Múltiples almacenes y ubicaciones',
        'Transferencias entre almacenes',
        'Acceso para hasta 10 usuarios',
        'Soporte prioritario por email y teléfono'
      ],
      enterprise: [
        'Todo lo incluido en Professional',
        'Previsión de demanda con IA',
        'Optimización automática de niveles de stock',
        'Integración con proveedores',
        'API completa para integraciones',
        'Usuarios ilimitados',
        'Soporte 24/7 con gestor de cuenta dedicado'
      ]
    },
    benefits: [
      'Reduce el desperdicio alimentario hasta un 25%',
      'Optimiza los niveles de stock y reduce capital inmovilizado',
      'Mejora la rotación de productos con gestión FIFO/FEFO',
      'Elimina las roturas de stock con alertas proactivas',
      'Ahorra tiempo en conteos físicos de inventario'
    ]
  },
  {
    id: 'transparency',
    name: 'Módulo Transparencia',
    description: 'Portal web para clientes con información sobre seguridad alimentaria, alérgenos y certificaciones.',
    icon: Users,
    color: 'bg-purple-100 text-purple-700',
    price: {
      basic: 29,
      professional: 59,
      enterprise: 99
    },
    features: {
      basic: [
        'Portal web personalizable',
        'Información básica de productos',
        'Publicación de certificaciones',
        'Información de alérgenos',
        'Acceso para hasta 3 usuarios',
        'Soporte por email'
      ],
      professional: [
        'Todo lo incluido en Basic',
        'Códigos QR dinámicos para productos',
        'Personalización avanzada del portal',
        'Análisis de visitas y engagement',
        'Comentarios y valoraciones de clientes',
        'Acceso para hasta 10 usuarios',
        'Soporte prioritario por email y teléfono'
      ],
      enterprise: [
        'Todo lo incluido en Professional',
        'Página web completa personalizada',
        'Trazabilidad en tiempo real visible para clientes',
        'Integración con redes sociales',
        'API completa para integraciones',
        'Usuarios ilimitados',
        'Soporte 24/7 con gestor de cuenta dedicado'
      ]
    },
    benefits: [
      'Aumenta la confianza de tus clientes con total transparencia',
      'Diferencia tu negocio de la competencia',
      'Reduce consultas sobre alérgenos e ingredientes',
      'Mejora la percepción de marca y valor añadido',
      'Facilita el cumplimiento del Reglamento UE 1169/2011'
    ]
  },
  {
    id: 'ecommerce',
    name: 'Módulo E-commerce',
    description: 'Integración con WooCommerce para sincronización de inventario, productos y pedidos en tiempo real.',
    icon: Server,
    color: 'bg-orange-100 text-orange-700',
    price: {
      basic: 39,
      professional: 69,
      enterprise: 119
    },
    features: {
      basic: [
        'Sincronización básica de productos',
        'Actualización de stock diaria',
        'Gestión de pedidos básica',
        'Integración con WooCommerce',
        'Acceso para hasta 3 usuarios',
        'Soporte por email'
      ],
      professional: [
        'Todo lo incluido en Basic',
        'Sincronización en tiempo real',
        'Gestión avanzada de pedidos',
        'Gestión de promociones',
        'Múltiples tiendas online',
        'Acceso para hasta 10 usuarios',
        'Soporte prioritario por email y teléfono'
      ],
      enterprise: [
        'Todo lo incluido en Professional',
        'Integración con múltiples plataformas e-commerce',
        'Análisis avanzado de ventas',
        'Personalización completa de la integración',
        'API completa para integraciones',
        'Usuarios ilimitados',
        'Soporte 24/7 con gestor de cuenta dedicado'
      ]
    },
    benefits: [
      'Elimina la gestión manual de pedidos y stock entre sistemas',
      'Reduce errores de disponibilidad y pedidos fallidos',
      'Mejora la experiencia de cliente con información en tiempo real',
      'Aumenta ventas con estrategias multicanal coordinadas',
      'Optimiza la operativa de preparación de pedidos'
    ]
  },
  {
    id: 'elearning',
    name: 'Módulo E-Learning',
    description: 'Plataforma de formación online para empleados con cursos de seguridad alimentaria y certificaciones.',
    icon: GraduationCap,
    color: 'bg-yellow-100 text-yellow-700',
    price: {
      basic: 29,
      professional: 59,
      enterprise: 99
    },
    features: {
      basic: [
        'Cursos básicos preconfigurados',
        'Sistema de evaluación simple',
        'Seguimiento de progreso',
        'Certificados automáticos',
        'Acceso para hasta 10 alumnos',
        'Soporte por email'
      ],
      professional: [
        'Todo lo incluido en Basic',
        'Cursos personalizables',
        'Evaluaciones avanzadas',
        'Gamificación y rankings',
        'Informes detallados de formación',
        'Acceso para hasta 50 alumnos',
        'Soporte prioritario por email y teléfono'
      ],
      enterprise: [
        'Todo lo incluido en Professional',
        'Creación ilimitada de cursos propios',
        'Integración con sistemas de RRHH',
        'Campus virtual personalizado',
        'API completa para integraciones',
        'Alumnos ilimitados',
        'Soporte 24/7 con gestor de cuenta dedicado'
      ]
    },
    benefits: [
      'Asegura que todo el personal está correctamente formado',
      'Reduce costes de formación presencial',
      'Facilita el seguimiento del cumplimiento formativo',
      'Mejora la retención de conocimientos con módulos interactivos',
      'Demuestra compromiso con la formación ante inspecciones'
    ]
  },
  {
    id: 'banking',
    name: 'Módulo Banca',
    description: 'Integración bancaria PSD2 para gestión financiera, pagos y análisis de costes y rentabilidad.',
    icon: CreditCard,
    color: 'bg-sky-100 text-sky-700',
    price: {
      basic: 39,
      professional: 69,
      enterprise: 119
    },
    features: {
      basic: [
        'Integración con una cuenta bancaria',
        'Visualización de movimientos',
        'Categorización básica',
        'Informes financieros simples',
        'Acceso para hasta 3 usuarios',
        'Soporte por email'
      ],
      professional: [
        'Todo lo incluido en Basic',
        'Múltiples cuentas bancarias',
        'Categorización automática avanzada',
        'Gestión de presupuestos',
        'Análisis de rentabilidad',
        'Acceso para hasta 10 usuarios',
        'Soporte prioritario por email y teléfono'
      ],
      enterprise: [
        'Todo lo incluido en Professional',
        'Integración con software contable',
        'Previsiones financieras con IA',
        'Análisis de costes por departamento',
        'API completa para integraciones',
        'Usuarios ilimitados',
        'Soporte 24/7 con gestor de cuenta dedicado'
      ]
    },
    benefits: [
      'Centraliza toda la información financiera en un solo lugar',
      'Automatiza la categorización de gastos e ingresos',
      'Identifica áreas de mejora en la estructura de costes',
      'Mejora la planificación financiera con datos en tiempo real',
      'Toma decisiones basadas en datos con análisis avanzado'
    ]
  },
  {
    id: 'analytics',
    name: 'Módulo Análisis IA',
    description: 'Análisis avanzado con inteligencia artificial para optimización de procesos, costes y calidad.',
    icon: BarChart3,
    color: 'bg-red-100 text-red-700',
    price: {
      basic: 49,
      professional: 89,
      enterprise: 149
    },
    features: {
      basic: [
        'Dashboards básicos predefinidos',
        'Informes mensuales automatizados',
        'Análisis de tendencias simples',
        'Exportación de datos',
        'Acceso para hasta 3 usuarios',
        'Soporte por email'
      ],
      professional: [
        'Todo lo incluido en Basic',
        'Dashboards personalizables',
        'Análisis predictivo básico',
        'Alertas basadas en datos',
        'Segmentación avanzada',
        'Acceso para hasta 10 usuarios',
        'Soporte prioritario por email y teléfono'
      ],
      enterprise: [
        'Todo lo incluido en Professional',
        'Análisis predictivo avanzado con IA',
        'Recomendaciones automatizadas',
        'Integración con todos los módulos',
        'API completa para integraciones',
        'Usuarios ilimitados',
        'Soporte 24/7 con gestor de cuenta dedicado'
      ]
    },
    benefits: [
      'Anticipa problemas antes de que ocurran con análisis predictivo',
      'Identifica oportunidades de mejora con datos integrados',
      'Optimiza procesos basándote en datos reales',
      'Reduce costes con recomendaciones inteligentes',
      'Mejora la toma de decisiones con insights accionables'
    ]
  },
  {
    id: 'purchasing',
    name: 'Módulo Compras',
    description: 'Gestión completa del proceso de compras con pedidos, recepción y análisis de proveedores.',
    icon: Tag,
    color: 'bg-indigo-100 text-indigo-700',
    price: {
      basic: 39,
      professional: 69,
      enterprise: 119
    },
    features: {
      basic: [
        'Gestión de proveedores',
        'Creación de órdenes de compra',
        'Recepción básica de mercancía',
        'Histórico de compras',
        'Acceso para hasta 3 usuarios',
        'Soporte por email'
      ],
      professional: [
        'Todo lo incluido en Basic',
        'Solicitudes de compra y aprobaciones',
        'Comparativa de proveedores',
        'Evaluación de proveedores',
        'Integración con inventario',
        'Acceso para hasta 10 usuarios',
        'Soporte prioritario por email y teléfono'
      ],
      enterprise: [
        'Todo lo incluido en Professional',
        'Previsión automática de necesidades',
        'Optimización de pedidos con IA',
        'Integración con ERPs',
        'API completa para integraciones',
        'Usuarios ilimitados',
        'Soporte 24/7 con gestor de cuenta dedicado'
      ]
    },
    benefits: [
      'Reduce costes de adquisición con compras optimizadas',
      'Mejora la planificación de compras y evita roturas de stock',
      'Evalúa y mejora el rendimiento de tus proveedores',
      'Automatiza procesos repetitivos de compra',
      'Integra todo el proceso desde la necesidad hasta la recepción'
    ]
  }
];

// Componente de tarjeta de plan
const PlanCard: React.FC<{
  module: any;
  plan: 'basic' | 'professional' | 'enterprise';
  planName: string;
  isPopular?: boolean;
}> = ({ module, plan, planName, isPopular }) => {
  return (
    <Card className={`relative h-full flex flex-col ${isPopular ? 'border-primary shadow-lg' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 inset-x-0 flex justify-center">
          <Badge className="bg-primary hover:bg-primary">Más popular</Badge>
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Plan {planName}</h3>
          <div className={`p-2 rounded-full ${module.color} transition-colors`}>
            <module.icon className="h-5 w-5" />
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{module.price[plan]}€</span>
            <span className="text-muted-foreground ml-1">/mes</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Facturación anual. IVA no incluido.</p>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <ul className="space-y-2 mt-4">
          {module.features[plan].map((feature: string, i: number) => (
            <li key={i} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4">
        <Button className="w-full" variant={isPopular ? "default" : "outline"}>
          Elegir plan {planName}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Página principal de la tienda de módulos
const ShopModulesPage: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState(modules[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtrar módulos basados en la búsqueda
  const filteredModules = searchQuery
    ? modules.filter(module => 
        module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : modules;
  
  return (
    <div className="container px-4 sm:px-6 lg:px-8 mx-auto py-12">
      {/* Hero */}
      <motion.section
        className="relative mb-16 py-20 px-6 rounded-xl overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Módulos ShieldCuisine
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Una solución modular y escalable para todas las necesidades de tu 
            negocio alimentario. Elige los módulos que necesitas y amplía
            cuando lo necesites.
          </p>
          <div className="max-w-lg mx-auto">
            <Input 
              placeholder="Buscar módulos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="shadow-sm"
            />
          </div>
        </div>
      </motion.section>
      
      {/* Grid de módulos */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredModules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer transition-all ${selectedModule.id === module.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                onClick={() => setSelectedModule(module)}
              >
                <CardContent className="p-6 flex items-start gap-4">
                  <div className={`p-2 rounded-full ${module.color} transition-colors`}>
                    <module.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{module.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {module.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Detalle del módulo seleccionado */}
      <AnimatePresence mode="wait">
        <motion.section
          key={selectedModule.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-24"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-4">
              <div className={`p-3 rounded-full ${selectedModule.color}`}>
                <selectedModule.icon className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">{selectedModule.name}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {selectedModule.description}
            </p>
          </div>
          
          {/* Planes de precios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <PlanCard 
              module={selectedModule} 
              plan="basic" 
              planName="Basic"
            />
            <PlanCard 
              module={selectedModule} 
              plan="professional" 
              planName="Professional" 
              isPopular
            />
            <PlanCard 
              module={selectedModule} 
              plan="enterprise" 
              planName="Enterprise"
            />
          </div>
          
          {/* Beneficios */}
          <div className="bg-muted/30 rounded-xl p-8 md:p-12">
            <h3 className="text-2xl font-bold mb-6 text-center">
              Beneficios principales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedModule.benefits.map((benefit: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="bg-background p-4 rounded-lg shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-full p-2 mt-1">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <p>{benefit}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </AnimatePresence>
      
      {/* FAQ */}
      <section className="mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Preguntas frecuentes</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Todo lo que necesitas saber sobre nuestros módulos y planes de suscripción
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>¿Puedo cambiar de plan en cualquier momento?</AccordionTrigger>
              <AccordionContent>
                Sí, puedes actualizar tu plan en cualquier momento y el cambio se aplicará inmediatamente. 
                Si cambias a un plan inferior, el cambio se aplicará al finalizar tu ciclo de facturación actual.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>¿Ofrecen descuentos por contratar varios módulos?</AccordionTrigger>
              <AccordionContent>
                Sí, aplicamos descuentos progresivos según el número de módulos contratados: 10% de descuento 
                al contratar 2 módulos, 15% con 3 módulos, y hasta un 25% de descuento al contratar el paquete 
                completo.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>¿Qué pasa si necesito funcionalidades personalizadas?</AccordionTrigger>
              <AccordionContent>
                Nuestros planes Enterprise incluyen cierto nivel de personalización. Para necesidades muy 
                específicas, ofrecemos servicios de desarrollo a medida con presupuesto personalizado. 
                Contacta con nuestro equipo comercial para más información.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>¿Tengo que comprometerme por un tiempo mínimo?</AccordionTrigger>
              <AccordionContent>
                No exigimos compromiso de permanencia, aunque nuestros precios están optimizados para 
                facturación anual. Si prefieres facturación mensual, los precios son un 20% superior 
                a los mostrados.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>¿Incluyen formación para el uso de los módulos?</AccordionTrigger>
              <AccordionContent>
                Todos los planes incluyen formación básica mediante tutoriales y documentación. Los planes 
                Professional y Enterprise incluyen sesiones de formación en directo (2 y 4 horas respectivamente). 
                Formación adicional disponible con coste extra.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
      
      {/* CTA */}
      <motion.section 
        className="bg-primary/5 p-12 rounded-xl text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <h2 className="text-3xl font-bold mb-4">¿No estás seguro de qué módulos necesitas?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
          Nuestros expertos pueden ayudarte a determinar la combinación perfecta de módulos para tu 
          negocio según tus necesidades específicas.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/public/contacto">
              Solicitar asesoramiento
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth">Probar gratis por 14 días</Link>
          </Button>
        </div>
      </motion.section>
    </div>
  );
};

export default ShopModulesPage;