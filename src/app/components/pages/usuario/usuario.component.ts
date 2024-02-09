import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { UsuarioService } from 'src/app/services/usuario/usuario.service'; 
import { Usuario } from 'src/app/interfaces/usuario/usuario.interface';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as XLSX from 'xlsx';



@Component({
    templateUrl: './usuario.component.html',
    
})
export class UsuarioComponent implements OnInit {
    listUsuarios: Usuario[] = []
    usuario: Usuario = {}
    formUsuario:FormGroup;
    id:number=0;

    valSwitch: boolean = false;
    showConfirmationDialog: boolean = false;
    usuarioSeleccionado: Usuario | null = null;
    switchState: boolean | undefined = undefined;


    estado:SelectItem[] = [
      { label: 'Activo', value: true },
      { label: 'Inactivo', value: false }
    ];
    selectedEstado: SelectItem = {value: ''};

    productDialog: boolean = false;
    
    rowsPerPageOptions = [5, 10, 15];
    
    constructor(private fb:FormBuilder,
      private _usuarioService: UsuarioService,
      private toastr: ToastrService,      
      private aRouter:ActivatedRoute,
      ){
        this.formUsuario = this.fb.group({
          nombre: ['',Validators.required],
          cedula: ['',Validators.required],
          email: ['',Validators.required],
          contrasena: ['',],
          estado: ['',],
        })
        this.aRouter.params.subscribe(params => {
          this.id = +params['id']; // Obtén el valor del parámetro 'id' de la URL y actualiza id
        });
    }

    ngOnInit():void {        
        this.getListUsuarios()
                      
    }

    
    getListUsuarios(){     
        this._usuarioService.getListUsuarios().subscribe((data:any) =>{      
          this.listUsuarios = data.listUsuarios;          
        })        
    }


    getUsuario(id:number){      
      this._usuarioService.getUsuario(id).subscribe((data:Usuario) => {
        console.log(data)
        this.formUsuario.setValue({
          nombre: data.nombre,
          cedula: data.cedula,
          email: data.email,
          contrasena: data.contrasena,
          estado: data.estado
        })
      })
    }


    addUsuario(){
      this.formUsuario.markAllAsTouched();

      if (this.formUsuario.valid) {
        const usuario : Usuario = {
          nombre: this.formUsuario.value.nombre,
          cedula: this.formUsuario.value.cedula,
          email: this.formUsuario.value.email,
          contrasena: this.formUsuario.value.cedula
        }
  
        if(this.id !== 0){
        usuario.id = this.id
        this._usuarioService.putUsuario(this.id,usuario).subscribe(()=>{         
          this.productDialog = false;
          this.toastr.info(`El usuario ${usuario.nombre} fue actualizado con éxito`,`Usuario actualizado`)
          this.getListUsuarios();         
        })
        }else{            
        this._usuarioService.postUsuario(usuario).subscribe(() => {        
          this.productDialog = false;
          this.toastr.success(`El usuario ${usuario.nombre} fue registrado con éxito`,`Usuario agregado`)        
          this.getListUsuarios();
        })
        }
  
        this.productDialog = false;
    } else{
      this.toastr.error('Por favor, complete todos los campos obligatorios.', 'Error de validación');

    }

    }


    openNew() {
        this.id = 0;                
        this.formUsuario.reset()
        this.productDialog = true;
    }
    
    editProduct(id:number) {
        this.id=id;
        this.productDialog = true;
        this.getUsuario(id)
    }

    hideDialog() {
        this.productDialog = false;
    }

    cerrarModel(){
      this.productDialog = false;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    showConfirmation(usuario:Usuario) {
      this.switchState = usuario.estado;
      this.usuarioSeleccionado = usuario;
      this.showConfirmationDialog = true;      
    }
    
    confirmAction(confirmation: boolean) {
      if (confirmation && this.usuarioSeleccionado) {      
        if (this.usuarioSeleccionado.id) {
          this._usuarioService.putUsuario(this.usuarioSeleccionado.id, this.usuarioSeleccionado).subscribe(() => {
            if (this.usuarioSeleccionado!.estado !== undefined) {
              this.valSwitch = this.usuarioSeleccionado!.estado;
            }
          });
        }
      }
      this.showConfirmationDialog = false;
      this.usuarioSeleccionado = null;
    }
    
    exportToExcel() {
      const data: any[] = []; // Array para almacenar los datos
    
      // Agregar encabezados a la matriz de datos
      const headers = [
        'Nombre',
        'Cédula',
        'Email',
        'Estado'
      ];
    
      data.push(headers);
    
      // Agregar datos de cada fila a la matriz de datos
      this.listUsuarios.forEach(usuario => {
        const row = [
          usuario.nombre,
          usuario.cedula,
          usuario.email,
          usuario.estado? 'Activo' : 'Inactivo'
        ];
    
        data.push(row);
      });
    
      // Crear un libro de Excel
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
    
      // Guardar el libro de Excel como archivo
      XLSX.writeFile(wb, 'usuarios.xlsx');
    }
    
            
}
