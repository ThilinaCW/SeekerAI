import { Component, ViewChild, OnInit } from '@angular/core';
import { MovieListComponent } from './components/movie-list/movie-list.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Seeker';

  @ViewChild(MovieListComponent)
  private movieListComponent!: MovieListComponent;

  // Filter properties (mirroring YTS.MX defaults initially)
  selectedQuality: string = 'all';
  selectedGenre: string = 'all';
  selectedYear: string = 'all';
  selectedRating: number = 0;
  selectedLanguage: string = 'English'; // Default language from YTS.MX homepage
  selectedOrderBy: string = 'latest';
  searchKeyword: string = '';

  ngOnInit(): void {
    // Initial load will be handled by movieListComponent's ngOnInit
  }

  applyFilters(): void {
    if (this.movieListComponent) {
      this.movieListComponent.qualityFilter = this.selectedQuality;
      this.movieListComponent.genreFilter = this.selectedGenre;
      this.movieListComponent.ratingFilter = this.selectedRating;
      this.movieListComponent.orderByFilter = this.selectedOrderBy;
      this.movieListComponent.searchKeyWord = this.searchKeyword;
      // Since 'year' and 'language' are new filters, we need to add them to movieListComponent
      // For now, let's just make sure the core filters are passed.

      this.movieListComponent.pageNumber = 1; // Reset to first page on new search
      this.movieListComponent.loadMovies();
    }
  }
}
