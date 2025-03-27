import React from "react";
import { Route, Switch, useLocation } from "wouter";
// Importamos las páginas del módulo e-learning
import CoursesPage from "./courses";
import LessonsPage from "./lessons";
import QuizzesPage from "./quizzes";

export default function LearningModule() {
  const [location, setLocation] = useLocation();
  
  // Redirigir a cursos si estamos en la raíz del módulo
  React.useEffect(() => {
    if (location === "/admin/learning") {
      setLocation("/admin/learning/courses");
    }
  }, [location, setLocation]);

  // Añadir una barra de navegación para moverse entre las secciones
  return (
    <div className="space-y-6">
      <div className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <div className="flex gap-6 font-medium">
            <a
              href="/admin/learning/courses"
              onClick={(e) => {
                e.preventDefault();
                setLocation("/admin/learning/courses");
              }}
              className={`flex items-center border-b-2 px-2 py-4 ${
                location === "/admin/learning/courses"
                  ? "border-primary"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              Cursos
            </a>
            <a
              href="/admin/learning/lessons"
              onClick={(e) => {
                e.preventDefault();
                setLocation("/admin/learning/lessons");
              }}
              className={`flex items-center border-b-2 px-2 py-4 ${
                location === "/admin/learning/lessons"
                  ? "border-primary"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              Lecciones
            </a>
            <a
              href="/admin/learning/quizzes"
              onClick={(e) => {
                e.preventDefault();
                setLocation("/admin/learning/quizzes");
              }}
              className={`flex items-center border-b-2 px-2 py-4 ${
                location === "/admin/learning/quizzes"
                  ? "border-primary"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              Cuestionarios
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <Switch>
          <Route path="/admin/learning/courses" component={CoursesPage} />
          <Route path="/admin/learning/lessons" component={LessonsPage} />
          <Route path="/admin/learning/quizzes" component={QuizzesPage} />
        </Switch>
      </div>
    </div>
  );
}