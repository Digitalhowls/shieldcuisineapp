import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Users, BadgeCheck, Star } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="container px-4 sm:px-6 lg:px-8 mx-auto py-12">
      {/* Hero sección */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">Sobre ShieldCuisine</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Somos pioneros en tecnología para la seguridad alimentaria, ayudando a establecimientos
          a cumplir con normativas y ofrecer la máxima calidad y transparencia.
        </p>
      </div>

      {/* Nuestra misión */}
      <section className="mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Nuestra misión</h2>
            <p className="text-lg mb-6">
              En ShieldCuisine tenemos una misión clara: transformar la manera en que los establecimientos
              alimentarios gestionan la seguridad, higiene y trazabilidad de sus productos.
            </p>
            <p className="text-lg mb-6">
              Creemos que la tecnología debe estar al servicio de la salud pública, simplificando
              procesos complejos y permitiendo que los negocios se centren en lo que mejor saben hacer:
              ofrecer experiencias gastronómicas excepcionales.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle2 className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <p>Hacer que el cumplimiento normativo sea sencillo e intuitivo</p>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <p>Aumentar la transparencia en toda la cadena alimentaria</p>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <p>Reducir el desperdicio alimentario mediante gestión inteligente</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -right-4 -bottom-4 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl opacity-70"></div>
            <div className="relative z-10">
              <img 
                src="/images/about-mission.svg" 
                alt="Nuestra misión" 
                className="rounded-lg shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="mb-20 bg-muted/30 py-16 rounded-lg">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Nuestros valores</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Los principios que guían nuestro trabajo y nos ayudan a ofrecer la mejor solución 
            para la seguridad alimentaria.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          <div className="bg-background p-6 rounded-lg shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <BadgeCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Excelencia</h3>
            <p className="text-muted-foreground">
              Nos comprometemos con los más altos estándares en cada aspecto de nuestro servicio
              y plataforma tecnológica.
            </p>
          </div>
          
          <div className="bg-background p-6 rounded-lg shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Colaboración</h3>
            <p className="text-muted-foreground">
              Trabajamos codo con codo con nuestros clientes para crear soluciones que respondan 
              a sus necesidades reales.
            </p>
          </div>
          
          <div className="bg-background p-6 rounded-lg shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Innovación</h3>
            <p className="text-muted-foreground">
              Exploramos constantemente nuevas tecnologías y enfoques para mejorar la seguridad 
              alimentaria.
            </p>
          </div>
          
          <div className="bg-background p-6 rounded-lg shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-.5-12H9v6h2V9.75L13 12h2l-3-3 3-3h-2l-1.5 2.25z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Transparencia</h3>
            <p className="text-muted-foreground">
              Creemos en relaciones abiertas y honestas, tanto internamente como con nuestros 
              clientes y usuarios finales.
            </p>
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Nuestro equipo</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Un equipo multidisciplinar comprometido con la excelencia y la innovación en 
            seguridad alimentaria.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Los perfiles del equipo irían aquí */}
          <div className="text-center">
            <div className="h-48 w-48 mx-auto bg-muted rounded-full mb-4"></div>
            <h3 className="text-xl font-bold">María González</h3>
            <p className="text-muted-foreground">CEO & Fundadora</p>
          </div>
          <div className="text-center">
            <div className="h-48 w-48 mx-auto bg-muted rounded-full mb-4"></div>
            <h3 className="text-xl font-bold">Javier Martín</h3>
            <p className="text-muted-foreground">Director de Tecnología</p>
          </div>
          <div className="text-center">
            <div className="h-48 w-48 mx-auto bg-muted rounded-full mb-4"></div>
            <h3 className="text-xl font-bold">Laura Sánchez</h3>
            <p className="text-muted-foreground">Directora de Operaciones</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 p-12 rounded-lg text-center">
        <h2 className="text-3xl font-bold mb-4">¿Listo para empezar?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
          Descubre cómo ShieldCuisine puede transformar la gestión de la seguridad alimentaria 
          en tu negocio con una demostración personalizada.
        </p>
        <Button asChild size="lg">
          <Link href="/auth">Solicitar demostración</Link>
        </Button>
      </section>
    </div>
  );
};

export default AboutPage;