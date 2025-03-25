import { useQuery, useMutation } from "@tanstack/react-query";
import { NotificationPreferences } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useNotificationPreferences() {
  const { toast } = useToast();
  
  // Get notification preferences
  const {
    data: preferences,
    isLoading,
    error,
    refetch,
  } = useQuery<NotificationPreferences>({
    queryKey: ["/api/notification-preferences"],
  });

  // Update notification preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updatedPreferences: Partial<NotificationPreferences>) => {
      const response = await apiRequest("PUT", "/api/notification-preferences", updatedPreferences);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-preferences"] });
      toast({
        title: "Éxito",
        description: "Preferencias de notificaciones actualizadas correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudieron actualizar las preferencias: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    preferences,
    isLoading,
    error,
    refetch,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdating: updatePreferencesMutation.isPending,
  };
}