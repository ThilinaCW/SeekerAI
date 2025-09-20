import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { UiService } from './services/ui.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Subscription, fromEvent } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Magenet';
  currentYear: number = new Date().getFullYear();
  showBackToTop = false;
  isDrawerOpen = false;
  private scrollSubscription?: Subscription;
  private drawerSubscription?: Subscription;

  constructor(private uiService: UiService) {}

  ngOnInit() {
    // Initialize scroll listener
    this.scrollSubscription = fromEvent(window, 'scroll', { passive: true }).subscribe(() => {
      this.checkScrollPosition();
    });

    // Initial check in case the page is loaded with scroll position
    this.checkScrollPosition();

    this.drawerSubscription = this.uiService.isDrawerOpen$.subscribe(isOpen => {
      this.isDrawerOpen = isOpen;
      this.checkScrollPosition(); // Re-check visibility when drawer state changes
    });
  }

  @HostListener('window:scroll')
  checkScrollPosition() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showBackToTop = !this.isDrawerOpen && scrollPosition > 300; 
  }

  // For debugging
  ngAfterViewInit() {
    this.checkScrollPosition();
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Smooth scroll to top
    });
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }
}