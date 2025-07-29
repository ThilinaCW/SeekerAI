import { Component, ViewChild, OnInit } from '@angular/core';
import { MovieListComponent } from './components/movie-list/movie-list.component';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Seeker';

  @ViewChild(MovieListComponent)
  private movieListComponent!: MovieListComponent;

  // Filter properties
  selectedQuality: string = 'all';
  selectedGenre: string = 'all';
  selectedYear: string = 'All';
  selectedRating: number = 0;
  selectedLanguage: string = 'English';
  selectedOrderBy: string = 'latest';
  searchKeyword: string = '';
  showMovieList: boolean = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showMovieList = event.url === '/' || event.url === '';
    });
  }

  applyFilters(): void {
    if (this.movieListComponent) {
      this.movieListComponent.qualityFilter = this.selectedQuality;
      this.movieListComponent.genreFilter = this.selectedGenre;
      this.movieListComponent.ratingFilter = this.selectedRating;
      this.movieListComponent.orderByFilter = this.selectedOrderBy;
      this.movieListComponent.searchKeyWord = this.searchKeyword;
      this.movieListComponent.selectedYear = this.selectedYear;
      this.movieListComponent.selectedLanguage = this.selectedLanguage;
      this.movieListComponent.pageNumber = 1;
      this.movieListComponent.loadMovies();
    }
  }

  onMovieSelected(movieId: number): void {
    this.router.navigate(['/movie', movieId]);
  }
}