import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
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
  title = 'SeekerAI';
  currentYear: number = new Date().getFullYear();
  showBackToTop = false;
  private scrollSubscription?: Subscription;

  constructor() {}

  ngOnInit() {
    // Initialize scroll listener
    this.scrollSubscription = fromEvent(window, 'scroll', { passive: true }).subscribe(() => {
      this.checkScrollPosition();
    });
    
    // Initial check in case the page is loaded with scroll position
    this.checkScrollPosition();
  }

  @HostListener('window:scroll')
  checkScrollPosition() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showBackToTop = scrollPosition > 300; // Show button after scrolling 300px
    console.log('Scroll position:', scrollPosition, 'Show button:', this.showBackToTop);
  }
  
  // For debugging
  ngAfterViewInit() {
    console.log('AppComponent initialized, checking initial scroll position');
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