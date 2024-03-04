import { Component, OnInit } from '@angular/core';
import { EmpleadoService } from 'src/app/services/empleado/empleado.service';
import { Table } from 'primeng/table';
import { Empleado } from 'src/app/interfaces/empleado/empleado.interface';
import { PedidoService } from 'src/app/services/pedido/pedido.service';
import { PedidoInstance } from 'src/app/interfaces/pedido/pedido.interface'; 
import { AsyncValidatorFn, FormBuilder, FormControl, FormControlName, FormGroup } from '@angular/forms';
import { ValidatorFn, AbstractControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { AvanceProcesoEmpleado } from 'src/app/interfaces/produccion/avanceProcesoEmpleado.interface';
import { AvanceProcesoEmpleadoService } from 'src/app/services/produccion/avanceProcesoEmpleado.service';
import { Observable } from 'rxjs';
import { ConfirmationService, MessageService, ConfirmEventType } from 'primeng/api';


interface OptionTipoIdentidad {
  label: string;
  value: string;
}

@Component({
  templateUrl: './empleado.component.html',
  providers: [MessageService, ConfirmationService],
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

  listTipoIdentidad: OptionTipoIdentidad[] | undefined;

  maxDate: Date = new Date();



  constructor(private fb: FormBuilder,
    private _empleadoService: EmpleadoService,
    private _pedidoService: PedidoService,
    private confirmationService: ConfirmationService,
      private _avanceProcesoService: AvanceProcesoEmpleadoService,
      private confirmationService: ConfirmationService,
      private toastr: ToastrService,      
      private aRouter:ActivatedRoute,
      ) {
        this.form = this.fb.group({
          tipoIdentidad: [''],
          numIdentidad: ['', [Validators.required]],
          nombre: ['', [Validators.required, Validators.maxLength(30), this.customTextRegExpValidator(/^[A-Za-záéíóúüÜÁÉÍÓÚÑñ ]+$/), this.customLengthtRegExpValidator(/^(\S+\s){0,2}\S*$/)]],
          apellido: ['', [Validators.required, Validators.maxLength(30), this.customTextRegExpValidator(/^[A-Za-záéíóúüÜÁÉÍÓÚÑñ ]+$/), this.customLengthtRegExpValidator(/^(\S+\s){0,2}\S*$/)]],
          correo: ['', [Validators.required, Validators.maxLength(40), this.customEmailRegExpValidator(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
          telefono: ['', [Validators.required, this.customNumberRegExpValidator(/^[0-9]{10}$/)]],
          ciudad: ['', [Validators.required, Validators.maxLength(30), this.customTextRegExpValidator(/^[A-Za-záéíóúüÜÁÉÍÓÚÑñ ]+$/), this.customLengthtRegExpValidator(/^(\S+\s){0,2}\S+$/)]],
          direccion: ['', [Validators .required, Validators.maxLength(40)]],
          fechaIngreso: ['', [Validators.required]],
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

    if (numIdentidadValue && numIdentidadValue.length > 10) {
      numIdentidadControl?.setErrors({ maxlength: true });
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

  customLengthtRegExpValidator(lengthRegExp: RegExp): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isValid = lengthRegExp.test(control.value);
      return isValid ? null : { 'customLengthRegExp': { value: control.value } };
    };
  }

  customEmailRegExpValidator(emailRegExp: RegExp): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isValid = emailRegExp.test(control.value);
      return isValid ? null : { 'customEmailRegExp': { value: control.value } };
    };
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

      this.listEmpleados.forEach((empleado: any) => {
        empleado.asignarProcesoEmpleados.forEach((procAsig: any) => {
          this._pedidoService.getPedidoProcesoById(procAsig.pedidoprocesoId).subscribe((proceso: any) => {
              procAsig.procesoNom = proceso.proceso;
          })
          console.log(this.listEmpleados)
        })
      });

          // this.listEmpleados.forEach((procAsig: any) => {
          //   this._pedidoService.getPedidoProcesoById(procAsig.id).subscribe((proceso: any) => {
          //       procAsig.procesoNom = proceso.proceso;
          //   })
          // })
    
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
        this.toastr.success('Registro de avance exitoso', 'Éxito');
        this.getEmpleadoProceso();
      });
    }


  addEmpleado() {
      this.form.markAllAsTouched();

      if(this.form.valid) {
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
    }else {
      this.toastr.error('Por favor, complete todos los campos obligatorios', 'Error de validación');
    }
  }

  cambiarEstado(empleado: Empleado) {
    this.changeStateDialog = true;
    this.empleadoSeleccionado =  empleado;
  }

  confirm(empleado: Empleado) {
    this.empleadoSeleccionado = empleado;

    this.confirmationService.confirm({
      header: 'Confirmación',

      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      rejectButtonStyleClass: 'p-button-sm',
      acceptButtonStyleClass: 'p-button-outlined p-button-sm',
      accept: () => {
        if (this.empleadoSeleccionado != null && this.empleadoSeleccionado.id != null) {
          this._empleadoService.putEmpleado(this.empleadoSeleccionado.id, this.empleadoSeleccionado)
            .subscribe(() => {
              if(this.empleadoSeleccionado?.estado === true){
                this.toastr.success('¡El empleado ha sido <strong>activado</strong> exitosamente!', 'Éxito');
              }else{
                this.toastr.warning('¡El empleado ha sido <strong>desactivado</strong> exitosamente!', 'Éxito');
              }
            } );
        }

      },
      reject: () => {
        this.getEmpleadoProceso();
      }
    });
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
            this.toastr.error('Empleado inactivo', 'Éxito');
          }
          this.getEmpleadoProceso();
        });
      
      }
    });
  }

  getEmpleado(id:number) {
    
    this._empleadoService.getEmpleado(id).subscribe((data: Empleado) => {

      console.log(data);

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

