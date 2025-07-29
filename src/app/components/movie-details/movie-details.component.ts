import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { YtsApiService } from '../../services/yts-api.service';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { fadeInAnimation } from '../../animations/fade.animation';

interface MovieDetails {
  id: number;
  title: string;
  year: number;
  rating: number;
  genres: string[];
  description_full: string;
  medium_cover_image: string;
  large_cover_image: string;
  yt_trailer_code: string;
  // Add other properties as needed from the API response
}

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, SafeUrlPipe],
  animations: [fadeInAnimation],
  host: { '[@fadeIn]': '' }
})
export class MovieDetailsComponent implements OnInit {
  movie: MovieDetails | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ytsApiService: YtsApiService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const movieId = +params['id'];
      if (movieId) {
        this.loadMovieDetails(movieId);
      } else {
        this.error = 'No movie ID provided';
        this.loading = false;
      }
    });
  }

  private loadMovieDetails(movieId: number): void {
    this.loading = true;
    this.error = null;

    console.log('Loading movie details for ID:', movieId);
    
    this.ytsApiService.GetMovieDetails(movieId).subscribe({
      next: (response) => {
        console.log('Movie details response:', response);
        if (response?.data?.movie) {
          this.movie = response.data.movie;
        } else {
          this.error = 'No movie details found';
          console.error('No movie data in response:', response);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading movie details:', err);
        this.error = 'Failed to load movie details. Please try again later.';
        this.loading = false;
      }
    });
  }

  getTrailerUrl(youtubeCode: string): string {
    return `https://www.youtube.com/embed/${youtubeCode}?autoplay=1`;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
