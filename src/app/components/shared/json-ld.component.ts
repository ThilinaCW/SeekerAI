import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { MovieSchema } from '../../models/schema.types';

type SchemaType = 'website' | 'movie' | 'article' | 'breadcrumb' | 'organization' | Record<string, any>;

@Component({
  selector: 'app-json-ld',
  template: `
    <script type="application/ld+json" [innerHTML]="safeJson"></script>
  `,
  standalone: true
})
export class JsonLdComponent implements OnChanges {
  @Input() schema: SchemaType | null = null;
  safeJson: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['schema'] && this.schema) {
      const json = this.sanitizeJsonLd(this.schema);
      this.safeJson = this.sanitizer.bypassSecurityTrustHtml(
        JSON.stringify(json, null, 2)
          .replace(/\/\*.*\*\//g, '')
          .replace(/\n\s*\n/g, '\n')
      );
    }
  }

  private sanitizeJsonLd(schema: SchemaType): any {
    // Remove any undefined or null values
    return JSON.parse(JSON.stringify(schema, (_, value) => {
      return value === undefined ? undefined : value;
    }));
  }
}
