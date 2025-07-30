import { Component, OnInit } from '@angular/core';
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
  selectedYear = 'all';
  selectedRating = 'all';
  selectedLanguage = 'all';
  searchKeyword = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize component
  }

  applyFilters(): void {
    // This will be handled by the MovieListComponent
  }

  onMovieSelect(movieId: number): void {
    this.router.navigate(['/movie', movieId]).catch(error => {
      console.error('Navigation error:', error);
    });
  }
}
