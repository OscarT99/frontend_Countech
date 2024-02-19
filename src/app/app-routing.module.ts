
/*
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './shared/app.layout.component';
import { OlvidoContrasenaComponent } from './components/auth/olvido-contrasena/olvido-contrasena.component';
import { AuthGuard } from './auth.guard'; // Importa el guardia de enrutamiento

const routes: Routes = [
  {
    path: '', 
    redirectTo: '/auth/login', 
    pathMatch: 'full'
  },
  {
    path: '', 
    component: AppLayoutComponent,
    canActivate: [AuthGuard], // Aplica el guardia de enrutamiento a este conjunto de rutas
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

*/



import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './shared/app.layout.component';
import { OlvidoContrasenaComponent } from './components/auth/olvido-contrasena/olvido-contrasena.component'; 
import { LoginComponent } from './components/auth/login/login.component';
import { AuthGuard } from './guards/auth.guard';

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
    path: 'olvidoContrasena', 
    component: OlvidoContrasenaComponent 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
