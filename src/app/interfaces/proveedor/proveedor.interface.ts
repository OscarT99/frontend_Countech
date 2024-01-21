export interface Proveedor {
    id?: number;
    tipoProveedor?: 'Persona' | 'Empresa';
    tipoIdentificacion?: 'Registro civil' | 'Tarjeta de identidad' | 'Cedula de ciudadanía' | 'Tarjeta de extranjero' | 'Cedula de extranjero' | 'NIT' | 'Pasaporte';
    numeroIdentificacion?: string;
    razonSocial?: string;
    nombreComercial?: string;
    ciudad?: string;
    direccion?: string;
    contacto?: string | null; // Puede ser nulo según tu tabla
    telefono?: string;
    correo?: string | null; // Puede ser nulo según tu tabla
    estado?: boolean;
}
