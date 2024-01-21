export interface Empleado {
    idEmpleado?: number;
    tipoIdentificacion?: string;
    numeroIdentificacion?: string;
    nombre?: string;
    apellido?: string;
    correo?: string;
    telefono?: string;
    ciudad?: string;
    direccion?: string;
    fechaIngreso?: Date;
    estado?: boolean;
    estadoProduccion?: boolean;
  }