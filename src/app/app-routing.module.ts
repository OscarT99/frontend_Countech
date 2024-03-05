import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './shared/app.layout.component';
import { OlvidoContrasenaComponent } from './components/auth/olvido-contrasena/olvido-contrasena.component';
import { AuthGuard } from './guards/auth.guard';
import { CambiarContrasenaComponent } from './components/auth/cambiar-contrasena/cambiar-contrasena.component';

const routes: Routes = [
  {
    path: '', 
    redirectTo: '/auth/login', 
    pathMatch: 'full'
  },
  {
    path: '', 
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'pages', loadChildren: () => import('./components/pages/pages.modules').then(m => m.PagesModule) }
    ]
  },
  { 
    path: 'auth', 
    loadChildren: () => import('./components/auth/auth.module').then(m => m.AuthModule) 
  },
  {
    path: 'cambiar-contrasena/:token',
    component: CambiarContrasenaComponent,
  },
  { 
    path: 'olvidoContrasena', 
    component: OlvidoContrasenaComponent 
  },
  // Ruta de captura para rutas desconocidas
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


/*


import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './shared/app.layout.component';
import { LoginComponent } from './components/auth/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { CambiarContrasenaComponent } from './components/auth/cambiar-contrasena/cambiar-contrasena.component';

const routes: Routes = [
  {
    path: '', 
    redirectTo: '/auth/login', 
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
    path: 'cambiar-contrasena/:token',
    component: CambiarContrasenaComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }*/