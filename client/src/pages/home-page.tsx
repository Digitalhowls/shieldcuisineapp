import React, { useEffect } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();

  // Si el usuario es un administrador, redirigirlo al dashboard de administrador
  // Si es otro tipo de usuario, redirigirlo al dashboard de cliente
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (user?.role === "admin") {
    return <Redirect to="/admin/dashboard" />;
  } else {
    return <Redirect to="/client/dashboard" />;
  }
}