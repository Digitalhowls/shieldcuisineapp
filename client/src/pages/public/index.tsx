import React from 'react';
import { Link } from 'wouter';
import PublicLayout from './layout';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Globe, 
  GraduationCap, 
  CreditCard, 
  Building, 
  Boxes,
  Server,
  BarChart3,
  ArrowRight,
  Check,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

// Animación para los elementos que aparecen al hacer scroll
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

// Características principales
const features = [
  {
    title: 'APPCC Digital',
    description: 'Digitaliza todos tus controles APPCC. Gestiona checklist, temperaturas y establece alertas automáticas.',
    icon: ShieldCheck,
    color: 'bg-blue-100 text-blue-700'
  },
  {
    title: 'Portal Transparencia',
    description: 'Muestra a tus clientes tu compromiso con la seguridad alimentaria con un portal público personalizable.',
    icon: Globe,
    color: 'bg-purple-100 text-purple-700'
  },
  {
    title: 'Gestión Inventario',
    description: 'Control completo de stock, caducidades y trazabilidad. Reduce desperdicios y optimiza compras.',
    icon: Boxes,
    color: 'bg-green-100 text-green-700'
  },
  {
    title: 'Integración WooCommerce',
    description: 'Sincroniza tu tienda online con tu inventario y gestiona los pedidos de forma integrada.',
    icon: Server,
    color: 'bg-orange-100 text-orange-700'
  },
  {
    title: 'E-Learning',
    description: 'Plataforma de formación para tus empleados con cursos de seguridad alimentaria y certificaciones.',
    icon: GraduationCap,
    color: 'bg-yellow-100 text-yellow-700'
  },
  {
    title: 'Banca PSD2',
    description: 'Integración bancaria para gestión financiera, pagos y análisis de costes y rentabilidad.',
    icon: CreditCard,
    color: 'bg-sky-100 text-sky-700'
  },
  {
    title: 'Multiempresa',
    description: 'Gestiona múltiples establecimientos desde una única plataforma centralizada.',
    icon: Building,
    color: 'bg-pink-100 text-pink-700'
  },
  {
    title: 'Análisis IA',
    description: 'Análisis avanzado con inteligencia artificial para optimización de procesos, costes y calidad.',
    icon: BarChart3,
    color: 'bg-red-100 text-red-700'
  }
];

