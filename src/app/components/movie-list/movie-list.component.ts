import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YtsApiService } from '../../services/yts-api.service';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.css']
})
export class MovieListComponent implements OnInit {
  movies: Movie[] = [];
  loading: boolean = true;
  error: string | null = null;
  skeletonItems = Array(8).fill(0); // Create 8 skeleton items
  currentPage: number = 1;
  totalMovies: number = 0;
  totalPages: number = 0;

  // Private properties with default values
  private _pageNumber: number = 1;
  private _pageSize: number = 20;
  private _qualityFilter: string = 'all';
  private _genreFilter: string = 'all';
  private _ratingFilter: number = 0;
  private _orderByFilter: string = 'latest';
  private _searchKeyWord: string = '';
  private _previousSearchKeyWord: string = '';
  private _selectedLanguage: string = 'All';
  private _previousFilters: {
    quality: string;
    genre: string;
    rating: number;
    orderBy: string;
    language: string;
  } = {
    quality: 'all',
    genre: 'all',
    rating: 0,
    orderBy: 'latest',
    language: 'All'
  };

  @Output() movieSelected = new EventEmitter<number>();

  @Input() set pageNumber(value: number) { this._pageNumber = value; }
  get pageNumber(): number { return this._pageNumber; }

  @Input() set pageSize(value: number) { this._pageSize = value; }
  get pageSize(): number { return this._pageSize; }

  @Input() set qualityFilter(value: string) { 
    this._qualityFilter = value || 'all'; 
    this.checkAndReload();
  }
  get qualityFilter(): string { return this._qualityFilter; }

  @Input() set genreFilter(value: string) { 
    this._genreFilter = value || 'all'; 
    this.checkAndReload();
  }
  get genreFilter(): string { return this._genreFilter; }

  @Input() set ratingFilter(value: number) { 
    this._ratingFilter = value || 0; 
    this.checkAndReload();
  }
  get ratingFilter(): number { return this._ratingFilter; }

  @Input() set orderByFilter(value: string) { 
    this._orderByFilter = value || 'latest'; 
    this.checkAndReload();
  }
  get orderByFilter(): string { return this._orderByFilter; }

  @Input() set selectedLanguage(value: string) {
    this._selectedLanguage = value || 'All';
    this.checkAndReload();
  }
  get selectedLanguage(): string { return this._selectedLanguage; }

  @Input() set searchKeyWord(value: string) {
    // Only update the search keyword without triggering a reload
    const newValue = value || '';
    if (this._searchKeyWord !== newValue) {
      this._searchKeyWord = newValue;
      // Don't call checkAndReload here anymore
    }
  }
  get searchKeyWord(): string { 
    return this._searchKeyWord; 
  }

  // Method to be called when Apply Filter is clicked
  applySearch(searchTerm: string): void {
    const newValue = searchTerm || '';
    if (this._searchKeyWord !== newValue) {
      this._searchKeyWord = newValue;
    } else if (newValue === '') {
      // If search term is empty, still trigger reload to clear any previous search
    }
    this.checkAndReload();
  }

  constructor(private ytsApiService: YtsApiService) { }

  ngOnInit(): void {
    this.loadMovies();
  }

  private checkAndReload(): void {
    // Only reload if the search keyword or filters have changed
    if (this._searchKeyWord !== this._previousSearchKeyWord || 
        this._previousFilters.quality !== this._qualityFilter ||
        this._previousFilters.genre !== this._genreFilter ||
        this._previousFilters.rating !== this._ratingFilter ||
        this._previousFilters.orderBy !== this._orderByFilter ||
        this._previousFilters.language !== this._selectedLanguage) {
      
      this._previousSearchKeyWord = this._searchKeyWord;
      this._previousFilters = {
        quality: this._qualityFilter,
        genre: this._genreFilter,
        rating: this._ratingFilter,
        orderBy: this._orderByFilter,
        language: this._selectedLanguage
      };
      
      this._pageNumber = 1; // Reset to first page on new search/filter
      this.loadMovies();
    }
  }

  loadMovies(): void {
    this.loading = true;
    this.error = null;

    // Define the base parameters with proper typing
    const baseParams: any = {
      page: this._pageNumber,
      limit: this._pageSize,
      quality: this._qualityFilter !== 'all' ? this._qualityFilter : undefined,
      genre: this._genreFilter !== 'all' ? this._genreFilter : undefined,
      minimum_rating: this._ratingFilter > 0 ? this._ratingFilter : undefined,
      query_term: this._searchKeyWord || undefined,
      order_by: this._orderByFilter,
      with_rt_ratings: true,
      language: this._selectedLanguage !== 'All' ? this._selectedLanguage : undefined
    };

    // Create a new object with only defined parameters
    const params: Record<string, any> = { ...baseParams };

    // Year filter has been removed as per user request

    this.ytsApiService.getMovies(params).subscribe({
      next: (response: any) => {
        if (response?.data?.movies) {
          this.movies = response.data.movies;
          this.totalMovies = response.data.movie_count;
          this.totalPages = Math.ceil(this.totalMovies / this._pageSize);
        } else {
          this.movies = [];
          this.totalMovies = 0;
          this.totalPages = 0;
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading movies:', err);
        this.error = 'Failed to load movies. Please try again later.';
        this.loading = false;
        this.movies = [];
        this.totalMovies = 0;
        this.totalPages = 0;
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this._pageNumber = page;
      this.loadMovies();
    }
  }

  onMovieSelect(movieId: number): void {
    this.movieSelected.emit(movieId);
  }

  /**
   * Navigate to the previous page if not on the first page
   */
  prevPage(): void {
    if (this.pageNumber > 1) {
      this.pageNumber = this.pageNumber - 1;
      this.loadMovies();
    }
  }

  /**
   * Navigate to the next page if not on the last page
   */
  nextPage(): void {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber = this.pageNumber + 1;
      this.loadMovies();
    }
  }

  /**
   * Navigate to a specific page number
   * @param page The page number to navigate to
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNumber = page;
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
  openMovieDetails(movieId: number): void {
    // Emit the selected movie ID to parent component
    this.movieSelected.emit(movieId);
  }
}


