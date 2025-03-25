import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  // Esta función muestra un indicador de carga mientras se verifica la autenticación
  const LoadingComponent = () => (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  // Esta función redirige al usuario a la página de autenticación si no está autenticado
  const RedirectToAuth = () => <Redirect to="/auth" />;

  // Si la autenticación está cargando, muestra el indicador de carga
  if (isLoading) {
    return <Route path={path} component={LoadingComponent} />;
  }

  // Si el usuario no está autenticado, redirige a la página de autenticación
  if (!user) {
    return <Route path={path} component={RedirectToAuth} />;
  }

  // Si el usuario está autenticado, muestra el componente protegido
  return <Route path={path} component={Component} />;
}
