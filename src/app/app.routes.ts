import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('../app/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'brands',
    loadComponent: () =>
      import('../app/brand/brand.component').then((m) => m.BrandComponent),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('../app/categories/categories.component').then(
        (m) => m.CategoriesComponent
      ),
  },
  {
    path: 'category/create',
    loadComponent: () =>
      import(
        '../app/categories/create-category/create-category.component'
      ).then((m) => m.CreateCategoryComponent),
  },
  {
    path: 'category/update/:id',
    
  },
  {
    path: '**',
    loadComponent: () =>
      import('../app/components/pagenotfound/pagenotfound.component').then(
        (m) => m.PagenotfoundComponent
      ),
  },
];
