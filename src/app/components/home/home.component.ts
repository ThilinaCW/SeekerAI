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
  selectedLanguage = 'all';
  searchKeyword = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize component
  }

  applyFilters(): void {
    // Force update the search keyword in movie list component
    if (this.movieListComponent) {
      this.movieListComponent.applySearch(this.searchKeyword);
    }
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
