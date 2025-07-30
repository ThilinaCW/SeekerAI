import { Component, ViewChild, OnInit } from '@angular/core';
import { MovieListComponent } from './components/movie-list/movie-list.component';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Seeker';

  @ViewChild(MovieListComponent, { static: false })
  private movieListComponent!: MovieListComponent;
  
  private searchParams: any = {};

  // Filter properties
  selectedQuality: string = 'all';
  selectedGenre: string = 'all';
  selectedYear: string = 'All';
  selectedRating: number = 0;
  selectedLanguage: string = 'English';
  selectedOrderBy: string = 'latest';
  searchKeyword: string = '';
  showMovieList: boolean = true;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // First, check for initial search parameters
    this.checkAndApplySearchParams();

    // Then subscribe to route changes
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const url = event.urlAfterRedirects || event.url;
      this.showMovieList = url === '/' || url === '' || url.startsWith('/?');
      this.checkAndApplySearchParams();
    });
  }

  private checkAndApplySearchParams(): void {
    const urlTree = this.router.parseUrl(this.router.url);
    const queryParams = urlTree.queryParams;
    
    // Store the search parameters
    this.searchParams = { ...queryParams };
    
    if (queryParams['q']) {
      const searchTerm = queryParams['q'].trim();
      if (searchTerm !== this.searchKeyword) {
        this.searchKeyword = searchTerm;
        // Update other filters from query params if they exist
        this.selectedQuality = queryParams['quality'] || 'all';
        this.selectedGenre = queryParams['genre'] || 'all';
        this.selectedYear = queryParams['year'] || 'All';
        this.selectedRating = queryParams['rating'] ? parseInt(queryParams['rating']) : 0;
        this.selectedLanguage = queryParams['language'] || 'English';
        this.selectedOrderBy = queryParams['order_by'] || 'latest';
        
        // Ensure we're on the home page to show results
        if (!this.showMovieList) {
          this.router.navigate(['/'], { 
            queryParams: this.searchParams,
            replaceUrl: true // Replace the current URL in history
          });
          return;
        }
        
        // Apply the filters to update the movie list
        this.applyFilters();
      }
    } else if (this.showMovieList && this.searchKeyword) {
      // Reset filters when navigating to home without search
      this.resetFilters();
    }
  }
  
  // Reset all filters to default values
  private resetFilters(): void {
    this.searchKeyword = '';
    this.selectedQuality = 'all';
    this.selectedGenre = 'all';
    this.selectedRating = 0;
    this.selectedOrderBy = 'latest';
    
    if (this.movieListComponent) {
      this.applyFilters();
    }
  }

  applyFilters(): void {
    if (this.movieListComponent) {
      // Reset to first page when applying new filters
      this.movieListComponent.pageNumber = 1;
      
      // Apply all filters to the movie list component
      this.movieListComponent.qualityFilter = this.selectedQuality;
      this.movieListComponent.genreFilter = this.selectedGenre;
      this.movieListComponent.ratingFilter = this.selectedRating;
      this.movieListComponent.orderByFilter = this.selectedOrderBy;
      this.movieListComponent.searchKeyWord = this.searchKeyword;
      this.movieListComponent.selectedYear = this.selectedYear;
      this.movieListComponent.selectedLanguage = this.selectedLanguage;
      
      // Force a reload of the movies with the new filters
      this.movieListComponent.loadMovies();
    }
  }

  onMovieSelected(movieId: number): void {
    // Open in a new tab
    const url = this.router.createUrlTree(['/movie', movieId]).toString();
    window.open(url, '_blank');
  }
}