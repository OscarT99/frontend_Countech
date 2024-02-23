import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { PedidoService } from 'src/app/services/pedido/pedido.service'; 
import { PedidoInstance } from 'src/app/interfaces/pedido/pedido.interface'; 

import { AsignarProcesoEmpleado, EstadoAnular } from 'src/app/interfaces/produccion/asignarProceso.interface';
import { AsignarProcesoService } from 'src/app/services/produccion/asignarProcesoEmpleado.service';

import { ProcesoReferenciaPedidoInstance } from 'src/app/interfaces/pedido/procesoReferenciaPedido.interface';
import { procesoReferenciaPedidoService } from 'src/app/services/produccion/procesoReferenciaPedido.service';

import { EmpleadoService } from 'src/app/services/empleado/empleado.service'; 
import { Empleado } from 'src/app/interfaces/empleado/empleado.interface';

import { AvanceProcesoEmpleado } from 'src/app/interfaces/produccion/avanceProcesoEmpleado.interface';
import { AvanceProcesoEmpleadoService } from 'src/app/services/produccion/avanceProcesoEmpleado.service';

import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ConfirmationService, MessageService} from 'primeng/api';
import { Subscription } from 'rxjs';


@Component({
  templateUrl: './regProduccion.component.html',
  providers: [ConfirmationService, MessageService]
})
export class RegProduccionComponent implements OnInit {

    // Getter
    listPedidos: PedidoInstance[] = []
    getPedidoById: PedidoInstance = {}
    listPedidoProceso: ProcesoReferenciaPedidoInstance[] = []
    listPedidoInfo: PedidoInstance[] = []
    listAsignarProcesoEmpleado: AsignarProcesoEmpleado[] = []
    listEmpleados: Empleado[] = []
    listAvanceProcesoEmpleado: AvanceProcesoEmpleado[] = []

    // Getter por ID
    listFilterAsigProcEmpleado: AsignarProcesoEmpleado[] = []

    // Forms
    formAsignarProcesoEmpleado: FormGroup;
    formAvance: FormGroup;

    // Dialogs
    asignarProcDialog: boolean = false;
    detalleProcAsigDialog: boolean = false;

    filteredProcesosAsignados: AsignarProcesoEmpleado[] = [];

    filteredPedidos: PedidoInstance[] = [];

    listSearchPedido: PedidoInstance[] = [];

    searchText: string = '';

    filteredPedidoProceso: ProcesoReferenciaPedidoInstance[] = [];
    
    id: number = 0;

    procesoId: number = 0;

    empleadoId: number = 0;

    subscription: Subscription = new Subscription();
   
    rowsPerPageOptions = [5, 10, 15];

  constructor(
    private confirmationService: ConfirmationService,
    // private messageService: MessageService,
    private fb: FormBuilder,
    private _procesoReferenciaPedidoService: procesoReferenciaPedidoService,
    private _pedidoService:PedidoService,
    private _asignarProcesoService:AsignarProcesoService,
    private _empleadoService: EmpleadoService,
    private _avanceProcesoService: AvanceProcesoEmpleadoService,
    private toastr: ToastrService,      
    private aRouter:ActivatedRoute,
    private router : Router,
    ){
      this.formAsignarProcesoEmpleado = this.fb.group({
        empleadoId: ['', Validators.required],
        pedidoprocesoId: [''],
        cantidadPendiente: [''],
        cantidadAsignada: ['', [Validators.required, Validators.min(1)]],
      });
      this.formAvance = this.fb.group({
        cantidadHecha: ['', [Validators.required, Validators.min(1)]],
      });
      this.aRouter.params.subscribe(params => {
        this.id = +params['id'];
      });
    }

  ngOnInit():void {
    //Obtiene la información principal del pedido
    this.getPedidoInfoEstado()
    // Obtiene los pedidos registrados
    this.getListPedidos();
    // Obtiene los procesos registrado con su relación de colores
    this.getListPedidoProcesos();
    // Obtiene los empleados
    this.getEmpleadoList();
    // Obtiene los procesos asignados con su relación de avances
    this.getAsignarProcesoEmpleado();

    this.subscription = this._avanceProcesoService.refresh$.subscribe(() => {
      this.getAsignarProcesoEmpleado();
    });

  }

