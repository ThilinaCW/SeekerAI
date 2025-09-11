import { Injectable } from '@angular/core';
import { MovieSchema } from '../models/schema.types';

@Injectable({
  providedIn: 'root'
})
export class SchemaService {
  constructor() {}

  /**
   * Generate structured data for a movie
   * @param movie The movie data
   * @param baseUrl The base URL of the website
   * @returns Structured data for the movie
   */
  generateMovieSchema(movie: any, baseUrl: string): MovieSchema {
    // Format actors if available
    const actors = movie.cast?.map((actor: string) => ({
      '@type': 'Person',
      name: actor
    }));

    // Format directors if available
    const directors = movie.director?.map((director: string) => ({
      '@type': 'Person',
      name: director
    }));

    // Format reviews if available
    const reviews = movie.reviews?.map((review: any) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating || 0,
        bestRating: 10,
        worstRating: 0
      },
      author: {
        '@type': 'Person',
        name: review.author || 'Anonymous'
      },
      datePublished: review.date || new Date().toISOString(),
      reviewBody: review.comment
    }));

    // Create the movie schema
    const schema: MovieSchema = {
      '@context': 'https://schema.org',
      '@type': 'Movie',
      name: movie.title || 'Unknown Movie',
      image: movie.large_cover_image || movie.medium_cover_image || `${baseUrl}/assets/default-movie.jpg`,
      description: movie.description_full || movie.description_short || `Watch ${movie.title || 'this movie'} online.`,
      director: directors,
      actor: actors,
      datePublished: movie.year ? `${movie.year}-01-01` : undefined,
      genre: movie.genres,
      keywords: movie.genres?.join(', '),
      contentRating: movie.mpa_rating || 'Not Rated',
      duration: this.formatDuration(movie.runtime),
      url: `${baseUrl}/movie/${movie.id}/${this.slugify(movie.title || 'movie')}`,
      aggregateRating: movie.rating ? {
        '@type': 'AggregateRating',
        ratingValue: movie.rating,
        bestRating: 10,
        worstRating: 0,
        ratingCount: movie.rating_count || 0
      } : undefined,
      review: reviews,
      trailer: movie.yt_trailer_code ? {
        '@type': 'VideoObject',
        name: `${movie.title || 'Movie'} Trailer`,
        embedUrl: `https://www.youtube.com/embed/${movie.yt_trailer_code}`,
        thumbnailUrl: movie.medium_cover_image || `${baseUrl}/assets/default-movie.jpg`,
        description: `Official trailer for ${movie.title || 'the movie'}`
      } : undefined
    };

    return schema;
  }

  /**
   * Format duration in minutes to ISO 8601 duration format
   * @param minutes Duration in minutes
   * @returns Formatted duration string (e.g., 'PT2H30M')
   */
  private formatDuration(minutes: number): string | undefined {
    if (!minutes) return undefined;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `PT${hours}H${mins}M`;
  }

  /**
   * Convert a string to a URL-friendly slug
   * @param text The text to convert
   * @returns URL-friendly slug
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
}
