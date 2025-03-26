import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ShoppingCart, 
  Star, 
  StarHalf,
  Info,
  Check,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Datos de productos
const products = [
  {
    id: 1,
    name: 'Termómetro digital de precisión con sonda',
    description: 'Termómetro profesional con sonda para medición precisa de temperatura en alimentos. Rango de -50° a 300°C.',
    price: 49.95,
    oldPrice: 69.95,
    image: '/images/shop/termometro-digital.jpg',
    category: 'Medición',
    rating: 4.8,
    reviewCount: 124,
    inStock: true,
    isNew: false,
    isBestseller: true,
    isOnSale: true,
    specifications: [
      { name: 'Rango de temperatura', value: '-50°C a 300°C' },
      { name: 'Precisión', value: '±0.5°C' },
      { name: 'Tiempo de respuesta', value: '3-4 segundos' },
      { name: 'Batería', value: 'CR2032 (incluida)' },
      { name: 'Pantalla', value: 'LCD retroiluminada' },
      { name: 'Certificaciones', value: 'FDA, CE, RoHS' }
    ],
    features: [
      'Medición rápida en 3-4 segundos',
      'Pantalla LCD retroiluminada',
      'Función de retención de datos',
      'Apagado automático para ahorro de batería',
      'Resistente al agua (IP67)',
      'Ideal para APPCC y control de temperatura'
    ]
  },
  {
    id: 2,
    name: 'Kit completo etiquetado APPCC',
    description: 'Sistema de etiquetado APPCC con etiquetas codificadas por color para los 7 días de la semana. Incluye rotuladores y dispensador.',
    price: 89.90,
    oldPrice: null,
    image: '/images/shop/kit-etiquetado.jpg',
    category: 'Etiquetado',
    rating: 4.6,
    reviewCount: 87,
    inStock: true,
    isNew: true,
    isBestseller: false,
    isOnSale: false,
    specifications: [
      { name: 'Contenido', value: '7 rollos de etiquetas (1 por día), dispensador, 2 rotuladores' },
      { name: 'Etiquetas por rollo', value: '500 unidades' },
      { name: 'Tamaño de etiqueta', value: '5 x 7,5 cm' },
      { name: 'Material', value: 'Polipropileno resistente a la humedad' },
      { name: 'Color', value: 'Codificado por días de la semana' }
    ],
    features: [
      'Etiquetas codificadas por color para cada día de la semana',
      'Resistentes al agua y temperaturas extremas',
      'Incluye campos para fecha, hora, producto, caducidad y operario',
      'Dispensador profesional incluido',
      'Rotuladores permanentes incluidos',
      'Cumple con normativas APPCC'
    ]
  },
  {
    id: 3,
    name: 'Tablet resistente con software APPCC preinstalado',
    description: 'Tablet rugerizada IP68 con software ShieldCuisine preinstalado para gestión APPCC. Resistente a agua, golpes y polvo.',
    price: 499.00,
    oldPrice: 599.00,
    image: '/images/shop/tablet-ruggerizada.jpg',
    category: 'Dispositivos',
    rating: 4.9,
    reviewCount: 56,
    inStock: true,
    isNew: true,
    isBestseller: true,
    isOnSale: true,
    specifications: [
      { name: 'Pantalla', value: '10.1" HD 1920x1200' },
      { name: 'Procesador', value: 'Octa-core 2.3 GHz' },
      { name: 'Memoria RAM', value: '6GB' },
      { name: 'Almacenamiento', value: '128GB (ampliable)' },
      { name: 'Batería', value: '8000 mAh (hasta 12h)' },
      { name: 'Conectividad', value: 'WiFi, Bluetooth 5.0, 4G opcional' },
      { name: 'Certificaciones', value: 'IP68 (resistente a agua y polvo)' }
    ],
    features: [
      'Software ShieldCuisine APPCC preinstalado y configurado',
      'Resistente a agua, polvo y caídas (MIL-STD-810G)',
      'Escáner de código de barras integrado',
      'Batería de larga duración (hasta 12 horas)',
      'Pantalla legible a la luz del sol',
      'Incluye soporte para pared y cargador',
      '1 año de soporte técnico incluido'
    ]
  },
  {
    id: 4,
    name: 'Impresora portátil de etiquetas Bluetooth',
    description: 'Impresora portátil térmica para etiquetas APPCC. Compatible con app ShieldCuisine y conectividad Bluetooth.',
    price: 149.95,
    oldPrice: null,
    image: '/images/shop/impresora-etiquetas.jpg',
    category: 'Etiquetado',
    rating: 4.5,
    reviewCount: 42,
    inStock: true,
    isNew: false,
    isBestseller: false,
    isOnSale: false,
    specifications: [
      { name: 'Tecnología', value: 'Impresión térmica directa' },
      { name: 'Resolución', value: '203 DPI' },
      { name: 'Velocidad de impresión', value: 'Hasta 127mm/s' },
      { name: 'Conectividad', value: 'Bluetooth 4.0, USB' },
      { name: 'Batería', value: 'Recargable 2600mAh (500 etiquetas)' },
      { name: 'Compatibilidad', value: 'Android, iOS, Windows' }
    ],
    features: [
      'Conexión Bluetooth para impresión inalámbrica',
      'Batería recargable de larga duración',
      'Compatible con app ShieldCuisine',
      'Impresión de etiquetas APPCC, alérgenos y caducidad',
      'Tamaño compacto y portátil',
      'Incluye rollo de etiquetas y adaptador'
    ]
  },
  {
    id: 5,
    name: 'Lector de código de barras para trazabilidad',
    description: 'Escáner de códigos de barras y QR para trazabilidad alimentaria. Conectividad Bluetooth y USB.',
    price: 129.00,
    oldPrice: 159.00,
    image: '/images/shop/lector-barras.jpg',
    category: 'Dispositivos',
    rating: 4.4,
    reviewCount: 38,
    inStock: true,
    isNew: false,
    isBestseller: false,
    isOnSale: true,
    specifications: [
      { name: 'Tipo de escáner', value: '2D (códigos QR y 1D)' },
      { name: 'Conectividad', value: 'Bluetooth 4.0, USB' },
      { name: 'Batería', value: '2200mAh recargable' },
      { name: 'Alcance', value: 'Hasta 10m (Bluetooth)' },
      { name: 'Compatibilidad', value: 'Windows, Android, iOS' }
    ],
    features: [
      'Lectura de códigos 1D y 2D (QR)',
      'Integración con ShieldCuisine para trazabilidad',
      'Modo de escáner continuo',
      'Resistente a caídas de hasta 1.5m',
      'Incluye base de carga',
      'Batería para todo un día de trabajo'
    ]
  },
  {
    id: 6,
    name: 'Registrador automático de temperatura con WiFi',
    description: 'Sistema de registro automático de temperatura para cámaras frigoríficas con alertas WiFi y panel de control.',
    price: 249.00,
    oldPrice: null,
    image: '/images/shop/registrador-temperatura.jpg',
    category: 'Medición',
    rating: 4.7,
    reviewCount: 29,
    inStock: true,
    isNew: true,
    isBestseller: false,
    isOnSale: false,
    specifications: [
      { name: 'Sensores', value: '3 sondas incluidas' },
      { name: 'Rango de temperatura', value: '-40°C a 85°C' },
      { name: 'Precisión', value: '±0.3°C' },
      { name: 'Conectividad', value: 'WiFi, Ethernet' },
      { name: 'Alimentación', value: 'Adaptador AC + batería de respaldo' },
      { name: 'Almacenamiento', value: 'Cloud + memoria interna 8GB' }
    ],
    features: [
      'Registro automático de temperatura 24/7',
      'Alertas por email y SMS en caso de desviaciones',
      'Compatible con plataforma ShieldCuisine',
      'Panel de control basado en web',
      'Generación automática de informes APPCC',
      'Instalación sencilla Plug & Play'
    ]
  },
];

