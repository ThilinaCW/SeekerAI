import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

export interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  genres: string[];
  medium_cover_image: string;
}

export interface MoviesResponse {
  data: {
    movie_count: number;
    movies: Movie[];
  };
  status: string;
  status_message: string;
}

function removeDuplicates(movies: Movie[]): Movie[] {
  const unique = new Map<number, Movie>();
  movies.forEach(movie => {
    if (!unique.has(movie.id)) {
      unique.set(movie.id, movie);
    }
  });
  return Array.from(unique.values());
}

@Injectable({
  providedIn: 'root'
})
export class YtsApiService {

  private baseUrl = 'https://yts.mx';

  constructor(private http: HttpClient) { }

  GetTimeLineMoviesList(pageNumber: number, limit: number, qualityFilter: string, genreFilter: string, ratingFilter: number, orderByFilter: string, searchKeyWord: string, yearFilter: string, languageFilter: string) {
    if (searchKeyWord == '') {
      searchKeyWord = '0';
    }
    var endpointUrl = `${this.baseUrl}/api/v2/list_movies.json?page=${pageNumber}&limit=${limit}&quality=${qualityFilter}&genre=${genreFilter}&minimum_rating=${ratingFilter}&sort_by=${orderByFilter}&query_term=${searchKeyWord}&year=${yearFilter}&language=${languageFilter}`;
    return this.http.get<MoviesResponse>(endpointUrl).pipe(
      map(response => {
        if (response.data?.movies) {
          response.data.movies = removeDuplicates(response.data.movies);
        }
        return response;
      })
    );
  }

  GetMovieSuggestions(movieId: number) {
    var endpointUrl = `${this.baseUrl}/api/v2/movie_suggestions.json?movie_id=${movieId}`;
    return this.http.get<MoviesResponse>(endpointUrl).pipe(
      map(response => {
        if (response.data?.movies) {
          response.data.movies = removeDuplicates(response.data.movies);
        }
        return response;
      })
    );
  }

  GetMovieDetails(movieId: number) {
    var endpointUrl = `${this.baseUrl}/api/v2/movie_details.json?movie_id=${movieId}&with_images=true&with_cast=true`;
    return this.http.get<any>(endpointUrl);
  }
}
