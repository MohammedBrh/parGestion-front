import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./pages/home.component').then((m) => m.HomeComponent) },
  {
    path: 'attributions/new',
    loadComponent: () => import('./pages/attribution-form.component').then((m) => m.AttributionFormComponent),
  },
  {
    path: 'attributions/:id',
    loadComponent: () => import('./pages/attribution-detail.component').then((m) => m.AttributionDetailComponent),
  },
  { path: 'chauffeurs', loadComponent: () => import('./pages/drivers.component').then((m) => m.DriversComponent) },
  { path: 'voitures', loadComponent: () => import('./pages/cars.component').then((m) => m.CarsComponent) },
  { path: 'personnel', loadComponent: () => import('./pages/personnel.component').then((m) => m.PersonnelComponent) },
  { path: '**', redirectTo: '' },
];