// Categorías de productos
const categories = [
  { id: 'all', name: 'Todos los productos' },
  { id: 'Medición', name: 'Equipos de medición' },
  { id: 'Etiquetado', name: 'Etiquetado y rotulación' },
  { id: 'Dispositivos', name: 'Dispositivos y tecnología' },
  { id: 'Accesorios', name: 'Accesorios' },
];

// Opciones de ordenamiento
const sortOptions = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'nombre-asc', label: 'Nombre: A-Z' },
  { value: 'nombre-desc', label: 'Nombre: Z-A' },
];

// Componente para mostrar estrellas de valoración
const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <div className="flex">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ))}
      {hasHalfStar && <StarHalf className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-yellow-400" />
      ))}
    </div>
  );
};

// Componente para tarjeta de producto
const ProductCard: React.FC<{ product: any; index: number; addToCart: (product: any) => void }> = ({ 
  product, 
  index,
  addToCart
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="h-full flex flex-col hover:shadow-md transition-all relative overflow-hidden">
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {product.isNew && (
            <Badge className="bg-blue-500 hover:bg-blue-600">Nuevo</Badge>
          )}
          {product.isOnSale && (
            <Badge className="bg-red-500 hover:bg-red-600">Oferta</Badge>
          )}
          {product.isBestseller && (
            <Badge className="bg-amber-500 hover:bg-amber-600">Más vendido</Badge>
          )}
        </div>
        
        {/* Imagen */}
        <Link href={`/public/shop/producto/${product.id}`}>
          <div className="relative h-48 overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=ShieldCuisine';
              }}
            />
          </div>
        </Link>
        
        <CardContent className="flex-grow py-4">
          <Badge variant="outline" className="mb-2">
            {product.category}
          </Badge>
          <Link href={`/public/shop/producto/${product.id}`}>
            <h3 className="font-bold text-lg mb-1 hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center gap-2 mb-2">
            <RatingStars rating={product.rating} />
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount} opiniones)
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{product.price.toFixed(2)}€</span>
            {product.oldPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {product.oldPrice.toFixed(2)}€
              </span>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-0 pb-4">
          <Button 
            onClick={() => {
              addToCart(product);
              toast({
                title: "Añadido al carrito",
                description: `${product.name} ha sido añadido al carrito`,
                action: (
                  <Link href="/public/shop/carrito">
                    <Button variant="outline" size="sm">Ver carrito</Button>
                  </Link>
                ),
              });
            }}
            className="w-full"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Añadir al carrito
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

// Vista detallada de producto
const ProductDetail: React.FC<{ product: any, addToCart: (product: any) => void, closeSheet: () => void }> = ({ 
  product, 
  addToCart,
  closeSheet
}) => {
  const { toast } = useToast();
  
  return (
    <div>
      <div className="relative mb-6 rounded-lg overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-auto object-cover"
          style={{ maxHeight: '300px' }}
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=ShieldCuisine';
          }}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <Badge className="bg-blue-500 hover:bg-blue-600">Nuevo</Badge>
          )}
          {product.isOnSale && (
            <Badge className="bg-red-500 hover:bg-red-600">Oferta</Badge>
          )}
          {product.isBestseller && (
            <Badge className="bg-amber-500 hover:bg-amber-600">Más vendido</Badge>
          )}
        </div>
      </div>
      
      <Badge variant="outline" className="mb-2">
        {product.category}
      </Badge>
      
      <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
      
      <div className="flex items-center gap-2 mb-4">
        <RatingStars rating={product.rating} />
        <span className="text-sm text-muted-foreground">
          ({product.reviewCount} opiniones)
        </span>
      </div>
      
      <p className="text-muted-foreground mb-4">{product.description}</p>
      
      <div className="flex items-center gap-2 mb-6">
        <span className="font-bold text-2xl">{product.price.toFixed(2)}€</span>
        {product.oldPrice && (
          <span className="text-sm text-muted-foreground line-through">
            {product.oldPrice.toFixed(2)}€
          </span>
        )}
      </div>
      
      <div className="mb-6 flex items-center">
        <Badge className={`mr-2 ${product.inStock ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
          {product.inStock ? 'En stock' : 'Sin stock'}
        </Badge>
        <p className="text-sm text-muted-foreground">
          {product.inStock 
            ? 'Envío en 24-48 horas' 
            : 'Temporalmente sin stock. Contacta para más información.'}
        </p>
      </div>
      
      <Tabs defaultValue="features">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="features">Características</TabsTrigger>
          <TabsTrigger value="specs">Especificaciones</TabsTrigger>
        </TabsList>
        <TabsContent value="features" className="pt-4">
          <ul className="space-y-2">
            {product.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="specs" className="pt-4">
          <div className="space-y-2">
            {product.specifications.map((spec: any, index: number) => (
              <div key={index} className="flex justify-between">
                <span className="font-medium">{spec.name}:</span>
                <span className="text-muted-foreground">{spec.value}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 flex flex-col gap-4">
        <Button 
          size="lg"
          onClick={() => {
            addToCart(product);
            toast({
              title: "Añadido al carrito",
              description: `${product.name} ha sido añadido al carrito`,
              action: (
                <Link href="/public/shop/carrito">
                  <Button variant="outline" size="sm">Ver carrito</Button>
                </Link>
              ),
            });
            closeSheet();
          }}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Añadir al carrito
        </Button>
        
        <Button variant="outline" size="lg" asChild>
          <Link href="/public/contacto">
            <Info className="mr-2 h-5 w-5" />
            Solicitar más información
          </Link>
        </Button>
      </div>
    </div>
  );
};

// Página principal de la tienda
const ShopEquipmentPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevancia');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const { toast } = useToast();
  
  // Filtrar y ordenar productos
  useEffect(() => {
    let result = [...products];
    
    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }
    
    // Ordenar
    switch (sortBy) {
      case 'precio-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'precio-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'nombre-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nombre-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'relevancia':
      default:
        // Por defecto, los más vendidos primero
        result.sort((a, b) => {
          if (a.isBestseller && !b.isBestseller) return -1;
          if (!a.isBestseller && b.isBestseller) return 1;
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return 0;
        });
    }
    
    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, sortBy]);
  
  // Añadir al carrito
  const addToCart = (product: any) => {
    const itemIndex = cartItems.findIndex(item => item.product.id === product.id);
    
    if (itemIndex >= 0) {
      // Si ya existe, incrementar cantidad
      const newCart = [...cartItems];
      newCart[itemIndex].quantity += 1;
      setCartItems(newCart);
    } else {
      // Si no existe, añadir con cantidad 1
      setCartItems([...cartItems, { product, quantity: 1 }]);
    }
  };
  
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
            Equipamiento Profesional
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Todo lo que necesitas para implementar y mantener un sistema APPCC eficiente
            y cumplir con la normativa de seguridad alimentaria.
          </p>
          <div className="flex max-w-lg mx-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar productos..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </motion.section>
      
      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div className="flex items-center">
          <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="sm:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Categorías</h3>
                <div className="space-y-1">
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setIsFiltersOpen(false);
                      }}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="hidden sm:flex space-x-1">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredProducts.length} productos
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Ordenar por
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sortOptions.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={sortBy === option.value ? "bg-secondary" : ""}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <ShoppingCart className="h-4 w-4" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-white text-xs">
                    {cartItems.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Carrito de compra</SheetTitle>
              </SheetHeader>
              
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[70vh]">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Tu carrito está vacío</p>
                  <p className="text-muted-foreground text-center mb-6">
                    Añade algunos productos para continuar con la compra
                  </p>
                  <SheetClose asChild>
                    <Button>Seguir comprando</Button>
                  </SheetClose>
                </div>
              ) : (
                <div className="mt-6 flex flex-col h-[calc(100vh-10rem)]">
                  <div className="flex-grow overflow-auto space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://placehold.co/300x300/e2e8f0/64748b?text=ShieldCuisine';
                            }}
                          />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {item.product.name}
                          </h4>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => {
                                  const newCart = [...cartItems];
                                  const itemIndex = newCart.findIndex(cartItem => cartItem.product.id === item.product.id);
                                  if (newCart[itemIndex].quantity > 1) {
                                    newCart[itemIndex].quantity -= 1;
                                    setCartItems(newCart);
                                  } else {
                                    setCartItems(newCart.filter(cartItem => cartItem.product.id !== item.product.id));
                                  }
                                }}
                              >
                                -
                              </Button>
                              <span>{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => {
                                  const newCart = [...cartItems];
                                  const itemIndex = newCart.findIndex(cartItem => cartItem.product.id === item.product.id);
                                  newCart[itemIndex].quantity += 1;
                                  setCartItems(newCart);
                                }}
                              >
                                +
                              </Button>
                            </div>
                            <div className="text-sm font-medium">
                              {(item.product.price * item.quantity).toFixed(2)}€
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold">
                        {cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2)}€
                      </span>
                    </div>
                    
                    <Button className="w-full" size="lg" asChild>
                      <Link href="/public/shop/checkout">
                        Finalizar compra
                      </Link>
                    </Button>
                    
                    <SheetClose asChild>
                      <Button variant="outline" className="w-full">
                        Seguir comprando
                      </Button>
                    </SheetClose>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Lista de productos */}
      <AnimatePresence>
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground mb-4">
              No se encontraron productos que coincidan con tu búsqueda.
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Ver todos los productos
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <Sheet key={product.id}>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="p-0 h-auto w-full" onClick={() => setSelectedProduct(product)}>
                    <ProductCard 
                      product={product} 
                      index={index} 
                      addToCart={(p) => {
                        // Evitar que el evento de clic propague al Sheet
                        event?.stopPropagation();
                        addToCart(p);
                      }} 
                    />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[90vw] sm:max-w-xl overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Detalles del producto</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <ProductDetail 
                      product={selectedProduct} 
                      addToCart={addToCart} 
                      closeSheet={() => document.body.click()} 
                    />
                  </div>
                </SheetContent>
              </Sheet>
            ))}
          </div>
        )}
      </AnimatePresence>
      
      {/* CTA */}
      <motion.section 
        className="mt-24 bg-primary/5 p-12 rounded-xl text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <h2 className="text-3xl font-bold mb-4">¿Necesitas ayuda para elegir?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
          Nuestros especialistas pueden ayudarte a seleccionar el equipamiento más 
          adecuado para tu negocio. Contacta con nosotros para recibir asesoramiento personalizado.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/public/contacto">Solicitar asesoramiento</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/public/shop/guia-equipamiento">Ver guía de compra</Link>
          </Button>
        </div>
      </motion.section>
    </div>
  );
};

export default ShopEquipmentPage;