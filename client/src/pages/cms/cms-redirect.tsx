import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface CMSRedirectProps {
  targetPath: string;
}

// Componente para redirigir entre rutas del CMS
const CMSRedirect: React.FC<CMSRedirectProps> = ({ targetPath }) => {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Redirigir a la ruta especificada después de que el componente se monte
    setLocation(targetPath);
  }, [targetPath, setLocation]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redireccionando...</p>
      </div>
    </div>
  );
};

export default CMSRedirect;