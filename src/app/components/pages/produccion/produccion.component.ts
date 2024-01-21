// import { Component, OnInit, ViewChild } from '@angular/core';
// import { Table } from 'primeng/table';
// import { PedidoService } from 'src/app/services/pedido/pedido.service'; 
// import { PedidoInstance } from 'src/app/interfaces/pedido/pedido.interface'; 

// import { AsignarProceso } from 'src/app/interfaces/produccion/asignarProceso.interface';
// import { asignarProcesoService } from 'src/app/services/produccion/asignarProceso.service';

// import { ProcesoReferenciaPedido } from 'src/app/interfaces/pedido/procesoReferenciaPedido.interface';
// import { procesoReferenciaPedidoService } from 'src/app/services/produccion/procesoReferenciaPedido.service';

// import { EmpleadoService } from 'src/app/services/empleado/empleado.service'; 
// import { Empleado } from 'src/app/interfaces/empleado/empleado.interface';

// import { ToastrService } from 'ngx-toastr';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { Dialog } from 'primeng/dialog';
// import { MessageService } from 'primeng/api';

// @Component({
//   templateUrl: './produccion.component.html',
//   providers: [MessageService]
// })
// export class ProduccionComponent implements OnInit {

//     viewInfoDialog: boolean = false;

//     asignarTareaDialog: boolean = false;


//     empleadoId: number = 0;
//   messageService: any;

//     hideDialog(){
//       this.viewInfoDialog = false;
//       this.asignarTareaDialog = false;
//       this.formularioAsignarProceso.reset('empleado');
//     }

//     formularioAsignarProceso: FormGroup;

//     listPedidos: PedidoInstance[] = []

//     listEmpleados: Empleado[] = [];

//     listProcesos: ProcesoReferenciaPedido[]  = [];

//     listAsignarProceso: AsignarProceso[] = []

//     asignarProceso: AsignarProceso = {}

//     filteredAsignarProceso: AsignarProceso[] = [];

//     id:number=0;

//     mostrarModalDetalle: boolean = false;

//     pedidoIdSeleccionado!: number;

//     detallePedido: any;
//     @ViewChild('detallePedidoModal') detallePedidoModal!: Dialog;
   
//     rowsPerPageOptions = [5, 10, 15];

//   constructor(
//     private fb: FormBuilder,
//     private _procesoReferenciaPedidoService: procesoReferenciaPedidoService,
//     private _pedidoService:PedidoService,
//     private _asignarProcesoService:asignarProcesoService,
//     private _empleadoService: EmpleadoService,
//     private toastr: ToastrService,      
//     private aRouter:ActivatedRoute,
//     private router : Router,
//     ){
//       this.formularioAsignarProceso = this.fb.group({
//         proceso: ['', Validators.required],
//         empleado: ['', Validators.required],
//         cantAsignada: ['', [Validators.required, Validators.min(1)]],
//         cantidadPendiente: ['', Validators.required],
//         estado: ['', Validators.required],
//       });
//       this.aRouter.params.subscribe(params => {
//         this.id = +params['id'];
//       });
//     }


//   ngOnInit():void {
//     this.getListPedidos();
//     this.getAsignarProcesos();
//     this.getListEmpleados();
//     this.getProcesosEnReferenciaEnPedido();
//   }

//   onGlobalFilter(table: Table, event: Event) {
//     table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
//   }

//   getListEmpleados() {
//     this._empleadoService.getListEmpleados().subscribe((data: any) => {
//       this.listEmpleados = data.listEmpleados.filter((empleado: Empleado) => empleado);
//     });
//   }

//   buscarEmpleado(event: any): void {
//     this.listEmpleados = this.filterEmpleados(event.query);
// }

// getNombreEmpleado(idEmpleado: number): string {
//   const empleado = this.listEmpleados.find(emp => emp.idEmpleado === idEmpleado);
//   return empleado ? `${empleado.nombre} ${empleado.apellido}` : 'Empleado no disponible';
// }


