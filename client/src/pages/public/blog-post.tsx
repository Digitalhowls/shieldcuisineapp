import React from 'react';
import { Link, useRoute } from 'wouter';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

// Datos de ejemplo para blogs
const blogPosts = [
  {
    id: 1,
    title: 'Nuevas normativas APPCC: Lo que todo negocio alimentario debe saber en 2025',
    excerpt: 'Las autoridades reguladoras han actualizado las normativas APPCC para 2025. Descubre cómo estos cambios afectarán a tu negocio y cómo adaptarte eficientemente.',
    image: '/images/blog/normativas-appcc.jpg',
    author: {
      name: 'María Rodríguez',
      avatar: '/images/team/maria.jpg',
      role: 'Especialista en Normativas Alimentarias',
      bio: 'María es consultora especializada en normativas de seguridad alimentaria con más de 15 años de experiencia asesorando a restaurantes y empresas del sector alimentario.'
    },
    date: '15 marzo, 2025',
    readTime: '7 min',
    category: 'Normativas',
    tags: ['APPCC', 'Regulaciones', 'Seguridad Alimentaria'],
    slug: 'nuevas-normativas-appcc-2025',
    content: `
      <h2>Cambios importantes en las normativas APPCC para 2025</h2>
      <p>La seguridad alimentaria sigue siendo una preocupación primordial para los consumidores y las autoridades reguladoras. Por ello, las normativas APPCC (Análisis de Peligros y Puntos de Control Crítico) han sido actualizadas para 2025, introduciendo cambios significativos que todo negocio alimentario debe conocer.</p>
      
      <p>Estos cambios buscan adaptarse a las nuevas realidades del sector alimentario, como el aumento de los servicios de entrega a domicilio, las nuevas tendencias en alimentación y los avances tecnológicos disponibles para monitorear la seguridad alimentaria.</p>
      
      <h3>Principales actualizaciones en las normativas APPCC</h3>
      <p>Entre los cambios más destacables se encuentran:</p>
      <ul>
        <li><strong>Mayor énfasis en la digitalización:</strong> Se recomienda la implementación de sistemas digitales para el registro y monitoreo de puntos críticos, facilitando la trazabilidad en caso de incidencias.</li>
        <li><strong>Nuevos requisitos para delivery:</strong> Establece controles específicos para servicios de entrega a domicilio, incluyendo el mantenimiento de la cadena de frío y la prevención de contaminación cruzada durante el transporte.</li>
        <li><strong>Actualización de límites críticos:</strong> Revisión de los límites críticos para ciertos patógenos, ajustándose a los últimos estudios científicos disponibles.</li>
        <li><strong>Transparencia con el consumidor:</strong> Nuevas directrices sobre la comunicación de prácticas de seguridad alimentaria a los consumidores, fomentando la confianza y la transparencia.</li>
      </ul>
      
      <h3>¿Cómo adaptarse a estos cambios?</h3>
      <p>La adaptación a estas nuevas normativas puede parecer compleja, pero siguiendo estos pasos podrás implementarlas de manera efectiva:</p>
      <ol>
        <li>Revisar y actualizar tu plan APPCC actual, identificando las áreas que necesitan modificaciones según las nuevas directrices.</li>
        <li>Formar a tu personal sobre los cambios y la importancia de cumplir con los nuevos requisitos.</li>
        <li>Considerar la implementación de soluciones tecnológicas que faciliten el cumplimiento de las nuevas normativas, como sistemas digitales de registro y monitoreo.</li>
        <li>Establecer un calendario para la implementación progresiva de los cambios, priorizando aquellos aspectos que tengan un mayor impacto en la seguridad alimentaria.</li>
      </ol>
      
      <h2>El papel de la tecnología en el cumplimiento de las nuevas normativas</h2>
      <p>La digitalización juega un papel crucial en el cumplimiento de las nuevas normativas APPCC. Las soluciones tecnológicas no solo facilitan el registro y monitoreo de los puntos críticos, sino que también permiten una respuesta más rápida ante posibles incidencias.</p>
      <p>Plataformas como ShieldCuisine ofrecen herramientas específicamente diseñadas para ayudar a los negocios alimentarios a cumplir con las normativas APPCC de manera eficiente y efectiva. Estas soluciones permiten:</p>
      <ul>
        <li>Registro digital de controles APPCC</li>
        <li>Alertas automáticas cuando se superan los límites críticos</li>
        <li>Trazabilidad completa de productos y procesos</li>
        <li>Generación automática de informes para inspecciones</li>
        <li>Análisis de tendencias para identificar posibles áreas de mejora</li>
      </ul>
      
      <h3>Conclusión</h3>
      <p>Las nuevas normativas APPCC para 2025 representan un paso más hacia una mayor seguridad alimentaria. Aunque adaptarse a estos cambios puede requerir un esfuerzo inicial, los beneficios a largo plazo son significativos: mayor seguridad para los consumidores, reducción de riesgos para el negocio y un posible aumento de la confianza del cliente.</p>
      <p>Mantenerse actualizado sobre estos cambios y buscar las herramientas adecuadas para implementarlos será clave para el éxito de cualquier negocio en el sector alimentario en los próximos años.</p>
    `
  },
  {
    id: 2,
    title: 'Cómo reducir el desperdicio alimentario en restaurantes mediante tecnología',
    slug: 'reducir-desperdicio-alimentario-restaurantes',
    // Datos similares al primer post...
  },
  // Resto de posts...
];

