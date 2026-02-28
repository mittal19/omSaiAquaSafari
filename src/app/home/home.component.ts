import { CommonModule, DOCUMENT, NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

import { GalleryComponent } from '../gallery/gallery.component';
import { TestimonialsComponent } from '../testimonials/testimonials.component';
import { ExploreComponent } from '../explore/explore.component';
import { YachtOptionsComponent } from '../yachtOptions/yachtOptions.component';

type Slide = { imageUrl: string; subTitle: string };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    RouterLink,
    ExploreComponent,
    YachtOptionsComponent,
    GalleryComponent,
    TestimonialsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [
    trigger('imageFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('{{t}}ms ease', style({ opacity: 1 })),
      ], { params: { t: 650 } }),
      transition(':leave', [
        animate('{{t}}ms ease', style({ opacity: 0 })),
      ], { params: { t: 650 } }),
    ]),
  ],
})
export class HomeComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly doc = inject(DOCUMENT);

  // ----- Slider data -----
  slides: Slide[] = [
    { imageUrl: 'assets/slider/1.jpeg', subTitle: 'Premium yachts and curated experiences.' },
    { imageUrl: 'assets/slider/5.jpeg', subTitle: 'Transparent pricing and easy booking.' },
    { imageUrl: 'assets/slider/2.png', subTitle: 'The Finest Yacht Charters for every Occasion.' },
    { imageUrl: 'assets/slider/3.png', subTitle: 'Redefine your Events, Celebrations and Parties.' },
    { imageUrl: 'assets/slider/4.jpeg', subTitle: 'Premium yachts and curated experiences.' },
  ];

  currentIndex = 0;
  reducedMotion = false;

  // for true fade-out + fade-in (prev image stays briefly)
  showPrev = false;
  prevSlideUrl: string | null = null;
  slideAnimKey = 0;

  private intervalId: number | null = null;
  private firstSlideReady = false;

  // Keep references so the browser keeps these in memory during session
  private preloadImages: HTMLImageElement[] = [];

  get currentSlide(): string {
    return this.slides[this.currentIndex]?.imageUrl ?? '';
  }

  get currentSubtitle(): string {
    return this.slides[this.currentIndex]?.subTitle ?? '';
  }

  constructor() {
    // Start fetching ASAP (even before ngOnInit)
    if (isPlatformBrowser(this.platformId)) {
      this.addPreloadLinksToHead();
    }
  }

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

    // Warm cache for ALL slides (helps next/prev transitions too)
    this.preloadAllSlides();

    // Ensure first slide is decoded before autoplay kicks in
    await this.ensureFirstSlideDecoded();

    this.firstSlideReady = true;
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  pauseAutoplay(): void {
    this.stopAutoplay();
  }

  resumeAutoplay(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.firstSlideReady) return;
    this.startAutoplay();
  }

  goToSlide(index: number): void {
    if (index === this.currentIndex) return;
    if (index < 0 || index >= this.slides.length) return;
    this.swapTo(index);
  }

  // ---- UI micro-interaction (your template calls this) ----
  ctaRipple(ev: PointerEvent): void {
    const btn = ev.currentTarget as HTMLElement | null;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;

    btn.style.setProperty('--ripple-x', `${x}px`);
    btn.style.setProperty('--ripple-y', `${y}px`);
    btn.classList.remove('rippling');
    // force reflow
    void btn.offsetWidth;
    btn.classList.add('rippling');
  }

  // ---- Autoplay ----
  private startAutoplay(): void {
    if (this.reducedMotion) return; // respect reduced motion
    if (this.intervalId != null) return;

    this.intervalId = window.setInterval(() => {
      this.nextSlide();
    }, 2000);
  }

  private stopAutoplay(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.intervalId == null) return;

    window.clearInterval(this.intervalId);
    this.intervalId = null;
  }

  private nextSlide(): void {
    const next = (this.currentIndex + 1) % this.slides.length;
    this.swapTo(next);
  }

  private swapTo(nextIndex: number): void {
    // keep current as "prev" for fade-out
    this.prevSlideUrl = this.currentSlide;
    this.showPrev = true;

    // switch
    this.currentIndex = nextIndex;

    // triggers the fade transition
    this.slideAnimKey++;

    // after fade duration, remove prev from DOM
    const t = this.reducedMotion ? 0 : 650;
    window.setTimeout(() => {
      this.showPrev = false;
      this.prevSlideUrl = null;
    }, t);
  }

  // ---- Preload logic (fixes first-load delay) ----
  private addPreloadLinksToHead(): void {
    // Preload the first 2 slides with highest priority
    const urls = this.uniqueSlideUrls().slice(0, 2);

    for (const href of urls) {
      // Avoid duplicates
      const already = this.doc.head?.querySelector(`link[rel="preload"][as="image"][href="${href}"]`);
      if (already) continue;

      const link = this.doc.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = href;

      // Hint priority where supported
      link.setAttribute('fetchpriority', 'high');

      // If you ever serve images from a CDN domain, you can also add:
      // link.crossOrigin = 'anonymous';

      this.doc.head?.appendChild(link);
    }
  }

  private preloadAllSlides(): void {
    const urls = this.uniqueSlideUrls();

    this.preloadImages = urls.map((u) => {
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      img.src = u;
      return img;
    });
  }

  private async ensureFirstSlideDecoded(): Promise<void> {
    const first = this.currentSlide;
    if (!first) return;

    // If we already created an Image() for it, use that; otherwise create one.
    let img = this.preloadImages.find((i) => i.src.endsWith(first));
    if (!img) {
      img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      img.src = first;
      this.preloadImages.unshift(img);
    }

    // decode() ensures the image is ready to paint (where supported)
    try {
      // If it’s already loaded, decode resolves quickly.
      // decode() may throw on some browsers; we safely ignore.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyImg = img as any;
      if (typeof anyImg.decode === 'function') {
        await anyImg.decode();
      } else {
        // Fallback: wait for load event if decode isn't available
        await new Promise<void>((resolve) => {
          if (img.complete) return resolve();
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      }
    } catch {
      // ignore: best-effort preload/decode
    }
  }

  private uniqueSlideUrls(): string[] {
    // Deduplicate (you currently repeat 'three.jpeg')
    const set = new Set<string>();
    for (const s of this.slides) set.add(s.imageUrl);
    return Array.from(set);
  }
}