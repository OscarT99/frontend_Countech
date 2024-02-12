import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { EmpleadoService } from 'src/app/services/empleado/empleado.service'; 
import { Empleado} from 'src/app/interfaces/empleado/empleado.interface';
import { PedidoService } from 'src/app/services/pedido/pedido.service';
import { PedidoInstance } from 'src/app/interfaces/pedido/pedido.interface'; 
import { FormBuilder, FormControl, FormControlName, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

interface City {
  name: string;
  code: string;
}

@Component({
  templateUrl: './empleado.component.html',
  providers: [MessageService]
})
export class EmpleadoComponent implements OnInit {

  listEmpleados: Empleado[] = [];

  infoDialog: boolean = false;
  
  editDialog: boolean = false;
  
  createDialog: boolean = false;
  
  id: number = 0;

  form: FormGroup;

  pedido: PedidoInstance = {};

  empleado: Empleado = {};

  empleadoSeleccionado: Empleado | null = null;

  changeStateDialog: boolean = false;

  selectedProduct!: Empleado;

  submitted: boolean = false;

  cols: any[] = [];

  cities: City[] | undefined;

  selectedCity: City | undefined;



  constructor(private fb: FormBuilder,
      private _empleadoService: EmpleadoService,
      private _pedidoService: PedidoService,
      private toastr: ToastrService,      
      private aRouter:ActivatedRoute,
      ) {
        this.form = this.fb.group({
          tipoIdentidad: ['',Validators.required],
          numIdentidad: ['',Validators.required],
          nombre: ['',Validators.required],
          apellido: ['',Validators.required],
          correo: ['',Validators.required],
          telefono: ['',Validators.required],
          ciudad: ['',Validators.required],
          direccion: ['',Validators.required],
          fechaIngreso: ['',Validators.required],
          estado: ['',Validators.required],
          estadoOcupado: ['',Validators.required],
        })
        this.aRouter.params.subscribe(params => {
          this.id = +params['id'];
        });
       }

  ngOnInit(): void {

      this.getEmpleadoProceso();

      this.cities = [
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ];

  }
  
  getPedido(id: number) {
    this._pedidoService.getPedido(id).subscribe((data: PedidoInstance) => {
      this.pedido = data;
    });
  }

  getEmpleadoProceso() {
    this._empleadoService.getEmpleadoProcesos().subscribe((data: any) => {
      this.listEmpleados = data.EmpleadoProcesos;
    });
  }

  showInfoDialog(id: number) {
    this.infoDialog = true;
    this.id = id;
    this.getEmpleado(id);
  }

  showEditDialog(id: number) {
    this.editDialog = true;
    this.id = id;
    this.getEmpleado(id);
  }

  showCreateDialog() {
    this.form.reset();
    this.createDialog = true;
  }


  hideDialog() {
    this.infoDialog = false;
    this.editDialog = false;
    this.createDialog = false;
    // this.empleadoInfoDialog = false;
    // this.submitted = false;
  }

  getEstado(estado: boolean) {
    switch (estado) {
      case true:
        return 'success';
      case false:
        return 'danger';
    };
  }

  changeEstado(estado: boolean) {
    switch (estado) {
      case true:
        return 'ACTIVO';
      case false:
        return 'INACTIVO';
    };
  }

  getEstadoProd(estado: boolean) {
    switch (estado) {
      case true:
        return 'danger';
      case false:
        return 'success';
    };
  }

  changeEstadoProd(estado: boolean) {
    switch (estado) {
      case true:
        return 'OCUPADO';
      case false:
        return 'LIBRE';
    };
  }

  changeEstadoProc(estado: boolean) {
    switch (estado) {
      case true:
        return 'TERMINADO';
      case false:
        return 'PENDIENTE';
    };
  }


  addEmpleado() {  
      this.submitted = false;

      const empleado: Empleado = {
        tipoIdentidad: this.form.value.tipoIdentidad,
        numIdentidad: this.form.value.numIdentidad,
        nombre: this.form.value.nombre,
        apellido: this.form.value.apellido,
        correo: this.form.value.correo,
        telefono: this.form.value.telefono,
        ciudad: this.form.value.ciudad,
        direccion: this.form.value.direccion,
        fechaIngreso: this.form.value.fechaIngreso,
      }

      if (empleado.tipoIdentidad == null || empleado.tipoIdentidad == '' || empleado.tipoIdentidad == undefined) {
        this.toastr.error('El tipo de identificación es requerido', 'Error');
        return;

      }
      if (empleado.numIdentidad == null || empleado.numIdentidad == '' || empleado.numIdentidad == undefined) {
        this.toastr.error('El número de identificación es requerido', 'Error');
        return;

      }
      if (empleado.nombre == null || empleado.nombre == '' || empleado.nombre == undefined) {
        this.toastr.error('El nombre es requerido', 'Error');
        return;

      }
      if (empleado.apellido == null || empleado.apellido == '' || empleado.apellido == undefined) {
        this.toastr.error('El apellido es requerido', 'Error');
        return;

      }
      if (empleado.correo == null || empleado.correo == '' || empleado.correo == undefined) {
        this.toastr.error('El correo es requerido', 'Error');
        return;

      }
      if (empleado.telefono == null || empleado.telefono == '' || empleado.telefono == undefined) {
        this.toastr.error('El teléfono es requerido', 'Error');
        return;

      }
      if (empleado.ciudad == null || empleado.ciudad == '' || empleado.ciudad == undefined) {
        this.toastr.error('La ciudad es requerida', 'Error');
        return;

      }
      if (empleado.direccion == null || empleado.direccion == '' || empleado.direccion == undefined) {
        this.toastr.error('La dirección es requerida', 'Error');
        return;

      }

      else if (this.id) {
        console.log(this.id)
        this._empleadoService.putEmpleado(this.id, empleado).subscribe(() => {
          this.editDialog = false;
          this.toastr.info(`El empleado ${empleado.nombre} fue actualizado con éxito`, 'Empleado actualizado');
          this.getEmpleadoProceso();
        });
      } else {
        this._empleadoService.postEmpleado(empleado).subscribe(() => {
          this.createDialog = false;
          this.toastr.success(`El empleado ${empleado.nombre} fue registrado con éxito`, 'Empleado agregado');
          this.getEmpleadoProceso();
        });
      }

      this.createDialog = false;
  
  }

  // cambiarEstado(empleado: Empleado) {
  //   this.changeStateDialog = true;
  //   this.empleadoSeleccionado = empleado;
  // }

  // confirmChangeState(confirmacion: boolean) {
  //   this.empleadoInfoDialog = false;
  //   if (confirmacion && this.empleadoSeleccionado && this.empleadoSeleccionado.estadoProduccion === false) {
  //     if (this.empleadoSeleccionado.idEmpleado){
  //       this._empleadoService.putEmpleado(this.empleadoSeleccionado.idEmpleado, this.empleadoSeleccionado).subscribe(() => {
  //         this.empleado.estado = !this.empleado.estado;
  //         if (this.empleado.estado == false) {
  //         this.messageService.add({ severity: 'success', summary: 'Completado', detail: 'Empleado activo', life: 3000 });
  //         } else{
  //         this.messageService.add({ severity: 'success', summary: 'Completado', detail: 'Empleado inactivo', life: 3000 });
  //         }
  //         this.getListEmpleados();
  //       });
      
  //     }
  //   }
  //   else{
  //     this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado', life: 3000 });
  //     this.getListEmpleados();
  //   }
  //   this.changeStateDialog = false;
  // }

  getEmpleado(id:number) {
    
    this._empleadoService.getEmpleado(id).subscribe((data: Empleado) => {

        this.form.setValue({
          tipoIdentidad: data.tipoIdentidad,
          numIdentidad: data.numIdentidad,
          nombre: data.nombre,
          apellido: data.apellido,
          correo: data.correo,
          telefono: data.telefono,
          ciudad: data.ciudad,
          direccion: data.direccion,
          fechaIngreso: data.fechaIngreso,
          estado: data.estado,
          estadoOcupado: data.estadoOcupado
        });
      
    });
  }





//   onGlobalFilter(table: Table, event: Event) {
//     table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
// }

 }

