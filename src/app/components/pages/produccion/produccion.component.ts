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

import { ConfirmationService, MessageService, ConfirmEventType } from 'primeng/api';
import { Subscription } from 'rxjs';


@Component({
  templateUrl: './produccion.component.html',
  providers: [ConfirmationService, MessageService]
})
export class ProduccionComponent implements OnInit {

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

    listSearchPedido: any[] = [];

    searchText: string = '';

    filteredPedidoProceso: ProcesoReferenciaPedidoInstance[] = [];
    
    id: number = 0;

    procesoId: number = 0;

    pedidoId: number = 0;

    empleadoId: number = 0;

    subscription: Subscription = new Subscription();
   
    rowsPerPageOptions = [5, 10, 15];

    activeAccordionTabIndex: number = 0;

    idSelected: any;


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

  ngOnInit(): void {
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
       this.filteredPedidos = this.listPedidos.filter((pedido: any) => pedido.estado === 'Registrado' || pedido.estado === 'En proceso');   
       this.listSearchPedido = this.filteredPedidos;
      })
  }

  filterPedidosByOrdenTrabajo(ordenTrabajo: string) {
      this.listSearchPedido = this.filteredPedidos.filter(pedido =>
      pedido?.ordenTrabajo?.toLowerCase().includes(ordenTrabajo.toLowerCase()) 
    );

    console.log(this.listSearchPedido.length);
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
        // console.log(this.filteredProcesosAsignados);
  
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
    this.pedidoId = proceso.pedido;
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

  validateCantHecha(cantRestante: number) {
    const cantidadHechaControl = this.formAvance.get('cantidadHecha');
    const cantidadHechaValue = cantidadHechaControl?.value;
    const cantidadRestanteControl = cantRestante;

    if (cantidadHechaValue && cantidadHechaValue > cantidadRestanteControl) {
      cantidadHechaControl?.setErrors({ cantError: true });
        return;
    }
  }

  // Registrar un proceso asignado a un empleado
  addAsignarProcesoEmpleado() {
    this.formAsignarProcesoEmpleado.markAllAsTouched();

    if(this.formAsignarProcesoEmpleado.valid){
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
  }else {
    this.toastr.error('Por favor, complete todos los campos obligatorios', 'Error de validación');
  }
  }

  getAsignarProcesoEmpleadoById(id: number) {
    this._pedidoService.getPedidoProcesoById(id).subscribe((data: any) => {
      console.log(data);
    });
  }


  // Registrar una cantidad hecha de un proceso asignado a un empleado
  crearAvance(id: number) {

    this.formAvance.markAllAsTouched();

    const dataAvance: AvanceProcesoEmpleado = {
      cantidadHecha: this.formAvance.value.cantidadHecha,
      asignarProcesoEmpleadoId: id
    }
    try{
      if(this.formAvance.valid){
        this._avanceProcesoService.postAvanceProcesoEmpleado(dataAvance).subscribe(() => {
          this._pedidoService.getPedido(this.pedidoId).subscribe((data: any) => {
            if(data.estado === 'Terminado'){
              this.toastr.success('Pedido terminado correctamente', 'Éxito');
              this.getListPedidos();
            }
          });
          this.toastr.success('Registro de avance exitoso', 'Éxito');
          this.getListPedidoProcesos();
          this.getAsignarProcesoEmpleado();
          this.getPedidoInfoEstado();
        });
      }else{
        this.toastr.error('Por favor, complete todos los campos obligatorios', 'Error de validación');
      }
    }catch(error){
      console.error('Ha ocurrido un error al registrar el avance:', error);
      this.toastr.error('Ha ocurrido un error al registrar el avance', 'Error');
    }
  };


  // Anular un proceso asignado a un empleado
  // anularProceso(id: number){
  //   this.confirmationService.confirm({
  //     message: '¿Está seguro de anular el proceso?',
  //     header: 'Anular proceso',
  //     icon: 'pi pi-exclamation-triangle',
  //     acceptLabel: 'Sí',
  //     rejectLabel: 'No',
  //     accept: () => {
  //       const dataAnular: EstadoAnular = {
  //         estadoAnular: true
  //       }
  //       // console.log({data: dataAnular}); 
  //       this._asignarProcesoService.putAnularProceso(id, dataAnular).subscribe(() => {
  //         this.toastr.success('Proceso anulado correctamente', 'Éxito');
  //         this.getAsignarProcesoEmpleado();
  //         this.getListPedidoProcesos();
  //       });
  //     },
  //     reject: () => {
  //       // this.toastr.error('Proceso no anulado', 'Error');
  //     }
  //   });
  // }

  confirm(id: number) {
    this.idSelected = id;

    const messageTemplate = `
    <div class="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border">
      <i class="pi pi-exclamation-circle text-6xl text-primary-500"></i>
      <p>¿Está seguro de que desea anular el proceso?</p>
    </div>`;

    this.confirmationService.confirm({
      message: messageTemplate,
      header: 'Confirmación',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      rejectButtonStyleClass: 'p-button-sm',
      acceptButtonStyleClass: 'p-button-outlined p-button-sm',
      accept: () => {
        if (this.idSelected != null) {
            const dataAnular: EstadoAnular = {
              estadoAnular: true
            }
            this._asignarProcesoService.putAnularProceso(id, dataAnular).subscribe(() => {
              this.toastr.success('Proceso anulado correctamente', 'Éxito');
              this.getAsignarProcesoEmpleado();
              this.getListPedidoProcesos();
            })
      }
      },
      reject: () => {
        this.toastr.error('¡El proceso no ha sido anulado!', 'Error');
      }
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }



  buscarEmpleado(event: any): void {
    this.listEmpleados = this.filterEmpleados(event.query);
  }

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

}
