import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { EmpleadoService } from 'src/app/services/empleado/empleado.service';
import { Table } from 'primeng/table';
import { Empleado} from 'src/app/interfaces/empleado/empleado.interface';
import { PedidoService } from 'src/app/services/pedido/pedido.service';
import { PedidoInstance } from 'src/app/interfaces/pedido/pedido.interface'; 
import { AsyncValidatorFn, FormBuilder, FormControl, FormControlName, FormGroup } from '@angular/forms';
import { ValidatorFn, AbstractControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { AvanceProcesoEmpleado } from 'src/app/interfaces/produccion/avanceProcesoEmpleado.interface';
import { AvanceProcesoEmpleadoService } from 'src/app/services/produccion/avanceProcesoEmpleado.service';
import { Observable } from 'rxjs';

interface City {
  label: string;
  value: string;
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

  avanceDialog: boolean = false;
  
  id: number = 0;

  form: FormGroup;

  formAvance: FormGroup;

  pedido: PedidoInstance = {};

  empleado: Empleado = {};

  empleadoSeleccionado: Empleado | null = null;

  changeStateDialog: boolean = false;

  cols: any[] = [];

  listTipoIdentidad: City[] | undefined;

  // selectedTipo: tipoIdentidad | undefined;


  constructor(private fb: FormBuilder,
      private _empleadoService: EmpleadoService,
      private _pedidoService: PedidoService,
      private _avanceProcesoService: AvanceProcesoEmpleadoService,
      private toastr: ToastrService,      
      private aRouter:ActivatedRoute,
      ) {
        this.form = this.fb.group({
          tipoIdentidad: [null],
          numIdentidad: ['', Validators.required],
          nombre: ['', [Validators.required, this.customTextRegExpValidator(/^[A-Za-záéíóúüÜÁÉÍÓÚÑñ ]+$/)]],
          apellido: ['', [Validators.required, this.customTextRegExpValidator(/^[A-Za-záéíóúüÜÁÉÍÓÚÑñ ]+$/)]],
          correo: ['', [Validators.required, this.customEmailRegExpValidator(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
          telefono: ['',[Validators.required, this.customNumberRegExpValidator(/^[0-9]{10}$/)]],
          ciudad: ['', [Validators.required, this.customTextRegExpValidator(/^[A-Za-záéíóúüÜÁÉÍÓÚÑñ ]+$/)]],
          direccion: ['',Validators.required],
          fechaIngreso: ['',Validators.required],
          estado: [''],
          estadoOcupado: [''],
        });
        this.formAvance = this.fb.group({
          cantidadHecha: ['', [Validators.required, Validators.min(1)]],
        });
        this.aRouter.params.subscribe(params => {
          this.id = +params['id'];
        });
       }

  ngOnInit(): void {

    this.getEmpleadoProceso();

    this.listTipoIdentidad = [
      { label: 'Cédula de ciudadanía', value:'Cédula de ciudadanía' },
      { label: 'Tarjeta de extranjería', value:'Tarjeta de extranjería' },
      { label: 'Cédula de extranjero', value:'Cédula de extranjería' },
      { label: 'Pasaporte', value:'Pasaporte' },
    ];

  }

  validateNumIdentidad() {
    const numIdentidadControl = this.form.get('numIdentidad');
    const numIdentidadValue = numIdentidadControl?.value;
  
    // Verificar si el número de identificación tiene al menos 6 dígitos
    if (numIdentidadValue && numIdentidadValue.length < 6) {
      numIdentidadControl?.setErrors({ minlength: true });
        return;
    }
  
    // Verificar si el número de identificación ya existe en la base de datos
    const existingNumber = this.listEmpleados.some(empleado => empleado.numIdentidad === numIdentidadValue);
    if (existingNumber) {
      numIdentidadControl?.setErrors({ numeroExistente: true });
    } else {
      numIdentidadControl?.setErrors(null);
    }
  }

  validateEmail() {
    const correoControl = this.form.get('correo');
    const correoValue = correoControl?.value;
  
    // Verificar si el número de identificación ya existe en la base de datos
    const existingEmail = this.listEmpleados.some(empleado => empleado.correo === correoValue);
    if (existingEmail) {
      correoValue?.setErrors({ correoExistente: true });
    } else {
      correoControl?.setErrors(null);
    }
  }



  existingNumberValidator(listEmpleados: any[]): AsyncValidatorFn {
    return (control: AbstractControl): Promise<{ [key: string]: any } | null> | Observable<{ [key: string]: any } | null> => {
      const numIdentidadValue = control.value;
      const numeroExistente = listEmpleados.some(empleado => empleado.numIdentidad === numIdentidadValue);
      return Promise.resolve(numeroExistente ? { 'numeroExistente': true } : null);
    };
  }


  customNumberRegExpValidator(numberRegExp: RegExp): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isValid = numberRegExp.test(control.value);
      return isValid ? null : { 'customNumberRegExp': { value: control.value } };
    };
  }



  customTextRegExpValidator(textRegExp: RegExp): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isValid = textRegExp.test(control.value);
      return isValid ? null : { 'customTextRegExp': { value: control.value } };
    };
  }

  customEmailRegExpValidator(emailRegExp: RegExp): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isValid = emailRegExp.test(control.value);
      return isValid ? null : { 'customEmailRegExp': { value: control.value } };
    };
  }
  
  getPedido(id: number) {
    this._pedidoService.getPedido(id).subscribe((data: PedidoInstance) => {
      this.pedido = data;
    });
  }

  getEmpleadoProceso() {
    this._empleadoService.getEmpleadoProcesos().subscribe((data: any) => {
      this.listEmpleados = data.EmpleadoProcesos.map((empleadoProceso: any) => {
        empleadoProceso.asignarProcesoEmpleados = empleadoProceso.asignarProcesoEmpleados.filter((asignacion: any) => !asignacion.estadoProcAsig);
        return empleadoProceso;
      });
      
      console.log(this.listEmpleados);
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

  showDialogAvance(id: number) {
    this.avanceDialog = true;
  }


  showCreateDialog() {
    this.form.reset();
    this.createDialog = true;
  }
 

  hideDialog() {
    this.infoDialog = false;
    this.editDialog = false;
    this.createDialog = false;
    this.form.get('tipoIdentidad')?.setValue(null)
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

    // Registrar una cantidad hecha de un proceso asignado a un empleado
    crearAvance(id: number){
      const dataAvance: AvanceProcesoEmpleado = {
        cantidadHecha: this.formAvance.value.cantidadHecha,
        asignarProcesoEmpleadoId: id
      }
      this._avanceProcesoService.postAvanceProcesoEmpleado(dataAvance).subscribe(() => {
        this.toastr.success('Registro exitoso');
      });
    }

  addEmpleado() {

      const empleado: Empleado = {
        tipoIdentidad: this.form.value.tipoIdentidad.value,
        numIdentidad: this.form.value.numIdentidad,
        nombre: this.form.value.nombre,
        apellido: this.form.value.apellido,
        correo: this.form.value.correo,
        telefono: this.form.value.telefono,
        ciudad: this.form.value.ciudad,
        direccion: this.form.value.direccion,
        fechaIngreso: this.form.value.fechaIngreso,
      }

      console.log(empleado)

      if (this.id) {
        console.log(this.id)
        this._empleadoService.putEmpleado(this.id, empleado).subscribe(() => {
          this.editDialog = false;
          this.toastr.info(`El empleado ${empleado.nombre} fue actualizado con éxito`, 'Empleado actualizado');
          this.getEmpleadoProceso();
        });
      } else {
        this._empleadoService.postEmpleado(empleado).subscribe(
          () => {
            this.createDialog = false;
            this.toastr.success(`El empleado ${empleado.nombre} fue registrado con éxito`, 'Empleado agregado');
            this.getEmpleadoProceso();
          },
          (error) => {
            console.error('Ha ocurrido un error al registrar el empleado:', error);
            this.toastr.error('Ha ocurrido un error al registrar el empleado', 'Error');
          }
        );
      }

      this.createDialog = false;
  
  }

  cambiarEstado(empleado: Empleado) {
    this.changeStateDialog = true;
    this.empleadoSeleccionado =  empleado;
    console.log(this.empleadoSeleccionado);
    this.getEmpleadoProceso();
  }

  confirmChangeState(confirmacion: boolean) {
    // this.empleadoInfoDialog = false;
    if (confirmacion && this.empleadoSeleccionado && this.empleadoSeleccionado.estadoOcupado === false) {
      if (this.empleadoSeleccionado.id){
        this._empleadoService.putEmpleado(this.empleadoSeleccionado.id, this.empleadoSeleccionado).subscribe(() => {
          this.empleado.estado = !this.empleado.estado;
          if (this.empleado.estado == false) {
            this.toastr.success('Empleado activo', 'Éxito');
          } else{
            this.toastr.success('Empleado inactivo', 'Éxito');
          }
          this.getEmpleadoProceso();
        });
      
      }
    }
    else{
      this.toastr.error('No se puedo cambiar el estado', 'Error');
      this.getEmpleadoProceso();
    }
    this.changeStateDialog = false;
  }

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

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
}

 }