  changeSeverityPedido(estado: string) {
    if(estado === 'Registrado'){
      return 'warning'
    } else if(estado == 'En proceso'){
      return 'info'
    }else{
      return 'success'
    }
  }

  changeSeverityProceso(estado: string) {
    if(estado === 'Pendiente'){
      return 'warning'
    } else if(estado == 'En proceso'){
      return 'info'
    }else{
      return 'success'
    }
  }

  changeEstadoProd(estadoPro: boolean, estadoAnu: boolean) {
    let value = '';
    if(estadoPro === true && estadoAnu === false){
      value =  'TERMINADO'
    } else if(estadoPro === false && estadoAnu === false){
      value =  'PENDIENTE'
    }else{
      value = 'ANULADO'
    }
    return value;
  }

  getEstadoProd(estadoPro: boolean, estadoAnu: boolean) {
    if(estadoPro === true && estadoAnu === false){
      return 'success'
    } else if(estadoPro === false && estadoAnu === false){
      return 'warning'
    }else{
      return 'danger'
    }
  }

  changeEstadoAnular(estado: boolean) {
    switch (estado) {
      case true:
        return 'ANULADO';
      case false:
        return 'ACTIVO';
    };
  }

  styleEstadoAnular(estado: boolean) {
    switch (estado) {
      case true:
        return 'danger';
      case false:
        return 'success';
    };
  }

  // Listar los pedidos en producción
  getListPedidos(){     
    this._pedidoService.getListPedidos().subscribe((data:any) =>{      
      this.listPedidos = data.listaPedidos;
      this.filteredPedidos = this.listPedidos.filter((pedido: any) => pedido.estado === 'Terminado');
      // console.log(this.listPedidos);
      this.listSearchPedido = this.filteredPedidos;      
    })
  }

  
  filterPedidosByOrdenTrabajo(ordenTrabajo: string) {
    this.listSearchPedido = this.filteredPedidos.filter(pedido =>
      (pedido.ordenTrabajo ?? '').toLowerCase().includes(ordenTrabajo.toLowerCase())
    );
  }

  getListPedidoProcesos(){
    this._pedidoService.getPedidoProcesos().subscribe((data:any) =>{
      this.listPedidoProceso = data.listaProcesos;
      // console.log(this.listPedidoProceso);
    });
  }

  getPedidoInfoEstado(){
    this._pedidoService.getPedidoInfo().subscribe((data:any) =>{
      this.listPedidoInfo = data.listaPedidoInfo;
    });
  }

  // Listar los procesos asignados a los empleados
  getAsignarProcesoEmpleado() {
    this._asignarProcesoService.getProcesoAvance().subscribe((data: any) => {
        this.listAsignarProcesoEmpleado = data.ProcesoAvances;
        // Iteramos el objeto para obtener la fecha y hora de creación
        this.listAsignarProcesoEmpleado.forEach((proceso: any) => {
          if(proceso.avanceProcesoEmpleados.length > 0){
            proceso.avanceProcesoEmpleados.forEach((avance: any) => {
              const dateObj = new Date(avance.createdAt);
              const date = dateObj.toLocaleDateString();
              const time = dateObj.toLocaleTimeString();
              avance.date = date;
              avance.time = time;
            });
          }
        });

        this.filteredProcesosAsignados = this.listAsignarProcesoEmpleado.filter((proceso: any) => proceso.pedidoprocesoId === this.procesoId);
  
        // Iteramos el objeto para obtener el nombre del empleado
         this.filteredProcesosAsignados.forEach((proceso: any) => {
          this._empleadoService.getEmpleado(proceso.empleadoId).subscribe((empleado: any) => {
              proceso.nombreEmpleado = empleado.nombre;
          })
        })

      
      });
  }


  // Listar los empleados
  getEmpleadoList(){
    this._empleadoService.getEmpleadoList().subscribe((data: any) => {
      this.listEmpleados = data.Empleados;
      // console.log(this.listEmpleados);
    });
  }


  // Hide Dialog
  hideDialog() {
    this.asignarProcDialog = false;
    this.detalleProcAsigDialog = false;
  }


  // Mostrar el dialogo para asignar un proceso a un empleado
  showAsignarProcesoDialog(proceso: any) {
    // Inicializar el formulario
    this.asignarProcDialog = true;  
    this.formAsignarProcesoEmpleado.reset();
    this.procesoId = proceso.id;
    this.formAsignarProcesoEmpleado.get('cantidadPendiente')!.setValue(proceso.cantidadPendiente);
    // console.log({data: proceso});
  }

