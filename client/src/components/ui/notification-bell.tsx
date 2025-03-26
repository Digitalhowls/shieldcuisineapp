import { useState } from "react";
import { 
  Bell, 
  BellOff, 
  Check, 
  Trash2, 
  Settings, 
  X,
  Shield,
  Package,
  ClipboardCheck,
  GraduationCap,
  CreditCard,
  ShoppingCart,
  ServerCog,
  Globe
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

// Mapeamos los tipos de notificación a íconos y colores
const notificationTypeConfig = {
  security: { color: "bg-red-500", icon: Shield },
  inventory: { color: "bg-blue-500", icon: Package },
  appcc_control: { color: "bg-green-500", icon: ClipboardCheck },
  learning: { color: "bg-purple-500", icon: GraduationCap },
  banking: { color: "bg-yellow-500", icon: CreditCard },
  purchasing: { color: "bg-orange-500", icon: ShoppingCart },
  system: { color: "bg-gray-500", icon: ServerCog },
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { 
    unreadNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    isLoadingUnread,
    isMarkingAllAsRead,
  } = useNotifications();
  const [, navigate] = useLocation();

  const handleNotificationClick = (notification: any) => {
    // Marcar como leída
    markAsRead(notification.id);
    
    // Navegar según el tipo y link
    if (notification.link) {
      navigate(notification.link);
    }
    
    // Cerrar el popover
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative p-2">
          <Bell className="h-5 w-5" />
          {unreadNotifications && unreadNotifications.length > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.2rem] h-5 flex items-center justify-center rounded-full bg-red-500 text-white">
              {unreadNotifications.length > 9 ? "9+" : unreadNotifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">Notificaciones</h3>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllAsRead || (unreadNotifications && unreadNotifications.length === 0)}
            >
              {isMarkingAllAsRead ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span className="sr-only">Marcar todas como leídas</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Opciones de notificaciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/configuracion/notificaciones")}>
                  Preferencias de notificaciones
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => markAllAsRead()}>
                  Marcar todas como leídas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-[300px]">
          {isLoadingUnread ? (
            <div className="flex justify-center items-center h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : unreadNotifications && unreadNotifications.length > 0 ? (
            <div className="space-y-2">
              {unreadNotifications.map((notification) => {
                const typeConfig = notificationTypeConfig[notification.type] || notificationTypeConfig.system;
                const NotificationIcon = typeConfig.icon;
                
                return (
                  <div 
                    key={notification.id} 
                    className="flex items-start gap-3 p-2 hover:bg-muted rounded cursor-pointer relative group"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={`${typeConfig.color} p-2 rounded-full shrink-0`}>
                      <NotificationIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{notification.body}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { 
                          addSuffix: true,
                          locale: es
                        })}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <BellOff className="h-8 w-8 mb-2" />
              <p>No hay notificaciones nuevas</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}