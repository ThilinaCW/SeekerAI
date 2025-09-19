import { Routes } from '@angular/router';

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
    path: 'about',
    loadComponent: () => import('./components/about/about.component')
      .then(m => m.AboutComponent)
  },
  { 
    path: 'sitemap',
    loadComponent: () => import('./sitemap/sitemap.component')
      .then(m => m.SitemapComponent)
  },
  { 
    path: '',
    loadComponent: () => import('./components/home/home.component')
      .then(m => m.HomeComponent),
    pathMatch: 'full'
  },
  // 404 - Not Found Route (must be the last route)
  { 
    path: '404',
    loadComponent: () => import('./components/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  },
  // Redirect all other routes to 404
  { 
    path: '**',
    redirectTo: '/404'
  }
];