  // Mostrar el dialogo para ver la lista de procesos asignados a un empleado de un proceso
  showDetalleProcAsigDialog(proceso: any) {
    this.procesoId = proceso.id;
    this.getAsignarProcesoEmpleado();
    this.detalleProcAsigDialog = true;
    console.log({data: proceso});
    this.formAvance.reset();
  }

  validateCantAsignada() {
    const cantidadPendienteValue = this.formAsignarProcesoEmpleado.get('cantidadPendiente');
    const cantidadAsignadaControl = this.formAsignarProcesoEmpleado.get('cantidadAsignada');
    const cantidadAsignadaValue = cantidadAsignadaControl?.value;

    if (cantidadAsignadaValue && cantidadAsignadaValue > cantidadPendienteValue?.value) {
      cantidadAsignadaControl?.setErrors({ cantError: true });
        return;
    }
  }

  // Registrar un proceso asignado a un empleado
  addAsignarProcesoEmpleado() {
    const dataAsignarProceso: AsignarProcesoEmpleado = {
      empleadoId: this.empleadoId,
      pedidoprocesoId: this.procesoId,
      cantidadAsignada: this.formAsignarProcesoEmpleado.value.cantidadAsignada,
    }

    console.log(dataAsignarProceso);
    this._asignarProcesoService.postAsignarProcesoEmpleado(dataAsignarProceso).subscribe(() => {
      this.toastr.success('Proceso asignado correctamente', 'Éxito');
      this.getListPedidoProcesos();
      this.getAsignarProcesoEmpleado();
      this.getPedidoInfoEstado();
      // this.getAsignarProcesoEmpleado();
      this.hideDialog();
    });
  }

  getAsignarProcesoEmpleadoById(id: number) {
    this._pedidoService.getPedidoProcesoById(id).subscribe((data: any) => {
      console.log(data);
    });
  }


  // Registrar una cantidad hecha de un proceso asignado a un empleado
  crearAvance(id: number) {
    const dataAvance: AvanceProcesoEmpleado = {
      cantidadHecha: this.formAvance.value.cantidadHecha,
      asignarProcesoEmpleadoId: id
    }
    this._avanceProcesoService.postAvanceProcesoEmpleado(dataAvance).subscribe(() => {
      this.toastr.success('Registro de avance exitoso');
      this.getListPedidoProcesos();
      this.getAsignarProcesoEmpleado();
      this.getPedidoInfoEstado();
    });


  };


  // Anular un proceso asignado a un empleado
  anularProceso(id: number){
    this.confirmationService.confirm({
      message: '¿Está seguro de anular el proceso?',
      header: 'Anular Proceso',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const dataAnular: EstadoAnular = {
          estadoAnular: true
        }
        // console.log({data: dataAnular}); 
        this._asignarProcesoService.putAnularProceso(id, dataAnular).subscribe(() => {
          this.toastr.success('Proceso anulado correctamente', 'Éxito');
          this.getAsignarProcesoEmpleado();
          this.getListPedidoProcesos();
        });
      },
      reject: () => {
        // this.toastr.error('Proceso no anulado', 'Error');
      }
    });
  }


  // async asignarTarea(proceso: { id: number }) {
//   this.getListEmpleados();
//   this.formularioAsignarProceso.reset();
//   this.asignarTareaDialog = true;
//   this.procesoId = proceso.id;

//   console.log('Proceso:', proceso.id);

//   // Obtener información adicional del proceso usando getProcesosEnReferenciaEnPedido
//   await this._procesoReferenciaPedidoService.getProcesosEnReferenciaEnPedido().toPromise();
  
//   let procesoEnReferencia = this.listProcesos.find(p => p.id === proceso.id);

//   if (procesoEnReferencia) {
//     this.cantidadTotal = procesoEnReferencia.cantidadTotal || 0;
//     this.cantidadHecha = procesoEnReferencia.cantidadHecha || 0;
//     this.cantidadPendiente = procesoEnReferencia.cantidadPendiente || 0;
//     // console.log('Cantidad pendiente:', this.cantidadPendiente);
//   }

//   console.log('Cantidad pendiente:', this.cantidadPendiente);

