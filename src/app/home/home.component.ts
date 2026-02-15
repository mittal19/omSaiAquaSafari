import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  ViewChild,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { GalleryComponent } from './gallery/gallery.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';
import { ExploreComponent } from './explore/explore.component';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,ExploreComponent,GalleryComponent,TestimonialsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
   private readonly platformId = inject(PLATFORM_ID);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  currentIndex = 0;
  private intervalId: number | null = null;

  slides = [
    { imageUrl: 'assets/slider/one.jpg' },
    { imageUrl: 'assets/slider/two.jpg' },
    { imageUrl: 'assets/slider/one.jpg' },
  ];

  ngOnInit(): void {
    // ✅ SEO (works in SSR too)
    this.title.setTitle('Om Sai Aqua Safari | Yacht & Cruise Rentals in Goa');
    this.meta.updateTag({
      name: 'description',
      content:
        'Book premium yacht rentals and cruises in Goa with Om Sai Aqua Safari. Private & shared options, sunset cruises, and easy online booking.',
    });
    this.meta.updateTag({
      property: 'og:title',
      content: 'Om Sai Aqua Safari - Goa Yacht & Cruise Rentals',
    });
    this.meta.updateTag({
      property: 'og:description',
      content:
        'Premium yacht rentals & cruises in Goa. Private and shared experiences with instant booking support.',
    });

    // ✅ Autoplay only on browser (SSR-safe)
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoSlide();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  startAutoSlide(): void {
    this.stopAutoSlide(); // avoid duplicates

    this.intervalId = window.setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoSlide(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  nextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  goToSlide(index: number): void {
    this.currentIndex = index;

    // restart timer for better UX (browser only)
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoSlide();
    }
  }

  get heroBg(): string {
  const url = this.slides[this.currentIndex]?.imageUrl ?? '';
  return url ? `url(${url})` : 'none';
}

}
