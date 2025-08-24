import { Routes } from '@angular/router';

// Export the routes array so it can be used in main.ts
export const routes: Routes = [
  { 
    path: 'movie/:id', 
    loadComponent: () => import('./components/movie-details/movie-details.component')
      .then(m => m.MovieDetailsComponent)
  },
  { 
    path: 'movie/:id-:titleSlug', 
    loadComponent: () => import('./components/movie-details/movie-details.component')
      .then(m => m.MovieDetailsComponent)
  },
  { 
    path: '',
    loadComponent: () => import('./components/home/home.component')
      .then(m => m.HomeComponent)
  },
  { path: '**', redirectTo: '' } // Default route
];
