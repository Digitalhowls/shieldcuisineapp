import { useQuery, useMutation } from "@tanstack/react-query";
import { Notification } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useNotifications() {
  const { toast } = useToast();
  
  // Get all notifications
  const {
    data: notifications,
    isLoading,
    error,
    refetch,
  } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  // Get unread notifications
  const {
    data: unreadNotifications,
    isLoading: isLoadingUnread,
    refetch: refetchUnread,
  } = useQuery<Notification[]>({
    queryKey: ["/api/notifications/unread"],
  });

  // Mark a notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo marcar la notificación como leída: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", "/api/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread"] });
      toast({
        title: "Éxito",
        description: "Todas las notificaciones han sido marcadas como leídas",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudieron marcar todas las notificaciones como leídas: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete a notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread"] });
      toast({
        title: "Éxito", 
        description: "Notificación eliminada correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar la notificación: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    notifications: notifications || [],
    unreadNotifications: unreadNotifications || [],
    isLoading,
    isLoadingUnread,
    error,
    refetch,
    refetchUnread,
    markAsRead: markAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    deleteNotification: deleteNotificationMutation.mutate,
    isDeletingNotification: deleteNotificationMutation.isPending,
  };
}