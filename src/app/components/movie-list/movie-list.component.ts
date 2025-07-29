import { Component, OnInit, Input } from '@angular/core';
import { YtsApiService } from '../../services/yts-api.service';

export interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  genres: string[];
  medium_cover_image: string;
  // Add other properties you might need from the API response
}

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.css']
})
export class MovieListComponent implements OnInit {
  movies: Movie[] = [];
  totalMovies: number = 0;
  totalPages: number = 0;

  // Search parameters, now as @Input()
  @Input() pageNumber: number = 1;
  @Input() pageSize: number = 20;
  @Input() qualityFilter: string = 'all';
  @Input() genreFilter: string = 'all';
  @Input() ratingFilter: number = 0;
  @Input() orderByFilter: string = 'latest';
  @Input() searchKeyWord: string = '';
  @Input() selectedYear: string = 'All'; // Add this line
  @Input() selectedLanguage: string = 'All'; // Add this line

  constructor(private ytsApiService: YtsApiService) { }

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.ytsApiService.GetTimeLineMoviesList(
      this.pageNumber,
      this.pageSize,
      this.qualityFilter,
      this.genreFilter,
      this.ratingFilter,
      this.orderByFilter,
      this.searchKeyWord,
      this.selectedYear, // Pass selectedYear
      this.selectedLanguage // Pass selectedLanguage
    ).subscribe(
      (data) => {
        console.log('Full API Response:', data);
        if (data && data.data && data.data.movies) {
          console.log('Movies array from API:', data.data.movies);
          this.movies = data.data.movies;
          this.totalMovies = data.data.movie_count;
          this.totalPages = Math.ceil(this.totalMovies / this.pageSize);
        } else {
          console.log('No movies found or unexpected API response structure.');
          this.movies = [];
          this.totalMovies = 0;
          this.totalPages = 0;
        }
      },
      (error) => {
        console.error('Error fetching movies:', error);
        this.movies = [];
        this.totalMovies = 0;
        this.totalPages = 0;
      }
    );
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNumber = page;
      this.loadMovies();
    }
  }

  nextPage(): void {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.loadMovies();
    }
  }

  prevPage(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadMovies();
    }
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.pageNumber - 2);
    const endPage = Math.min(this.totalPages, this.pageNumber + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
