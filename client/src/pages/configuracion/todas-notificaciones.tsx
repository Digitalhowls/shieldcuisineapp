import React, { useCallback, useRef, useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Bell, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { FixedSizeList as List } from "react-window";
import { Notification } from "@shared/schema";

// Definir tipo para la configuración de notificaciones
type NotificationTypeConfig = {
  [key: string]: {
    color: string;
    label: string;
  }
};

// Mapeo de tipos de notificaciones a colores y etiquetas
const notificationTypeConfig: NotificationTypeConfig = {
  security: { 
    color: "bg-red-100 text-red-800 hover:bg-red-200", 
    label: "Seguridad" 
  },
  inventory: { 
    color: "bg-blue-100 text-blue-800 hover:bg-blue-200", 
    label: "Inventario" 
  },
  appcc_control: { 
    color: "bg-green-100 text-green-800 hover:bg-green-200", 
    label: "APPCC" 
  },
  learning: { 
    color: "bg-purple-100 text-purple-800 hover:bg-purple-200", 
    label: "Formación" 
  },
  banking: { 
    color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200", 
    label: "Banca" 
  },
  purchasing: { 
    color: "bg-orange-100 text-orange-800 hover:bg-orange-200", 
    label: "Compras" 
  },
  cms: { 
    color: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200", 
    label: "CMS y Web" 
  },
  system: { 
    color: "bg-gray-100 text-gray-800 hover:bg-gray-200", 
    label: "Sistema" 
  },
};

// Props para los datos de fila virtualizada
interface NotificationRowData {
  notifications: Notification[];
  typeConfig: NotificationTypeConfig;
  onDelete: (id: number) => void;
  onClick: (notification: Notification) => void;
  formatTime: (date: Date) => string;
}

// Componente de fila virtualizada para notificaciones
const NotificationRow = React.memo(({ index, style, data }: { 
  index: number; 
  style: React.CSSProperties; 
  data: NotificationRowData 
}) => {
  const notification = data.notifications[index];
  const typeConfig = data.typeConfig;
  
  // Usar una fecha segura para el formateo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const safeDate = new Date((notification as any).createdAt || Date.now());
  
  return (
    <div 
      style={{
        ...style,
        paddingTop: 8,
        paddingBottom: 8
      }}
    >
      <div 
        className={`flex items-start gap-4 p-4 rounded-md ${notification.isRead ? 'bg-card' : 'bg-muted'} hover:bg-muted-foreground/5 cursor-pointer relative group`}
        onClick={() => data.onClick(notification)}
      >
        <div className={`${typeConfig[notification.type]?.color || typeConfig.system.color} p-3 rounded-full`}>
          <Bell className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className={`font-medium truncate ${notification.isRead ? 'text-foreground' : 'text-foreground font-semibold'}`}>
              {notification.title}
            </h4>
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {data.formatTime(safeDate)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.body}
          </p>
          
          <div className="flex items-center mt-2 text-xs space-x-2">
            <Badge variant="outline" className={typeConfig[notification.type]?.color || typeConfig.system.color}>
              {typeConfig[notification.type]?.label || "Sistema"}
            </Badge>
            
            {!notification.isRead && (
              <Badge variant="default" className="bg-blue-500">
                Nueva
              </Badge>
            )}
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  data.onDelete(notification.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Eliminar notificación</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
});

export default function TodasNotificacionesPage() {
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    deleteNotification, 
    markAllAsRead,
    isMarkingAllAsRead,
  } = useNotifications();
  
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [filter, setFilter] = React.useState<string | undefined>(undefined);
  const [tab, setTab] = React.useState("all");
  
  // Filtrar notificaciones según el tab y el filtro de tipo
  const filteredNotifications = React.useMemo(() => {
    if (!notifications) return [];
    
    let filtered = [...notifications];
    
    // Filtrar por tab
    if (tab === "unread") {
      filtered = filtered.filter(n => !n.isRead);
    } else if (tab === "read") {
      filtered = filtered.filter(n => n.isRead);
    }
    
    // Filtrar por tipo
    if (filter) {
      filtered = filtered.filter(n => n.type === filter);
    }
    
    return filtered;
  }, [notifications, filter, tab]);
  
  const handleNotificationClick = (notification: Notification) => {
    // Marcar como leída
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navegar según el tipo y link
    if (notification.url) {
      navigate(notification.url);
    }
  };
  
  // Stats
  const stats = React.useMemo(() => {
    if (!notifications) return { total: 0, unread: 0, read: 0 };
    
    const unread = notifications.filter(n => !n.isRead).length;
    return {
      total: notifications.length,
      unread,
      read: notifications.length - unread
    };
  }, [notifications]);
  
  // Tipologías
  const typeStats = React.useMemo(() => {
    if (!notifications) return {};
    
    return notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [notifications]);
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Todas las notificaciones</h1>
          <p className="text-muted-foreground">
            Visualiza y gestiona todas tus notificaciones del sistema.
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar por tipo
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter(undefined)}>
                Todos los tipos
              </DropdownMenuItem>
              {Object.entries(notificationTypeConfig).map(([key, config]) => (
                <DropdownMenuItem key={key} onClick={() => setFilter(key)}>
                  {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => markAllAsRead()}
            disabled={isMarkingAllAsRead || stats.unread === 0}
          >
            {isMarkingAllAsRead ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Marcar todas como leídas
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/configuracion/notificaciones")}
          >
            Preferencias
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Resumen</CardTitle>
              <CardDescription>
                Estado de tus notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="font-medium">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">No leídas:</span>
                <Badge variant="destructive">{stats.unread}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Leídas:</span>
                <span className="font-medium">{stats.read}</span>
              </div>
              
              <Separator className="my-2" />
              
              <div>
                <h4 className="text-sm font-medium mb-2">Por tipo:</h4>
                <div className="space-y-2">
                  {Object.entries(notificationTypeConfig).map(([key, config]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{config.label}:</span>
                      <Badge className={notificationTypeConfig[key as keyof typeof notificationTypeConfig].color}>
                        {typeStats[key] || 0}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Tabs defaultValue="all" value={tab} onValueChange={setTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                Todas
                <Badge className="ml-2 bg-muted text-muted-foreground">{stats.total}</Badge>
              </TabsTrigger>
              <TabsTrigger value="unread">
                No leídas
                <Badge className="ml-2 bg-red-100 text-red-800">{stats.unread}</Badge>
              </TabsTrigger>
              <TabsTrigger value="read">
                Leídas
                <Badge className="ml-2 bg-green-100 text-green-800">{stats.read}</Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={tab}>
              <Card>
                <CardContent className="pt-6">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-[400px]">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredNotifications.length > 0 ? (
                    <div className="notification-virtualized-container" style={{ height: 400 }}>
                      <List
                        className="notification-list"
                        height={400}
                        itemCount={filteredNotifications.length}
                        itemSize={140} // Ajustar la altura según el contenido de la notificación
                        width="100%"
                        itemData={{
                          notifications: filteredNotifications,
                          typeConfig: notificationTypeConfig,
                          onDelete: (id: number) => {
                            deleteNotification(id);
                            toast({
                              title: "Notificación eliminada",
                              description: "La notificación ha sido eliminada correctamente",
                            });
                          },
                          onClick: handleNotificationClick,
                          formatTime: (date: Date) => formatDistanceToNow(date, { addSuffix: true, locale: es })
                        }}
                      >
                        {NotificationRow}
                      </List>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                      <Bell className="h-12 w-12 mb-4" />
                      <p className="text-lg mb-2">No hay notificaciones</p>
                      <p className="text-sm text-center max-w-md">
                        {filter 
                          ? "No tienes notificaciones del tipo seleccionado. Prueba a cambiar el filtro." 
                          : tab === "unread" 
                            ? "No tienes notificaciones sin leer." 
                            : tab === "read" 
                              ? "No tienes notificaciones leídas." 
                              : "No tienes ninguna notificación."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}