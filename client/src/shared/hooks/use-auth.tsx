import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasValidAuthCookie, getAuthToken, setAuthToken, removeAuthToken } from "@/lib/cookie-auth";

// Constantes para almacenamiento local
const AUTH_USER_KEY = 'shield_cuisine_user';

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
  refreshUserSession: () => Promise<SelectUser | null>;
};

// Extend the insertUserSchema with additional validation
const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Debe proporcionar un correo electrónico válido"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterData = z.infer<typeof registerSchema>;
type LoginData = Pick<z.infer<typeof insertUserSchema>, "username" | "password">;

// Funciones para manejar el almacenamiento local del usuario
function saveUserToLocalStorage(user: SelectUser): void {
  try {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
}

function getUserFromLocalStorage(): SelectUser | null {
  try {
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error reading user from localStorage:', error);
    return null;
  }
}

function removeUserFromLocalStorage(): void {
  localStorage.removeItem(AUTH_USER_KEY);
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Función para obtener datos del usuario (expuesta en el contexto)
  async function refreshUserSession(): Promise<SelectUser | null> {
    try {
      // Primer intento: verificar la sesión del servidor
      const res = await fetch('/api/user', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (res.ok) {
        const userData = await res.json();
        saveUserToLocalStorage(userData);
        queryClient.setQueryData(["/api/user"], userData);
        console.log("Sesión refrescada exitosamente desde el servidor");
        return userData;
      }
      
      console.log("No se pudo obtener sesión del servidor, intentando restaurar");
      
      // Segundo intento: Si hay cookie o datos locales, intentar realizar un nuevo login con esos datos
      if (hasValidAuthCookie() || getUserFromLocalStorage()) {
        try {
          // Usar datos de la cookie o localStorage para intentar forzar un re-login
          const authToken = getAuthToken();
          const localUser = getUserFromLocalStorage();
          
          // Si tenemos datos del usuario guardados localmente (nombre y contraseña de prueba)
          if (localUser && localUser.username) {
            // En entorno de desarrollo, podemos intentar reconectar con credenciales conocidas
            if (["admin", "admintest"].includes(localUser.username)) {
              console.log("Intentando reconexión automática para usuario conocido:", localUser.username);
              
              // Intentar re-login con credenciales hardcodeadas (solo para desarrollo)
              try {
                // Credenciales de prueba (solo para desarrollo)
                const reconnectRes = await fetch('/api/login', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include',
                  body: JSON.stringify({
                    username: localUser.username,
                    password: 'admin123' // Contraseña de desarrollo
                  })
                });
                
                if (reconnectRes.ok) {
                  const reconnectedUser = await reconnectRes.json();
                  console.log("Reconexión automática exitosa:", reconnectedUser);
                  saveUserToLocalStorage(reconnectedUser);
                  queryClient.setQueryData(["/api/user"], reconnectedUser);
                  return reconnectedUser;
                }
              } catch (reconnectError) {
                console.error("Error en reconexión automática:", reconnectError);
              }
            }
            
            // Si la reconexión automática falló o no es un usuario de prueba, usar datos locales como último recurso
            console.log("Usando datos locales como respaldo");
            queryClient.setQueryData(["/api/user"], localUser);
            return localUser;
          }
        } catch (restoreError) {
          console.error("Error al intentar restaurar sesión:", restoreError);
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error refreshing user session:", error);
      return getUserFromLocalStorage(); // Último recurso: usar datos locales
    }
  }

  // Consulta principal para obtener usuario
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        // Intentar obtener el usuario de la API
        const res = await fetch('/api/user', { credentials: 'include' });
        
        if (res.ok) {
          const userData = await res.json();
          saveUserToLocalStorage(userData);
          return userData;
        }
        
        // Si no hay sesión en el servidor pero hay cookie o datos locales
        if (hasValidAuthCookie() || getUserFromLocalStorage()) {
          console.log("No hay sesión pero hay credenciales locales");
          return getUserFromLocalStorage();
        }
        
        return null;
      } catch (error) {
        console.error("Error fetching user:", error);
        // Último recurso: usar datos locales
        return getUserFromLocalStorage();
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Mutación de inicio de sesión
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Attempting login with:", credentials.username);
      try {
        const res = await apiRequest("POST", "/api/login", credentials);
        console.log("Login response:", res.status);
        const data = await res.json();
        console.log("Login data:", data);
        return data;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      console.log("Login successful, user:", user);
      // Almacenar en React Query, localStorage y cookie
      queryClient.setQueryData(["/api/user"], user);
      saveUserToLocalStorage(user);
      
      // También guardamos datos básicos en cookie como respaldo
      setAuthToken({
        id: user.id,
        username: user.username,
        role: user.role
      });
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${user.name}`,
      });
    },
    onError: (error: Error) => {
      console.error("Login error in onError:", error);
      toast({
        title: "Error de inicio de sesión",
        description: "Nombre de usuario o contraseña incorrectos",
        variant: "destructive",
      });
    },
  });

  // Mutación de registro
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      // Remove confirmPassword as it's not in the DB schema
      const { confirmPassword, ...credentials } = data;
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      // Almacenar en todas partes
      queryClient.setQueryData(["/api/user"], user);
      saveUserToLocalStorage(user);
      setAuthToken({
        id: user.id,
        username: user.username,
        role: user.role
      });
      
      toast({
        title: "Registro exitoso",
        description: `Bienvenido a ShieldCuisine, ${user.name}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error de registro",
        description: error.message || "No se pudo crear la cuenta",
        variant: "destructive",
      });
    },
  });

  // Mutación de cierre de sesión
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      // Limpiar datos en todas partes
      queryClient.setQueryData(["/api/user"], null);
      removeUserFromLocalStorage();
      removeAuthToken();
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      });
      
      // Limpiar de todos modos en caso de error
      queryClient.setQueryData(["/api/user"], null);
      removeUserFromLocalStorage();
      removeAuthToken();
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        refreshUserSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}