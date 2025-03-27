import React, { useEffect } from "react";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";

interface CMSRedirectProps {
  targetPath: string;
}

// Componente para redirigir entre rutas del CMS
const CMSRedirect: React.FC<CMSRedirectProps> = ({ targetPath }) => {
  useEffect(() => {
    // Usamos el componente Link para mantener el estado de la aplicación
    // y preservar la sesión durante la redirección
    const linkElement = document.getElementById("redirect-link");
    if (linkElement) {
      linkElement.click();
    }
  }, [targetPath]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redireccionando a {targetPath}...</p>
        <Link href={targetPath}>
          <a id="redirect-link" className="hidden">Continuar</a>
        </Link>
      </div>
    </div>
  );
};

export default CMSRedirect;