import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { EmpleadoService } from 'src/app/services/empleado/empleado.service'; 
import { Empleado } from 'src/app/interfaces/empleado/empleado.interface';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';



@Component({
  templateUrl: './empleado.component.html',
  providers: [MessageService]
})
export class EmpleadoComponent implements OnInit {

  formularioEmpleado: FormGroup;

  listEmpleados: Empleado[] = [];

  empleado: Empleado = {};

  empleadoSeleccionado: Empleado | null = null;

  empleadoNuevoDialog: boolean = false;

  empleadoEditarDialog: boolean = false;

  empleadoInfoDialog: boolean = false;

  changeStateDialog: boolean = false;

  selectedProduct!: Empleado;

  submitted: boolean = false;

  cols: any[] = [];

  id:number=0;

  tipoIdentidad: any[] = [];

  visible: boolean = false;

    showDialog() {
        this.visible = true;
    }

  constructor(private fb: FormBuilder,
      private _empleadoService: EmpleadoService,
      private messageService: MessageService,
      private toastr: ToastrService,      
      private aRouter:ActivatedRoute,
      ) {
        this.formularioEmpleado = this.fb.group({
          tipoIdentificacion: ['',Validators.required],
          numeroIdentificacion: ['',Validators.required],
          nombre: ['',Validators.required],
          apellido: ['',Validators.required],
          correo: ['',Validators.required],
          telefono: ['',Validators.required],
          ciudad: ['',Validators.required],
          direccion: ['',Validators.required],
          estado: ['',Validators.required],
        })
        this.aRouter.params.subscribe(params => {
          this.id = +params['id'];
        });
       }

  ngOnInit(): void {


    this.getListEmpleados();

    this.cols = [
      { field: 'product', header: 'Product' },
      { field: 'price', header: 'Price' },
      { field: 'category', header: 'Category' },
      { field: 'rating', header: 'Reviews' },
      { field: 'inventoryStatus', header: 'Status' }
  ];

  this.tipoIdentidad = [
    { label: 'Cédula de ciudadanía', value: 'CC' },
    { label: 'Cédula de ciudadanía', value: 'CC' },
    { label: 'Cédula de extranjería', value: 'CE' },
  ];

  }

  addEmpleado() {  
      this.submitted = false;

      const empleado: Empleado = {

        tipoIdentificacion: this.formularioEmpleado.value.tipoIdentificacion,
        numeroIdentificacion: this.formularioEmpleado.value.numeroIdentificacion,
        nombre: this.formularioEmpleado.value.nombre,
        apellido: this.formularioEmpleado.value.apellido,
        correo: this.formularioEmpleado.value.correo,
        telefono: this.formularioEmpleado.value.telefono,
        ciudad: this.formularioEmpleado.value.ciudad,
        direccion: this.formularioEmpleado.value.direccion,
        estado: true,
      }
      if (empleado.tipoIdentificacion == null || empleado.tipoIdentificacion == '' || empleado.tipoIdentificacion == undefined) {
        this.toastr.error('El tipo de identificación es requerido', 'Error');
        return;

      }
      if (empleado.numeroIdentificacion == null || empleado.numeroIdentificacion == '' || empleado.numeroIdentificacion == undefined) {
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
      else if (this.id !== 0) {
        this._empleadoService.putEmpleado(this.id, empleado).subscribe(() => {
          this.empleadoEditarDialog = false;
          this.toastr.info(`El empleado ${empleado.nombre} fue actualizado con éxito`, 'Empleado actualizado');
          this.getListEmpleados();
        });
      } else {
        this._empleadoService.postEmpleado(empleado).subscribe(() => {
          this.empleadoNuevoDialog = false;
          this.toastr.success(`El empleado ${empleado.nombre} fue registrado con éxito`, 'Empleado agregado');
          this.getListEmpleados();
        });
      }
      this.empleadoNuevoDialog = false;
  
  }

  hideDialog() {
    this.empleadoNuevoDialog = false;
    this.empleadoEditarDialog = false;
    this.empleadoInfoDialog = false;
    this.submitted = false;
  }

  nuevoEmpleado() {
    this.id = 0;                
    this.formularioEmpleado.reset()
    this.empleadoNuevoDialog = true;
  }

  cambiarEstado(empleado: Empleado) {
    this.changeStateDialog = true;
    this.empleadoSeleccionado = empleado;
  }

  confirmChangeState(confirmacion: boolean) {
    this.empleadoInfoDialog = false;
    if (confirmacion && this.empleadoSeleccionado && this.empleadoSeleccionado.estadoProduccion === false) {
      if (this.empleadoSeleccionado.idEmpleado){
        this._empleadoService.putEmpleado(this.empleadoSeleccionado.idEmpleado, this.empleadoSeleccionado).subscribe(() => {
          this.empleado.estado = !this.empleado.estado;
          if (this.empleado.estado == false) {
          this.messageService.add({ severity: 'success', summary: 'Completado', detail: 'Empleado activo', life: 3000 });
          } else{
          this.messageService.add({ severity: 'success', summary: 'Completado', detail: 'Empleado inactivo', life: 3000 });
          }
          this.getListEmpleados();
        });
      
      }
    }
    else{
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado', life: 3000 });
      this.getListEmpleados();
    }
    this.changeStateDialog = false;
  }

  
  editProduct(id: number) {
    this.id = id;
    this.empleadoEditarDialog = true;
    this.getEmpleado(id)
  }

  infoEmpleado(id: number) {
    this.id = id;
    this.empleadoInfoDialog = true;
    this.getEmpleado(id)
  }
  
  getEmpleado(id:number) {
    
    this._empleadoService.getEmpleado(id).subscribe((data: Empleado) => {
        // console.log(data);
        this.formularioEmpleado.setValue({
          tipoIdentificacion: data.tipoIdentificacion,
          numeroIdentificacion: data.numeroIdentificacion,
          nombre: data.nombre,
          apellido: data.apellido,
          correo: data.correo,
          telefono: data.telefono,
          ciudad: data.ciudad,
          direccion: data.direccion,
          estado: data.estado,
        });
      
    });
  }

  getListEmpleados() {
    this._empleadoService.getListEmpleados().subscribe((data: any) => {
      this.listEmpleados = data.listEmpleados;
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
}

 }

