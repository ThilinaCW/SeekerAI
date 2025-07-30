import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule, NavigationEnd } from '@angular/router';
import { YtsApiService } from '../../services/yts-api.service';
import { Movie } from '../../models/movie.model';
import { filter } from 'rxjs/operators';
import { MovieListComponent } from '../movie-list/movie-list.component';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';
import { Torrent } from '../../models/movie.model';

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
    MovieListComponent
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
  movie: Movie | null = null;
  loading = true;
  error: string | null = null;
  showFullDescription = false;
  truncatedDescription = '';
  isDownloadsDrawerOpen = false;
  searchKeyword = '';
  showSearchResults = false;

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

  private loadMovieDetails(movieId: number): void {
    this.loading = true;
    this.ytsApiService.getMovieDetails(movieId).subscribe({
      next: (response) => {
        if (response?.data?.movie) {
          this.movie = this.processMovieData(response.data.movie);
        } else {
          this.error = 'Movie details not found';
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading movie details:', err);
        this.error = 'Failed to load movie details. Please try again later.';
        this.loading = false;
      }
    });
  }

  /**
   * Process and enhance movie data before displaying
   */
  private processMovieData(movie: Movie): Movie {
    // Process and enhance the movie data before displaying
    const processedMovie: Movie = {
      ...movie,
      // Ensure arrays are always defined
      genres: movie.genres || [],
      torrents: movie.torrents || [],
      cast: movie.cast || []
    };

    // Set initial truncated description if needed
    if (movie.description_full && movie.description_full.length > 300) {
      this.truncatedDescription = movie.description_full.substring(0, 300) + '...';
      this.showFullDescription = false;
    } else {
      this.truncatedDescription = movie.description_full || movie.description_intro || '';
      this.showFullDescription = true;
    }

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

  @ViewChild('searchResults') searchResultsList!: MovieListComponent;

  onMovieSelect(movieId: number): void {
    // Close the search results
    this.showSearchResults = false;
    
    // Navigate to the selected movie details
    this.router.navigate(['/movie', movieId]).catch(error => {
      console.error('Navigation error:', error);
    });
  }

  onSearch(): void {
    debugger
    const query = this.searchKeyword.trim();
    if (query) {
      this.showSearchResults = true;
      // If we have a reference to the movie list component, trigger search directly
      if (this.searchResultsList) {
        this.searchResultsList.searchKeyWord = query;
        this.searchResultsList.pageNumber = 1; // Reset to first page
        this.searchResultsList.loadMovies();
      }
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
