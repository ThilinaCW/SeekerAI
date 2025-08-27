import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'xml',
  standalone: true
})
export class XmlPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    
    try {
      // Simple XML formatting with indentation
      const formatted = this.formatXml(value);
      return this.escapeHtml(formatted);
    } catch (error) {
      console.error('Error formatting XML:', error);
      return this.escapeHtml(value);
    }
  }

  private formatXml(xml: string): string {
    // Add line breaks for tags
    let formatted = '';
    let indent = '';
    const tab = '  ';
    
    // Split tags with newlines for better formatting
    xml = xml.replace(/></g, '>\n<');
    
    // Process each line
    const lines = xml.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Decrease indent on closing tags
      if (line.match(/^<\/[\w:-]+>/) || line.match(/<[^/][^>]*\/>/)) {
        indent = indent.substring(tab.length);
      }
      
      // Add current line with indentation
      formatted += indent + line + '\n';
      
      // Increase indent on opening tags
      if (line.match(/<[^/][^>]*>/) && !line.match(/<[^>]+\/>/)) {
        indent += tab;
      }
    }
    
    return formatted.trim();
  }
  
  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
