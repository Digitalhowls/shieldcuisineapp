import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 pb-4">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-error" />
            <h1 className="text-2xl font-bold text-neutral-800">404 Página no encontrada</h1>
          </div>

          <p className="mt-4 mb-6 text-sm text-neutral-600">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
          
          <div className="flex justify-end">
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
