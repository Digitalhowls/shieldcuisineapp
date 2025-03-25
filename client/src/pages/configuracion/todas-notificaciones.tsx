import React from "react";
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

// Mapeo de tipos de notificaciones a colores y etiquetas
const notificationTypeConfig = {
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
  system: { 
    color: "bg-gray-100 text-gray-800 hover:bg-gray-200", 
    label: "Sistema" 
  },
};

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
  
  const handleNotificationClick = (notification: any) => {
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
                    <div className="space-y-4">
                      {filteredNotifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`flex items-start gap-4 p-4 rounded-md ${notification.isRead ? 'bg-card' : 'bg-muted'} hover:bg-muted-foreground/5 cursor-pointer relative group`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className={`${notificationTypeConfig[notification.type]?.color || notificationTypeConfig.system.color} p-3 rounded-full`}>
                            <Bell className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className={`font-medium truncate ${notification.isRead ? 'text-foreground' : 'text-foreground font-semibold'}`}>
                                {notification.title}
                              </h4>
                              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                {formatDistanceToNow(new Date(notification.createdAt), { 
                                  addSuffix: true,
                                  locale: es
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notification.body}
                            </p>
                            
                            <div className="flex items-center mt-2 text-xs space-x-2">
                              <Badge variant="outline" className={notificationTypeConfig[notification.type]?.color || notificationTypeConfig.system.color}>
                                {notificationTypeConfig[notification.type]?.label || "Sistema"}
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
                                    deleteNotification(notification.id);
                                    toast({
                                      title: "Notificación eliminada",
                                      description: "La notificación ha sido eliminada correctamente",
                                    });
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
                      ))}
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