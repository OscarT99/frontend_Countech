  import {Component, ElementRef, OnInit, ViewChild } from '@angular/core';
  import { ToastrService } from 'ngx-toastr';
  import { ActivatedRoute, Router } from '@angular/router';
  import { ConfirmationService } from 'primeng/api';

  import { SelectItem } from 'primeng/api';


  import { v4 as uuidv4 } from 'uuid';
  
  import { PedidoService } from 'src/app/services/pedido/pedido.service';
  import { PedidoInstance } from 'src/app/interfaces/pedido/pedido.interface';
  import { ProcesoReferenciaPedidoInstance } from 'src/app/interfaces/pedido/procesoReferenciaPedido.interface';
  import { ColorProcesoReferenciaPedidoInstance } from 'src/app/interfaces/pedido/colorProcesoReferenciaPedido.interface';
  
  import { ClienteService } from 'src/app/services/cliente/cliente.service';
  import { Cliente } from 'src/app/interfaces/cliente/cliente.interface';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';

  @Component({
    templateUrl: './add.pedido.component.html',
  })
  export class AddPedidoComponent implements OnInit {
    
    listPedidos: PedidoInstance[] = []

    id: number = 0;
    mostrarID:boolean=false;

    formPedido: FormGroup;

    clientes: Cliente[] = [];
    sugerenciasClientes: Cliente[] = [];
    campoBusqueda: string = '';

    maxDate: Date = new Date();
    minDate: Date = new Date();

    totalNeto: number = 0;

    pedido: PedidoInstance = {};
    procesosReferencia: ProcesoReferenciaPedidoInstance[] = [];     
    coloresEnProceso: ColorProcesoReferenciaPedidoInstance[] = []
    @ViewChild('procesoInput') procesoInput: ElementRef | undefined;
    @ViewChild('colorInput') colorInput: ElementRef | undefined;
    
    totalTallaS: number = 0;
    totalTallaM: number = 0;
    totalTallaL: number = 0;
    totalTallaXL: number = 0;
    totalGeneral: number = 0;

    tipoMaquina: any[] = [
      { label: 'Fileteadora', value: 'Fileteadora' },
      { label: 'Plana', value: 'Plana' },
      { label: 'Presilladora', value: 'Presilladora' },
      { label: 'Recubridora', value: 'Recubridora' },
      { label: 'Manual', value: 'Manual' }
    ];
    
    formaPago: SelectItem[] = [
      { label: 'Crédito', value: 'Crédito' },
      { label: 'Contado', value: 'Contado' }
    ];
        
    constructor(private fb: FormBuilder,
      private aRouter: ActivatedRoute,
      private router: Router,
      private _pedidoService: PedidoService,
      private toastr: ToastrService,
      private _clienteService: ClienteService,
      private confirmationService: ConfirmationService,
    ) { 
      this.formPedido = this.fb.group({        
        cliente:['',Validators.required],
        razonSocial:['',Validators.required],
        contacto: [{ value: '', disabled: true }],
        ordenTrabajo:['',Validators.required],
        fechaOrdenTrabajo:['',Validators.required],
        fechaEntregaOrden:['',Validators.required],
        referencia:['',Validators.required],
        descripcion:['',Validators.required],
        valorUnitario:[0,Validators.required],
        proceso:['',Validators.required],
        tipoDeMaquina:['',Validators.required],
        color:['',Validators.required],
        tallaS:[],
        tallaM:[],
        tallaL:[],
        tallaXL:[],
        formaPago:['',Validators.required],        
        totalNeto: [0],
        idTemporalColor:[null],
        idTemporalProceso:[null],        
      })            
    }

    ngOnInit(): void {
      this.aRouter.params.subscribe(params => {
        this.id = +params['id'];
      
        this.getListPedidos()  
        this.obtenerListaClientes();

        this.formPedido.get('cliente')?.valueChanges.subscribe(() => {
          this.validarOrdenTrabajo();
        });
      
        if (this.id !== 0) {
          this.getPedido(this.id) 
        } 
        
      });
    }

    getListPedidos(){     
      this._pedidoService.getListPedidos().subscribe((data:any) =>{              
        this.listPedidos = data.listaPedidos; 
        console.log(this.listPedidos);
      })        
  }
    
    getPedido(id: number) {
      this._pedidoService.getPedido(id).subscribe((data: PedidoInstance) => {
        console.log(data.ProcesoEnReferenciaEnPedidos);
        this.formPedido.patchValue({
          cliente:data.cliente,
          razonSocial: data.Cliente!.razonSocial,
          ordenTrabajo: data.ordenTrabajo,
          fechaOrdenTrabajo: data.fechaOrdenTrabajo,
          fechaEntregaOrden: data.fechaEntregaOrden,
          formaPago: data.formaPago,
          referencia: data.referencia,
          descripcion: data.descripcion,
          valorUnitario: data.valorUnitario,
          observaciones: data.observaciones,
          totalNeto: data.valorTotal,
        });
    
        // Asignar la lista de procesos
        this.procesosReferencia = data.ProcesoEnReferenciaEnPedidos || [];
    
        // Agregar la lista de colores del primer proceso, si existe
        const primerProceso = this.procesosReferencia[0];
        if (primerProceso && primerProceso.ColorEnProcesoEnReferenciaEnPedidos) {
          this.coloresEnProceso = primerProceso.ColorEnProcesoEnReferenciaEnPedidos.map(color => ({
            id: color.id, // Ajustar según tu modelo
            color: color.color,
            tallaS: color.tallaS,
            tallaM: color.tallaM,
            tallaL: color.tallaL,
            tallaXL: color.tallaXL,
            cantidadTotal: color.cantidadTotal,
          }));
    
          // Calcular las sumatorias
          this.totalTallaS = this.coloresEnProceso.reduce((sum, color) => sum + (color.tallaS || 0), 0);
          this.totalTallaM = this.coloresEnProceso.reduce((sum, color) => sum + (color.tallaM || 0), 0);
          this.totalTallaL = this.coloresEnProceso.reduce((sum, color) => sum + (color.tallaL || 0), 0);
          this.totalTallaXL = this.coloresEnProceso.reduce((sum, color) => sum + (color.tallaXL || 0), 0);
        } else {
          this.coloresEnProceso = [];
          this.totalTallaS = 0;
          this.totalTallaM = 0;
          this.totalTallaL = 0;
          this.totalTallaXL = 0;
        }
        this.totalGeneral = this.totalTallaL+this.totalTallaM+this.totalTallaS+this.totalTallaXL
      });
    }
    
    
    
      /////   METODOS PARA ESCOGER EL CLIENTE
      obtenerListaClientes(): void {
        this._clienteService.getListClientesPedido().subscribe(
          (data: { listClientes: Cliente[] }) => {
            this.sugerenciasClientes = data.listClientes.filter(cliente => cliente.estado);
          },
          (error: any) => {
            console.error(error);
          }
        );
      }
      

      buscarClientes(event: any): void {
        if (!event.query) {
          this.obtenerListaClientes();
        }
        this.sugerenciasClientes = this.filterClientes(event.query);
      }
      

    
    filterClientes(query: string): Cliente[] {
      return this.sugerenciasClientes.filter(
        (cliente) =>
          cliente.razonSocial!.toLowerCase().includes(query.toLowerCase()) ||
          cliente.nombreComercial!.toLowerCase().includes(query.toLowerCase()) ||
          cliente.numeroIdentificacion!.toLowerCase().includes(query.toLowerCase())
      );
    }
  
    seleccionarCliente(event: any): void {
      const clienteId = event.value.id;
      const clienteRazonSocial = event.value.razonSocial; 

      this.formPedido.get('cliente')!.setValue(clienteId);
      this.formPedido.get('razonSocial')!.setValue(clienteRazonSocial);

      const clienteSeleccionado = this.sugerenciasClientes.find(c => c.id === clienteId);
    
      if (clienteSeleccionado) {
        this.formPedido.get('contacto')!.setValue(clienteSeleccionado.contacto || '');
      }        

        // Actualizar la validación al cambiar el cliente
      this.validarOrdenTrabajo();
    }

    realizarBusquedaEnTiempoReal(event: any): void {
      const query = event.target.value;
      this.obtenerListaClientes(); // Obtener la lista completa de clientes
      this.sugerenciasClientes = this.filterClientes(query);
  }

    /////   METODOS PARA CREAR,MODIFICAR,ELIMINAR UN PROCESO
    agregarProceso(): void {
      const proceso = this.formPedido.value.proceso;
      const tipoDeMaquina = this.formPedido.value.tipoDeMaquina;
      const idTemporalProceso = this.formPedido.value.idTemporalProceso;
    
      if (!proceso || !tipoDeMaquina) { 
        this.toastr.warning('Complete los campos del proceso.');
        return;
      }
    
      if (idTemporalProceso) {
        // Actualizar el proceso existente
        const procesoExistente = this.procesosReferencia.find(p => p.idTemporal === idTemporalProceso);
        
        if (procesoExistente) {
          procesoExistente.proceso = proceso;
          procesoExistente.tipoDeMaquina = tipoDeMaquina;
        }
      } else {
        // Agregar un nuevo proceso
        const nuevoProceso: ProcesoReferenciaPedidoInstance = {    
          idTemporal:uuidv4(),  
          proceso: proceso,
          tipoDeMaquina: tipoDeMaquina,
          ColorEnProcesoEnReferenciaEnPedidos: [], 
        };
    
        this.procesosReferencia.push(nuevoProceso);
      }
    
      // Restablecer valores y marcar como no tocados
      this.formPedido.get('idTemporalProceso')?.setValue(null);
      this.formPedido.get('proceso')?.setValue(null);
      this.formPedido.get('tipoDeMaquina')?.setValue('');
      this.formPedido.get('proceso')?.markAsUntouched();
      this.formPedido.get('tipoDeMaquina')?.markAsUntouched();
    
      setTimeout(() => {
        if (this.procesoInput) {
          this.procesoInput.nativeElement.focus();
        }
      });
    
      // Limpiar mensajes de error
      this.formPedido.get('proceso')?.setErrors(null);
      this.formPedido.get('tipoDeMaquina')?.setErrors(null);
    }
    
    getProcesoModificar(proceso:ProcesoReferenciaPedidoInstance){
      this.formPedido.patchValue({
        proceso:proceso.proceso,
        tipoDeMaquina:proceso.tipoDeMaquina,
        idTemporalProceso:proceso.idTemporal
      })

      setTimeout(() => {
        if (this.procesoInput) {
          this.procesoInput.nativeElement.focus();
        }
      });
    }

    eliminarProceso(index: number): void {
      if (this.procesosReferencia.length > 1) {
        this.procesosReferencia.splice(index, 1);
      } else {
        this.toastr.warning('Debe haber al menos un proceso.');
      }
    }
    
    

    /////   METODOS PARA CREAR,MODIFICAR,ELIMINAR UN COLOR
    agregarColor(): void {
      const color = this.formPedido.value.color;
      const tallaS = this.formPedido.value.tallaS;
      const tallaM = this.formPedido.value.tallaM;
      const tallaL = this.formPedido.value.tallaL;
      const tallaXL = this.formPedido.value.tallaXL;
      const idTemporal = this.formPedido.value.idTemporalColor;
    
      if (!color) {
        this.toastr.warning('Ingresa un color.');
        return;
      }
    
      if ((tallaS + tallaM + tallaL + tallaXL) < 1) {
        this.toastr.warning('Ingresa al menos una cantidad en alguna talla.');
        return;
      }
    
      if (idTemporal !== null) {
        // Editar color existente
        const colorExistente = this.coloresEnProceso.find(c => c.idTemporal === idTemporal);
        if (colorExistente) {
          colorExistente.color = color;
          colorExistente.tallaS = tallaS;
          colorExistente.tallaM = tallaM;
          colorExistente.tallaL = tallaL;
          colorExistente.tallaXL = tallaXL;
          colorExistente.cantidadTotal = tallaS + tallaM + tallaL + tallaXL;
        }
      } else {
        // Agregar nuevo color
        const nuevoColor: ColorProcesoReferenciaPedidoInstance = {
          idTemporal: uuidv4(),
          color: color,
          tallaS: tallaS,
          tallaM: tallaM,
          tallaL: tallaL,
          tallaXL: tallaXL,
          cantidadTotal: tallaS + tallaM + tallaL + tallaXL
        };
    
        this.coloresEnProceso.push(nuevoColor);
      }
    
      // Actualizar sumatoria y valor total en el formulario
      this.actualizarSumatoriaYTotal();
    
      // Restablecer valores y marcar como no tocados
      this.formPedido.patchValue({
        color: null,
        tallaS: null,
        tallaM: null,
        tallaL: null,
        tallaXL: null,
        idTemporalColor: null  // Reiniciar el idTemporal después de la edición
      });
      this.formPedido.get('color')?.markAsUntouched();
    
      setTimeout(() => {
        if (this.colorInput) {
          this.colorInput.nativeElement.focus();
        }
      });
    
      // Limpiar mensajes de error
      this.formPedido.get('color')?.setErrors(null);
    }
        
    getColorModificar(color:ColorProcesoReferenciaPedidoInstance){
      this.formPedido.patchValue({
        color:color.color,
        tallaS:color.tallaS,
        tallaM:color.tallaM,
        tallaL:color.tallaL,
        tallaXL:color.tallaXL,
        idTemporalColor:color.idTemporal
      })

      setTimeout(() => {
        if (this.colorInput) {
          this.colorInput.nativeElement.focus();
        }
      });
    }

    eliminarColor(index: number): void {
      if (this.coloresEnProceso.length > 1) {
        const color = this.coloresEnProceso[index];
        
        // Restar los valores eliminados
        this.totalTallaS -= color.tallaS!;
        this.totalTallaM -= color.tallaM!;
        this.totalTallaL -= color.tallaL!;
        this.totalTallaXL -= color.tallaXL!;
        this.totalGeneral -= color.cantidadTotal!;
    
        // Actualizar valor total en el formulario
        this.formPedido.get('totalNeto')!.setValue(this.totalGeneral);
    
        // Eliminar color
        this.coloresEnProceso.splice(index, 1);
      } else {
        this.toastr.warning('Debe haber al menos un color.');
      }
    }
           
    

    ////  ACTUALIZAR VALORES DEL TOTALNETO
    private actualizarSumatoriaYTotal(): void {
      // Actualizar sumatoria
      this.totalTallaS = this.coloresEnProceso.reduce((sum, color) => sum + (color.tallaS || 0), 0);
      this.totalTallaM = this.coloresEnProceso.reduce((sum, color) => sum + (color.tallaM || 0), 0);
      this.totalTallaL = this.coloresEnProceso.reduce((sum, color) => sum + (color.tallaL || 0), 0);
      this.totalTallaXL = this.coloresEnProceso.reduce((sum, color) => sum + (color.tallaXL || 0), 0);
      this.totalGeneral = this.coloresEnProceso.reduce((sum, color) => sum + color.cantidadTotal!, 0);
    
      // Actualizar valor total en el formulario
      this.formPedido.get('totalNeto')!.setValue(this.totalGeneral * this.formPedido.value.valorUnitario);
    }



    /////   METODO  PARA AGREGAR EL PEDIDO A LA BASE DE DATOS   
    addPedido(){

      this.formPedido.markAllAsTouched();

      if(this.formPedido.valid){
        this.procesosReferencia.forEach(proceso => {
          proceso.ColorEnProcesoEnReferenciaEnPedidos = [...this.coloresEnProceso];
  
          proceso.cantidadTotal = this.totalGeneral;
        });
              
        const pedido : PedidoInstance = {
          cliente: this.formPedido.value.cliente,
          ordenTrabajo:this.formPedido.value.ordenTrabajo,
          fechaOrdenTrabajo:this.formPedido.value.fechaOrdenTrabajo,
          fechaEntregaOrden:this.formPedido.value.fechaEntregaOrden,
          referencia:this.formPedido.value.referencia,
          descripcion:this.formPedido.value.descripcion,
          valorUnitario:this.formPedido.value.valorUnitario,
          cantidadTotal:this.totalGeneral,
          formaPago:this.formPedido.value.formaPago,
          observaciones:this.formPedido.value.observaciones,
          ProcesoEnReferenciaEnPedidos:this.procesosReferencia
        }
  
        if(this.id !== 0){
          pedido.id = this.id
          this._pedidoService.putPedido(this.id,pedido).subscribe(()=>{
            this.router.navigate(['/pages/pedido']);
            this.toastr.info(`la orden de trabajo ${pedido.ordenTrabajo} fue actualizada con exito`,`Pedido actualizado`)
          })
        }else{
          this._pedidoService.postPedido(pedido).subscribe(()=>{
            this.router.navigate(['/pages/pedido']);
            this.toastr.success(`La orden de Trabajo ${pedido.ordenTrabajo} fue registrada con exito`,`Cliente agregado`)
          })
        }
      }else{
        this.toastr.error('Por favor, complete todos los campos obligatorios.', 'Error de validación');
      }      
    }




    mostrarConfirmacionSalir() {
      this.confirmationService.confirm({
        icon: 'pi pi-exclamation-triangle', 
        header: '¿Deseas salir de la creación?',
        message: 'Con esta acción perderás todos los cambios que no hayas guardado y no los podrás recuperar.',
        acceptLabel: 'Salir',
        rejectLabel: 'Cancelar',
        accept: () => {
          this.router.navigate(['/pages/pedido']);
        },
        reject: () => {
          // El usuario ha cancelado la acción, no hacer nada
        }
      });
    }



    validarOrdenTrabajo() {
      const ordenTrabajoControl = this.formPedido.get('ordenTrabajo');
      const ordenTrabajoValue = ordenTrabajoControl?.value;
    
      // Verificar si es requerido
      if (ordenTrabajoControl?.hasError('required')) {
        return;
      }

      const soloNumeros = /^[0-9]*$/;
      if (!soloNumeros.test(ordenTrabajoValue)) {
        // Si no es un número, establecer el error
        ordenTrabajoControl?.setErrors({ 'soloNumeros': true });
        return;
      }

      // Verificar la existencia en la lista de pedidos
      const ordenExistente = this.listPedidos.some(pedido => pedido.cliente == this.formPedido.value.cliente && pedido.ordenTrabajo == ordenTrabajoValue);
        
      if (ordenExistente) {
        ordenTrabajoControl?.setErrors({ 'ordenTrabajoExistente': true });
      } else {
        // Si la orden de trabajo no existe, asegúrate de borrar cualquier error anterior.
        ordenTrabajoControl?.setErrors(null);
      }
    }

    validarReferencia(){
      const referenciaControl = this.formPedido.get('referencia');
      const referenciaValue = referenciaControl?.value;
    
      // Verificar si es requerido
      if (referenciaControl?.hasError('required')) {
        return;
      }

      const soloNumeros = /^[0-9]*$/;
      if (!soloNumeros.test(referenciaValue)) {
        // Si no es un número, establecer el error
        referenciaControl?.setErrors({ 'soloNumeros': true });
        return;
      }      
    }
  }
