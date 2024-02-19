import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { InsumoService } from 'src/app/services/insumo/insumo.service';  
import { InsumoInstance } from 'src/app/interfaces/insumo/insumo.interface';  
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as XLSX from 'xlsx';
import { CategoriaInsumoInstance } from 'src/app/interfaces/insumo/categoriaInsumo.interface';
import { CategoriaInsumoService } from 'src/app/services/insumo/categoriaInsumo.service';
import { SalidaInsumoInstance } from 'src/app/interfaces/insumo/salidaInsumo.interface';
import { SalidaInsumoService } from 'src/app/services/insumo/salidaInsumo.service';

@Component({
    templateUrl: './insumo.component.html',
    
})
export class InsumoComponent implements OnInit {

    tipoMaquina: any[] = [
      { label: 'Fileteadora', value: 'Fileteadora' },
      { label: 'Plana', value: 'Plana' },
      { label: 'Presilladora', value: 'Presilladora' },
      { label: 'Recubridora', value: 'Recubridora' },
      { label: 'Manual', value: 'Manual' }
    ];

    listInsumosGastados: SalidaInsumoInstance[]=[]

    sugerenciasInsumos:InsumoInstance[]=[];

    showConfirmationSalidaInsumo:boolean = false;
  
    showConfirmationDialogInsumo: boolean = false;
    insumoSeleccionado: InsumoInstance | null = null;

    showConfirmationDialogCategoria: boolean = false;
    categoriaSeleccionado: CategoriaInsumoInstance | null = null;


    idInsumo:number=0;
    idCategoria:number=0;

    formCategoria:FormGroup;
    formInsumo:FormGroup;
    formSalidaInsumo:FormGroup;

    insumos: InsumoInstance[] = []
    categoriasDeInsumo: CategoriaInsumoInstance[] =[]

    modalCrearInsumo:  boolean = false;
    modalSalidaInsumo: boolean = false;

    modalCrearCategoria: boolean = false;
    
    sugerenciaCategoriasInsumo: CategoriaInsumoInstance[]=[]

    rowsPerPageOptions = [5, 10, 15];


    constructor(private fb:FormBuilder,
      private _insumoService:InsumoService,
      private toastr: ToastrService,      
      private aRouter:ActivatedRoute,
      private _categoriaInsumoService:CategoriaInsumoService,
      private _salidaInsumoService:SalidaInsumoService
      ){
      this.formCategoria=this.fb.group({
        nombre:['',Validators.required] 
      }),
      this.formInsumo=this.fb.group({
        categoria:['',Validators.required],
        nombre:['',Validators.required]
      }),
      this.formSalidaInsumo=this.fb.group({
        insumo:['',Validators.required],
        cantidad:[0,Validators.required],
        tipoDeMaquina:['',Validators.required]
      })
    }

