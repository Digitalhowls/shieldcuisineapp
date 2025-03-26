import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  BarChart3,
  Users,
  ClipboardList,
  ShoppingBag,
  Store,
  LayoutDashboard,
  Book,
  BriefcaseBusiness,
  Building2,
  Building,
  Settings,
  PieChart,
  Menu,
  X,
  CreditCard,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  href,
  icon,
  label,
  active,
  onClick,
}) => {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
        onClick={onClick}
      >
        {icon}
        <span>{label}</span>
      </a>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile sidebar toggle */}
      <button
        className="fixed z-50 bottom-4 right-4 md:hidden bg-primary text-white p-3 rounded-full shadow-lg"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col w-64 bg-background border-r h-screen overflow-y-auto transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">ShieldCuisine</h2>
        </div>

        <div className="flex-1 py-4 space-y-1 px-3">
          <NavItem
            href="/"
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={location === "/"}
            onClick={() => setIsOpen(false)}
          />

          <div className="py-2">
            <h3 className="px-3 text-xs font-semibold text-gray-500">APPCC</h3>
            <div className="mt-1 space-y-1">
              <NavItem
                href="/appcc/dashboard"
                icon={<BarChart3 size={20} />}
                label="Resumen"
                active={location === "/appcc/dashboard"}
                onClick={() => setIsOpen(false)}
              />
              <NavItem
                href="/appcc/daily-controls"
                icon={<ClipboardList size={20} />}
                label="Controles Diarios"
                active={location === "/appcc/daily-controls"}
                onClick={() => setIsOpen(false)}
              />
              <NavItem
                href="/appcc/templates"
                icon={<ClipboardList size={20} />}
                label="Plantillas"
                active={location === "/appcc/templates"}
                onClick={() => setIsOpen(false)}
              />
              <NavItem
                href="/appcc/records"
                icon={<ClipboardList size={20} />}
                label="Registros"
                active={location === "/appcc/records"}
                onClick={() => setIsOpen(false)}
              />
              <NavItem
                href="/appcc/reports"
                icon={<PieChart size={20} />}
                label="Informes"
                active={location === "/appcc/reports"}
                onClick={() => setIsOpen(false)}
              />
            </div>
          </div>

          <div className="py-2">
            <h3 className="px-3 text-xs font-semibold text-gray-500">
              Inventario
            </h3>
            <div className="mt-1 space-y-1">
              <NavItem
                href="/almacen/dashboard"
                icon={<Store size={20} />}
                label="Almacén"
                active={location === "/almacen/dashboard"}
                onClick={() => setIsOpen(false)}
              />
              <NavItem
                href="/almacen/productos"
                icon={<ShoppingBag size={20} />}
                label="Productos"
                active={location === "/almacen/productos"}
                onClick={() => setIsOpen(false)}
              />
              <NavItem
                href="/almacen/woocommerce"
                icon={<Store size={20} />}
                label="WooCommerce"
                active={location === "/almacen/woocommerce"}
                onClick={() => setIsOpen(false)}
              />
            </div>
          </div>

          <div className="py-2">
            <h3 className="px-3 text-xs font-semibold text-gray-500">Compras</h3>
            <div className="mt-1 space-y-1">
              <NavItem
                href="/compras"
                icon={<ShoppingBag size={20} />}
                label="Órdenes de Compra"
                active={location === "/compras"}
                onClick={() => setIsOpen(false)}
              />
              <NavItem
                href="/compras/analisis"
                icon={<BarChart3 size={20} />}
                label="Análisis IA"
                active={location === "/compras/analisis"}
                onClick={() => setIsOpen(false)}
              />
            </div>
          </div>

          <div className="py-2">
            <h3 className="px-3 text-xs font-semibold text-gray-500">Banca</h3>
            <div className="mt-1 space-y-1">
              <NavItem
                href="/banca/dashboard"
                icon={<CreditCard size={20} />}
                label="Dashboard"
                active={location === "/banca/dashboard"}
                onClick={() => setIsOpen(false)}
              />
              <NavItem
                href="/banca/cuentas"
                icon={<CreditCard size={20} />}
                label="Cuentas"
                active={location === "/banca/cuentas"}
                onClick={() => setIsOpen(false)}
              />
              <NavItem
                href="/banca/transacciones"
                icon={<CreditCard size={20} />}
                label="Transacciones"
                active={location === "/banca/transacciones"}
                onClick={() => setIsOpen(false)}
              />
            </div>
          </div>

          <div className="py-2">
            <h3 className="px-3 text-xs font-semibold text-gray-500">
              Formación
            </h3>
            <div className="mt-1 space-y-1">
              <NavItem
                href="/formacion/dashboard"
                icon={<Book size={20} />}
                label="Dashboard"
                active={location === "/formacion/dashboard"}
                onClick={() => setIsOpen(false)}
              />
              <NavItem
                href="/formacion/cursos"
                icon={<Book size={20} />}
                label="Catálogo"
                active={location === "/formacion/cursos"}
                onClick={() => setIsOpen(false)}
              />
              <NavItem
                href="/formacion/mis-cursos"
                icon={<Book size={20} />}
                label="Mis Cursos"
                active={location === "/formacion/mis-cursos"}
                onClick={() => setIsOpen(false)}
              />
            </div>
          </div>

          <div className="py-2">
            <h3 className="px-3 text-xs font-semibold text-gray-500">
              Administración
            </h3>
            <div className="mt-1 space-y-1">
              <NavItem
                href="/admin/clientes"
                icon={<BriefcaseBusiness size={20} />}
                label="Empresas"
                active={location === "/admin/clientes"}
                onClick={() => setIsOpen(false)}
              />
              <NavItem
                href="/admin/locations"
                icon={<Building2 size={20} />}
                label="Localizaciones"
                active={location === "/admin/locations"}
                onClick={() => setIsOpen(false)}
              />
              <NavItem
                href="/admin/almacenes"
                icon={<Building size={20} />}
                label="Almacenes"
                active={location === "/admin/almacenes"}
                onClick={() => setIsOpen(false)}
              />
              <NavItem
                href="/admin/usuarios"
                icon={<Users size={20} />}
                label="Usuarios"
                active={location === "/admin/usuarios"}
                onClick={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              logoutMutation.mutate();
              setIsOpen(false);
            }}
          >
            <LogOut size={16} className="mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;