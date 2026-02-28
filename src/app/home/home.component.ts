import { CommonModule, DOCUMENT, NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { animate, style, transition, trigger } from '@angular/animations';

import { GalleryComponent } from '../gallery/gallery.component';
import { TestimonialsComponent } from '../testimonials/testimonials.component';
import { ExploreComponent } from '../explore/explore.component';
import { YachtOptionsComponent } from '../yachtOptions/yachtOptions.component';

type Slide = { imageUrl: string; subTitle: string; alt?: string };

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
      transition(
        ':enter',
        [style({ opacity: 0 }), animate('{{t}}ms ease', style({ opacity: 1 }))],
        { params: { t: 650 } }
      ),
      transition(':leave', [animate('{{t}}ms ease', style({ opacity: 0 }))], {
        params: { t: 650 },
      }),
    ]),
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly doc = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  // ----- Slider data -----
  slides: Slide[] = [
    {
      imageUrl: 'assets/slider/1.jpeg',
      subTitle: 'Premium yachts and curated experiences.',
      alt: 'Luxury yacht cruise in Goa at sunset',
    },
    {
      imageUrl: 'assets/slider/5.jpeg',
      subTitle: 'Transparent pricing and easy booking.',
      alt: 'Premium yacht deck experience in Goa',
    },
    {
      imageUrl: 'assets/slider/2.png',
      subTitle: 'The finest yacht charters for every occasion.',
      alt: 'Yacht charter in Goa for families and friends',
    },
    {
      imageUrl: 'assets/slider/3.png',
      subTitle: 'Redefine your events, celebrations and parties.',
      alt: 'Party yacht in Goa for celebrations',
    },
    {
      imageUrl: 'assets/slider/4.jpeg',
      subTitle: 'Private cruises, proposals, birthdays & corporate events.',
      alt: 'Private yacht rental in Goa with crew',
    },
  ];

  currentIndex = 0;
  reducedMotion = false;

  // for true fade-out + fade-in (prev image stays briefly)
  showPrev = false;
  prevSlideUrl: string | null = null;
  slideAnimKey = 0;

  private intervalId: number | null = null;
  private firstSlideReady = false;

  private preloadImages: HTMLImageElement[] = [];

  private readonly headerOffsetVarName = '--header-offset';
  private removeResizeListener: (() => void) | null = null;

  get currentSlide(): string {
    return this.slides[this.currentIndex]?.imageUrl ?? '';
  }

  get currentSubtitle(): string {
    return this.slides[this.currentIndex]?.subTitle ?? '';
  }

  get currentAlt(): string {
    return this.slides[this.currentIndex]?.alt ?? 'Luxury yacht rentals in Goa';
  }

  get jsonLd(): string {
    const origin = isPlatformBrowser(this.platformId) ? window.location.origin : '';
    const data = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Sea Rider',
      url: origin || undefined,
      areaServed: 'Goa, India',
      description:
        'Luxury yacht rentals in Goa for cruises, parties, proposals, birthdays, and corporate events. Transparent pricing and instant support.',
      serviceType: ['Yacht rental', 'Yacht charter', 'Party yacht', 'Sunset cruise'],
    };
    return JSON.stringify(data);
  }

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.addPreloadLinksToHead();
      queueMicrotask(() => this.syncHeaderOffset());
    }
  }

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

    this.setupSeo();

    this.preloadAllSlides();
    await this.ensureFirstSlideDecoded();

    // Prevent hero being hidden under fixed header
    this.syncHeaderOffset();
    const onResize = () => this.syncHeaderOffset();
    window.addEventListener('resize', onResize, { passive: true });
    this.removeResizeListener = () => window.removeEventListener('resize', onResize);

    this.firstSlideReady = true;
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    this.removeResizeListener?.();
    this.removeResizeListener = null;
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

  ctaRipple(ev: PointerEvent): void {
    const btn = ev.currentTarget as HTMLElement | null;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;

    btn.style.setProperty('--ripple-x', `${x}px`);
    btn.style.setProperty('--ripple-y', `${y}px`);
    btn.classList.remove('rippling');
    void btn.offsetWidth; // reflow
    btn.classList.add('rippling');
  }

  private startAutoplay(): void {
    if (this.reducedMotion) return;
    if (this.intervalId != null) return;

    // Slower feels more premium/readable
    this.intervalId = window.setInterval(() => this.nextSlide(), 4500);
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
    this.prevSlideUrl = this.currentSlide;
    this.showPrev = true;

    this.currentIndex = nextIndex;
    this.slideAnimKey++;

    const t = this.reducedMotion ? 0 : 650;
    window.setTimeout(() => {
      this.showPrev = false;
      this.prevSlideUrl = null;
    }, t);
  }

  private addPreloadLinksToHead(): void {
    const urls = this.uniqueSlideUrls().slice(0, 2);

    for (const href of urls) {
      const already = this.doc.head?.querySelector(`link[rel="preload"][as="image"][href="${href}"]`);
      if (already) continue;

      const link = this.doc.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = href;
      link.setAttribute('fetchpriority', 'high');
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

    let img = this.preloadImages.find((i) => i.src.endsWith(first));
    if (!img) {
      img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      img.src = first;
      this.preloadImages.unshift(img);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyImg = img as any;
      if (typeof anyImg.decode === 'function') {
        await anyImg.decode();
      } else {
        await new Promise<void>((resolve) => {
          if (img.complete) return resolve();
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      }
    } catch {
      // best-effort
    }
  }

  private uniqueSlideUrls(): string[] {
    const set = new Set<string>();
    for (const s of this.slides) set.add(s.imageUrl);
    return Array.from(set);
  }

  private syncHeaderOffset(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const headerEl =
      (this.doc.querySelector('app-header') as HTMLElement | null) ||
      (this.doc.querySelector('[data-fixed-header]') as HTMLElement | null) ||
      (this.doc.querySelector('header') as HTMLElement | null);

    const fallback = 72;
    const h = headerEl?.getBoundingClientRect()?.height
      ? Math.round(headerEl.getBoundingClientRect().height)
      : fallback;

    this.doc.documentElement.style.setProperty(this.headerOffsetVarName, `${h}px`);
  }

  private setupSeo(): void {
    const title = 'Sea Rider Goa | Luxury Yacht Rentals, Parties & Cruises';
    const description =
      'Book luxury yacht rentals in Goa with transparent pricing, instant support, and premium crew. Perfect for cruises, parties, proposals, birthdays, and corporate events.';

    this.title.setTitle(title);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index,follow,max-image-preview:large' });

    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    const canonical = this.doc.head?.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const href = window.location.origin + window.location.pathname;
    if (canonical) canonical.href = href;
    else {
      const link = this.doc.createElement('link');
      link.rel = 'canonical';
      link.href = href;
      this.doc.head?.appendChild(link);
    }
  }
}