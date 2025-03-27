import React from "react";
import CMSRedirect from "./cms-redirect";

// Componentes adaptadores para la redirección compatible con ProtectedRoute
export const RedirectToPaginas = () => <CMSRedirect targetPath="/cms/paginas" />;
export const RedirectToCategorias = () => <CMSRedirect targetPath="/cms/categorias" />;
export const RedirectToMedia = () => <CMSRedirect targetPath="/cms/media" />;
export const RedirectToBranding = () => <CMSRedirect targetPath="/cms/branding" />;