//   this.formularioAsignarProceso.patchValue({
//     cantidadPendiente: this.cantidadPendiente,
//   });
// }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }


  buscarEmpleado(event: any): void {
    this.listEmpleados = this.filterEmpleados(event.query);
}

// getNombreEmpleado(idEmpleado: number): string {
//   const empleado = this.listEmpleados.find(emp => emp.id === idEmpleado);
//   return empleado ? `${empleado.nombre} ${empleado.apellido}` : 'Empleado no disponible';
// }


filterEmpleados(query: string): Empleado[] {
  return this.listEmpleados
  .filter((empleado) => (empleado.estado === true)
  );
}

  
seleccionarEmpleado(event: any): void {
  this.empleadoId = event.value.id;
  const nombre = event.value.nombre;
  const apellido = event.value.apellido;
  if (this.listEmpleados.length > 0) {
  this.formAsignarProcesoEmpleado.get('empleadoId')!.setValue(nombre + ' ' + apellido);
  }else{
    this.formAsignarProcesoEmpleado.get('empleadoId')!.setValue('No hay empleados disponibles');
  }
  const empleadoSeleccionado = this.listEmpleados.find(c => c.id === this.empleadoId);

  this.empleadoId = empleadoSeleccionado?.id || 0;
  

  console.log(this.empleadoId)

}

// getProcesosEnReferenciaEnPedido() {
//   this._procesoReferenciaPedidoService.getProcesosEnReferenciaEnPedido().subscribe((data: any) => {
//     this.listProcesos = data.ProcesoEnReferenciaEnPedidos;
//     // console.log(this.listProcesos);
//   });
// }


// validarRegistroProceso(pedidoId: number): boolean {
//   const pedido = this.listPedidos.find(p => p.id === pedidoId);

//   if (pedido && pedido.ProcesoEnReferenciaEnPedidos) {
//     for (const proceso of pedido.ProcesoEnReferenciaEnPedidos) {
//           if (proceso.AsignarProcesoEmpleado && proceso.AsignarProcesoEmpleado.length > 0) {
//             return true;
//           }
//     }
//   }

//   return false;
  
// }


// validarRegistroProceso2(procesoId: number): boolean {
//   const proceso = this.listPedidos.find(p => p.id === procesoId);
//   // console.log(proceso);
//   if (proceso) {
//           const asignar = this.listAsignarProcesoEmpleado.find(a => a.proceso === procesoId);
//           if (asignar) {
//             return true;
//           }
//         }

//   return false;
  
// }


// changeStateDialog: boolean = false;
// procesoSeleccionado: AsignarProcesoEmpleado = {};

// cambiarEstadoProceso(proceso: AsignarProcesoEmpleado) {
//   this.changeStateDialog = true;
//   this.procesoSeleccionado = proceso;
//   console.log('Proceso seleccionado:', proceso);  
// }


// async confirmChangeState(confirmacion: boolean) {
//   if (confirmacion) {
//     if (this.procesoSeleccionado?.idAsignarProceso){
//       this.asignarProceso.estado = !this.asignarProceso.estado;
//       this._AsignarProcesoService.putAsignarProcedimiento(this.procesoSeleccionado.idAsignarProceso, this.procesoSeleccionado).subscribe(() => {

//       });
      
//       await this.actualizarCantidadHecha(this.procesoSeleccionado.proceso || 0);

//       const empleadoTareaTerminada: Empleado = {
//         id: this.procesoSeleccionado.empleado,
//         estadoOcupado: false
//       }

//       this._empleadoService.putEmpleado(this.procesoSeleccionado.empleado || 0, empleadoTareaTerminada).subscribe(() => {
//         this.getProcesosEnReferenciaEnPedido();
//       });

//       this.getAsignarProcesoEmpleado();
//     }
//   } else {
//     console.log('No se pudo cambiar el estado');
//     this.showInfo(this.procesoSeleccionado.proceso || 0);
//   }
//   this.getListEmpleados();
//   this.changeStateDialog = false;
// }

// addAsignarProceso() {

//   const cantidadAsignada = parseInt(this.formularioAsignarProceso.value.cantAsignada, 10);

//   if (cantidadAsignada > this.cantidadTotal || cantidadAsignada <= 0) {
//     console.log('La cantidad asignada no es válida.');
//     return;
//   }else if (cantidadAsignada > this.cantidadPendiente){
//     console.log('La cantidad no puede ser mayor a la cantidad pendiente.');
//     return;
//   }


