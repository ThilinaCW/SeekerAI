import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MovieListComponent } from '../movie-list/movie-list.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Scroll to top of main container when component initializes
    this.scrollToMain();
  }

  // Scroll to the top of the main container with offset for fixed navbar
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

  onMovieSelect(movieId: number): void {
    this.router.navigate(['/movie', movieId]).catch(error => {
      console.error('Navigation error:', error);
    });
  }

  // Generate an array of years from start to end (inclusive)
  getYearRange(start: number, end: number): number[] {
    const years: number[] = [];
    for (let year = start; year >= end; year--) {
      years.push(year);
    }
    return years;
  }


}
