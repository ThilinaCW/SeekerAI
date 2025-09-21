import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MovieListComponent } from '../movie-list/movie-list.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { SeoService } from '../../services/seo.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MovieListComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class HomeComponent implements OnInit {
  selectedQuality = 'all';
  selectedGenre = 'all';
  selectedRating = '0';
  searchKeyword = '';
  advancedSearchExpanded = false;

  private seoSubscription?: Subscription;

  constructor(
    private router: Router,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    this.setSeoMetadata();
    // Scroll to top of main container when component initializes
    this.scrollToMain();
  }

  private setSeoMetadata(): void {
    this.seoService.setTitle(' Magenet - Find Download and Stream Movies');
    this.seoService.setMetaDescription('Search and Download and Stream your favorite movies in high quality. Browse by genre, rating, and more.');
    this.seoService.setCanonicalUrl();
  }

  // Scroll to the top of the main container with offset for fixed navbar
  toggleAdvancedSearch(): void {
    this.advancedSearchExpanded = !this.advancedSearchExpanded;
  }

  onMovieSelect(movie: any): void {
    if (!movie || !movie.id) {
      console.error('Invalid movie object:', movie);
      return;
    }

    try {
      // Create a URL-friendly slug from the movie title
      const titleSlug = (movie.title || 'movie').toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/--+/g, '-')      // Replace multiple hyphens with single hyphen
        .trim()                    // Remove leading/trailing hyphens
        .substring(0, 50);         // Limit the length of the slug
      
      const movieUrl = `/movie/${movie.id}-${titleSlug}`;
      console.log('Navigating to:', movieUrl);
      
      // Navigate using the router
      this.router.navigateByUrl(movieUrl, { replaceUrl: true })
        .then(navigated => {
          if (!navigated) {
            console.warn('Navigation failed, falling back to window.location');
            window.location.href = movieUrl;
          }
        });
    } catch (error) {
      console.error('Error navigating to movie details:', error);
      // Fallback to just the ID if there's an error with the slug
      this.router.navigate(['/movie', movie.id]);
    }
  }

  private scrollToMain(): void {
    // Use setTimeout to ensure the DOM has been updated
    setTimeout(() => {
      const mainElement = document.querySelector('main');
      const navbar = document.querySelector('.main-header');
      const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
      
      if (mainElement) {
        const elementPosition = mainElement.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - navbarHeight - 20; // 20px additional padding
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else {
        // Fallback to top of page if element is not found
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 0);
  }

  applyFilters(): void {
    // Force update the search keyword in movie list component
    if (this.movieListComponent) {
      this.movieListComponent.applySearch(this.searchKeyword);
    }
  }

  clearAllFilters(): void {
    // Reset all filter values to their defaults
    this.selectedQuality = 'all';
    this.selectedGenre = 'all';
    this.selectedRating = '0';
    this.searchKeyword = '';
    
    // Apply the cleared filters
    this.applyFilters();
  }

  // Reference to the MovieListComponent
  @ViewChild(MovieListComponent) movieListComponent!: MovieListComponent;

  // Generate an array of years from start to end (inclusive)
  getYearRange(start: number, end: number): number[] {
    const years: number[] = [];
    for (let year = start; year >= end; year--) {
      years.push(year);
    }
    return years;
  }


}
