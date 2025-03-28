import { useAuth } from "../../shared/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";

type AllowedRoles = 'admin' | 'company_admin' | 'location_manager' | 'area_supervisor' | 'employee' | 'external';

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles = ['admin', 'company_admin', 'location_manager', 'area_supervisor', 'employee', 'external'],
}: {
  path: string;
  component: React.ComponentType<any>;
  allowedRoles?: AllowedRoles[];
}) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Verificar si el usuario tiene uno de los roles permitidos
  const hasRequiredRole = allowedRoles.includes(user.role as AllowedRoles);

  // Redirigir a la interfaz adecuada según el rol si el usuario no tiene permiso
  if (!hasRequiredRole) {
    // Si el usuario está en una ruta de admin pero no es admin, redirigir a su dashboard apropiado
    if (path.startsWith('/admin') && user.role !== 'admin') {
      return (
        <Route path={path}>
          <Redirect to="/client/dashboard" />
        </Route>
      );
    }
    
    // Ya no redirigimos a los administradores fuera de la interfaz de cliente
    // porque ahora pueden acceder a ambas interfaces
  }

  // Si el usuario tiene un rol permitido para esta ruta, mostrar el componente
  return <Route path={path} component={Component} />;
}