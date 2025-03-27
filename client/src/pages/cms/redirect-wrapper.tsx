import React from "react";
import CMSRedirect from "./cms-redirect";

// Componentes adaptadores para la redirección compatible con ProtectedRoute
export function RedirectToPaginas() {
  return <CMSRedirect destination="/cms/paginas" />;
}

export function RedirectToCategorias() {
  return <CMSRedirect destination="/cms/categorias" />;
}

export function RedirectToMedia() {
  return <CMSRedirect destination="/cms/media" />;
}

export function RedirectToBranding() {
  return <CMSRedirect destination="/cms/branding" />;
}