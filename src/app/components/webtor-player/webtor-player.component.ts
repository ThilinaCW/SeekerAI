import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-webtor-player',
  standalone: true,
  templateUrl: './webtor-player.component.html',
  styleUrls: ['./webtor-player.component.css'],
  imports: [CommonModule]
})
export class WebtorPlayerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() magnet?: string;
  @Input() torrentUrl?: string;
  @Input() infoHash?: string;
  @Input() title?: string;
  @Input() autoplay: boolean = false;

  @ViewChild('playerContainer', { static: true }) playerContainer!: ElementRef<HTMLDivElement>;

  private sdkLoaded = false;
  private scriptEl?: HTMLScriptElement;
  containerId = `webtor-player-${Math.random().toString(36).slice(2)}`;

  ngOnInit(): void {
    // Do not auto-initialize; wait for inputs via ngOnChanges
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['magnet'] || changes['torrentUrl'] || changes['infoHash'] || changes['title']) {
      const hasSource = !!(this.magnet || this.torrentUrl || this.infoHash);
      if (!hasSource) return;
      // Re-initialize the player on input changes
      this.ensureSdk().then(() => {
        // Clear existing embed
        if (this.playerContainer?.nativeElement) {
          this.playerContainer.nativeElement.innerHTML = '';
        }
        this.initPlayer();
      });
    }
  }

  ngOnDestroy(): void {
    try {
      // Clear container to remove iframe
      if (this.playerContainer?.nativeElement) {
        this.playerContainer.nativeElement.innerHTML = '';
      }
    } catch {}
  }

  private ensureSdk(): Promise<void> {
    return new Promise((resolve, reject) => {
      const w = window as any;
      if (w.webtor && typeof w.webtor.push === 'function') {
        this.sdkLoaded = true;
        resolve();
        return;
      }

      // Load from CDN
      const existing = document.querySelector('script[src*="@webtor/embed-sdk-js"]') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => {
          this.sdkLoaded = true;
          resolve();
        });
        existing.addEventListener('error', (e) => reject(e));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@webtor/embed-sdk-js/dist/index.min.js';
      script.async = true;
      script.charset = 'utf-8';
      script.onload = () => {
        this.sdkLoaded = true;
        resolve();
      };
      script.onerror = (e) => reject(e);
      document.body.appendChild(script);
      this.scriptEl = script;
    });
  }

  private initPlayer(): void {
    const w = window as any;
    const magnet = this.magnet || (this.infoHash ? `magnet:?xt=urn:btih:${this.infoHash}${this.title ? `&dn=${encodeURIComponent(this.title)}` : ''}` : undefined);
    const torrentUrl = this.torrentUrl;

    if (!magnet && !torrentUrl) {
      // Nothing to play
      // eslint-disable-next-line no-console
      console.warn('[WebtorPlayer] No magnet or torrentUrl provided, player not initialized.');
      return;
    }

    // Ensure container has the proper id
    const el = this.playerContainer.nativeElement;
    el.id = this.containerId;
    // Do not add 'webtor' class before config push to avoid any SDK auto-scan race

    w.webtor = w.webtor || [];
    const cfg: any = {
      id: this.containerId,
      title: this.title,
      features: { embed: false },
      // autoplay is enabled when 'controls' are on in basic usage; here it's a hint
    };
    if (magnet) cfg.magnet = magnet;
    if (torrentUrl) cfg.torrentUrl = torrentUrl;
    // eslint-disable-next-line no-console
    console.debug('[WebtorPlayer] Pushing config to Webtor SDK:', cfg);
    w.webtor.push(cfg);
    // Optionally mark container as webtor after push (not required for SDK)
    this.enforceIframeSizing();
  }

  /**
   * Ensure the injected iframe has width="100%" and height="100%" attributes, in addition to CSS sizing.
   * Uses a MutationObserver to catch late iframe injection by the SDK.
   */
  private enforceIframeSizing(): void {
    const container = this.playerContainer?.nativeElement;
    if (!container) return;

    const apply = () => {
      const iframe = container.querySelector('iframe') as HTMLIFrameElement | null;
      if (iframe) {
        try {
          iframe.setAttribute('width', '100%');
          iframe.setAttribute('height', '100%');
          // Also ensure inline style as a last resort
          const style = iframe.getAttribute('style') || '';
          if (!/width\s*:\s*100%/.test(style)) iframe.style.width = '100%';
          if (!/height\s*:\s*100%/.test(style)) iframe.style.height = '100%';
        } catch {}
        return true;
      }
      return false;
    };

    // Try immediately
    if (apply()) return;

    // Observe for iframe additions for a short window
    const observer = new MutationObserver(() => {
      if (apply()) {
        observer.disconnect();
      }
    });
    observer.observe(container, { childList: true, subtree: true });

    // Safety timeout to disconnect after 5s
    setTimeout(() => observer.disconnect(), 5000);
  }
}
