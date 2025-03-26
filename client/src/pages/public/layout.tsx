import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { CmsBranding, CmsMenu, CmsMenuItem } from '@shared/schema';
import { Loader2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const companyId = 1; // ID de la empresa por defecto

  // Obtener la información de marca
  const { 
    data: branding,
    isLoading: isBrandingLoading 
  } = useQuery<CmsBranding>({
    queryKey: [`/api/cms/companies/${companyId}/branding`],
    retry: false,
  });

  // Obtener el menú principal
  const { 
    data: menu,
    isLoading: isMenuLoading 
  } = useQuery<CmsMenu>({
    queryKey: [`/api/cms/companies/${companyId}/menus/main`],
    retry: false,
  });

  // Cerrar el menú móvil cuando cambie la ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Renderizar elementos del menú recursivamente
  const renderMenuItem = (item: CmsMenuItem, index: number, isMobile: boolean = false) => {
    // Determinar la URL basada en el tipo de enlace
    let url = '#';
    
    if (item.type === 'page' && item.pageSlug) {
      url = `/public/pagina/${item.pageSlug}`;
    } else if (item.type === 'external' && item.url) {
      url = item.url;
    }
    
    // Para elementos con subitems, renderizar un desplegable
    if (item.children && item.children.length > 0) {
      return (
        <div key={index} className={`relative group ${isMobile ? 'mb-4' : ''}`}>
          <div className={`
            ${isMobile ? 'py-2 px-4' : 'px-4 py-2'} 
            text-foreground cursor-pointer hover:text-primary transition-colors font-medium
          `}>
            {item.label}
          </div>
          <div className={`
            ${isMobile ? '' : 'absolute left-0 z-10 min-w-[200px] p-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 bg-popover rounded-md shadow-md'}
          `}>
            {item.children.map((childItem, childIndex) => 
              renderMenuItem(childItem, childIndex, isMobile)
            )}
          </div>
        </div>
      );
    }
    
    // Para elementos sin subitems, renderizar un enlace
    return (
      <Link 
        key={index} 
        href={url} 
        target={item.type === 'external' ? '_blank' : undefined}
        className={`
          ${isMobile ? 'block py-3 px-4 border-b border-border/20' : 'px-4 py-2'} 
          text-foreground hover:text-primary transition-colors font-medium
        `}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-sm">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/public" className="flex items-center">
                {isBrandingLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  branding?.logoUrl ? (
                    <img 
                      src={branding.logoUrl} 
                      alt={branding.companyName || "Logo"} 
                      className="h-10 w-auto" 
                    />
                  ) : (
                    <span className="text-xl font-bold text-primary">
                      {branding?.companyName || "ShieldCuisine"}
                    </span>
                  )
                )}
              </Link>
            </div>
            
            {/* Menú de navegación (escritorio) */}
            <nav className="hidden md:flex items-center space-x-1">
              {isMenuLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                menu?.items?.map((item, index) => renderMenuItem(item, index))
              )}
              
              {/* Botón de acceso a la plataforma */}
              <Button asChild className="ml-4" variant="default">
                <Link href="/auth">Acceder a la plataforma</Link>
              </Button>
            </nav>
            
            {/* Menú móvil */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Menú</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85%] sm:w-[350px] pt-10">
                  <nav className="flex flex-col">
                    {isMenuLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : (
                      menu?.items?.map((item, index) => renderMenuItem(item, index, true))
                    )}
                    
                    {/* Botón de acceso a la plataforma */}
                    <div className="mt-6 px-4">
                      <Button asChild className="w-full" variant="default">
                        <Link href="/auth">Acceder a la plataforma</Link>
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      
      {/* Contenido principal */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-muted/30 border-t">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Información de la empresa */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {branding?.companyName || "ShieldCuisine"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {branding?.tagline || "Soluciones de seguridad alimentaria"}
              </p>
              {branding?.contactInfo && (
                <p className="text-sm text-muted-foreground">
                  {branding.contactInfo}
                </p>
              )}
            </div>
            
            {/* Enlaces útiles */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces útiles</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/public" className="text-muted-foreground hover:text-primary transition-colors">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/public/pagina/sobre-nosotros" className="text-muted-foreground hover:text-primary transition-colors">
                    Sobre nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/public/pagina/servicios" className="text-muted-foreground hover:text-primary transition-colors">
                    Servicios
                  </Link>
                </li>
                <li>
                  <Link href="/public/pagina/contacto" className="text-muted-foreground hover:text-primary transition-colors">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/public/pagina/privacidad" className="text-muted-foreground hover:text-primary transition-colors">
                    Política de privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/public/pagina/terminos" className="text-muted-foreground hover:text-primary transition-colors">
                    Términos y condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/public/pagina/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                    Política de cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {branding?.companyName || "ShieldCuisine"}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;