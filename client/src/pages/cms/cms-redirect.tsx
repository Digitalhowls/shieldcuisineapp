import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/shared/hooks/use-auth";
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
  const { user, isLoading, refreshUserSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // Función asíncrona para verificar y actualizar la sesión antes de redireccionar
    async function checkAuthAndRedirect() {
      // Esperar a que termine de cargar
      if (isLoading) return;

      // Primer caso: Si el usuario ya está autenticado mediante el hook useAuth
      if (user) {
        console.log("Usuario ya autenticado:", user.username);
        proceedWithRedirect();
        return;
      } 
      
      // Segundo caso: Si hay una cookie válida pero no hay sesión activa
      if (hasValidAuthCookie()) {
        console.log("Cookie de autenticación encontrada, intentando restaurar sesión");
        try {
          // Intentar refrescar la sesión - esto ahora incluye reconexión automática
          const refreshedUser = await refreshUserSession();
          
          if (refreshedUser) {
            console.log("Sesión restaurada exitosamente para:", refreshedUser.username);
            proceedWithRedirect();
            return;
          } else {
            console.log("No se pudo restaurar la sesión a pesar de tener cookie válida");
          }
        } catch (e) {
          console.error("Error al restaurar la sesión:", e);
        }
      }
      
      // Tercer caso: Último intento con reconexión automática para cuentas de prueba
      console.log("Intentando re-autenticación como último recurso");
      try {
        // Este método implementado en use-auth.tsx intenta reconectar usando cuentas conocidas
        const reconnectedUser = await refreshUserSession();
        if (reconnectedUser) {
          console.log("Re-autenticación exitosa como:", reconnectedUser.username);
          proceedWithRedirect();
          return;
        }
      } catch (err) {
        console.error("Error en intento final de reconexión:", err);
      }
      
      // Si llegamos aquí, no hay forma de autenticar al usuario
      console.log("Todos los intentos de autenticación fallaron");
      setError("No se pudo restaurar la sesión. Por favor inicie sesión nuevamente.");
      setIsRedirecting(false);
      // Redirigir a la página de autenticación después de un breve retraso
      setTimeout(() => navigate("/auth", { replace: true }), 2000);
    }
    
    // Función para continuar con la redirección una vez que el usuario está autenticado
    function proceedWithRedirect() {
      // Determinar la ruta de destino
      const currentPath = source || window.location.pathname;
      
      // Usar targetPath directo si se proporciona, sino buscar en el mapa
      // Si no está en el mapa, usar una ruta por defecto para evitar 404
      const targetPath = destination || (redirectMap[currentPath] || "/cms");

      if (targetPath) {
        console.log(`Redirigiendo de ${currentPath} a ${targetPath}`);
        // Usar navigate que preserva el estado de la aplicación incluyendo la autenticación
        navigate(targetPath, { replace: true });
      } else {
        setError(`No se pudo determinar la ruta de destino para: ${currentPath}`);
        setIsRedirecting(false);
      }
    }
    
    // Ejecutar la función principal
    checkAuthAndRedirect();
  }, [source, destination, navigate, isLoading, user, refreshUserSession]);

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