// Casos de uso por tipo de negocio
const useCases = [
  {
    id: 'restaurants',
    title: 'Restaurantes y Bares',
    content: (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <img 
            src="/images/restaurant.jpg" 
            alt="Restaurante" 
            className="rounded-lg w-full max-w-md object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/800x600/e2e8f0/64748b?text=Restaurante';
            }}
          />
          <div>
            <h3 className="text-xl font-bold mb-4">Seguridad alimentaria sin complicaciones</h3>
            <p className="text-muted-foreground mb-4">
              Para restaurantes y bares, ShieldCuisine ofrece una solución integral que simplifica 
              el cumplimiento normativo APPCC sin entorpecer las operaciones diarias.
            </p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Registros digitales de temperatura y limpieza</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Control de alérgenos y fichas técnicas de platos</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Trazabilidad de ingredientes desde el proveedor hasta el plato</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Alertas de caducidad y control de stock optimizado</span>
              </li>
            </ul>
          </div>
        </div>
        <div>
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="italic mb-2">
              "ShieldCuisine ha transformado nuestra operativa diaria. Antes, gastábamos horas rellenando 
              registros en papel. Ahora todo está digitalizado, las inspecciones son mucho más ágiles y 
              nuestro personal puede centrarse en lo importante: nuestros clientes."
            </p>
            <p className="font-semibold">Carlos Rodríguez, Propietario de Restaurante La Viña</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'hotels',
    title: 'Hoteles y Catering',
    content: (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <img 
            src="/images/hotel.jpg" 
            alt="Hotel" 
            className="rounded-lg w-full max-w-md object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/800x600/e2e8f0/64748b?text=Hotel';
            }}
          />
          <div>
            <h3 className="text-xl font-bold mb-4">Control multinivel para operaciones complejas</h3>
            <p className="text-muted-foreground mb-4">
              Hoteles y servicios de catering pueden gestionar múltiples puntos de servicio, cocinas y 
              operaciones desde una única plataforma, asegurando consistencia y calidad.
            </p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Gestión centralizada de múltiples cocinas y puntos de servicio</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Calendario automatizado de tareas APPCC para cada ubicación</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Niveles de acceso personalizados para distintos roles</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Dashboard con indicadores clave de seguridad alimentaria</span>
              </li>
            </ul>
          </div>
        </div>
        <div>
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="italic mb-2">
              "Con operaciones en 3 hoteles y servicio de catering para eventos, necesitábamos una 
              solución que nos permitiera control total. ShieldCuisine nos ha proporcionado visibilidad 
              en tiempo real de todas nuestras operaciones alimentarias."
            </p>
            <p className="font-semibold">Ana Martínez, Directora de Operaciones, Cadena Hotelera Solaris</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'retail',
    title: 'Retail y Supermercados',
    content: (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <img 
            src="/images/retail.jpg" 
            alt="Supermercado" 
            className="rounded-lg w-full max-w-md object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/800x600/e2e8f0/64748b?text=Supermercado';
            }}
          />
          <div>
            <h3 className="text-xl font-bold mb-4">Trazabilidad y rotación de stock optimizada</h3>
            <p className="text-muted-foreground mb-4">
              Para retail alimentario y supermercados, ShieldCuisine proporciona control de stock, 
              trazabilidad completa y gestión de caducidades para reducir desperdicios.
            </p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Gestión FIFO/FEFO automatizada para reducir desperdicios</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Control de temperatura de lineales y cámaras frigoríficas</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Integración con sistemas de código de barras y etiquetado</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Sincronización con tu tienda online WooCommerce</span>
              </li>
            </ul>
          </div>
        </div>
        <div>
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="italic mb-2">
              "Gracias a ShieldCuisine hemos reducido nuestro desperdicio alimentario en un 27%. 
              El sistema de alertas de caducidad y la gestión FIFO automatizada ha supuesto un 
              ahorro considerable, además de mejorar nuestra huella medioambiental."
            </p>
            <p className="font-semibold">Miguel López, Director de Supermercados FrescoMarket</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'production',
    title: 'Producción Alimentaria',
    content: (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <img 
            src="/images/production.jpg" 
            alt="Producción alimentaria" 
            className="rounded-lg w-full max-w-md object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/800x600/e2e8f0/64748b?text=Producción';
            }}
          />
          <div>
            <h3 className="text-xl font-bold mb-4">Trazabilidad completa y análisis avanzado</h3>
            <p className="text-muted-foreground mb-4">
              Para empresas de producción alimentaria, ShieldCuisine ofrece trazabilidad completa
              desde materias primas hasta producto terminado y análisis avanzado para mejora continua.
            </p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Control de puntos críticos en líneas de producción</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Gestión de lotes y trazabilidad completa</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Análisis predictivo con IA para prevención de incidencias</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Generación automática de documentación para auditorías</span>
              </li>
            </ul>
          </div>
        </div>
        <div>
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="italic mb-2">
              "Como empresa con certificación IFS, la documentación y trazabilidad son críticas. 
              ShieldCuisine ha simplificado enormemente nuestros procesos de auditoría y nos permite 
              tener trazabilidad completa en tiempo real de toda nuestra producción."
            </p>
            <p className="font-semibold">Laura García, Responsable Calidad, Conservas Atlántico</p>
          </div>
        </div>
      </div>
    )
  }
];

// Testimonios de clientes
const testimonials = [
  {
    quote: "ShieldCuisine ha revolucionado nuestra gestión APPCC. Hemos reducido el tiempo dedicado a tareas administrativas en un 70% y aumentado nuestra puntuación en las auditorías.",
    author: "María Fernández",
    company: "Restaurante El Olivo",
    image: "/images/testimonials/maria.jpg"
  },
  {
    quote: "La integración con nuestro sistema bancario nos permite tener una visión clara de los costes por área. Hemos optimizado nuestros proveedores y mejorado nuestros márgenes.",
    author: "Antonio Ruiz",
    company: "Grupo Gastronómico Sabores",
    image: "/images/testimonials/antonio.jpg"
  },
  {
    quote: "El portal de transparencia ha sido un diferencial para nuestro negocio. Nuestros clientes valoran poder ver nuestros controles APPCC y nos ha posicionado como líderes en seguridad alimentaria.",
    author: "Laura Martínez",
    company: "Catering Eventos Premium",
    image: "/images/testimonials/laura.jpg"
  },
  {
    quote: "La plataforma de formación nos permite asegurar que todo nuestro personal está correctamente formado en manipulación de alimentos. La tasa de aprobación ha aumentado un 35%.",
    author: "Carlos Sánchez",
    company: "Hotel Marina Bay",
    image: "/images/testimonials/carlos.jpg"
  }
];

