import { Outlet, Switch, Route, Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import Dashboard from "./dashboard";
import Cursos from "./cursos";
import CursoDetalle from "./curso-detalle";
import MisCursos from "./mis-cursos";
import CursoProgreso from "./curso-progreso";

export default function FormacionModule() {
  const [location] = useLocation();
  
  // Verifica si estamos en una subruta de formacion
  const isBase = location === "/formacion";
  
  return (
    <Layout>
      <div className="container px-4 py-4 mx-auto">
        {isBase ? (
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Plataforma de formación</h1>
            <p className="text-muted-foreground">
              Gestiona los cursos de capacitación para tu personal
            </p>
          </div>
        ) : null}
        
        <div className="mb-6">
          <nav className="flex space-x-4">
            <Link href="/formacion">
              <a className={`${location === "/formacion" ? "font-bold border-b-2 border-primary" : ""} px-2 py-1 hover:text-primary transition-colors`}>
                Dashboard
              </a>
            </Link>
            <Link href="/formacion/cursos">
              <a className={`${location === "/formacion/cursos" ? "font-bold border-b-2 border-primary" : ""} px-2 py-1 hover:text-primary transition-colors`}>
                Catálogo de cursos
              </a>
            </Link>
            <Link href="/formacion/mis-cursos">
              <a className={`${location === "/formacion/mis-cursos" ? "font-bold border-b-2 border-primary" : ""} px-2 py-1 hover:text-primary transition-colors`}>
                Mis cursos
              </a>
            </Link>
          </nav>
        </div>
        
        <Switch>
          <Route path="/formacion" component={Dashboard} />
          <Route path="/formacion/cursos" component={Cursos} />
          <Route path="/formacion/cursos/:id" component={CursoDetalle} />
          <Route path="/formacion/mis-cursos" component={MisCursos} />
          <Route path="/formacion/progreso/:id" component={CursoProgreso} />
          <Route path="/formacion/:rest*">
            <Outlet />
          </Route>
        </Switch>
      </div>
    </Layout>
  );
}