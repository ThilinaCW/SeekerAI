import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { YtsApiService } from '../services/yts-api.service';
import { Movie } from '../models/movie.model';
import { SitemapService } from '../services/sitemap.service';

type SitemapType = 'regular' | 'video';

@Component({
  selector: 'app-sitemap',
  templateUrl: './sitemap.component.html',
  styleUrls: ['./sitemap.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class SitemapComponent implements OnInit, OnDestroy {
  sitemapTypeControl = new FormControl<SitemapType>('regular');
  get sitemapType(): SitemapType {
    return this.sitemapTypeControl.value as SitemapType;
  }
  sitemapContent = '';
  isLoading = false;
  error: string | null = null;
  showFullSitemap = false;
  private movies: Movie[] = [];
  private readonly maxMovies = 1000; // Limit number of movies to process

  constructor(
    private ytsApiService: YtsApiService,
    private sitemapService: SitemapService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadMovies();
  }

  ngOnDestroy() {
    // Clean up any subscriptions if needed
  }

  private loadMovies(page = 1, limit = 50, allMovies: Movie[] = []): void {
    if (allMovies.length >= this.maxMovies) {
      this.movies = allMovies.slice(0, this.maxMovies);
      return;
    }

    this.ytsApiService.getMovies({ page, limit }).subscribe({
      next: (response) => {
        const movies = response.data?.movies || [];
        const updatedMovies = [...allMovies, ...movies];
        
        if (movies.length === limit && updatedMovies.length < this.maxMovies) {
          // Load next page if there are more movies
          this.loadMovies(page + 1, limit, updatedMovies);
        } else {
          this.movies = updatedMovies.slice(0, this.maxMovies);
        }
      },
      error: (error) => {
        console.error('Error loading movies for sitemap:', error);
        this.error = 'Failed to load movies. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  generateSitemap() {
    if (this.movies.length === 0) {
      this.error = 'No movies loaded. Please try again.';
      return;
    }

    this.isLoading = true;
    this.error = null;
    
    try {
      if (this.sitemapType === 'video') {
        this.sitemapContent = this.sitemapService.generateVideoSitemap(this.movies);
      } else {
        this.sitemapContent = this.sitemapService.generateSitemap(this.movies);
      }
      this.isLoading = false;
    } catch (error) {
      console.error('Error generating sitemap:', error);
      this.error = 'Failed to generate sitemap. Please try again.';
      this.isLoading = false;
    }
  }
  
  downloadSitemap() {
    if (!this.sitemapContent) return;
    
    const blob = new Blob([this.sitemapContent], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.sitemapType === 'video' ? 'video-sitemap.xml' : 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  formatSitemapContent(): string {
    if (!this.sitemapContent) return '';
    
    const content = this.showFullSitemap 
      ? this.sitemapContent 
      : this.sitemapContent.substring(0, 500);
    
    // Simple XML formatting - this is a basic implementation
    // For a more robust solution, consider using a proper XML formatter
    return content
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
      .replace(/\s/g, '&nbsp;');
  }
}
