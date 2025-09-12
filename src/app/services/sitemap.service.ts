import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Movie, Torrent } from '../models/movie.model';
import { map } from 'rxjs/operators';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SitemapService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly baseSiteUrl = (environment.baseSiteUrl || 'https://magenet.online').replace(/\/$/, '');
  private readonly maxUrls = 50000; // Sitemap protocol limit per file
  private readonly maxSize = 50 * 1024 * 1024; // 50MB sitemap size limit

  constructor(private http: HttpClient) {}

  /**
   * Generate a sitemap for all movies
   */
  generateSitemap(movies: Movie[]): string {
    return this.createSitemap(movies);
  }
  
  /**
   * Generate a video sitemap for all movies with video content
   */
  generateVideoSitemap(movies: Movie[]): string {
    return this.createVideoSitemap(movies);
  }

  /**
   * Create a video sitemap from movie data
   */
  private createVideoSitemap(movies: Movie[]): string {
    const now = new Date().toISOString();
    let urls = '';
    
    // Add video entries for each movie
    movies.forEach(movie => {
      if (movie.torrents && movie.torrents.length > 0) {
        urls += this.createVideoSitemapEntry(movie);
      }
    });
    
    return this.wrapInSitemap(urls);
  }

  /**
   * Create sitemap XML content from movie data
   */
  private createSitemap(movies: Movie[]): string {
    const now = new Date().toISOString();
    let urls = '';
    
    // Add homepage
    urls += this.createSitemapUrl(this.baseSiteUrl, now, '1.0', 'daily');
    
    // Add main movies listing
    urls += this.createSitemapUrl(`${this.baseSiteUrl}movies`, now, '0.9', 'daily');
    
    // Add genre pages
    const genres = ['action', 'comedy', 'drama', 'thriller', 'horror', 'sci-fi', 'romance', 'documentary'];
    genres.forEach(genre => {
      urls += this.createSitemapUrl(
        `${this.baseSiteUrl}movies?genre=${genre}`, 
        now, 
        '0.8', 
        'daily'
      );
    });
    
    // Add quality filter pages
    const qualities = ['2160p', '1080p', '720p', '3D'];
    qualities.forEach(quality => {
      urls += this.createSitemapUrl(
        `${this.baseSiteUrl}movies?quality=${quality}`, 
        now, 
        '0.7', 
        'daily'
      );
    });
    
    // Add individual movie pages
    movies.slice(0, this.maxUrls - 50).forEach(movie => {
      urls += this.createSitemapUrl(
        `${this.baseSiteUrl}movie/${movie.id}-${this.slugify(movie.title)}`,
        now,
        '0.9',
        'weekly'
      );
    });
    
    // Add static pages
    const staticPages = ['about', 'contact', 'privacy', 'terms'];
    staticPages.forEach(page => {
      urls += this.createSitemapUrl(
        `${this.baseSiteUrl}${page}`,
        now,
        page === 'about' || page === 'contact' ? '0.5' : '0.3',
        'monthly'
      );
    });
    
    return this.wrapInSitemap(urls);
  }

  /**
   * Create a single URL entry for the sitemap
   */
  private createSitemapUrl(loc: string, lastmod: string, priority: string, changefreq: string): string {
    return `  <url>\n    <loc>${this.escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
  }

  /**
   * Wrap URLs in sitemap XML tags
   */
  private wrapInSitemap(urls: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${urls}</urlset>`;
  }

  /**
   * Create a video sitemap entry for a movie
   */
  private createVideoSitemapEntry(movie: Movie): string {
    const movieUrl = `${this.baseSiteUrl}movie/${movie.id}`;
    const bestTorrent = this.getBestQualityTorrent(movie.torrents || []);
    const thumbnailUrl = movie.large_cover_image || movie.medium_cover_image || '';
    
    let entry = `  <url>\n`;
    entry += `    <loc>${this.escapeXml(movieUrl)}</loc>\n`;
    entry += `    <video:video>\n`;
    entry += `      <video:thumbnail_loc>${this.escapeXml(thumbnailUrl)}</video:thumbnail_loc>\n`;
    entry += `      <video:title>${this.escapeXml(movie.title || '')}</video:title>\n`;
    
    if (movie.description_full) {
      entry += `      <video:description>${this.escapeXml(movie.description_full.substring(0, 2000))}</video:description>\n`;
    }
    
    if (bestTorrent) {
      entry += `      <video:content_loc>${this.escapeXml(bestTorrent.url || '')}</video:content_loc>\n`;
      entry += `      <video:player_loc>${this.escapeXml(movieUrl)}</video:player_loc>\n`;
      entry += `      <video:duration>${movie.runtime ? movie.runtime * 60 : 0}</video:duration>\n`;
    }
    
    if (movie.rating) {
      entry += `      <video:rating>${movie.rating.toFixed(1)}</video:rating>\n`;
    }
    
    if (movie.like_count) {
      entry += `      <video:view_count>${movie.like_count}</video:view_count>\n`;
    }
    
    if (movie.date_uploaded) {
      entry += `      <video:publication_date>${new Date(movie.date_uploaded).toISOString()}</video:publication_date>\n`;
    }
    
    if (movie.genres && movie.genres.length > 0) {
      entry += `      <video:tag>${this.escapeXml(movie.genres.join(', '))}</video:tag>\n`;
    }
    
    if (movie.mpa_rating) {
      entry += `      <video:family_friendly>${movie.mpa_rating === 'R' ? 'no' : 'yes'}</video:family_friendly>\n`;
    }
    
    entry += `      <video:requires_subscription>no</video:requires_subscription>\n`;
    entry += `      <video:live>no</video:live>\n`;
    entry += `    </video:video>\n`;
    entry += `  </url>\n`;
    
    return entry;
  }

  /**
   * Get the best quality torrent from available torrents
   */
  private getBestQualityTorrent(torrents: Torrent[]): Torrent | null {
    if (!torrents || torrents.length === 0) return null;
    
    // Sort by quality (assuming higher quality has higher resolution numbers)
    return [...torrents].sort((a, b) => {
      const qualityA = parseInt(a.quality) || 0;
      const qualityB = parseInt(b.quality) || 0;
      return qualityB - qualityA;
    })[0];
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(unsafe: string): string {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generate movie URLs for sitemap
   */
  private generateMovieUrls(movies: Movie[]): string[] {
    return movies.slice(0, this.maxUrls - 50) // Leave room for other URLs
      .map(movie => `${this.baseSiteUrl}movie/${movie.id}-${this.slugify(movie.title)}`);
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
