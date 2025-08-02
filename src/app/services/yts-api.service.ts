import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Movie, MovieListResponse } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class YtsApiService {
  private readonly baseUrl = 'https://yts.mx/api/v2';

  constructor(private http: HttpClient) {}

  getMovies(params: {
    page?: number;
    limit?: number;
    quality?: string;
    genre?: string;
    minimum_rating?: number;
    query_term?: string;
    order_by?: string;
    sort_by?: string;
    with_rt_ratings?: boolean;
    year?: string;
    language?: string;
  }): Observable<MovieListResponse> {
    // Convert parameters to HttpParams for better URL handling
    let httpParams = new HttpParams();
    
    // Add only defined parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    // Set default values if not provided
    if (!httpParams.has('page')) httpParams = httpParams.set('page', '1');
    if (!httpParams.has('limit')) httpParams = httpParams.set('limit', '20');
  //  if (!httpParams.has('sort_by')) httpParams = httpParams.set('sort_by', 'year');
    if (!httpParams.has('order_by')) httpParams = httpParams.set('order_by', 'date_added');
    if (!httpParams.has('with_rt_ratings')) httpParams = httpParams.set('with_rt_ratings', 'true');

    return this.http.get<MovieListResponse>(`${this.baseUrl}/list_movies.json`, { params: httpParams })
      .pipe(
        map(response => {
          // Ensure we always have a data object
          if (!response.data) {
            response.data = { movie_count: 0, limit: 20, page_number: 1, movies: [] };
          }
          return response;
        })
      );
  }

  getMovieDetails(movieId: number, withImages = true, withCast = true): Observable<{ data: { movie: Movie } }> {
    let params = new HttpParams()
      .set('movie_id', movieId.toString())
      .set('with_images', withImages.toString())
      .set('with_cast', withCast.toString());

    return this.http.get<{ data: { movie: Movie } }>(
      `${this.baseUrl}/movie_details.json`,
      { params }
    );
  }

  getSimilarMovies(movieId: number, limit: number = 5): Observable<{ data: { movies: Movie[] } }> {
    const params = new HttpParams()
      .set('movie_id', movieId.toString())
      .set('limit', limit.toString());

    return this.http.get<{ data: { movies: Movie[] } }>(
      `${this.baseUrl}/movie_suggestions.json`,
      { params }
    );
  }
}
