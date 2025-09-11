import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule, NavigationEnd } from '@angular/router';
import { YtsApiService } from '../../services/yts-api.service';
import { UiService } from '../../services/ui.service';
import { Movie, MovieListResponse, Torrent } from '../../models/movie.model';
import { filter } from 'rxjs/operators';
import { MovieListComponent } from '../movie-list/movie-list.component';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';
import { LanguagePipe } from '../../pipes/language.pipe';
import { Meta, Title } from '@angular/platform-browser';
import { JsonLdComponent } from '../shared/json-ld.component';
import { SchemaService } from '../../services/schema.service';
import { environment } from '../../../environments/environment';

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
    LanguagePipe,
    JsonLdComponent
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
export class MovieDetailsComponent implements OnInit, OnDestroy {
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

  private jsonLdScript: HTMLScriptElement | null = null;

  movieSchema: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ytsApiService: YtsApiService,
    private uiService: UiService,
    private titleService: Title,
    private meta: Meta,
    private schemaService: SchemaService
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

    // Handle navigation end to update structured data when navigating between movie details
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.movie) {
        this.generateStructuredData();
      }
    });
  }

  private generateStructuredData(): void {
    if (this.movie) {
      this.movieSchema = this.schemaService.generateMovieSchema(
        this.movie,
        environment.baseSiteUrl || window.location.origin
      );
    }
  }

  /**
   * Remove JSON-LD script from the document head
   */
  private removeJsonLd(): void {
    if (this.jsonLdScript && this.jsonLdScript.parentNode) {
      this.jsonLdScript.parentNode.removeChild(this.jsonLdScript);
      this.jsonLdScript = null;
    }
  }

  /**
   * Update SEO metadata for the movie page
   */
  private updateSeoMetadata(): void {
    if (!this.movie) return;

    const title = `${this.movie.title} (${this.movie.year}) - YTS ${this.movie.rating}⭐`;
    const description = this.movie.description_full || this.movie.description_intro || `Watch ${this.movie.title} in HD quality.`;
    const image = this.movie.large_cover_image || this.movie.medium_cover_image || `${environment.baseSiteUrl}/assets/default-movie.jpg`;
    const url = `${environment.baseSiteUrl}/movie/${this.movie.id}-${this.slugify(this.movie.title || 'movie')}`;
    
    // Update page title
    this.titleService.setTitle(title);
    
    // Update meta tags
    this.meta.updateTag({ name: 'description', content: description });
    
    // Open Graph / Facebook
    this.meta.updateTag({ property: 'og:type', content: 'video.movie' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: url });
    
    // Twitter
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    
    // Additional meta tags
    if (this.movie.genres && this.movie.genres.length > 0) {
      this.meta.updateTag({ name: 'keywords', content: this.movie.genres.join(', ') });
    }
    
    // Canonical URL
    this.meta.updateTag({ rel: 'canonical', href: url });
  }
  
  /**
   * Convert a string to a URL-friendly slug
   */
  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
  }

  ngOnDestroy(): void {
    this.removeJsonLd();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      
      if (idParam) {
        // Use the ID parameter as is, let the service handle the type
        this.loadMovieDetails(idParam);
      } else {
        this.error = 'No movie ID provided in URL';
        this.loading = false;
      }
    });
    
    // Scroll to main container when component initializes
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

  private loadMovieDetails(id: string | number): void {
    this.loading = true;
    this.error = null;
    this.loadingSimilar = true;
    this.similarMovies = [];

    // Reset screenshot state
    this.currentScreenshotIndex = 0;
    this._screenshots = [];

    // Convert ID to number if it's a string
    const movieId = typeof id === 'string' ? parseInt(id, 10) : id;

    // Load movie details
    this.ytsApiService.getMovieDetails(movieId).subscribe({
      next: (response) => {
        if (response?.data?.movie) {
          this.movie = response.data.movie;
          this.updateSeoMetadata();
          this.generateStructuredData();
          this.loadSimilarMovies(movieId);
          this.loading = false;
        } else {
          this.router.navigate(['/not-found']);
        }
      },
      error: (error) => {
        console.error('Error loading movie details:', error);
        this.router.navigate(['/not-found']);
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
   * @param movie The movie object containing id and title
   */
  navigateToMovie(movie: any): void {
    // Close any open drawers
    this.isDownloadsDrawerOpen = false;
    this.showSearchResults = false;
    
    // Create a URL-friendly slug from the movie title
    const titleSlug = movie.title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
    
    // Navigate to the movie details page with ID and title in URL
    this.router.navigate(['/movie', `${movie.id}-${titleSlug}`]).then(() => {
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
    this.uiService.setDrawerState(this.isDownloadsDrawerOpen);
    
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

  onMovieSelect(movie: any): void {
    // Close the search results
    this.showSearchResults = false;
    
    // Create a URL-friendly slug from the movie title
    const titleSlug = movie.title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
    
    // Navigate to the selected movie details with ID and title in URL
    this.router.navigate(['/movie', `${movie.id}-${titleSlug}`]).catch(error => {
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