//   const asignarProcesoEmpleado : AsignarProcesoEmpleado = {
//     proceso: this.procesoId,
//     empleado: this.empleadoId,
//     cantAsignada: cantidadAsignada,
//     estado: false
//   }

//   console.log('Asignar proceso:', asignarProcesoEmpleado)

//   const empleadoTarea: Empleado = {
//     id: this.empleadoId,
//     estadoOcupado: true
//   }

//   // this._empleadoService.putEmpleado(this.empleadoId, empleadoTarea).subscribe(() => {
//   //   this.getListEmpleados();
//   //   console.log('Empleado ocupado');
//   // });

  
//   this._AsignarProcesoService.postAsignarProcedimiento(asignarProcesoEmpleado).subscribe(() => {
//     this.toastr.success('Proceso asignado correctamente', 'Éxito');
//     this.getAsignarProcesoEmpleado();
//     this.calcularSumaCantAsignada();
//     this.hideDialog();
//   });
  
// }

// async actualizarCantidadHecha(procesoId: number): Promise<void> {
//   try {
//     const AsignarProcesoEmpleado = this.listAsignarProcesoEmpleado
//       .filter(asignar => asignar.proceso === procesoId && asignar.estadoProcAsig === true);

//     const cantidadHecha = AsignarProcesoEmpleado.reduce((suma, asignar) => suma + (asignar.cantidadAsignada || 0), 0);

//     const procesoReferencia: ProcesoReferenciaPedidoInstance = {
//       cantidadHecha: cantidadHecha,
//     };

//     // Actualiza la propiedad cantidadHecha en el proceso
//     await this._procesoReferenciaPedidoService.putProcesoCantidad(procesoId, procesoReferencia).toPromise();

//     console.log('Cantidad hecha:', cantidadHecha);
//     console.log('Cantidad total:', this.cantidadTotal);
    
//     // Verifica si la cantidadTotal es igual a cantidadHecha
//     if (cantidadHecha === this.cantidadTotal) {
//       // Actualiza el estado del proceso si es necesario
//       const estadoActualizado = cantidadHecha === this.cantidadTotal;
//       const procesoReferenciaConEstado: ProcesoReferenciaPedidoInstance = {
//         cantidadHecha: cantidadHecha,
//         estado: estadoActualizado,
//       };

//       console.log(procesoReferenciaConEstado)
      
//       // Actualiza la propiedad cantidadHecha y el estado en el proceso
//       await this._procesoReferenciaPedidoService.putProcesoCantidad(procesoId, procesoReferenciaConEstado).toPromise();
//     }
//     this.getAsignarProcesoEmpleado();
//     // this.getProcesosEnReferenciaEnPedido();
//     // Actualiza la lista de procesos (opcional)
//   } catch (error) {
//     console.error('Error al actualizar cantidadHecha:', error);
//   }
// }

// async calcularSumaCantAsignada() {
//   try {
//     const data: any = await this._asignarProcesoService.getAsignarProcesoEmpleado().toPromise();
//     this.listAsignarProcesoEmpleado = data.listAsignarProcedimientos;

//     // Filtra solo los elementos que pertenecen al proceso actual
//     const asignarProcesoProcesoActual = this.listAsignarProcesoEmpleado.filter(asignar => asignar.proceso === this.procesoId);

//     // Realiza la suma solo de los elementos filtrados
//     this.cantidadAsignada = asignarProcesoProcesoActual.reduce((suma, asignar) => suma + (asignar.cantidadAsignada ?? 0), 0);
//     this.cantidadPendiente = this.cantidadTotal - this.cantidadAsignada;

//     const procesoReferencia: ProcesoReferenciaPedidoInstance = {
//       cantidadAsignada: this.cantidadAsignada,
//       cantidadPendiente: this.cantidadPendiente
//     };

//     await this._procesoReferenciaPedidoService.putProcesoCantidad(this.procesoId, procesoReferencia).toPromise();
//     // this.getProcesosEnReferenciaEnPedido();
//   } catch (error) {
//     console.error('Error al calcular:', error);
//   }
// }

// showInfo(procesoId: number) {
//   // this.getListEmpleados()
//   this.viewInfoDialog = true;
//   this.filteredAsignarProceso = this.listAsignarProceso.filter(asignar => asignar.proceso === procesoId);
//   // console.log(this.filteredAsignarProceso);
// }



}