// Artículos relacionados
const relatedPosts = [
  {
    id: 2,
    title: 'Cómo reducir el desperdicio alimentario en restaurantes mediante tecnología',
    excerpt: 'El desperdicio alimentario representa hasta un 10% de las pérdidas en hostelería. Aprende cómo la digitalización de procesos puede ayudarte a reducir este porcentaje.',
    image: '/images/blog/desperdicio-alimentario.jpg',
    date: '10 marzo, 2025',
    slug: 'reducir-desperdicio-alimentario-restaurantes'
  },
  {
    id: 5,
    title: 'Automatización de controles APPCC: Ahorra tiempo y mejora la precisión',
    excerpt: 'La automatización de los controles APPCC puede reducir hasta un 65% el tiempo dedicado a tareas administrativas. Descubre cómo implementarla en tu negocio.',
    image: '/images/blog/automatizacion-appcc.jpg',
    date: '18 febrero, 2025',
    slug: 'automatizacion-controles-appcc'
  },
  {
    id: 3,
    title: 'Beneficios de implementar un sistema de trazabilidad en tu negocio alimentario',
    excerpt: 'La trazabilidad completa no solo es un requisito legal, sino una ventaja competitiva. Analizamos cómo puede mejorar la confianza del consumidor y la eficiencia operativa.',
    image: '/images/blog/trazabilidad-alimentos.jpg',
    date: '5 marzo, 2025',
    slug: 'beneficios-trazabilidad-negocio-alimentario'
  }
];

const BlogPostPage: React.FC = () => {
  // Obtener slug de la URL
  const [, params] = useRoute<{ slug: string }>('/public/blog/:slug');
  const slug = params?.slug || '';
  
  // Encontrar el post basado en el slug
  const post = blogPosts.find(post => post.slug === slug) || blogPosts[0];
  
  return (
    <div className="container px-4 sm:px-6 lg:px-8 mx-auto py-12">
      {/* Botón de regreso */}
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href="/public/blog" className="inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al blog
          </Link>
        </Button>
      </div>
      
      {/* Cabecera del artículo */}
      <motion.div 
        className="max-w-4xl mx-auto mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="bg-primary hover:bg-primary/90">
            {post.category}
          </Badge>
          {post.tags.map(tag => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap items-center text-muted-foreground gap-4 mb-8">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            <span>{post.author.name}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            <span>{post.readTime} de lectura</span>
          </div>
        </div>
      </motion.div>
      
      {/* Imagen principal */}
      <motion.div 
        className="max-w-4xl mx-auto mb-12 rounded-xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-auto object-cover rounded-xl"
          style={{ maxHeight: '500px' }}
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/1200x500/e2e8f0/64748b?text=ShieldCuisine';
          }}
        />
      </motion.div>
      
      {/* Contenido del artículo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
        <motion.div 
          className="lg:col-span-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <article className="prose prose-lg max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
          
          {/* Compartir */}
          <div className="mt-12">
            <Separator className="mb-6" />
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex items-center space-x-1">
                <span className="text-muted-foreground mr-2">Compartir:</span>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Sidebar */}
        <aside className="lg:col-span-4">
          {/* Autor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Sobre el autor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{post.author.name}</h4>
                    <p className="text-sm text-muted-foreground">{post.author.role}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {post.author.bio}
                </p>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Artículos relacionados */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Artículos relacionados</CardTitle>
                <CardDescription>Contenido que podría interesarte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {relatedPosts.map(relatedPost => (
                  <div key={relatedPost.id} className="flex gap-4">
                    <div className="h-16 w-16 flex-shrink-0 rounded overflow-hidden">
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/300x300/e2e8f0/64748b?text=ShieldCuisine';
                        }}
                      />
                    </div>
                    <div>
                      <h5 className="font-medium line-clamp-2 text-sm">
                        <Link href={`/public/blog/${relatedPost.slug}`} className="hover:text-primary transition-colors">
                          {relatedPost.title}
                        </Link>
                      </h5>
                      <p className="text-xs text-muted-foreground mt-1">{relatedPost.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </aside>
      </div>
      
      {/* CTA */}
      <motion.div 
        className="mt-24 bg-primary/5 p-12 rounded-xl text-center max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <h2 className="text-3xl font-bold mb-4">¿Necesitas ayuda con la seguridad alimentaria de tu negocio?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Descubre cómo ShieldCuisine puede ayudarte a cumplir con las normativas APPCC, 
          reducir el desperdicio alimentario y mejorar la eficiencia operativa.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/auth">Solicitar demostración</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/public/contacto">Contactar con un experto</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default BlogPostPage;