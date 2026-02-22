import { CommonModule, NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { GalleryComponent } from './gallery/gallery.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';
import { ExploreComponent } from '../explore/explore.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, ExploreComponent, GalleryComponent, TestimonialsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [
    // Slider images only: fade-in / fade-out
    trigger('imageFade', [
      // Fade when the element is created
      transition(':enter', [
        style({ opacity: 0 }),
        animate('{{t}}ms ease', style({ opacity: 1 })),
      ], { params: { t: 650 } }),

      // Fade when the bound value changes (slideAnimKey increments)
      transition('* => *', [
        style({ opacity: 0 }),
        animate('{{t}}ms ease', style({ opacity: 1 })),
      ], { params: { t: 650 } }),

      // Fade when the element is removed
      transition(':leave', [
        animate('{{t}}ms ease', style({ opacity: 0 })),
      ], { params: { t: 650 } }),
    ]),
  ],
})
export class HomeComponent {
  private readonly platformId = inject(PLATFORM_ID);

  currentIndex = 0;
  reducedMotion = false;

  // for true fade-out + fade-in
  showPrev = false;
  prevSlideUrl: string | null = null;
  slideAnimKey = 0;

  private intervalId: number | null = null;

  slides = [
    { imageUrl: 'assets/slider/two.jpeg', subTitle: 'Premium yachts and curated experiences.' },
    { imageUrl: 'assets/slider/three.jpeg', subTitle: 'The Finest Yacht Charters for every Occasion.' },
    { imageUrl: 'assets/slider/four.png', subTitle: 'Redefine your Events, Celebrations and Parties.' },
    { imageUrl: 'assets/slider/three.jpeg', subTitle: 'Transparent pricing and easy booking.' },
  ];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
      if (!this.reducedMotion) this.startAutoSlide();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  get currentSlide(): string {
    return this.slides[this.currentIndex]?.imageUrl ?? '';
  }

  get currentSubtitle(): string {
    return this.slides[this.currentIndex]?.subTitle ?? '';
  }

  startAutoSlide(): void {
    this.stopAutoSlide();
    this.intervalId = window.setInterval(() => this.nextSlide(), 5000);
  }

  stopAutoSlide(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  pauseAutoplay(): void {
    if (isPlatformBrowser(this.platformId)) this.stopAutoSlide();
  }

  resumeAutoplay(): void {
    if (isPlatformBrowser(this.platformId) && !this.reducedMotion) this.startAutoSlide();
  }

  nextSlide(): void {
    const next = (this.currentIndex + 1) % this.slides.length;
    this.setSlide(next);
  }

  goToSlide(index: number): void {
    this.setSlide(index);
    if (isPlatformBrowser(this.platformId) && !this.reducedMotion) this.startAutoSlide();
  }

  private setSlide(index: number): void {
    if (index === this.currentIndex) return;

    // previous image fades out
    this.prevSlideUrl = this.currentSlide;
    this.showPrev = true;

    // switch to new slide -> new image fades in
    this.currentIndex = index;

    // triggers the fade transition
    this.slideAnimKey++;

    // after fade duration, remove prev from DOM
    if (isPlatformBrowser(this.platformId)) {
      window.setTimeout(() => {
        this.showPrev = false;
        this.prevSlideUrl = null;
      }, this.reducedMotion ? 0 : 650);
    } else {
      this.showPrev = false;
      this.prevSlideUrl = null;
    }
  }
}