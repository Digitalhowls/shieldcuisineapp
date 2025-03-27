import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { hasValidAuthCookie } from "@/lib/cookie-auth";

// Mapa de redirecciones entre rutas antiguas y nuevas
const redirectMap: Record<string, string> = {
  // Admin Routes
  "/admin/cms": "/cms",
  "/admin/cms/pages": "/cms/paginas",
  "/admin/cms/media": "/cms/media",
  "/admin/cms/settings": "/cms/configuracion",
  "/admin/cms/configuracion": "/cms/configuracion", // Agregada para consistencia
  "/admin/cms/blog": "/cms/blog",
  "/admin/cms/editor": "/cms/editor",
  "/admin/cms/categories": "/cms/categorias",
  "/admin/cms/categorias": "/cms/categorias", // Agregada para consistencia en español
  "/admin/cms/branding": "/cms/configuracion",
  
  // Client Routes (si es necesario)
  "/cms/paginas": "/admin/cms/pages",
  "/cms/media": "/admin/cms/media",
  "/cms/configuracion": "/admin/cms/settings",
  "/cms/blog": "/admin/cms/blog",
  "/cms/editor": "/admin/cms/editor", 
  "/cms/categorias": "/admin/cms/categories",
};

/**
 * Componente para manejar redirecciones entre rutas del CMS preservando la sesión
 * 
 * @param params.source - Ruta de origen para la redirección
 * @param params.destination - Ruta de destino para la redirección, si no se especifica
 *                            se utilizará el mapa de redirecciones
 */
export default function CMSRedirect({ 
  source, 
  destination 
}: { 
  source?: string;
  destination?: string;
}) {
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // Verificar que tenemos usuario o cookie antes de redirigir
    if (!isLoading) {
      if (user || hasValidAuthCookie()) {
        const currentPath = source || window.location.pathname;
        // Usar targetPath directo si se proporciona, sino buscar en el mapa
        // Si no está en el mapa, usar una ruta por defecto para evitar 404
        const targetPath = destination || 
                           (redirectMap[currentPath] || "/cms");

        if (targetPath) {
          console.log(`Redirigiendo de ${currentPath} a ${targetPath}`);
          // Usar navigate que preserva el estado de la aplicación incluyendo la autenticación
          navigate(targetPath, { replace: true });
        } else {
          setError(`No se pudo determinar la ruta de destino para: ${currentPath}`);
          setIsRedirecting(false);
        }
      } else {
        setError("No hay sesión activa. Por favor inicie sesión nuevamente.");
        setIsRedirecting(false);
        // Redirigir a la página de autenticación después de un breve retraso
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 2000);
      }
    }
  }, [source, destination, navigate, isLoading, user]);

  if (isLoading || isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Redireccionando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-destructive/10 p-4 rounded-lg border border-destructive max-w-md">
          <h2 className="text-xl font-semibold mb-2">Error de redirección</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return null;
}