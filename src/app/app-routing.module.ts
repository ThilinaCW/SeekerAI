import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
