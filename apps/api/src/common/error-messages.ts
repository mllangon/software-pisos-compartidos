// Mensajes de error descriptivos en español
export const ErrorMessages = {
  // Autenticación
  AUTH_INVALID_CREDENTIALS: 'Credenciales inválidas. Verifica tu correo electrónico y contraseña.',
  AUTH_EMAIL_ALREADY_REGISTERED: 'Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.',
  AUTH_USER_NOT_FOUND: 'Usuario no encontrado. Por favor, verifica tu información.',
  AUTH_SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  AUTH_UNAUTHORIZED: 'No estás autenticado. Por favor, inicia sesión.',
  
  // Grupos
  GROUP_NOT_FOUND: 'El grupo no existe o ha sido eliminado.',
  GROUP_NOT_MEMBER: 'No eres miembro de este grupo. Debes ser invitado para acceder.',
  GROUP_ONLY_OWNER_CAN_INVITE: 'Solo el propietario del grupo puede enviar invitaciones.',
  GROUP_ONLY_OWNER_CAN_DELETE: 'Solo el propietario del grupo puede eliminarlo.',
  GROUP_ONLY_OWNER_CAN_UPDATE_RULES: 'Solo el propietario del grupo puede actualizar las reglas.',
  GROUP_NAME_TOO_SHORT: 'El nombre del grupo debe tener al menos 2 caracteres.',
  
  // Invitaciones
  INVITATION_NOT_FOUND: 'La invitación no existe o ya ha sido procesada.',
  INVITATION_NOT_YOURS: 'Esta invitación no es para tu correo electrónico.',
  INVITATION_ALREADY_ACCEPTED: 'Esta invitación ya ha sido aceptada.',
  INVITATION_ALREADY_DECLINED: 'Esta invitación ya ha sido rechazada.',
  
  // Eventos
  EVENT_NOT_FOUND: 'El evento no existe o ha sido eliminado.',
  EVENT_NOT_MEMBER: 'No puedes acceder a este evento porque no eres miembro del grupo.',
  EVENT_ONLY_CREATOR_OR_OWNER_CAN_DELETE: 'Solo el creador del evento o el propietario del grupo pueden eliminarlo.',
  EVENT_TITLE_REQUIRED: 'El título del evento es obligatorio.',
  EVENT_DATE_REQUIRED: 'La fecha del evento es obligatoria.',
  EVENT_TYPE_INVALID: 'El tipo de evento no es válido. Debe ser: TASK, EVENT o REMINDER.',
  EVENT_DATABASE_ERROR: 'Error al guardar el evento. Verifica que la base de datos esté configurada correctamente.',
  
  // Gastos
  EXPENSE_NOT_FOUND: 'El gasto no existe o ha sido eliminado.',
  EXPENSE_NOT_MEMBER: 'No puedes acceder a este gasto porque no eres miembro del grupo.',
  EXPENSE_ONLY_PAYER_OR_OWNER_CAN_DELETE: 'Solo quien pagó el gasto o el propietario del grupo pueden eliminarlo.',
  EXPENSE_DESCRIPTION_REQUIRED: 'La descripción del gasto es obligatoria.',
  EXPENSE_AMOUNT_REQUIRED: 'El importe del gasto es obligatorio.',
  EXPENSE_AMOUNT_INVALID: 'El importe debe ser un número mayor a 0.',
  EXPENSE_DATABASE_ERROR: 'Error al guardar el gasto. Verifica que la base de datos esté configurada correctamente.',
  
  // Perfil
  PROFILE_USER_NOT_FOUND: 'No se pudo encontrar tu perfil. Por favor, recarga la página.',
  PROFILE_NAME_TOO_SHORT: 'El nombre debe tener al menos 2 caracteres.',
  PROFILE_UPDATE_FAILED: 'No se pudo actualizar tu perfil. Por favor, intenta nuevamente.',
  
  // Validación
  VALIDATION_EMAIL_INVALID: 'El correo electrónico no es válido.',
  VALIDATION_PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 6 caracteres.',
  VALIDATION_NAME_TOO_SHORT: 'El nombre debe tener al menos 2 caracteres.',
  VALIDATION_FIELD_REQUIRED: 'Este campo es obligatorio.',
  VALIDATION_DATE_INVALID: 'La fecha no es válida.',
  
  // Servidor
  SERVER_INTERNAL_ERROR: 'Error interno del servidor. Por favor, intenta nuevamente más tarde.',
  SERVER_DATABASE_ERROR: 'Error de conexión con la base de datos. Por favor, contacta al administrador.',
  SERVER_UNAVAILABLE: 'El servidor no está disponible en este momento. Por favor, intenta más tarde.',
  
  // Red
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  NETWORK_TIMEOUT: 'La solicitud tardó demasiado. Por favor, intenta nuevamente.',
  NETWORK_SERVER_UNREACHABLE: 'No se puede conectar con el servidor. Verifica que la API esté corriendo.',
} as const;

