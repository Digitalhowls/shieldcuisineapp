import React from "react";
import { useLocation, Switch, Route } from "wouter";
import { Loader2 } from "lucide-react";
import PaginasPage from "./paginas";
import BlogPage from "./blog";
import MediaPage from "./media";
import BrandingPage from "./branding";
import ApiPage from "./api";

const CMSModule: React.FC = () => {
  const [location] = useLocation();

  // Si estamos en la ruta principal del módulo, redirigir a la primera sección
  if (location === "/cms") {
    return <PaginasPage />;
  }

  return (
    <div className="p-6">
      <Switch>
        <Route path="/cms/paginas" component={PaginasPage} />
        <Route path="/cms/blog" component={BlogPage} />
        <Route path="/cms/media" component={MediaPage} />
        <Route path="/cms/branding" component={BrandingPage} />
        <Route path="/cms/api" component={ApiPage} />
        <Route>
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Route>
      </Switch>
    </div>
  );
};

export default CMSModule;