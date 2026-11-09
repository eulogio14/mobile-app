import axios from 'axios';

export function getFriendlyErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') return 'La solicitud tardó demasiado. Revisa tu conexión.';
    if (!error.response) return 'No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.';
    const status = error.response.status;
    const serverMsg = (error.response.data as { message?: string; error?: string } | undefined)?.message
      || (error.response.data as { message?: string; error?: string } | undefined)?.error;
    if (status === 400) return serverMsg || 'Los datos enviados no son válidos.';
    if (status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.';
    if (status === 403) return 'No tienes permiso para realizar esta acción.';
    if (status === 404) return serverMsg || 'No se encontró el recurso solicitado.';
    if (status === 409) return serverMsg || 'Ya existe un registro con esos datos.';
    if (status >= 500) return 'El servidor tuvo un problema. Intenta más tarde.';
    return serverMsg || 'Ocurrió un error inesperado.';
  }
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado.';
}
