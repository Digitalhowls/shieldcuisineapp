import { useEffect } from "react";
import { useLocation } from "wouter";
import Dashboard from "./dashboard";
import Cursos from "./cursos";
import CursoDetalle from "./curso-detalle";
import MisCursos from "./mis-cursos";
import CursoProgreso from "./curso-progreso";

export default function Formacion() {
  const [location, setLocation] = useLocation();
  
  // Redirigir al dashboard por defecto
  useEffect(() => {
    if (location === "/formacion") {
      setLocation("/formacion/dashboard");
    }
  }, [location, setLocation]);
  
  return null;
}