import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ChevronDown, 
  ShieldCheck, 
  ShoppingCart, 
  Globe, 
  GraduationCap,
  Phone,
  User,
  CreditCard,
  BarChart3,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface PublicLayoutProps {
  children: React.ReactNode;
}

// Animaciones
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.5 } 
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.3 } 
  }
};

const slideIn = {
  hidden: { x: '-100%' },
  visible: { 
    x: 0, 
    transition: { 
      type: 'spring', 
      damping: 30, 
      stiffness: 300 
    } 
  },
  exit: { 
    x: '-100%', 
    transition: { 
      type: 'spring', 
      damping: 40, 
      stiffness: 400 
    } 
  }
};

// Enlaces del menú principal
const menuLinks = [
  { 
    label: 'Inicio', 
    path: '/public', 
    highlight: false 
  },
  { 
    label: 'Soluciones', 
    path: '#', 
    highlight: false,
    children: [
      { 
        label: 'APPCC Digital', 
        path: '/public/soluciones/appcc',
        icon: ShieldCheck,
        description: 'Digitalización completa de controles APPCC'
      },
      { 
        label: 'Transparencia', 
        path: '/public/soluciones/transparencia',
        icon: Globe,
        description: 'Portal de transparencia para clientes'
      },
      { 
        label: 'E-Learning', 
        path: '/public/soluciones/learning',
        icon: GraduationCap,
        description: 'Plataforma de formación para empleados'
      },
      { 
        label: 'Banca PSD2', 
        path: '/public/soluciones/banca',
        icon: CreditCard,
        description: 'Gestión financiera con Open Banking'
      },
      { 
        label: 'Análisis Avanzado', 
        path: '/public/soluciones/analisis',
        icon: BarChart3,
        description: 'Insights y análisis predictivo'
      }
    ]
  },
  { 
    label: 'Módulos', 
    path: '/public/shop-modules', 
    highlight: false 
  },
  { 
    label: 'Equipamiento', 
    path: '/public/shop-equipment', 
    highlight: false 
  },
  { 
    label: 'Blog', 
    path: '/public/blog', 
    highlight: false 
  },
  { 
    label: 'Sobre Nosotros', 
    path: '/public/sobre-nosotros', 
    highlight: false 
  },
  { 
    label: 'Contacto', 
    path: '/public/contacto', 
    highlight: false 
  },
  { 
    label: 'Acceder', 
    path: '/auth', 
    highlight: true 
  }
];

// Enlaces del footer
const footerLinks = {
  solutions: [
    { label: 'APPCC Digital', path: '/public/soluciones/appcc' },
    { label: 'Portal de Transparencia', path: '/public/soluciones/transparencia' },
    { label: 'Integración WooCommerce', path: '/public/soluciones/woocommerce' },
    { label: 'Gestión de Inventario', path: '/public/soluciones/inventario' },
    { label: 'Plataforma E-Learning', path: '/public/soluciones/learning' },
    { label: 'Integración Bancaria', path: '/public/soluciones/banca' }
  ],
  company: [
    { label: 'Sobre Nosotros', path: '/public/sobre-nosotros' },
    { label: 'Clientes', path: '/public/clientes' },
    { label: 'Blog', path: '/public/blog' },
    { label: 'Trabaja con Nosotros', path: '/public/empleo' },
    { label: 'Contacto', path: '/public/contacto' }
  ],
  resources: [
    { label: 'Documentación', path: '/public/documentacion' },
    { label: 'Preguntas Frecuentes', path: '/public/faq' },
    { label: 'Webinars', path: '/public/webinars' },
    { label: 'Guías y Tutoriales', path: '/public/recursos' },
    { label: 'API', path: '/public/api-docs' }
  ],
  legal: [
    { label: 'Términos y Condiciones', path: '/public/terminos' },
    { label: 'Política de Privacidad', path: '/public/privacidad' },
    { label: 'Política de Cookies', path: '/public/cookies' },
    { label: 'Aviso Legal', path: '/public/aviso-legal' }
  ]
};

