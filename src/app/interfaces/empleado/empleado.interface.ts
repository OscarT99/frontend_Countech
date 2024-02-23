import { AsignarProcesoEmpleado } from "../produccion/asignarProceso.interface";

export interface Empleado {
    id?: number;
    tipoIdentidad?: string;
    numIdentidad?: string;
    nombre?: string;
    apellido?: string;
    correo?: string;
    telefono?: string;
    ciudad?: string;
    direccion?: string;
    fechaIngreso?: Date;
    estado?: boolean;
    estadoOcupado?: boolean;
    asignarProcesoEmpleados?: AsignarProcesoEmpleado[]; 
  }



