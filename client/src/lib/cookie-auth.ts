/**
 * Funciones auxiliares para manejar la autenticación basada en cookies
 * como respaldo al sistema de autenticación principal con sesiones.
 */

// Obtener el token de autenticación de la cookie
export function getAuthToken(): {id: number, username: string, role: string} | null {
  try {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
    
    if (!authCookie) return null;
    
    const cookieValue = authCookie.split('=')[1];
    if (!cookieValue) return null;
    
    // Decodificar el valor de la cookie (puede estar codificado como URI)
    const decodedValue = decodeURIComponent(cookieValue);
    return JSON.parse(decodedValue);
  } catch (error) {
    console.error('Error al leer la cookie de autenticación:', error);
    return null;
  }
}

// Establecer manualmente el token de autenticación (usado sólo en desarrollo)
export function setAuthToken(userData: {id: number, username: string, role: string}): void {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000); // 24 horas
    
    const cookieValue = encodeURIComponent(JSON.stringify(userData));
    document.cookie = `auth_token=${cookieValue}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  } catch (error) {
    console.error('Error al establecer la cookie de autenticación:', error);
  }
}

// Eliminar el token de autenticación
export function removeAuthToken(): void {
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// Verificar si hay una cookie de autenticación válida
export function hasValidAuthCookie(): boolean {
  return getAuthToken() !== null;
}