// Componente de layout público
const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { toast } = useToast();
  
  // Detectar scroll para cambiar estilo de la barra de navegación
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Cerrar menú móvil al cambiar de página
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  
  // Contenido del menú móvil
  const MobileMenu = () => (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={fadeIn}
          className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 lg:hidden"
        >
          <motion.div
            variants={slideIn}
            className="absolute inset-y-0 left-0 w-full sm:w-96 bg-background shadow-lg h-full"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <Link href="/public">
                <div className="flex items-center">
                  <img src="/images/logo.svg" alt="ShieldCuisine" className="h-8 w-auto" onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/200x80/3b82f6/ffffff?text=ShieldCuisine';
                  }} />
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <ScrollArea className="h-[calc(100vh-68px)]">
              <div className="p-4">
                <div className="space-y-2">
                  {menuLinks.map((link, index) => 
                    !link.children ? (
                      <Button
                        key={index}
                        asChild
                        variant="ghost"
                        className="justify-start w-full text-lg h-12"
                      >
                        <Link href={link.path}>
                          {link.label}
                        </Link>
                      </Button>
                    ) : (
                      <div key={index} className="space-y-1">
                        <div className="text-lg font-medium px-3 py-2">
                          {link.label}
                        </div>
                        <div className="pl-3">
                          {link.children.map((child, childIndex) => (
                            <Button
                              key={childIndex}
                              asChild
                              variant="ghost"
                              className="justify-start w-full text-base h-10"
                            >
                              <Link href={child.path}>
                                <child.icon className="h-5 w-5 mr-2" />
                                {child.label}
                              </Link>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Contacto</h4>
                    <p className="text-sm">
                      <Phone className="inline h-4 w-4 mr-2" />
                      +34 900 123 456
                    </p>
                    <p className="text-sm">
                      <div className="inline-flex space-x-3 mt-2">
                        <Button variant="outline" size="icon" className="rounded-full">
                          <Facebook className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full">
                          <Twitter className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full">
                          <Instagram className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full">
                          <Linkedin className="h-4 w-4" />
                        </Button>
                      </div>
                    </p>
                  </div>
                  
                  <Button className="w-full">
                    <Link href="/auth">Acceder</Link>
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Link href="/public/demo">Solicitar Demo</Link>
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  return (
    <>
      <MobileMenu />
      
      {/* Header */}
      <motion.header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled ? 'bg-background/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      >
        <div className="container flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/public">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <img 
                src="/images/logo.svg" 
                alt="ShieldCuisine" 
                className="h-8 w-auto" 
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/200x80/3b82f6/ffffff?text=ShieldCuisine';
                }}
              />
            </motion.div>
          </Link>
          
          {/* Menú de escritorio */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuLinks.map((link, index) => {
              // Elemento normal
              if (!link.children) {
                return (
                  <Button
                    key={index}
                    asChild
                    variant={link.highlight ? "default" : "ghost"}
                    size="sm"
                  >
                    <Link href={link.path}>
                      {link.label}
                    </Link>
                  </Button>
                );
              }
              
              // Elemento con submenú
              return (
                <DropdownMenu key={index}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="inline-flex gap-1">
                      {link.label}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-[300px] p-2 grid grid-cols-1 gap-1">
                    {link.children.map((child, childIndex) => (
                      <DropdownMenuItem key={childIndex} asChild className="flex items-start p-2">
                        <Link href={child.path} className="w-full">
                          <div className="flex items-start gap-2">
                            <div className="bg-primary/10 p-1 rounded mt-0.5">
                              <child.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{child.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {child.description}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </nav>
          
          {/* Botón de menú móvil */}
          <Button 
            variant="ghost" 
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </motion.header>
      
      {/* Contenido principal */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="min-h-[calc(100vh-64px)]">
          {children}
        </div>
      </motion.main>
      
      {/* CTA Banner */}
      <section className="bg-primary text-primary-foreground">
        <div className="container px-4 sm:px-6 lg:px-8 py-12 sm:py-16 mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                ¿Listo para mejorar la seguridad alimentaria de tu negocio?
              </h2>
              <p className="text-primary-foreground/80">
                Únete a cientos de empresas que confían en ShieldCuisine
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" size="lg" asChild>
                <Link href="/auth">Prueba gratuita</Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link href="/public/demo">
                  Solicitar demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-muted/40">
        <div className="container px-4 sm:px-6 lg:px-8 py-12 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Logo y descripción */}
            <div className="lg:col-span-2">
              <Link href="/public">
                <div className="flex items-center mb-6">
                  <img 
                    src="/images/logo.svg" 
                    alt="ShieldCuisine" 
                    className="h-8 w-auto" 
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/200x80/3b82f6/ffffff?text=ShieldCuisine';
                    }}
                  />
                </div>
              </Link>
              <p className="text-muted-foreground mb-6 max-w-md">
                ShieldCuisine revoluciona la gestión de la seguridad alimentaria 
                con soluciones digitales que mantienen a tu negocio siempre en 
                cumplimiento con las normativas APPCC.
              </p>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Enlaces */}
            <div>
              <h3 className="font-semibold mb-6">Soluciones</h3>
              <ul className="space-y-3">
                {footerLinks.solutions.map((link, index) => (
                  <li key={index}>
                    <Link href={link.path} className="text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-6">Empresa</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <Link href={link.path} className="text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-6">Recursos</h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((link, index) => (
                  <li key={index}>
                    <Link href={link.path} className="text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} ShieldCuisine. Todos los derechos reservados.
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              {footerLinks.legal.map((link, index) => (
                <Link 
                  key={index} 
                  href={link.path} 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
      
      {/* Newsletter popup */}
      <Button 
        variant="default" 
        className="fixed right-4 bottom-4 z-50 shadow-lg h-auto px-3 py-2 hover:scale-105 transition-transform"
        onClick={() => {
          toast({
            title: "¡Suscríbete a nuestro newsletter!",
            description: (
              <div className="mt-2 space-y-3">
                <p>Recibe las últimas noticias sobre seguridad alimentaria</p>
                <div className="flex gap-2 mt-2">
                  <input 
                    type="email" 
                    placeholder="Tu email" 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                  />
                  <Button variant="default" size="sm">Enviar</Button>
                </div>
              </div>
            ),
            duration: 50000,
          });
        }}
      >
        <Mail className="h-4 w-4 mr-2" /> Newsletter
      </Button>
    </>
  );
};

export default PublicLayout;