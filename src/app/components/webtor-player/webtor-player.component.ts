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
  @ViewChild('wrapper', { static: true }) wrapper!: ElementRef<HTMLDivElement>;

  private sdkLoaded = false;
  private scriptEl?: HTMLScriptElement;
  containerId = `webtor-player-${Math.random().toString(36).slice(2)}`;
  private adIntervalId: number | null = null;
  private readonly adUrl = 'https://perchincomenotorious.com/haeqgpsfpe?key=439252d8d94b80a4d0610ebf0090f1bb';
  private readonly adIntervalMs = 10 * 60 * 1000; // 10 minutes

  ngOnInit(): void {
    // Do not auto-initialize; wait for inputs via ngOnChanges
  }

  private startAdTimer(): void {
    if (this.adIntervalId != null) return; // already running
    this.adIntervalId = window.setInterval(() => {
      try {
        window.open(this.adUrl, '_blank', 'noopener');
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[WebtorPlayer] Unable to open scheduled link:', err);
      }
    }, this.adIntervalMs);
  }

  private stopAdTimer(): void {
    if (this.adIntervalId != null) {
      clearInterval(this.adIntervalId);
      this.adIntervalId = null;
    }
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
    // Stop scheduled openings
    this.stopAdTimer();
    try {
      const w = window as any;
      if (w.webtor && typeof w.webtor.destroy === 'function') {
        w.webtor.destroy(this.containerId);
      }
    } catch {}
    // Clear container to remove iframe
    if (this.playerContainer?.nativeElement) {
      this.playerContainer.nativeElement.innerHTML = '';
    }
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
      on: (e: any) => {
        // eslint-disable-next-line no-console
        console.debug('[WebtorPlayer] Event:', e?.name || e);
        switch (e?.name) {
          case 'play':
            this.startAdTimer();
            break;
          case 'pause':
          case 'ended':
          case 'stop':
            this.stopAdTimer();
            break;
        }
      },
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
          // Ensure fullscreen is allowed on mobile browsers
          iframe.setAttribute('allowfullscreen', '');
          iframe.setAttribute('webkitallowfullscreen', '');
          iframe.setAttribute('mozallowfullscreen', '');
          // Permissions Policy for modern browsers (includes fullscreen and PiP)
          const allowExisting = iframe.getAttribute('allow') || '';
          const needed = 'fullscreen; picture-in-picture; encrypted-media; autoplay;';
          if (!allowExisting.includes('fullscreen')) {
            iframe.setAttribute('allow', `${allowExisting} ${needed}`.trim());
          }
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
    apply();

    // Observe for iframe additions/changes and keep applying attributes
    const observer = new MutationObserver(() => {
      apply();
    });
    observer.observe(container, { childList: true, subtree: true });

    // Safety timeout to disconnect after 60s (handles SDK re-injections)
    setTimeout(() => observer.disconnect(), 60000);
  }

  // Fallback: allow user to enter/exit fullscreen for the container element
  enterFullscreen(): void {
    const container: any = this.playerContainer?.nativeElement;
    if (!container) return;
    // Prefer requesting fullscreen on the iframe itself for better mobile support
    const iframe: any = container.querySelector('iframe');
    const target: any = iframe || container;
    const req = target?.requestFullscreen || target?.webkitRequestFullscreen || target?.msRequestFullscreen || target?.mozRequestFullScreen;
    if (req) {
      try {
        req.call(target);
        // After a short delay, verify if fullscreen engaged; otherwise, use immersive fallback
        setTimeout(() => {
          if (!(document as any).fullscreenElement && !(document as any).webkitFullscreenElement) {
            this.enableImmersive();
          }
        }, 250);
        return;
      } catch {}
    }
    // Fallback to container if iframe call failed
    if (target !== container) {
      const req2 = container.requestFullscreen || (container as any).webkitRequestFullscreen || (container as any).msRequestFullscreen || (container as any).mozRequestFullScreen;
      try {
        req2?.call(container);
        setTimeout(() => {
          if (!(document as any).fullscreenElement && !(document as any).webkitFullscreenElement) {
            this.enableImmersive();
          }
        }, 250);
      } catch {
        this.enableImmersive();
      }
    }
  }

  exitFullscreen(): void {
    const d: any = document as any;
    const exit = document.exitFullscreen || d.webkitExitFullscreen || d.msExitFullscreen || d.mozCancelFullScreen;
    if (exit) {
      try { exit.call(document); } catch {}
    }
    this.disableImmersive();
  }

  toggleFullscreen(): void {
    if (document.fullscreenElement) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }

  private enableImmersive(): void {
    try {
      document.body.classList.add('no-scroll');
      this.wrapper?.nativeElement.classList.add('immersive-active');
    } catch {}
  }

  private disableImmersive(): void {
    try {
      document.body.classList.remove('no-scroll');
      this.wrapper?.nativeElement.classList.remove('immersive-active');
    } catch {}
  }
}
