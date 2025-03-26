import { Route, Switch, useLocation } from "wouter";
import MediaPage from "./media";
import BrandingPage from "./branding";
import ApiPage from "./api";

/**
 * Componente temporal de pages hasta que se implemente
 */
const PaginasPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold tracking-tight">Gestor de Páginas</h1>
      <p className="text-muted-foreground mt-2">
        Crea y edita las páginas de tu sitio web
      </p>
      <div className="mt-6 p-6 border rounded-lg text-center">
        <p>Esta sección está en desarrollo</p>
      </div>
    </div>
  );
};

/**
 * Componente temporal de blog hasta que se implemente
 */
const BlogPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      <p className="text-muted-foreground mt-2">
        Gestiona los artículos del blog de tu sitio web
      </p>
      <div className="mt-6 p-6 border rounded-lg text-center">
        <p>Esta sección está en desarrollo</p>
      </div>
    </div>
  );
};

/**
 * Componente principal del dashboard del CMS
 */
const CMSDashboard: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard CMS</h1>
      <p className="text-muted-foreground mt-2">
        Panel de control para gestionar el contenido y funcionalidades del CMS
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold">Páginas</h2>
          <p className="text-muted-foreground mt-2">Gestiona el contenido de tu sitio</p>
        </div>
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold">Medios</h2>
          <p className="text-muted-foreground mt-2">Administra imágenes y archivos</p>
        </div>
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold">API</h2>
          <p className="text-muted-foreground mt-2">Integración con otras aplicaciones</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Módulo principal del CMS
 * Maneja el enrutamiento interno dentro del módulo CMS
 */
const CMSModule: React.FC = () => {
  const [location] = useLocation();
  
  return (
    <Switch>
      <Route path="/cms">
        {location === "/cms" && <CMSDashboard />}
      </Route>
      <Route path="/cms/paginas">
        <PaginasPage />
      </Route>
      <Route path="/cms/blog">
        <BlogPage />
      </Route>
      <Route path="/cms/media">
        <MediaPage />
      </Route>
      <Route path="/cms/branding">
        <BrandingPage />
      </Route>
      <Route path="/cms/api">
        <ApiPage />
      </Route>
    </Switch>
  );
};

export default CMSModule;