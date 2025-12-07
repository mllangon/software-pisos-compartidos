/**
 * Extrae el mensaje de error de una respuesta de la API
 * Maneja diferentes formatos: JSON con message, texto plano, etc.
 */
export async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      // Si viene un array de mensajes (validación de class-validator)
      if (Array.isArray(data.message)) {
        return data.message.join('. ');
      }
      // Si viene un objeto con message
      if (typeof data.message === 'string') {
        return data.message;
      }
      // Si viene un objeto con error
      if (typeof data.error === 'string') {
        return data.error;
      }
    }
    // Si es texto plano
    const text = await response.text();
    if (text) {
      try {
        // Intentar parsear como JSON
        const parsed = JSON.parse(text);
        if (parsed.message) return parsed.message;
      } catch {
        // Si no es JSON, devolver el texto
        return text;
      }
      return text;
    }
  } catch (e) {
    console.error('Error extracting error message:', e);
  }
  
  // Mensajes por defecto según el código de estado
  switch (response.status) {
    case 400:
      return 'Solicitud inválida. Por favor, verifica los datos enviados.';
    case 401:
      return 'No estás autenticado. Por favor, inicia sesión nuevamente.';
    case 403:
      return 'No tienes permiso para realizar esta acción.';
    case 404:
      return 'El recurso solicitado no existe.';
    case 409:
      return 'Ya existe un recurso con estos datos.';
    case 500:
      return 'Error interno del servidor. Por favor, intenta nuevamente más tarde.';
    default:
      return 'Ha ocurrido un error. Por favor, intenta nuevamente.';
  }
}

/**
 * Maneja errores de red y extrae mensajes descriptivos
 */
export function handleNetworkError(error: any): string {
  if (error.message?.includes('fetch') || 
      error.message?.includes('Failed to fetch') || 
      error.message?.includes('NetworkError')) {
    return 'Error de conexión. Verifica que la API esté corriendo en http://localhost:3001';
  }
  return error.message || 'Ha ocurrido un error inesperado.';
}

