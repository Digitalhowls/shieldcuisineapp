import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/home-page";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import AppccModule from "./pages/appcc";
import AlmacenModule from "./pages/almacen";
import TransparenciaModule from "./pages/transparencia";

function AppRouter() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/appcc" component={AppccModule} />
      <ProtectedRoute path="/appcc/:rest*" component={AppccModule} />
      <ProtectedRoute path="/almacen" component={AlmacenModule} />
      <ProtectedRoute path="/almacen/:rest*" component={AlmacenModule} />
      <ProtectedRoute path="/transparencia" component={TransparenciaModule} />
      <ProtectedRoute path="/transparencia/:rest*" component={TransparenciaModule} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Definición del prefijo base para el router (asegura la compatibilidad con las URLs)
const RouterPrefix = () => (
  <WouterRouter base="">
    <AppRouter />
  </WouterRouter>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterPrefix />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
