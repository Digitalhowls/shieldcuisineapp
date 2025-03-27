import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function SimpleCourses() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Cursos</h1>
          <p className="text-muted-foreground">
            Administra los cursos disponibles en la plataforma de aprendizaje.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Curso
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cursos</CardTitle>
          <CardDescription>
            Lista de todos los cursos en la plataforma. Puedes ver, editar o eliminar cursos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-20 text-center text-muted-foreground">
            Esta es una versión simplificada del gestor de cursos para solucionar problemas de navegación.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Exportamos la función principal como predeterminada
export default SimpleCourses;