    ngOnInit():void {                      
        this.getListInsumos();
        this.getListCategoriasDeInsumo();
        this.obtenerListaCategorias();
        this.obtenerListaInsumos();                          
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getListInsumos(){
        this._insumoService.getListInsumos().subscribe((data:any) => {
            this.insumos = data.listInsumos
        })
    }

    openNewInsumo() {
      this.idInsumo = 0;
      this.formInsumo.reset();
      this.modalCrearInsumo = true;
    }

    editInsumo(id: number) {
      this.idInsumo = id;
      this.modalCrearInsumo = true;
      this.getInsumo(id);
    }

    openSalidaInsumo(){
      this.modalSalidaInsumo = true
    }

    openNewCategoria() {
      this.idCategoria = 0;
      this.formCategoria.reset();
      this.modalCrearCategoria = true;
    }
  
    editCategoria(id: number) {
      this.idCategoria = id;
      this.modalCrearCategoria = true;
      this.getCategoria(id);
    }


    getListCategoriasDeInsumo(){
        this._categoriaInsumoService.getListCategoriasInsumo().subscribe((data:any) =>{
            this.categoriasDeInsumo = data.categoriasInsumo
        })        
    }



    addInsumo() {
      this.formInsumo.markAllAsTouched();
  
      if (this.formInsumo.valid) {
        const insumo: InsumoInstance = {
          nombre: this.formInsumo.value.nombre,
          categoria: this.formInsumo.value.categoria,
        };
  
        if (this.idInsumo !== 0) {
          insumo.id = this.idInsumo;
          this._insumoService.putInsumo(this.idInsumo, insumo).subscribe(() => {
            this.modalCrearInsumo = false;
            this.toastr.info(
              `El insumo ${insumo.nombre} fue actualizado con éxito`,
              `Insumo actualizado`
            );
            this.getListInsumos();
          });
        } else {
          this._insumoService.postInsumo(insumo).subscribe(() => {
            this.modalCrearInsumo = false;
            this.toastr.success(
              `El insumo ${insumo.nombre} fue registrado con éxito`,
              `Insumo agregado`
            );
            this.getListInsumos();
          });
        }
  
        this.modalCrearInsumo = false;
      } else {
        this.toastr.error(
          'Por favor, complete todos los campos obligatorios.',
          'Error de validación'
        );
      }
    }

    getInsumo(id: number) {
      this._insumoService.getInsumo(id).subscribe((data: InsumoInstance) => {
        this.formInsumo.setValue({
          nombre: data.nombre,
          categoria: data.categoria,
        });
      });
    }

    getCategoria(id: number) {
      this._categoriaInsumoService.getCategoriaInsumo(id).subscribe((data: CategoriaInsumoInstance) => {
        this.formCategoria.setValue({
          nombre: data.nombre,
        });
      });
    }

    addCategoria() {
      this.formCategoria.markAllAsTouched();
  
      if (this.formCategoria.valid) {
        const categoria: CategoriaInsumoInstance = {
          nombre: this.formCategoria.value.nombre,
        };
  
        if (this.idCategoria !== 0) {
          categoria.id = this.idCategoria;
          this._categoriaInsumoService.putCategoriaInsumo(this.idCategoria, categoria).subscribe(() => {
            this.modalCrearCategoria = false;
            this.toastr.info(
              `La categoría ${categoria.nombre} fue actualizada con éxito`,
              `Categoría actualizada`
            );
            this.getListCategoriasDeInsumo();
          });
        } else {
          this._categoriaInsumoService.postCategoriaInsumo(categoria).subscribe(() => {
            this.modalCrearCategoria = false;
            this.toastr.success(
              `La categoría ${categoria.nombre} fue registrada con éxito`,
              `Categoría agregada`
            );
            this.getListCategoriasDeInsumo();
          });
        }
  
        this.modalCrearCategoria = false;
      } else {
        this.toastr.error(
          'Por favor, complete todos los campos obligatorios.',
          'Error de validación'
        );
      }
    }


      obtenerListaCategorias(): void {
        this._categoriaInsumoService.getListCategorias().subscribe(
          (data: { categoriasInsumo: CategoriaInsumoInstance[] }) => {
            this.sugerenciaCategoriasInsumo = data.categoriasInsumo;
            console.log(this.sugerenciaCategoriasInsumo)
          },
          (error: any) => {
            console.error(error);
          }
        );
      }
    
      buscarCategorias(event: any): void {
        this.sugerenciaCategoriasInsumo = this.filterCategorias(event.query);
      }
      
      filterCategorias(query: string): CategoriaInsumoInstance[] {
        return this.sugerenciaCategoriasInsumo.filter(
          (categoria) =>
            categoria.nombre!.toLowerCase().includes(query.toLowerCase()) 
        );
      }
    
      seleccionarCategoria(event: any): void {
        const categoriaId = event.value.id;
        this.formInsumo.get('categoria')!.setValue(categoriaId);
      }


      confirmarCambioEstadoInsumo(insumo: InsumoInstance): void {
        this.insumoSeleccionado = insumo;
        this.showConfirmationDialogInsumo = true;
      }
    
      confirmActionInsumo(aceptar: boolean): void {
        if (aceptar && this.insumoSeleccionado && this.insumoSeleccionado.id !== undefined && this.insumoSeleccionado.estado !== undefined) {
          this.insumoSeleccionado.estado = !this.insumoSeleccionado.estado;
          this.toastr.success(
            `El estado del insumo ${this.insumoSeleccionado.nombre} ha sido cambiado con éxito.`,
            'Estado Cambiado'
          );
      
          this._insumoService.actualizarEstadoInsumo(this.insumoSeleccionado.id, this.insumoSeleccionado.estado)
            .subscribe();
        }
      
        this.showConfirmationDialogInsumo = false;
        this.insumoSeleccionado = null;
      }


      confirmarCambioEstadoCategoria(categoria: CategoriaInsumoInstance): void {
        this.categoriaSeleccionado = categoria;
        this.showConfirmationDialogCategoria = true;
      }
    
      confirmActionCategoria(aceptar: boolean): void {
        if (aceptar && this.categoriaSeleccionado && this.categoriaSeleccionado.id !== undefined && this.categoriaSeleccionado.estado !== undefined) {
          this.categoriaSeleccionado.estado = !this.categoriaSeleccionado.estado;
          this.toastr.success(
            `El estado de la categoria ${this.categoriaSeleccionado.nombre} ha sido cambiado con éxito.`,
            'Estado Cambiado'
          );
      
          this._categoriaInsumoService.actualizarEstadoCategoria(this.categoriaSeleccionado.id, this.categoriaSeleccionado.estado)
            .subscribe();
        }
      
        this.showConfirmationDialogCategoria = false;
        this.categoriaSeleccionado = null;
      }

      obtenerListaInsumos(): void {
        this._insumoService.getListInsumosCompra().subscribe(
          (data: { listInsumos: InsumoInstance[] }) => {
            this.sugerenciasInsumos = data.listInsumos;
          },
          (error: any) => {
            console.error(error);
          }
        );
      }

      buscarInsumos(event: any): void {
        this.sugerenciasInsumos = this.filterInsumos(event.query);
      }
      
      filterInsumos(query: string): InsumoInstance[] {
        return this.sugerenciasInsumos.filter(
          (insumo) =>
            insumo.nombre!.toLowerCase().includes(query.toLowerCase()) 
        );
      }
    
      seleccionarInsumo(event: any): void {
        const insumoId = event.value.id;
        this.formSalidaInsumo.get('insumo')!.setValue(insumoId);
      }

      addInsumoGastado(){
        this.formSalidaInsumo.markAllAsTouched();
  
        if (this.formSalidaInsumo.valid) {
            const salidaInsumo: SalidaInsumoInstance = {
              insumo:this.formSalidaInsumo.value.insumo,
              cantidad:this.formSalidaInsumo.value.cantidad,
              tipoDeMaquina:this.formSalidaInsumo.value.tipoDeMaquina
            }

            this.listInsumosGastados.push(salidaInsumo)

            this.formSalidaInsumo.reset({
              ...this.formSalidaInsumo.value,
              insumo: '',
              cantidad: 0,
              tipoDeMaquina: ''
            });
        }else{
          this.toastr.error(
            'Por favor, complete todos los campos obligatorios.',
            'Error de validación'
          );
        }

      }

      eliminarInsumoGastado(insumoGastado: SalidaInsumoInstance): void {
        const index = this.listInsumosGastados.indexOf(insumoGastado);
        
        if (index !== -1) {
          this.listInsumosGastados.splice(index, 1);          
        } else {
          console.error("No se encontró el insumo en la lista.");
        }
      }

      confirmActionSalidaInsumo(aceptar: boolean): void {
        if (aceptar) {
          for (const salidaInsumo of this.listInsumosGastados) {
            this._salidaInsumoService.postSalidaInsumo(salidaInsumo).subscribe(() => {
              this._insumoService.restarCantidadInsumo(salidaInsumo.insumo!, salidaInsumo.cantidad!)
                .subscribe(() => { 
                  this.getListInsumos();                 
                }, error => {
                  console.error('Error al restar cantidad del insumo:', error);
                });
            }, error => {
              console.error('Error al crear salida de insumo:', error);
            });
          }          
          this.formSalidaInsumo.reset();
          this.listInsumosGastados = [];
          this.showConfirmationSalidaInsumo = false;
          this.modalSalidaInsumo = false;          
          this.toastr.success(`La salida de los insumos fue registrada con éxito`, `Salida insumo registrada`);
          
        } else {
          this.showConfirmationSalidaInsumo = false;
        }
      }
      
      

      confirmarSalidaInsumo(){        
        if(this.listInsumosGastados.length < 1){
          this.formSalidaInsumo.markAllAsTouched();
          this.toastr.error(
            'Debes de agregar por lo menos un insumo.',
            'Error de validación'
          );
          return
        }
        
        this.showConfirmationSalidaInsumo = true
        
        
      }
     
}      
