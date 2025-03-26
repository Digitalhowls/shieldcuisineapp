import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Loader2, 
  ArrowRight, 
  Calendar, 
  User, 
  Tag,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { motion } from 'framer-motion';

// Datos de ejemplo para blogs
const blogPosts = [
  {
    id: 1,
    title: 'Nuevas normativas APPCC: Lo que todo negocio alimentario debe saber en 2025',
    excerpt: 'Las autoridades reguladoras han actualizado las normativas APPCC para 2025. Descubre cómo estos cambios afectarán a tu negocio y cómo adaptarte eficientemente.',
    image: '/images/blog/normativas-appcc.jpg',
    author: 'María Rodríguez',
    date: '15 marzo, 2025',
    category: 'Normativas',
    tags: ['APPCC', 'Regulaciones', 'Seguridad Alimentaria'],
    slug: 'nuevas-normativas-appcc-2025'
  },
  {
    id: 2,
    title: 'Cómo reducir el desperdicio alimentario en restaurantes mediante tecnología',
    excerpt: 'El desperdicio alimentario representa hasta un 10% de las pérdidas en hostelería. Aprende cómo la digitalización de procesos puede ayudarte a reducir este porcentaje.',
    image: '/images/blog/desperdicio-alimentario.jpg',
    author: 'Javier Martín',
    date: '10 marzo, 2025',
    category: 'Sostenibilidad',
    tags: ['Desperdicio', 'Sostenibilidad', 'Restaurantes'],
    slug: 'reducir-desperdicio-alimentario-restaurantes'
  },
  {
    id: 3,
    title: 'Beneficios de implementar un sistema de trazabilidad en tu negocio alimentario',
    excerpt: 'La trazabilidad completa no solo es un requisito legal, sino una ventaja competitiva. Analizamos cómo puede mejorar la confianza del consumidor y la eficiencia operativa.',
    image: '/images/blog/trazabilidad-alimentos.jpg',
    author: 'Laura Sánchez',
    date: '5 marzo, 2025',
    category: 'Trazabilidad',
    tags: ['Trazabilidad', 'Seguridad', 'Operaciones'],
    slug: 'beneficios-trazabilidad-negocio-alimentario'
  },
  {
    id: 4,
    title: '5 tendencias en transparencia alimentaria que están transformando el sector',
    excerpt: 'Los consumidores exigen cada vez más transparencia. Desde QR en etiquetas hasta portales de información, estas son las tendencias que están redefiniendo la relación con tus clientes.',
    image: '/images/blog/transparencia-alimentaria.jpg',
    author: 'Carlos López',
    date: '25 febrero, 2025',
    category: 'Tendencias',
    tags: ['Transparencia', 'Tendencias', 'Consumidores'],
    slug: 'tendencias-transparencia-alimentaria'
  },
  {
    id: 5,
    title: 'Automatización de controles APPCC: Ahorra tiempo y mejora la precisión',
    excerpt: 'La automatización de los controles APPCC puede reducir hasta un 65% el tiempo dedicado a tareas administrativas. Descubre cómo implementarla en tu negocio.',
    image: '/images/blog/automatizacion-appcc.jpg',
    author: 'Elena Martínez',
    date: '18 febrero, 2025',
    category: 'Tecnología',
    tags: ['Automatización', 'APPCC', 'Eficiencia'],
    slug: 'automatizacion-controles-appcc'
  },
  {
    id: 6,
    title: 'Cómo la IA está revolucionando la seguridad alimentaria',
    excerpt: 'La inteligencia artificial no es solo para grandes empresas. Descubre aplicaciones prácticas que pueden implementarse en negocios de cualquier tamaño para mejorar la seguridad.',
    image: '/images/blog/ia-seguridad-alimentaria.jpg',
    author: 'Pablo García',
    date: '12 febrero, 2025',
    category: 'Tecnología',
    tags: ['IA', 'Inteligencia Artificial', 'Innovación'],
    slug: 'ia-revolucion-seguridad-alimentaria'
  },
];

// Componente para cada tarjeta de blog con animación
const BlogCard = ({ post, index }: { post: any, index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
        <CardHeader className="p-0">
          <div className="relative overflow-hidden h-48">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=ShieldCuisine';
              }}
            />
            <div className="absolute top-2 left-2">
              <Badge className="bg-primary hover:bg-primary/90">
                {post.category}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow py-4">
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{post.date}</span>
            <span className="mx-2">•</span>
            <User className="h-4 w-4 mr-1" />
            <span>{post.author}</span>
          </div>
          <h3 className="text-xl font-bold mb-2 line-clamp-2 hover:text-primary transition-colors">
            <Link href={`/public/blog/${post.slug}`}>
              {post.title}
            </Link>
          </h3>
          <p className="text-muted-foreground line-clamp-3">
            {post.excerpt}
          </p>
        </CardContent>
        <CardFooter className="pt-0 pb-4 flex flex-col items-start">
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <Button variant="link" className="p-0" asChild>
            <Link href={`/public/blog/${post.slug}`}>
              Leer más <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

// Categorías de blog para filtrar
const blogCategories = ["Todas", "Normativas", "Tecnología", "Sostenibilidad", "Tendencias", "Trazabilidad"];

const BlogPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('Todas');
  
  // Filtrar blogs basado en búsqueda y categoría
  const filteredPosts = React.useMemo(() => {
    return blogPosts.filter(post => {
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'Todas' || post.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="container px-4 sm:px-6 lg:px-8 mx-auto py-12">
      {/* Hero con imagen de fondo */}
      <section className="relative mb-16 py-20 px-6 rounded-xl overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.h1 
            className="text-4xl sm:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Blog de Seguridad Alimentaria
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Últimas noticias, consejos y tendencias sobre APPCC, normativas y gestión 
            de seguridad alimentaria para profesionales del sector.
          </motion.p>
          
          {/* Buscador */}
          <motion.div 
            className="flex gap-2 max-w-lg mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar artículos..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {blogCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        </div>
      </section>

      {/* Lista de blogs */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">
            {searchQuery || selectedCategory !== 'Todas' 
              ? 'Resultados de búsqueda' 
              : 'Últimos artículos'}
          </h2>
          <div className="text-muted-foreground">
            {filteredPosts.length} artículo{filteredPosts.length !== 1 ? 's' : ''}
          </div>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              No se encontraron artículos que coincidan con tu búsqueda.
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todas');
              }}
            >
              Ver todos los artículos
            </Button>
          </div>
        )}
      </section>

      {/* CTA Newsletter */}
      <motion.section 
        className="mt-20 bg-primary/5 p-8 sm:p-12 rounded-lg text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <h2 className="text-3xl font-bold mb-4">Mantente actualizado</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
          Suscríbete a nuestro newsletter y recibe las últimas noticias y tendencias
          en seguridad alimentaria directamente en tu bandeja de entrada.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <Input placeholder="Tu email" className="flex-grow" />
          <Button className="bg-primary hover:bg-primary/90">
            Suscribirme
          </Button>
        </div>
      </motion.section>
    </div>
  );
};

export default BlogPage;