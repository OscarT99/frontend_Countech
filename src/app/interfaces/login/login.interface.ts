import { Usuario } from "../usuario/usuario.interface";

export interface User {
    email?: string;
    contrasena?: string;
    id?: number;

}


export enum AuthStatus {
    authenticated = 'authenticated',
    notAuthenticated = 'notAuthenticated',
    checking = 'checking',
    // Otros estados de autenticación
  }
  
  export interface LoginResponse {
    usuario: Usuario;
    token: string;
    message: string; // Si necesitas mensajes específicos del servidor
  }
  
  export interface checkTokenResponse {
    user: Usuario;
    token: string;
    // Otros datos de la verificación del token si es necesario
  }