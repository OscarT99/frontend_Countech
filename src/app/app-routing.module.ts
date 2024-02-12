
/*
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './shared/app.layout.component';
import { OlvidoContrasenaComponent } from './components/auth/olvido-contrasena/olvido-contrasena.component'; 
import { LoginComponent } from './components/auth/login/login.component';
// const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot([
    {
    path: '', component: AppLayoutComponent,
    children:[
      //{path:'',loadChildren:()=>import('./components/pages/inicio/inicio.module').then(m => m.InicioModule)},
      {path: '', redirectTo: 'LoginComponent', pathMatch: 'full'},
      {path:'pages',loadChildren:()=>import('./components/pages/pages.modules').then(m => m.PagesModule)}
      
    ]

    
  },
  //{ path: 'auth', loadChildren: () => import('/components/auth/auth.module').then(m => m.AuthModule) },
  { path: 'auth', loadChildren: () => import('./components/auth/auth.module').then(m => m.AuthModule) },
  { path: 'olvidoContrasena', component: OlvidoContrasenaComponent },
  
])],
  exports: [RouterModule]
})
export class AppRoutingModule { }
*/


import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './shared/app.layout.component';
import { OlvidoContrasenaComponent } from './components/auth/olvido-contrasena/olvido-contrasena.component'; 
import { LoginComponent } from './components/auth/login/login.component';

const routes: Routes = [
  {
    path: '', 
    redirectTo: '/auth/login', // Redirige la ruta vacía al LoginComponent
    pathMatch: 'full'
  },
  {
    path: '', 
    component: AppLayoutComponent,
    children: [
      { path: 'pages', loadChildren: () => import('./components/pages/pages.modules').then(m => m.PagesModule) }
    ]
  },
  { 
    path: 'auth', 
    loadChildren: () => import('./components/auth/auth.module').then(m => m.AuthModule) 
  },
  { 
    path: 'olvidoContrasena', 
    component: OlvidoContrasenaComponent 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
