import React, { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface CMSRedirectProps {
  targetPath: string;
}

// Componente para redirigir entre rutas del CMS preservando la sesión
const CMSRedirect: React.FC<CMSRedirectProps> = ({ targetPath }) => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  useEffect(() => {
    // Verificamos que el usuario esté autenticado antes de redirigir
    if (user) {
      // Pequeño retraso para asegurar que todos los efectos sean procesados
      const timer = setTimeout(() => {
        // Usamos la navegación programática que mantiene el estado y la sesión
        navigate(targetPath);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user, targetPath, navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redireccionando a {targetPath}...</p>
        <Link href={targetPath}>
          <a id="redirect-link" className="text-primary hover:underline mt-4 inline-block">
            Si no eres redirigido automáticamente, haz clic aquí
          </a>
        </Link>
      </div>
    </div>
  );
};

export default CMSRedirect;