// filterEmpleados(query: string): Empleado[] {
//   return this.listEmpleados
//   .filter((empleado) => (empleado.estado === true && empleado.estadoProduccion === false)
//       // empleado.nombre!.toLowerCase().includes(query.toLowerCase()) ||
//       // empleado.apellido!.toLowerCase().includes(query.toLowerCase())
//       // cliente.numeroIdentificacion!.toLowerCase().includes(query.toLowerCase())
//   );
// }

  
// seleccionarEmpleado(event: any): void {
//   this.empleadoId = event.value.idEmpleado;
//   const nombre = event.value.nombre;
//   const apellido = event.value.apellido;
//   if (this.listEmpleados.length > 0) {
//   this.formularioAsignarProceso.get('empleado')!.setValue(nombre + ' ' + apellido);
//   }else{
//     this.formularioAsignarProceso.get('empleado')!.setValue('No hay empleados disponibles');
//   }
//   // const empleadoSeleccionado = this.listEmpleados.find(c => c.idEmpleado === empleadoId);

//   // if (empleadoSeleccionado) {
//   //   this.formularioAsignarProceso.get('contacto')!.setValue(empleadoSeleccionado.nombre || '');
//   // }
// }

// getAsignarProcesos() {
//   this._asignarProcesoService.getAsignarProcedimientos().subscribe((data: any) => {
//       this.listAsignarProceso = data.listAsignarProcedimientos;
//       // console.log(this.listAsignarProceso);
//     },
//   );
// }

// procesoId: number = 0;
// cantidadAsignada: number = 0;
// cantidadHecha: number = 0;
// cantidadPendiente: number = 0;
// cantidadTotal: number = 0;

// getProcesosEnReferenciaEnPedido() {
//   this._procesoReferenciaPedidoService.getProcesosEnReferenciaEnPedido().subscribe((data: any) => {
//     this.listProcesos = data.listProcesoEnReferenciaEnPedido;
//     // console.log(this.listProcesos);
//   });
// }


// validarRegistroProceso(pedidoId: number): boolean {
//   const pedido = this.listPedidos.find(p => p.id === pedidoId);

//   if (pedido && pedido.ReferenciaEnPedidos) {
//     for (const referencia of pedido.ReferenciaEnPedidos) {
//       if (referencia.ProcesoEnReferenciaEnPedidos) {
//         for (const proceso of referencia.ProcesoEnReferenciaEnPedidos) {
//           if (proceso.AsignarProcesos && proceso.AsignarProcesos.length > 0) {
//             return true;
//           }
//         }
//       }
//     }
//   }

//   return false;
  
// }


// validarRegistroProceso2(procesoId: number): boolean {
//   const proceso = this.listProcesos.find(p => p.id === procesoId);
//   // console.log(proceso);
//   if (proceso) {
//           const asignar = this.listAsignarProceso.find(a => a.proceso === procesoId);
//           if (asignar) {
//             return true;
//           }
//         }

//   return false;
  
// }



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


// changeStateDialog: boolean = false;
// procesoSeleccionado: AsignarProceso = {};

// cambiarEstadoProceso(proceso: AsignarProceso) {
//   this.changeStateDialog = true;
//   this.procesoSeleccionado = proceso;
//   console.log('Proceso seleccionado:', proceso);  
// }


// async confirmChangeState(confirmacion: boolean) {
//   if (confirmacion) {
//     if (this.procesoSeleccionado?.idAsignarProceso){
//       this.asignarProceso.estado = !this.asignarProceso.estado;
//       this._asignarProcesoService.putAsignarProcedimiento(this.procesoSeleccionado.idAsignarProceso, this.procesoSeleccionado).subscribe(() => {

//       });
      
//       await this.actualizarCantidadHecha(this.procesoSeleccionado.proceso || 0);

//       const empleadoTareaTerminada: Empleado = {
//         idEmpleado: this.procesoSeleccionado.empleado,
//         estadoProduccion: false
//       }