// Precios
const pricingPlans = [
  {
    name: "Basic",
    description: "Para pequeños negocios que buscan digitalizar sus controles APPCC.",
    price: 49,
    features: [
      "Módulo APPCC básico",
      "App móvil para registros",
      "Almacenamiento de documentos",
      "Hasta 3 usuarios",
      "Soporte por email"
    ],
    cta: "Empezar ahora",
    popular: false
  },
  {
    name: "Professional",
    description: "Para negocios en crecimiento que necesitan más funcionalidades.",
    price: 99,
    features: [
      "Todo lo de Basic +",
      "Módulo de Inventario",
      "Portal de Transparencia",
      "Hasta 10 usuarios",
      "Soporte prioritario"
    ],
    cta: "Probar gratis 14 días",
    popular: true
  },
  {
    name: "Enterprise",
    description: "Solución completa para cadenas y empresas alimentarias.",
    price: 249,
    features: [
      "Todo lo de Professional +",
      "Multiempresa/multilocalización",
      "E-Learning y Formación",
      "Integración Bancaria PSD2",
      "API completa",
      "Soporte 24/7"
    ],
    cta: "Contactar ventas",
    popular: false
  }
];

// Componente principal de la página de inicio
const HomePage: React.FC = () => {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 -z-10"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10 -z-10"></div>
        
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-4">
                Plataforma todo en uno
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
                Gestión APPCC moderna para negocios alimentarios
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-md">
                Digitaliza tus controles APPCC, optimiza inventarios y aumenta la transparencia 
                con tus clientes. Todo desde una única plataforma.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link href="/auth">
                    Probar gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/public/demo">Ver demostración</Link>
                </Button>
              </div>
              
              <div className="flex items-center mt-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="inline-block h-10 w-10 rounded-full border-2 border-background overflow-hidden">
                      <img 
                        src={`/images/avatars/avatar-${i}.jpg`} 
                        alt={`Usuario ${i}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=User+${i}&background=random`;
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="ml-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Más de 500 negocios confían en nosotros
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary to-primary-foreground/20 rounded-lg blur-xl opacity-20"></div>
                <img 
                  src="/images/dashboard-preview.png" 
                  alt="ShieldCuisine Dashboard" 
                  className="relative rounded-lg shadow-xl w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/800x500/3b82f6/ffffff?text=ShieldCuisine+Dashboard';
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Características */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-4">
              Características principales
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Todo lo que necesitas para cumplir con la normativa APPCC
            </h2>
            <p className="text-lg text-muted-foreground">
              Una plataforma completa que simplifica la gestión de seguridad alimentaria
              y potencia el crecimiento de tu negocio.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className={`p-3 rounded-full ${feature.color} mb-4 w-fit`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Casos de uso */}
      <section className="py-20">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-4">
              Soluciones por sector
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Diseñado para todos los negocios alimentarios
            </h2>
            <p className="text-lg text-muted-foreground">
              Descubre cómo ShieldCuisine se adapta a las necesidades específicas de tu sector
              y tipo de negocio.
            </p>
          </motion.div>
          
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <Tabs defaultValue="restaurants" className="w-full">
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full mb-8">
                {useCases.map(useCase => (
                  <TabsTrigger key={useCase.id} value={useCase.id}>
                    {useCase.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {useCases.map(useCase => (
                <TabsContent key={useCase.id} value={useCase.id}>
                  {useCase.content}
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        </div>
      </section>
      
      {/* Testimonios */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-4">
              Testimonios
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-lg text-muted-foreground">
              Descubre cómo ShieldCuisine está transformando negocios alimentarios en toda España.
            </p>
          </motion.div>
          
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <Carousel className="w-full">
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card className="h-full">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                          <p className="mb-6 italic">{testimonial.quote}</p>
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                              <img 
                                src={testimonial.image} 
                                alt={testimonial.author}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${testimonial.author.replace(' ', '+')}&background=random`;
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-semibold">{testimonial.author}</div>
                              <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center mt-8 gap-2">
                <CarouselPrevious />
                <CarouselNext />
              </div>
            </Carousel>
          </motion.div>
        </div>
      </section>
      
      {/* Precios */}
      <section className="py-20">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-4">
              Precios
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Planes que se adaptan a tu negocio
            </h2>
            <p className="text-lg text-muted-foreground">
              Elige el plan que mejor se adapta a tus necesidades y escala a medida que creces.
              Todos los planes incluyen actualización continua a normativas APPCC.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 inset-x-0 flex justify-center">
                    <Badge className="bg-primary">Más popular</Badge>
                  </div>
                )}
                <Card className={`h-full flex flex-col ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                  <CardContent className="p-6 flex-grow">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      <p className="text-muted-foreground">{plan.description}</p>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold">{plan.price}€</span>
                        <span className="text-muted-foreground ml-1">/mes</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Facturación anual. IVA no incluido.</p>
                    </div>
                    
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full mt-auto" 
                      variant={plan.popular ? "default" : "outline"}
                      asChild
                    >
                      <Link href="/auth">
                        {plan.cta}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-4">
              Preguntas frecuentes
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              ¿Tienes dudas?
            </h2>
            <p className="text-lg text-muted-foreground">
              Respuestas a las preguntas más comunes sobre ShieldCuisine.
              Si no encuentras lo que buscas, contacta con nosotros.
            </p>
          </motion.div>
          
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="max-w-3xl mx-auto"
          >
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid grid-cols-3 w-full mb-8">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="technical">Técnicas</TabsTrigger>
                <TabsTrigger value="pricing">Precios</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4">
                <div className="bg-background rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">¿Qué es ShieldCuisine?</h3>
                  <p className="text-muted-foreground">
                    ShieldCuisine es una plataforma integral de gestión APPCC que permite digitalizar todos los 
                    procesos relacionados con la seguridad alimentaria, desde controles de temperatura hasta 
                    trazabilidad de productos, simplificando el cumplimiento normativo.
                  </p>
                </div>
                
                <div className="bg-background rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">¿Para qué tipos de negocios está diseñado?</h3>
                  <p className="text-muted-foreground">
                    ShieldCuisine está diseñado para todo tipo de negocios alimentarios: restaurantes, hoteles, 
                    servicios de catering, supermercados, tiendas de alimentación y empresas de producción alimentaria.
                  </p>
                </div>
                
                <div className="bg-background rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">¿Es difícil de implementar?</h3>
                  <p className="text-muted-foreground">
                    No, ShieldCuisine está diseñado para ser fácil de usar e implementar. Ofrecemos un proceso de 
                    onboarding guiado y soporte continuo. La mayoría de nuestros clientes están operativos en menos 
                    de una semana.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="technical" className="space-y-4">
                <div className="bg-background rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">¿Funciona en dispositivos móviles?</h3>
                  <p className="text-muted-foreground">
                    Sí, ShieldCuisine tiene una aplicación móvil disponible para iOS y Android, además de una versión 
                    web totalmente responsive que se adapta a cualquier dispositivo.
                  </p>
                </div>
                
                <div className="bg-background rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">¿Puedo exportar los datos?</h3>
                  <p className="text-muted-foreground">
                    Sí, todos los datos pueden exportarse en formatos PDF, Excel o CSV. También puedes generar 
                    informes personalizados para auditorías o análisis internos.
                  </p>
                </div>
                
                <div className="bg-background rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">¿Cómo se integra con mi sistema actual?</h3>
                  <p className="text-muted-foreground">
                    ShieldCuisine ofrece API RESTful completa para integrarse con tus sistemas existentes. También
                    tenemos integraciones preconfiguradas con WooCommerce, sistemas POS comunes y proveedores de pagos.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="pricing" className="space-y-4">
                <div className="bg-background rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">¿Hay algún coste de configuración inicial?</h3>
                  <p className="text-muted-foreground">
                    No, los planes no tienen coste de configuración inicial. Solo pagas la suscripción mensual o anual.
                    Para implementaciones muy personalizadas o complejas, puede haber servicios profesionales adicionales.
                  </p>
                </div>
                
                <div className="bg-background rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">¿Puedo cambiar de plan en cualquier momento?</h3>
                  <p className="text-muted-foreground">
                    Sí, puedes actualizar tu plan en cualquier momento y el cambio se aplicará inmediatamente. Si 
                    cambias a un plan inferior, el cambio se aplicará al finalizar tu ciclo de facturación actual.
                  </p>
                </div>
                
                <div className="bg-background rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">¿Ofrecen descuentos para cadenas o franquicias?</h3>
                  <p className="text-muted-foreground">
                    Sí, ofrecemos precios especiales para cadenas, franquicias y grupos con múltiples localizaciones.
                    Contacta con nuestro equipo de ventas para obtener un presupuesto personalizado.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default HomePage;