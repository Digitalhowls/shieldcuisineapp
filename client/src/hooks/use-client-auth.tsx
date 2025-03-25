import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type ClientPortalState = {
  isLoading: boolean;
  isAuthenticated: boolean | null;
  error: string | null;
  companyId: number | null;
  companyName: string | null;
  businessType: string | null;
  token: string | null;
  portalType: 'client' | 'public' | null;
};

type ValidateTokenResponse = {
  valid: boolean;
  companyId: number;
  companyName: string;
  businessType: string;
  portalType: 'client' | 'public';
  locationId?: number;
};

type ClientAuthContextType = ClientPortalState & {
  validateToken: (token: string, companyId: number) => Promise<boolean>;
  clearAuth: () => void;
};

const initialState: ClientPortalState = {
  isLoading: true,
  isAuthenticated: null,
  error: null,
  companyId: null,
  companyName: null,
  businessType: null,
  token: null,
  portalType: null
};

const ClientAuthContext = createContext<ClientAuthContextType | null>(null);

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [state, setState] = useState<ClientPortalState>(initialState);

  // Recuperar token del localStorage al cargar
  useEffect(() => {
    const storedToken = localStorage.getItem('clientToken');
    const storedCompanyId = localStorage.getItem('clientCompanyId');
    
    if (storedToken && storedCompanyId) {
      validateToken(storedToken, parseInt(storedCompanyId))
        .catch(() => {
          // Si falla la validación, limpiar localStorage
          localStorage.removeItem('clientToken');
          localStorage.removeItem('clientCompanyId');
          setState({
            ...initialState,
            isLoading: false,
            isAuthenticated: false,
            error: "La sesión ha expirado. Por favor, inicie sesión nuevamente."
          });
        });
    } else {
      setState({
        ...initialState,
        isLoading: false,
        isAuthenticated: false
      });
    }
  }, []);

  // Función para validar token
  const validateToken = async (token: string, companyId: number): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiRequest('POST', '/api/client/validate-token', {
        token,
        companyId
      });
      
      if (!response.ok) {
        const error = await response.json();
        setState({
          ...initialState,
          isLoading: false,
          isAuthenticated: false,
          error: error.error || "Error al validar token de acceso"
        });
        return false;
      }
      
      const data: ValidateTokenResponse = await response.json();
      
      if (!data.valid) {
        setState({
          ...initialState,
          isLoading: false,
          isAuthenticated: false,
          error: "Token de acceso inválido"
        });
        return false;
      }
      
      // Guardar token en localStorage
      localStorage.setItem('clientToken', token);
      localStorage.setItem('clientCompanyId', companyId.toString());
      
      // Actualizar estado
      setState({
        isLoading: false,
        isAuthenticated: true,
        error: null,
        companyId: data.companyId,
        companyName: data.companyName,
        businessType: data.businessType,
        token,
        portalType: data.portalType
      });
      
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      setState({
        ...initialState,
        isLoading: false,
        isAuthenticated: false,
        error: "Error de conexión al validar acceso"
      });
      return false;
    }
  };

  // Función para limpiar autenticación
  const clearAuth = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientCompanyId');
    setState({
      ...initialState,
      isLoading: false,
      isAuthenticated: false
    });
    
    // Limpiar caché de consultas relacionadas con el cliente
    queryClient.invalidateQueries({ queryKey: ['/api/client'] });
  };

  return (
    <ClientAuthContext.Provider
      value={{
        ...state,
        validateToken,
        clearAuth
      }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const context = useContext(ClientAuthContext);
  if (context === null) {
    throw new Error("useClientAuth debe ser usado dentro de un ClientAuthProvider");
  }
  return context;
}

// Custom hook para obtener datos del dashboard del cliente
export function useClientDashboard() {
  const { isAuthenticated, token, companyId } = useClientAuth();
  
  return useQuery({
    queryKey: ['/api/client/dashboard'],
    queryFn: async () => {
      if (!isAuthenticated || !token) {
        throw new Error("No autenticado");
      }
      
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`
      };
      
      const res = await apiRequest('GET', '/api/client/dashboard', null, headers);
      
      if (!res.ok) {
        throw new Error("Error al obtener datos del dashboard");
      }
      
      return await res.json();
    },
    enabled: !!isAuthenticated && !!token
  });
}

// Custom hook para obtener listado de controles
export function useClientControls() {
  const { isAuthenticated, token, companyId } = useClientAuth();
  
  return useQuery({
    queryKey: ['/api/client/controls'],
    queryFn: async () => {
      if (!isAuthenticated || !token) {
        throw new Error("No autenticado");
      }
      
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`
      };
      
      const res = await apiRequest('GET', '/api/client/controls', null, headers);
      
      if (!res.ok) {
        throw new Error("Error al obtener controles");
      }
      
      return await res.json();
    },
    enabled: !!isAuthenticated && !!token
  });
}

// Custom hook para obtener detalles de un control específico
export function useClientControlDetails(controlId: number) {
  const { isAuthenticated, token, companyId } = useClientAuth();
  
  return useQuery({
    queryKey: ['/api/client/controls', controlId],
    queryFn: async () => {
      if (!isAuthenticated || !token) {
        throw new Error("No autenticado");
      }
      
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`
      };
      
      const res = await apiRequest('GET', `/api/client/controls/${controlId}`, null, headers);
      
      if (!res.ok) {
        throw new Error("Error al obtener detalles del control");
      }
      
      return await res.json();
    },
    enabled: !!isAuthenticated && !!token && !!controlId
  });
}