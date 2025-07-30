import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(html: string): SafeHtml {
    if (!html) return '';
    // Sanitize the HTML and allow basic formatting tags
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, html) || '';
    return this.sanitizer.bypassSecurityTrustHtml(sanitized);
  }
}
