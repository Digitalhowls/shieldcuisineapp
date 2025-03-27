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

export default function LessonsPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Lecciones</h1>
          <p className="text-muted-foreground">
            Administra las lecciones de los cursos en la plataforma.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nueva Lección
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lecciones</CardTitle>
          <CardDescription>
            Lista de todas las lecciones en la plataforma. Puedes ver, editar o eliminar lecciones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-20 text-center text-muted-foreground">
            Esta es una versión simplificada del gestor de lecciones para solucionar problemas de navegación.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}