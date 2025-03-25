import { Route, Switch } from "wouter";
import { Suspense, lazy } from "react";
import Dashboard from "./dashboard";
import Cuentas from "./cuentas";
import CuentaDetalle from "./cuenta-detalle";
import Configuracion from "./configuracion";

// Componente principal para la sección bancaria
export default function BancaIndex() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <Switch>
        <Route path="/banca" component={Dashboard} />
        <Route path="/banca/cuentas" component={Cuentas} />
        <Route path="/banca/cuenta/:id" component={CuentaDetalle} />
        <Route path="/banca/configuracion" component={Configuracion} />
      </Switch>
    </Suspense>
  );
}