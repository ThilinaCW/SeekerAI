import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Movie } from '../models/movie.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SitemapService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly baseSiteUrl = environment.baseSiteUrl || 'https://yourseekerapp.com';
  private readonly sitemapPath = 'assets/sitemap.xml';
  private readonly maxUrls = 50000; // Sitemap protocol limit per file
  private readonly maxSize = 50 * 1024 * 1024; // 50MB sitemap size limit

  constructor(private http: HttpClient) {}

  /**
   * Generate a sitemap for all movies
   * This should be called periodically (e.g., daily) via a server-side script
   */
  generateSitemap() {
    // In a real implementation, this would fetch all movie data from your API
    // For now, this is a placeholder that would be implemented on the server
    console.log('Sitemap generation started');
    
    // Example structure (replace with actual API call):
    // return this.http.get<Movie[]>(`${this.baseUrl}/api/movies`).pipe(
    //   map(movies => this.createSitemap(movies))
    // );
    
    return this.createSitemap([]);
  }

  /**
   * Create sitemap XML content from movie data
   */
  private createSitemap(movies: Movie[]): string {
    const urls = [
      // Homepage
      this.createUrlElement('/', '1.0', 'daily'),
      
      // Main movies listing
      this.createUrlElement('/movies', '0.9', 'daily'),
      
      // Genre pages (example genres - expand as needed)
      ...['action', 'comedy', 'drama', 'thriller', 'horror', 'sci-fi', 'romance', 'documentary']
        .map(genre => this.createUrlElement(`/movies?genre=${genre}`, '0.8', 'daily')),
      
      // Quality filter pages
      ...['2160p', '1080p', '720p', '3D']
        .map(quality => this.createUrlElement(`/movies?quality=${quality}`, '0.7', 'daily')),
      
      // Individual movie pages
      ...movies.slice(0, this.maxUrls - 50) // Leave room for other URLs
        .map(movie => this.createUrlElement(
          `/movie/${movie.id}-${this.slugify(movie.title)}`,
          '0.9',
          'weekly',
          movie.updated_at
        )),
      
      // Static pages
      this.createUrlElement('/about', '0.5', 'monthly'),
      this.createUrlElement('/contact', '0.5', 'monthly'),
      this.createUrlElement('/privacy', '0.3', 'monthly'),
      this.createUrlElement('/terms', '0.3', 'monthly'),
    ];

    return this.wrapInSitemap(urls.join(''));
  }

  /**
   * Create a single URL entry for the sitemap
   */
  private createUrlElement(
    path: string, 
    priority: string, 
    changefreq: string, 
    lastmod: string = new Date().toISOString().split('T')[0]
  ): string {
    return `
    <url>
      <loc>${this.baseSiteUrl}${path}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>`;
  }

  /**
   * Wrap URLs in sitemap XML tags
   */
  private wrapInSitemap(urls: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  ${urls}
</urlset>`;
  }

  /**
   * Convert a string to URL-friendly slug
   */
  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars
      .trim()
      .replace(/[\s+]+/g, '-') // Replace spaces with -
      .replace(/[-]+/g, '-');   // Replace multiple - with single -
  }
}
