  import {Component, ElementRef, OnInit, ViewChild } from '@angular/core';
  import { ToastrService } from 'ngx-toastr';
  import { ActivatedRoute, Router } from '@angular/router';
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

    formPedido: FormGroup;

    pedido: PedidoInstance = {};
    id: number = 0;
    
    clientes: Cliente[] = [];
    sugerenciasClientes: Cliente[] = [];
    campoBusqueda: string = '';

    totalNeto: number = 0;

    procesosReferencia: ProcesoReferenciaPedidoInstance[] = [];     
    coloresEnProceso: ColorProcesoReferenciaPedidoInstance[] = []
    @ViewChild('procesoInput') procesoInput: ElementRef | undefined;
    
    constructor(private fb: FormBuilder,
      private _pedidoService: PedidoService,
      private toastr: ToastrService,
      private aRouter: ActivatedRoute,
      private _clienteService: ClienteService,
      private router : Router,
    ) { 
      this.formPedido = this.fb.group({        
        cliente:['',Validators.required],
        ordenTrabajo:['',Validators.required],
        fechaOrdenTrabajo:['',Validators.required],
        fechaEntregaOrden:['',Validators.required],
        referencia:['',Validators.required],
        descripcion:['',Validators.required],
        valorUnitario:['',Validators.required],
        proceso:['',Validators.required],
        tipoDeMaquina:['',Validators.required],
        formaPago:[],        
        coloresSeleccionados:['',Validators.required],
        contacto: [{ value: '', disabled: true }],
        totalNeto: [{ value: 0, disabled: true }]
      })
      this.aRouter.params.subscribe(params => {
        this.id = +params['id']; // Obtén el valor del parámetro 'id' de la URL y actualiza id
      });      
    }

    ngOnInit(): void {
      this.aRouter.params.subscribe(params => {
        this.id = +params['id'];

        if (this.id !== 0) {
          this.obtenerListaClientes();
          this.getPedido(this.id)          
        } else {
          this.obtenerListaClientes();
        }
      });


    }

    obtenerListaClientes(): void {
      this._clienteService.getListClientesPedido().subscribe(
        (data: { listClientes: Cliente[] }) => {
          this.sugerenciasClientes = data.listClientes;
        },
        (error: any) => {
          console.error(error);
        }
      );
    }

    buscarClientes(event: any): void {
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
      this.formPedido.get('cliente')!.setValue(clienteId);
    
      const clienteSeleccionado = this.sugerenciasClientes.find(c => c.id === clienteId);
    
      if (clienteSeleccionado) {
        this.formPedido.get('contacto')!.setValue(clienteSeleccionado.contacto || '');
      }
    }

    // Asignar la lista de colores a cada objeto de proceso
    // this.procesosReferencia.forEach(proceso => {
    //   proceso.ColorEnProcesoEnReferenciaEnPedidos = this.coloresEnProceso;
    // });
        
  
    
    agregarProceso(): void {
      const proceso = this.formPedido.value.proceso;
      const tipoDeMaquina = this.formPedido.value.tipoDeMaquina;
    
      if (!proceso || !tipoDeMaquina) { 
        this.toastr.warning('Complete los campos del proceso.');
        return;
      }
    
      const nuevoProceso: ProcesoReferenciaPedidoInstance = {      
        proceso: proceso,
        tipoDeMaquina: tipoDeMaquina ,
        ColorEnProcesoEnReferenciaEnPedidos: [], 
      };
    
      this.procesosReferencia.push(nuevoProceso);
    
      this.formPedido.get('proceso')!.reset();
      this.formPedido.get('tipoDeMaquina')!.reset();

      if (this.procesoInput) {
        this.procesoInput.nativeElement.focus();
      }
    }
      
  
    getPedido(id:number){
      this._pedidoService.getPedido(id).subscribe((data:PedidoInstance) => {        
        console.log(data)
        this.formPedido.patchValue({
          cliente:data.cliente,
          ordenTrabajo:data.ordenTrabajo,          
          fechaOrdenTrabajo: data.fechaOrdenTrabajo,
          fechaEntregaOrden: data.fechaEntregaOrden,
          formaPago:data.formaPago          
        })
      })
    }
    
    addPedido(){      
      const pedido : PedidoInstance = {
        cliente: this.formPedido.value.cliente,
        ordenTrabajo:this.formPedido.value.ordenTrabajo,
        fechaOrdenTrabajo:this.formPedido.value.fechaOrdenTrabajo,
        fechaEntregaOrden:this.formPedido.value.fechaEntregaOrden,
        formaPago:this.formPedido.value.formaPago,
        valorTotal:this.formPedido.value.valorTotal,
        observaciones:this.formPedido.value.observaciones,
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
    }
      
    eliminarProceso(index: number): void {
      if (this.procesosReferencia.length > 1) {
        this.procesosReferencia.splice(index, 1);
      } else {
        this.toastr.warning('Debe haber al menos un proceso.');
      }
    }
    
    
  }
