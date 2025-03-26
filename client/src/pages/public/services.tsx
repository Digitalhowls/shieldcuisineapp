import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  Store, 
  BarChart3, 
  Boxes, 
  Building2, 
  GraduationCap, 
  CreditCard,
  User,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ServicesPage: React.FC = () => {
  return (
    <div className="container px-4 sm:px-6 lg:px-8 mx-auto py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">Nuestros Servicios</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Descubre cómo ShieldCuisine puede transformar la gestión de la seguridad alimentaria
          en tu negocio con soluciones integrales adaptadas a tus necesidades.
        </p>
      </div>

      {/* Introducción */}
      <section className="mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Una solución integral</h2>
            <p className="text-lg mb-6">
              ShieldCuisine ofrece una suite completa de herramientas diseñadas específicamente 
              para establecimientos alimentarios, desde pequeños restaurantes hasta cadenas con 
              múltiples localizaciones.
            </p>
            <p className="text-lg mb-6">
              Nuestra plataforma unifica todos los aspectos de la gestión de la seguridad alimentaria,
              desde el control APPCC hasta la gestión de inventario, pasando por la formación de empleados
              y la transparencia con los clientes.
            </p>
            <Button asChild className="mt-2">
              <Link href="/auth">
                Comienza ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute -right-4 -bottom-4 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl opacity-70"></div>
            <div className="relative z-10">
              <img 
                src="/images/services-overview.svg" 
                alt="Servicios ShieldCuisine" 
                className="rounded-lg shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Servicios detallados */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Servicios principales</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Cada módulo de ShieldCuisine ha sido diseñado para integrarse perfectamente con el resto,
            creando un ecosistema completo para la gestión alimentaria.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center mb-2">
                <ShieldCheck className="h-7 w-7 text-primary mr-2" />
                <CardTitle>Control APPCC</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Digitaliza completamente tu sistema APPCC con registros electrónicos, 
                seguimiento en tiempo real y análisis automático.
              </p>
              <ul className="space-y-2 list-disc pl-5 mb-4">
                <li>Planificación automatizada de controles</li>
                <li>Alertas de desviaciones y fechas críticas</li>
                <li>Análisis con inteligencia artificial</li>
                <li>Informes para auditorías e inspecciones</li>
              </ul>
              <Button variant="outline" asChild className="w-full mt-2">
                <Link href="/public/pagina/appcc">
                  Saber más
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center mb-2">
                <Boxes className="h-7 w-7 text-primary mr-2" />
                <CardTitle>Gestión de Inventario</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Control exhaustivo del inventario con trazabilidad completa, 
                alertas de caducidad y optimización de stock.
              </p>
              <ul className="space-y-2 list-disc pl-5 mb-4">
                <li>Control de caducidades y lotes</li>
                <li>Gestión FIFO/FEFO automatizada</li>
                <li>Alertas de stock mínimo</li>
                <li>Análisis de rotación y optimización</li>
              </ul>
              <Button variant="outline" asChild className="w-full mt-2">
                <Link href="/public/pagina/inventario">
                  Saber más
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center mb-2">
                <Store className="h-7 w-7 text-primary mr-2" />
                <CardTitle>Integración E-commerce</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Conecta tu negocio físico con tu tienda online gracias a la integración
                nativa con WooCommerce y otros sistemas de e-commerce.
              </p>
              <ul className="space-y-2 list-disc pl-5 mb-4">
                <li>Sincronización de inventario en tiempo real</li>
                <li>Gestión unificada de productos</li>
                <li>Análisis de ventas multicanal</li>
                <li>Trazabilidad completa del producto</li>
              </ul>
              <Button variant="outline" asChild className="w-full mt-2">
                <Link href="/public/pagina/ecommerce">
                  Saber más
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center mb-2">
                <User className="h-7 w-7 text-primary mr-2" />
                <CardTitle>Portal de Transparencia</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Comparte información relevante sobre seguridad alimentaria con tus clientes
                y colaboradores, construyendo confianza y diferenciación.
              </p>
              <ul className="space-y-2 list-disc pl-5 mb-4">
                <li>Portal web personalizable</li>
                <li>Certificaciones y resultados APPCC</li>
                <li>Información sobre alérgenos y trazabilidad</li>
                <li>QR dinámicos para menús y productos</li>
              </ul>
              <Button variant="outline" asChild className="w-full mt-2">
                <Link href="/public/pagina/transparencia">
                  Saber más
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center mb-2">
                <GraduationCap className="h-6 w-6 text-primary mr-2" />
                <CardTitle>Formación E-Learning</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Plataforma integrada de e-learning para la formación
                continua de empleados en seguridad alimentaria.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center mb-2">
                <CreditCard className="h-6 w-6 text-primary mr-2" />
                <CardTitle>Gestión Financiera</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Integración bancaria PSD2 para gestionar pagos,
                cuentas y análisis financiero del negocio.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center mb-2">
                <BarChart3 className="h-6 w-6 text-primary mr-2" />
                <CardTitle>Análisis Avanzado</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Informes y análisis con IA para optimizar procesos,
                costes y calidad en toda la operación.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Para quién */}
      <section className="mb-20 bg-muted/30 py-16 rounded-lg">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">¿Para quién está diseñado?</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            ShieldCuisine se adapta a diferentes tipos de negocios alimentarios,
            con soluciones específicas para cada sector.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          <div className="bg-background p-6 rounded-lg shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Restaurantes</h3>
            <p className="text-muted-foreground mb-4">
              Desde pequeños establecimientos hasta cadenas de restaurantes,
              con gestión centralizada o por localización.
            </p>
          </div>
          
          <div className="bg-background p-6 rounded-lg shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Boxes className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Obradores y Producción</h3>
            <p className="text-muted-foreground mb-4">
              Empresas de producción alimentaria con necesidades específicas
              de trazabilidad y control de procesos.
            </p>
          </div>
          
          <div className="bg-background p-6 rounded-lg shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Cadenas y Franquicias</h3>
            <p className="text-muted-foreground mb-4">
              Gestión centralizada con control individual por establecimiento
              y análisis comparativo entre localizaciones.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 p-12 rounded-lg text-center">
        <h2 className="text-3xl font-bold mb-4">¿Hablamos sobre tus necesidades?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
          Agenda una demostración personalizada y descubre cómo ShieldCuisine
          puede adaptarse a tu negocio y necesidades específicas.
        </p>
        <Button asChild size="lg">
          <Link href="/auth">Solicitar demostración</Link>
        </Button>
      </section>
    </div>
  );
};

export default ServicesPage;