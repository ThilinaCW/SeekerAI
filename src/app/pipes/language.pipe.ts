import { Pipe, PipeTransform } from '@angular/core';

type LanguageMap = {
  [key: string]: string;
};

@Pipe({
  name: 'languageName',
  standalone: true
})
export class LanguagePipe implements PipeTransform {
  private readonly languageMap: LanguageMap = {
    // Major world languages
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'hi': 'Hindi',
    'ar': 'Arabic',
    'tr': 'Turkish',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'fi': 'Finnish',
    'da': 'Danish',
    'no': 'Norwegian',
    'pl': 'Polish',
    'uk': 'Ukrainian',
    'cs': 'Czech',
    'hu': 'Hungarian',
    'ro': 'Romanian',
    'el': 'Greek',
    'he': 'Hebrew',
    'id': 'Indonesian',
    'ms': 'Malay',
    'fa': 'Persian',
    
    // Indian languages
    'bn': 'Bengali',
    'ta': 'Tamil',
    'te': 'Telugu',
    'mr': 'Marathi',
    'ur': 'Urdu',
    'pa': 'Punjabi',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'or': 'Odia',
    'as': 'Assamese',
    'sa': 'Sanskrit',
    
    // Other Asian languages
    'ne': 'Nepali',
    'si': 'Sinhala',
    'my': 'Burmese',
    'km': 'Khmer',
    'lo': 'Lao',
    'bo': 'Tibetan',
    'dz': 'Dzongkha',
    'mn': 'Mongolian',
    'ka': 'Georgian',
    'hy': 'Armenian',
    'az': 'Azerbaijani',
    'uz': 'Uzbek',
    'kk': 'Kazakh',
    'ky': 'Kyrgyz',
    'tg': 'Tajik',
    'tk': 'Turkmen',
    
    // European languages
    'et': 'Estonian',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'sq': 'Albanian',
    'mk': 'Macedonian',
    'sr': 'Serbian',
    'hr': 'Croatian',
    'sl': 'Slovenian',
    'bs': 'Bosnian',
    'bg': 'Bulgarian',
    'be': 'Belarusian',
    'is': 'Icelandic',
    'ga': 'Irish',
    'cy': 'Welsh',
    'eu': 'Basque',
    'ca': 'Catalan',
    'gl': 'Galician',
    
    // African languages
    'af': 'Afrikaans',
    'sw': 'Swahili',
    'zu': 'Zulu',
    'xh': 'Xhosa',
    'st': 'Southern Sotho',
    'tn': 'Tswana',
    'ss': 'Siswati',
    've': 'Venda',
    'ts': 'Tsonga',
    'nso': 'Northern Sotho',
    'ak': 'Akan',
    'yo': 'Yoruba',
    'ig': 'Igbo',
    'ha': 'Hausa',
    'ff': 'Fulah',
    'wo': 'Wolof',
    'sn': 'Shona',
    'rw': 'Kinyarwanda',
    'mg': 'Malagasy',
    'so': 'Somali',
    'am': 'Amharic',
    'ti': 'Tigrinya',
    'om': 'Oromo',
    'nr': 'Ndebele'
  };

  transform(languageCode: string | undefined): string {
    if (!languageCode) return '';
    
    // Convert to lowercase for case-insensitive matching
    const code = languageCode.toLowerCase();
    
    // Return the full language name or the original code if not found
    return this.languageMap[code] || languageCode.toUpperCase();
  }
}
