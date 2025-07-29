import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface MoviesQuerryViewModel {
  // Define the structure of your movie query view model here
  // This is a placeholder, you'll need to define the actual properties
  data: any;
  status: string;
  status_message: string;
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
    return this.http.get<MoviesQuerryViewModel>(endpointUrl);
  }

  GetMovieSugessions(movieId: number) {
    var endpointUrl = `${this.baseUrl}/api/v2/movie_suggestions.json?movie_id=${movieId}`;
    return this.http.get<MoviesQuerryViewModel>(endpointUrl);
  }

  GetMovieDetails(movieId: number) {
    var endpointUrl = `${this.baseUrl}/api/v2/movie_details.json?movie_id=${movieId}&with_images=true&with_cast=true`;
    return this.http.get<any>(endpointUrl);
  }
}
