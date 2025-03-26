import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowRight, ShieldCheck, BarChart3, Server, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CmsPage } from '@shared/schema';

const HomePage: React.FC = () => {
  const companyId = 1; // ID de la empresa por defecto

  // Obtener la página de inicio
  const { 
    data: homePage,
    isLoading: isHomePageLoading 
  } = useQuery<CmsPage>({
    queryKey: [`/api/cms/companies/${companyId}/pages/inicio`],
    retry: false,
  });

  if (isHomePageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si no hay una página de inicio definida, mostrar una página predeterminada
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-background to-muted/20 py-20">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                Gestión completa de seguridad alimentaria
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                ShieldCuisine es una solución integral para la gestión de APPCC, 
                inventario, compras y cumplimiento normativo en negocios de alimentación.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link href="/auth">Comenzar ahora</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/public/pagina/servicios">
                    Conocer más
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute -left-4 -top-4 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl opacity-70"></div>
              <div className="relative z-10">
                <img 
                  src="/images/hero-dashboard.svg" 
                  alt="ShieldCuisine Dashboard" 
                  className="rounded-lg shadow-xl border"
                  onError={(e) => {
                    // Fallback si la imagen no se encuentra
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-20">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Todo lo que necesitas para la seguridad alimentaria
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Descubre cómo ShieldCuisine puede transformar la gestión de 
              la seguridad alimentaria en tu negocio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <ShieldCheck className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Control APPCC</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Gestiona el sistema APPCC con registros digitales, monitoreo 
                  en tiempo real y análisis automatizado de puntos críticos.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <BarChart3 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Gestión de Inventario</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Control completo del inventario, trazabilidad, mínimos de stock 
                  y alertas de caducidad para optimizar tus recursos.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <Server className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Integración Online</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Conecta con tu tienda online, gestiona pagos y sincroniza 
                  inventario automáticamente con WooCommerce.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Portal de Transparencia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comparte los resultados de seguridad alimentaria con clientes 
                  y auditores, generando confianza y transparencia.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted py-20">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para transformar la seguridad alimentaria de tu negocio?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Comienza hoy mismo a digitalizar tus procesos APPCC y optimiza 
              la gestión de tu establecimiento alimentario.
            </p>
            <Button asChild size="lg">
              <Link href="/auth">Solicitar demostración</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;