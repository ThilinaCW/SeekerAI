import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule, NavigationEnd } from '@angular/router';
import { YtsApiService } from '../../services/yts-api.service';
import { Movie, MovieListResponse, Torrent } from '../../models/movie.model';
import { filter } from 'rxjs/operators';
import { MovieListComponent } from '../movie-list/movie-list.component';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';
import { LanguagePipe } from '../../pipes/language.pipe';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    SafeUrlPipe, 
    SafeHtmlPipe,
    MovieListComponent,
    LanguagePipe
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [
        animate(300, style({ opacity: 1 }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('300ms ease-in', style({ transform: 'translateY(0%)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(100%)' }))
      ])
    ])
  ]
})
export class MovieDetailsComponent implements OnInit {
  @ViewChild('searchResults') searchResultsListComponent?: MovieListComponent;
  searchResultsList?: ElementRef;
  
  movie: Movie | null = null;
  similarMovies: Movie[] = [];
  loading = true;
  error: string | null = null;
  loadingSimilar = false;
  showFullDescription = false;
  truncatedDescription = '';
  isDownloadsDrawerOpen = false;
  searchKeyword = '';
  showSearchResults = false;
  
  // Screenshot slideshow properties
  currentScreenshotIndex = 0;
  private _screenshots: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private ytsApiService: YtsApiService,
    private router: Router
  ) {
    // Listen to route changes to handle back navigation
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // If navigating from search results, preserve the search query
      if (event.urlAfterRedirects.includes('/?q=') && this.router.getCurrentNavigation()?.extras?.state?.['searchTerm']) {
        this.searchKeyword = this.router.getCurrentNavigation()?.extras?.state?.['searchTerm'] || '';
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadMovieDetails(+id);
      }
    });
  }

  // Get all available screenshots from the movie object
  getScreenshots(): string[] {
    if (this._screenshots.length === 0 && this.movie) {
      // Filter out any undefined screenshot URLs
      this._screenshots = [
        this.movie.medium_screenshot_image1,
        this.movie.medium_screenshot_image2,
        this.movie.medium_screenshot_image3,
        this.movie.medium_screenshot_image4
      ].filter(Boolean) as string[];
    }
    return this._screenshots;
  }

  // Check if there are any screenshots available
  hasScreenshots(): boolean {
    return this.getScreenshots().length > 0;
  }

  // Get the current screenshot URL
  getCurrentScreenshot(): string | null {
    const screenshots = this.getScreenshots();
    return screenshots[this.currentScreenshotIndex] || null;
  }

  // Navigate to the next screenshot
  nextScreenshot(): void {
    const screenshots = this.getScreenshots();
    if (this.currentScreenshotIndex < screenshots.length - 1) {
      this.currentScreenshotIndex++;
    }
  }

  // Navigate to the previous screenshot
  prevScreenshot(): void {
    if (this.currentScreenshotIndex > 0) {
      this.currentScreenshotIndex--;
    }
  }

  // Go to a specific screenshot by index
  goToScreenshot(index: number): void {
    const screenshots = this.getScreenshots();
    if (index >= 0 && index < screenshots.length) {
      this.currentScreenshotIndex = index;
    }
  }

  private loadMovieDetails(id: number): void {
    this.loading = true;
    this.error = null;
    this.loadingSimilar = true;
    this.similarMovies = [];

    // Reset screenshot state
    this.currentScreenshotIndex = 0;
    this._screenshots = [];

    // Load movie details
    this.ytsApiService.getMovieDetails(id).subscribe({
      next: (response) => {
        this.movie = response.data.movie;
        this.truncateDescription();
        this.loading = false;
        
        // Load similar movies
        this.loadSimilarMovies(id);
      },
      error: (err) => {
        console.error('Error loading movie details:', err);
        this.error = 'Failed to load movie details. Please try again later.';
        this.loading = false;
        this.loadingSimilar = false;
      }
    });
  }

  loadSimilarMovies(movieId: number): void {
    this.loadingSimilar = true;
    this.ytsApiService.getSimilarMovies(movieId, 6).subscribe({
      next: (response) => {
        this.similarMovies = response.data.movies || [];
        this.loadingSimilar = false;
      },
      error: (err) => {
        console.error('Error loading similar movies:', err);
        this.loadingSimilar = false;
      }
    });
  }

  /**
   * Navigate to a movie's details page
   * @param movieId The ID of the movie to navigate to
   */
  navigateToMovie(movieId: number): void {
    this.router.navigate(['/movie', movieId], {
      state: { 
        searchTerm: this.searchKeyword,
        fromSimilar: true
      },
      replaceUrl: true
    }).then(() => {
      // Scroll to top of the page
      window.scrollTo(0, 0);
      // Reload the component to load the new movie
      this.ngOnInit();
    });
  }

  private truncateDescription(): void {
    if (!this.movie) return;
    
    const maxLength = 300;
    if (this.movie.description_full && this.movie.description_full.length > maxLength) {
      this.truncatedDescription = this.movie.description_full.substring(0, maxLength) + '...';
    } else if (this.movie.description_intro) {
      this.truncatedDescription = this.movie.description_intro;
    } else {
      this.truncatedDescription = 'No description available.';
    }
  }

  /**
   * Process and enhance movie data before displaying
   */
  private processMovieData(movie: any): Movie {
    // Process movie data if needed
    const processedMovie = { ...movie };
    
    // Set default images if not provided
    if (!processedMovie.background_image_original && processedMovie.background_image) {
      processedMovie.background_image_original = processedMovie.background_image;
    }
    
    if (!processedMovie.large_cover_image && processedMovie.medium_cover_image) {
      processedMovie.large_cover_image = processedMovie.medium_cover_image;
    }
    
    // Format runtime if available
    if (movie.runtime) {
      processedMovie.runtime = typeof movie.runtime === 'string' 
        ? parseInt(movie.runtime, 10) 
        : movie.runtime;
    }
    
    // Ensure rating is a number and properly formatted
    if (movie.rating) {
      processedMovie.rating = parseFloat(movie.rating.toFixed(1));
    }
    
    return processedMovie;
  }

  /**
   * Get YouTube embed URL for the trailer
   */
  getTrailerUrl(trailerCode: string): string {
    if (!trailerCode) return '';
    return `https://www.youtube.com/embed/${trailerCode}?autoplay=0&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1`;
  }

  /**
   * Format file size in a human-readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Navigate back to the movie list
   */
  goBack(): void {
    this.router.navigate(['/']);
  }

  toggleDownloadsDrawer(): void {
    this.isDownloadsDrawerOpen = !this.isDownloadsDrawerOpen;
    
    // Toggle body scroll when drawer is open
    if (this.isDownloadsDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  @ViewChild('searchResultsList') set searchResultsListRef(ref: ElementRef) {
    this.searchResultsList = ref;
  }

  onMovieSelect(movieId: number): void {
    // Close the search results
    this.showSearchResults = false;
    
    // Navigate to the selected movie details
    this.router.navigate(['/movie', movieId]).catch(error => {
      console.error('Navigation error:', error);
    });
  }

  onSearch(query: string): void {
    if (query.trim()) {
      this.searchKeyword = query;
      this.showSearchResults = true;
      
      // If we have a reference to the search results component, trigger a search
      if (this.searchResultsListComponent) {
        this.searchResultsListComponent.searchKeyWord = query;
        this.searchResultsListComponent.pageNumber = 1; // Reset to first page
        this.searchResultsListComponent.loadMovies();
      }
    } else {
      this.showSearchResults = false;
    }
  }

  async copyMagnetLink(hash: string): Promise<void> {
    const magnetLink = `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(this.movie?.title || 'movie')}&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://p4p.arenabg.com:1337&tr=udp://tracker.leechers-paradise.org:6969`;
    
    try {
      await navigator.clipboard.writeText(magnetLink);
      // You might want to show a toast notification here
      console.log('Magnet link copied to clipboard');
    } catch (err) {
      console.error('Failed to copy magnet link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = magnetLink;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        console.log('Magnet link copied to clipboard (fallback)');
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  }
  
  /**
   * Format date to a readable format
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  /**
   * Open IMDB page for the movie
   */
  openIMDB(imdbCode: string): void {
    if (imdbCode) {
      window.open(`https://www.imdb.com/title/${imdbCode}`, '_blank');
    }
  }
  
  /**
   * Copy text to clipboard
   */
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Show a toast or notification here if needed
      console.log('Copied to clipboard');
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  }

  /**
   * Toggle between full and truncated description
   */
  toggleDescription(): void {
    this.showFullDescription = !this.showFullDescription;
  }
}
