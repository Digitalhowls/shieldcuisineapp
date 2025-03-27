import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/layouts/admin-layout";
import MediaLibrary from "@/components/cms/media/MediaLibrary";
import MediaCategoryManager from "@/components/cms/media/MediaCategoryManager";
import { Settings, Grid, FolderTree } from "lucide-react";

const MediaManagerPage = () => {
  const [activeTab, setActiveTab] = useState("library");

  return (
    <AdminLayout
      title="Gestor de Medios"
      description="Gestiona imágenes, videos y archivos para tu sitio web"
    >
      <Tabs defaultValue="library" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-end">
          <TabsList>
            <TabsTrigger value="library" className="gap-2">
              <Grid size={16} />
              <span>Biblioteca</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <FolderTree size={16} />
              <span>Categorías</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings size={16} />
              <span>Configuración</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="library" className="space-y-4">
          <MediaLibrary />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <MediaCategoryManager />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Medios</CardTitle>
              <CardDescription>
                Configura los ajustes para la biblioteca de medios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Próximamente: Configuración avanzada para la biblioteca de medios.</p>
                <p className="text-sm mt-2">
                  Esta sección permitirá configurar tamaños de imagen, compresión automática y otros ajustes.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default MediaManagerPage;