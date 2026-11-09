export type Sender = 'USUARIO' | 'EX_BOT';

export type Message = {
  id: number;
  content: string;
  sender: Sender;
  timestamp: string;
  status?: string;
};

export type Chat = {
  id: number;
  type?: string;
  createdAt?: string;
  messages?: Message[];
};

export type User = {
  id?: number;
  name?: string;
  email?: string;
  exName?: string;
  exPhotoUrl?: string | null;
  photoUrl?: string | null;
  exPersonality?: string;
  exWhatsAppStatus?: string;
  [key: string]: unknown;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type RegisterPayload = {
  nombre: string;
  email: string;
  password: string;
  nombreEx: string;
  fotoPerfilEx: string;
  fotoPerfil: string;
};

export type TrainingTask = {
  taskId: number;
  estado: string;
  mensaje?: string;
  imagenesProcesadas?: number;
  mensajesNuevos?: number;
  mensajesDuplicados?: number;
  totalMensajesDataset?: number;
  totalMensajesEx?: number;
  tonoDetectado?: string;
  errorMensaje?: string;
};

export type TrainingTextResult = {
  mensaje?: string;
  tonoDetectado?: string;
  totalLineasProcesadas?: number;
  totalMensajesEx?: number;
  totalMensajesUsuario?: number;
  emojisFrecuentes?: string[];
};
