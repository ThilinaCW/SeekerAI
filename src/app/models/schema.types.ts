export interface MovieSchema {
  '@context': string;
  '@type': string;
  name: string;
  image: string;
  description: string;
  director?: {
    '@type': string;
    name: string;
  }[];
  actor?: {
    '@type': string;
    name: string;
  }[];
  datePublished?: string;
  genre?: string[];
  keywords?: string;
  contentRating?: string;
  duration?: string;
  url: string;
  aggregateRating?: {
    '@type': string;
    ratingValue: string | number;
    bestRating?: string | number;
    worstRating?: string | number;
    ratingCount?: number;
  };
  review?: {
    '@type': string;
    reviewRating: {
      '@type': string;
      ratingValue: string | number;
      bestRating?: string | number;
    };
    author: {
      '@type': string;
      name: string;
    };
    datePublished?: string;
    reviewBody?: string;
  }[];
  trailer?: {
    '@type': string;
    name: string;
    embedUrl: string;
    thumbnailUrl: string;
    description: string;
  };
}
