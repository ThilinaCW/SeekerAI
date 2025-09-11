import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-json-ld',
  template: `
    <script type="application/ld+json" [innerHTML]="jsonLD | json"></script>
  `,
  standalone: true
})
export class JsonLdComponent implements OnChanges {
  @Input() json: any;
  jsonLD: string = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['json']) {
      this.jsonLD = JSON.stringify(this.json, null, 2)
        .replace(/\/\*.*\*\//g, '')
        .replace(/\n\s*\n/g, '\n');
    }
  }
}
