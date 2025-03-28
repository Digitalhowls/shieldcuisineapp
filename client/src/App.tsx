import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import HomePage from "./shared/features/home-page";
import NotFound from "./pages/not-found";
import AuthPage from "./shared/features/auth/pages/auth-page";
import { ProtectedRoute } from "./shared/components/protected-route";
import { AuthProvider } from "./shared/hooks/use-auth";

// Mantenemos los imports de las rutas antiguas para asegurar compatibilidad durante la migración
import AppccModule from "./pages/appcc";
import AlmacenModule from "./pages/almacen";
import TransparenciaModule from "./pages/transparencia";
import ClientePortal from "./pages/cliente";
import BancaModule from "./pages/banca";
import FormacionModule from "./pages/formacion";
import NotificacionesPage from "./pages/configuracion/notificaciones";
import TodasNotificacionesPage from "./pages/configuracion/todas-notificaciones";
import ComprasIndex from "./pages/compras";
import ComprasNueva from "./pages/compras/nueva";
import ComprasDetalle from "./pages/compras/[id]";
import ComprasAnalisis from "./pages/compras/analisis";
import CMSModule from "./pages/cms";
import AnimationPlayground from "./pages/cms/animation-playground";
import AnimatedBlocksDemo from "./pages/cms/animated-blocks-demo";
import GalleryDemo from "./pages/cms/gallery-demo";
import CMSRedirect from "./pages/cms/cms-redirect";
import RichTextDemo from "./pages/rich-text-demo";

// Nuevos módulos de interfaz dual
import AdminModule from "./pages/admin"; // Panel de administración
import ClientModule from "./pages/client"; // Panel de cliente

// Páginas públicas
import PublicIndex from "./pages/public/index";
import BlogPage from "./pages/public/blog";
import BlogPostPage from "./pages/public/blog-post";
import ShopEquipmentPage from "./pages/public/shop-equipment";
import ShopModulesPage from "./pages/public/shop-modules";

function AppRouter() {
  return (
    <Switch>
      {/* Rutas con doble interfaz */}
      <ProtectedRoute 
        path="/admin" 
        component={AdminModule} 
        allowedRoles={['admin']}
      />
      <ProtectedRoute 
        path="/admin/:rest*" 
        component={AdminModule}
        allowedRoles={['admin']}
      />
      <ProtectedRoute 
        path="/client" 
        component={ClientModule}
        allowedRoles={['admin', 'company_admin', 'location_manager', 'area_supervisor', 'employee']}
      />
      <ProtectedRoute 
        path="/client/:rest*" 
        component={ClientModule}
        allowedRoles={['admin', 'company_admin', 'location_manager', 'area_supervisor', 'employee']}
      />

      {/* Rutas protegidas antiguas (temporal, se migrarán a la nueva estructura) */}
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/appcc" component={AppccModule} />
      <ProtectedRoute path="/appcc/:rest*" component={AppccModule} />
      <ProtectedRoute path="/almacen" component={AlmacenModule} />
      <ProtectedRoute path="/almacen/:rest*" component={AlmacenModule} />
      <ProtectedRoute path="/transparencia" component={TransparenciaModule} />
      <ProtectedRoute path="/transparencia/:rest*" component={TransparenciaModule} />
      <ProtectedRoute path="/banca" component={BancaModule} />
      <ProtectedRoute path="/banca/:rest*" component={BancaModule} />
      <ProtectedRoute path="/formacion" component={FormacionModule} />
      <ProtectedRoute path="/formacion/:rest*" component={FormacionModule} />
      <ProtectedRoute path="/configuracion/notificaciones" component={NotificacionesPage} />
      <ProtectedRoute path="/configuracion/todas-notificaciones" component={TodasNotificacionesPage} />
      <ProtectedRoute path="/compras" component={ComprasIndex} />
      <ProtectedRoute path="/compras/nueva" component={ComprasNueva} />
      <ProtectedRoute path="/compras/analisis" component={ComprasAnalisis} />
      <ProtectedRoute path="/compras/:id" component={ComprasDetalle} />
      {/* Redirecciones del CMS para unificar rutas */}
      <ProtectedRoute path="/admin/cms" component={() => <CMSRedirect source="/admin/cms" destination="/cms" />} />
      <ProtectedRoute path="/admin/cms/pages" component={() => <CMSRedirect source="/admin/cms/pages" destination="/cms/paginas" />} />
      <ProtectedRoute path="/admin/cms/categories" component={() => <CMSRedirect source="/admin/cms/categories" destination="/cms/categorias" />} />
      <ProtectedRoute path="/admin/cms/media" component={() => <CMSRedirect source="/admin/cms/media" destination="/cms/media" />} />
      <ProtectedRoute path="/admin/cms/branding" component={() => <CMSRedirect source="/admin/cms/branding" destination="/cms/configuracion" />} />
      <ProtectedRoute path="/admin/cms/:rest*" component={() => <CMSRedirect source={window.location.pathname} destination="/cms" />} />
      
      {/* Rutas normales del CMS */}
      <ProtectedRoute path="/cms" component={CMSModule} />
      <ProtectedRoute path="/cms/animation-playground" component={AnimationPlayground} />
      <ProtectedRoute path="/cms/animated-blocks-demo" component={AnimatedBlocksDemo} />
      <ProtectedRoute path="/cms/gallery-demo" component={GalleryDemo} />
      <ProtectedRoute path="/cms/rich-text-demo" component={RichTextDemo} />
      <ProtectedRoute path="/cms/:rest*" component={CMSModule} />
      
      {/* Ruta de autenticación actualizada */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Portal de cliente (acceso por token) */}
      <Route path="/cliente" component={ClientePortal} />
      <Route path="/cliente/:rest*" component={ClientePortal} />
      
      {/* Sitio público */}
      <Route path="/public" component={PublicIndex} />
      <Route path="/public/blog" component={BlogPage} />
      <Route path="/public/blog/:slug" component={BlogPostPage} />
      <Route path="/public/shop-equipment" component={ShopEquipmentPage} />
      <Route path="/public/shop-modules" component={ShopModulesPage} />
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Definición del prefijo base para el router (asegura la compatibilidad con las URLs)
const RouterPrefix = () => (
  <WouterRouter base="">
    <AppRouter />
  </WouterRouter>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterPrefix />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
