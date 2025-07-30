import { Routes } from '@angular/router';

// Export the routes array so it can be used in main.ts
export const routes: Routes = [
  { 
    path: 'movie/:id', 
    loadComponent: () => import('./components/movie-details/movie-details.component')
      .then(m => m.MovieDetailsComponent)
  },
  { 
    path: '',
    loadComponent: () => import('./app.component')
      .then(m => m.AppComponent)
  },
  { path: '**', redirectTo: '' } // Default route
];