//       this._empleadoService.putEmpleado(this.procesoSeleccionado.empleado || 0, empleadoTareaTerminada).subscribe(() => {
//         this.getProcesosEnReferenciaEnPedido();
//       });

//       this.getAsignarProcesos();
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


//   const asignarProcesoEmpleado : AsignarProceso = {
//     proceso: this.procesoId,
//     empleado: this.empleadoId,
//     cantAsignada: cantidadAsignada,
//     estado: false
//   }

//   console.log('Asignar proceso:', asignarProcesoEmpleado)

//   const empleadoTarea: Empleado = {
//     idEmpleado: this.empleadoId,
//     estadoProduccion: true
//   }

//   this._empleadoService.putEmpleado(this.empleadoId, empleadoTarea).subscribe(() => {
//     this.getListEmpleados();
//     console.log('Empleado ocupado');
//   });

  
//   this._asignarProcesoService.postAsignarProcedimiento(asignarProcesoEmpleado).subscribe(() => {
//     this.toastr.success('Proceso asignado correctamente', 'Éxito');
//     this.getAsignarProcesos();
//     this.calcularSumaCantAsignada();
//     this.hideDialog();
//   });
  
// }

// async actualizarCantidadHecha(procesoId: number): Promise<void> {
//   try {
//     const asignarProcesos = this.listAsignarProceso
//       .filter(asignar => asignar.proceso === procesoId && asignar.estado === true);

//     const cantidadHecha = asignarProcesos.reduce((suma, asignar) => suma + (asignar.cantAsignada || 0), 0);

//     const procesoReferencia: ProcesoReferenciaPedido = {
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
//       const procesoReferenciaConEstado: ProcesoReferenciaPedido = {
//         cantidadHecha: cantidadHecha,
//         estado: estadoActualizado,
//       };

//       console.log(procesoReferenciaConEstado)
      
//       // Actualiza la propiedad cantidadHecha y el estado en el proceso
//       await this._procesoReferenciaPedidoService.putProcesoCantidad(procesoId, procesoReferenciaConEstado).toPromise();
//     }
//     this.getAsignarProcesos();
//     this.getProcesosEnReferenciaEnPedido();
//     // Actualiza la lista de procesos (opcional)
//   } catch (error) {
//     console.error('Error al actualizar cantidadHecha:', error);
//   }
// }

// async calcularSumaCantAsignada() {
//   try {
//     const data: any = await this._asignarProcesoService.getAsignarProcedimientos().toPromise();
//     this.listAsignarProceso = data.listAsignarProcedimientos;

//     // Filtra solo los elementos que pertenecen al proceso actual
//     const asignarProcesoProcesoActual = this.listAsignarProceso.filter(asignar => asignar.proceso === this.procesoId);

//     // Realiza la suma solo de los elementos filtrados
//     this.cantidadAsignada = asignarProcesoProcesoActual.reduce((suma, asignar) => suma + (asignar.cantAsignada ?? 0), 0);
//     this.cantidadPendiente = this.cantidadTotal - this.cantidadAsignada;

//     const procesoReferencia: ProcesoReferenciaPedido = {
//       cantidadAsignada: this.cantidadAsignada,
//       cantidadPendiente: this.cantidadPendiente
//     };

//     await this._procesoReferenciaPedidoService.putProcesoCantidad(this.procesoId, procesoReferencia).toPromise();
//     this.getProcesosEnReferenciaEnPedido();
//   } catch (error) {
//     console.error('Error al calcular:', error);
//   }
// }

// showInfo(procesoId: number) {
//   this.getListEmpleados()
//   this.viewInfoDialog = true;
//   this.filteredAsignarProceso = this.listAsignarProceso.filter(asignar => asignar.proceso === procesoId);
//   // console.log(this.filteredAsignarProceso);
// }

// getListPedidos(){     
//   this._pedidoService.getListPedidos().subscribe((data:any) =>{      
//     this.listPedidos = data.listaPedidos;   
//     // console.log(this.listPedidos);       
//   })        
// }

// }
