import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private siteName = 'Magenet - Your Movie Discovery Platform';

  constructor(
    private meta: Meta,
    private titleService: Title,
    private router: Router
  ) { }

  setTitle(title: string): void {
    this.titleService.setTitle(`${title} | ${this.siteName}`);
  }

  setMetaDescription(description: string): void {
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:description', content: description });
  }

  setCanonicalUrl(url?: string): void {
    const canonicalUrl = url || `https://magenet.online${this.router.url}`;
    this.meta.updateTag({ rel: 'canonical', href: canonicalUrl });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
  }

  setMetaTags(config: {
    title?: string;
    description?: string;
    image?: string;
    keywords?: string;
    type?: string;
  }) {
    const title = config.title ? `${config.title} | ${this.siteName}` : this.siteName;
    const description = config.description || 'Discover and download the latest movies in HD quality. Find your favorite films and more on Magenet.';
    const image = config.image || 'https://magenet.online/assets/og-image.jpg';
    const url = `https://magenet.online/${this.router.url}`;
    const keywords = config.keywords || 'movies, films, HD movies, download, download movies, watch online, torrent, yts';
    const type = config.type || 'website';

    // Set title
    this.titleService.setTitle(title);

    // Standard meta tags
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'keywords', content: keywords });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    // Open Graph / Facebook
    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:site_name', content: this.siteName });

    // Twitter
    this.meta.updateTag({ property: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ property: 'twitter:url', content: url });
    this.meta.updateTag({ property: 'twitter:title', content: title });
    this.meta.updateTag({ property: 'twitter:description', content: description });
    this.meta.updateTag({ property: 'twitter:image', content: image });
  }

  // Add structured data for rich snippets
  addStructuredData(schema: any) {
    // Remove existing schema
    const existingScript = document.getElementById('structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new schema
    const script = document.createElement('script');
    script.id = 'structured-data';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }
}
