import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, Inject, OnDestroy, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

type YachtDetail = {
  id: string;
  name: string;
  capacity: number;
  length: string;
  speed: string;
  sleeping: number;
  cabin: number;
  crew: number;
  morningRate: string;
  eveningRate: string;
  startingFrom: string;
  cruiseTime: string;
  anchoringTime: string;
  totalTime: string;
  imageUrl: string;
  imageAlt: string;
  images: string[];
  inclusions: string;
  description: string;
  additions: string;
};

type TripDetailItem = {
  icon: string;
  label: string;
  value: string;
};

type PriceCard = {
  title: string;
  price: string;
  sub?: string;
};

@Component({
  selector: 'app-yachtbook',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './yachtbook.component.html',
  styleUrls: ['./yachtbook.component.css'],
})
export class YachtBookComponent implements OnInit, OnDestroy {
   private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
   private keyController?: AbortController;
  readonly yacht = signal<YachtDetail | null>(null);

  /** Header badges: only the most decision-driving info */
  readonly headerBadges = computed(() => {
    const y = this.yacht();
    if (!y) return [] as Array<{ k: string; v: string }>;

    const out: Array<{ k: string; v: string }> = [];
    const add = (k: string, v?: string | number | null) => {
      if (v === undefined || v === null) return;
      const s = String(v).trim();
      if (!s) return;
      out.push({ k, v: s });
    };

    add('Guests', y.capacity);
    add('Length', y.length);
    add('Speed', y.speed);
    add('Total time', y.totalTime);
    add('Starting from', y.startingFrom);

    return out.slice(0, 5);
  });

  readonly specItems = computed(() => {
    const y = this.yacht();
    if (!y) return [] as Array<{ k: string; v: string }>;

    const out: Array<{ k: string; v: string }> = [];
    const add = (k: string, v?: string | number | null) => {
      if (v === undefined || v === null) return;
      const val = String(v).trim();
      if (!val || val === '0') return;
      out.push({ k, v: val });
    };

    add('Guests', y.capacity);
    add('Length', y.length);
    add('Speed', y.speed);
    add('Sleeping', y.sleeping);
    add('Cabins', y.cabin);
    add('Crew', y.crew);
    add('Cruise time', y.cruiseTime);
    add('Anchoring time', y.anchoringTime);
    add('Total time', y.totalTime);
    add('Rate', y.startingFrom);

    return out;
  });

  readonly inclusionsList = computed(() => {
    const raw = (this.yacht()?.inclusions ?? '').trim();
    if (!raw) return [] as string[];
    return raw
      .split(/\r?\n|,/g)
      .map(s => s.trim())
      .filter(Boolean);
  });

  readonly additionsList = computed(() => {
    const raw = (this.yacht()?.additions ?? '').trim();
    if (!raw) return [] as string[];
    return raw
      .split(/\r?\n|,/g)
      .map(s => s.trim())
      .filter(Boolean);
  });

  readonly pricingCards = computed(() => {
    const y = this.yacht();
    if (!y) return [] as PriceCard[];

    const cards: PriceCard[] = [];
    const addCard = (title: string, price?: string, sub?: string) => {
      const p = (price ?? '').trim();
      if (!p) return;
      cards.push({ title, price: p, sub });
    };

    const total = (y.totalTime ?? '').trim();
    const cruise = (y.cruiseTime ?? '').trim();
    const anchor = (y.anchoringTime ?? '').trim();

    const durationBits = [
      total ? `Total: ${total}` : '',
      cruise ? `Cruise: ${cruise}` : '',
      anchor ? `Anchoring: ${anchor}` : '',
    ].filter(Boolean);

    const durationLine = durationBits.length ? durationBits.join(' • ') : undefined;

    addCard('Morning charter', y.morningRate, durationLine);
    addCard('Evening charter', y.eveningRate, durationLine);

    const start = (y.startingFrom ?? '').trim();
    const morning = (y.morningRate ?? '').trim();
    const evening = (y.eveningRate ?? '').trim();
    if (start && start !== morning && start !== evening) {
      addCard('Starting from', start, durationLine);
    }

    return cards;
  });

  /** Gallery */
  readonly galleryImages = computed(() => {
    const y = this.yacht();
    if (!y) return [];
    const baseAlt = y.imageAlt || `${y.name} yacht in Goa`;
    return (y.images && y.images.length ? y.images : []).map((url, i) => ({
      url,
      alt: `${baseAlt} - image ${i + 1}`,
    }));
  });

  readonly activeImgIndex = signal(0);
  readonly isLightboxOpen = signal(false);
  readonly isHoveringGallery = signal(false);

  activeImg = computed(() => this.galleryImages()[this.activeImgIndex()] ?? null);

  /** JSON-LD for richer SEO */
  readonly seoJsonLd = computed(() => {
    const y = this.yacht();
    if (!y) return '';

    const offerPrices = [y.startingFrom, y.morningRate, y.eveningRate]
      .map(v => String(v ?? '').trim())
      .filter(Boolean);

    const url = this.getAbsoluteUrl();

    const jsonLd: any = {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      name: `${y.name} Yacht Booking`,
      description: (y.description ?? '').trim() || `Book ${y.name} yacht in Goa.`,
      touristType: ['Luxury travel', 'Private charter'],
      provider: { '@type': 'LocalBusiness', name: 'Sea Rider Goa' },
      location: { '@type': 'Place', name: 'Goa, India' },
      url,
    };

    if (offerPrices.length) {
      jsonLd.offers = offerPrices.map(p => ({
        '@type': 'Offer',
        price: p.replace(/[^0-9.]/g, ''),
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url,
      }));
    }

    return JSON.stringify(jsonLd);
  });

  readonly tripDetails = computed(() => {
    const y = this.yacht();
    if (!y) return [] as TripDetailItem[];
   
    const maxGuests = y.capacity ? `${y.capacity} Pax` : '—';

    return [
      { icon: '⚓', label: 'Activity Location', value: 'Panjim, North Goa' },
      { icon: '🛥️', label: 'Departure Point', value: 'Will be shared after booking.' },
      { icon: '📍', label: 'Reporting Time', value: '30 mins prior to the departure time' },
      {
        icon: '⏱️',
        label: 'Timings & Duration',
        value: `Custom timing as per the requirement between 9:00 AM to 11:00 PM, available 7 days a week in season.`,
      },
      { icon: '🛟', label: 'End point', value: 'This activity ends back at the departure point.' },
      { icon: '👥', label: 'Max Guests Allowed', value: maxGuests },
    ];
  });

  /** Form */
  toast = { visible: false, type: 'success' as 'success' | 'error', title: '', message: '' };
  isSubmitting = false;
  submitted = false;

  readonly contactForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    email: ['', [Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  get f() {
    return this.contactForm.controls;
  }

  // Replace this with your real receiver email (FormSubmit)
  formSubmitAction = 'https://formsubmit.co/ajax/YOUR_EMAIL_HERE';

  private autoSlideTimer?: number;
  private toastTimer?: number;
isYachtOptions = false;

  constructor(
     private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly title: Title,
    private readonly meta: Meta,
    @Inject(DOCUMENT) private readonly doc: Document
  ) {}

  ngOnInit(): void {
     this.isYachtOptions = this.router.url.includes('/book-yacht/');

    const state = history.state as any;

    const incoming = state && (state.id || state.name) ? (state as YachtDetail) : null;
    if (incoming) {
      this.yacht.set({
        ...incoming,
        images: incoming.images,
        imageAlt: incoming.imageAlt ?? state.imageAlt ?? `${incoming.name} yacht in Goa`,
      });
    }

    this.activeImgIndex.set(0);

    this.applySeoTags();

    const y = this.yacht();
    if (y?.name) {
      const base = `Hi, I want to book ${y.name}. Please share availability and best price.`;
      this.contactForm.patchValue({ message: base });
    }

    this.startAutoSlide();
      if (isPlatformBrowser(this.platformId)) {
      this.keyController = new AbortController();
      this.doc.addEventListener(
        'keydown',
        (e: KeyboardEvent) => {
          if (!this.isLightboxOpen()) return;

          if (e.key === 'Escape') {
            e.preventDefault();
            this.closeLightbox();
            return;
          }
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.prevMain();
            return;
          }
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.nextMain();
            return;
          }
        },
        { signal: this.keyController.signal }
      );

      this.destroyRef.onDestroy(() => this.keyController?.abort());
    }
  }
  private startAutoSlide() {
  this.autoSlideTimer = window.setInterval(() => {
    // Pause while user is interacting so arrows/thumbs feel responsive
    if (this.isHoveringGallery()) return;
    if (this.isLightboxOpen()) return;
    if (this.galleryImages().length <= 1) return;
    this.nextMain();
  }, 3200);
}

// Touch swipe handlers
private touchStartX = 0;

onTouchStart(e: TouchEvent) {
  this.touchStartX = e.changedTouches[0]?.clientX ?? 0;
  this.isHoveringGallery.set(true);
}

onTouchEnd(e: TouchEvent) {
  const endX = e.changedTouches[0]?.clientX ?? 0;
  const dx = endX - this.touchStartX;

  if (Math.abs(dx) >= 40) {
    dx > 0 ? this.prevMain() : this.nextMain();
  }

  // Resume autoplay shortly after touch interaction
  window.setTimeout(() => this.isHoveringGallery.set(false), 800);
}

  ngOnDestroy(): void {
    this.stopAutoSlide();
    if (this.toastTimer) window.clearTimeout(this.toastTimer);
       this.keyController?.abort();
  }

  private applySeoTags() {
    const y = this.yacht();
    const name = y?.name?.trim();

    const title = name ? `${name} Yacht Booking in Goa | Quick Quote` : 'Yacht Booking in Goa | Quick Quote';
    const desc = name
      ? `Book ${name} yacht in Goa. View photos, inclusions, quick specs and submit your booking request in seconds.`
      : 'Book a premium yacht experience in Goa. Browse photos, specs and request a quick quote.';

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:type', content: 'website' });

    const absUrl = this.getAbsoluteUrl();
    if (absUrl) this.meta.updateTag({ property: 'og:url', content: absUrl });

    const firstImg = this.galleryImages()[0]?.url || y?.imageUrl;
    if (firstImg) this.meta.updateTag({ property: 'og:image', content: firstImg });
  }

  private getAbsoluteUrl(): string {
    const origin = this.doc?.location?.origin ?? '';
    const path = this.router.url || '';
    return origin ? `${origin}${path}` : path;
  }

  // -------- Gallery / Lightbox --------
  setActiveImg(i: number) {
    const total = this.galleryImages().length;
    if (!total) return;
    const safe = Math.max(0, Math.min(i, total - 1));
    this.activeImgIndex.set(safe);
  }

  prevMain() {
    const total = this.galleryImages().length;
    if (!total) return;
    this.activeImgIndex.set((this.activeImgIndex() - 1 + total) % total);
  }

  nextMain() {
    const total = this.galleryImages().length;
    if (!total) return;
    this.activeImgIndex.set((this.activeImgIndex() + 1) % total);
  }

 openLightbox(index: number) {
    this.setActiveImg(index);
    this.isLightboxOpen.set(true);

    // Prevent background scroll (match Gallery behavior)
    this.doc.documentElement.classList.add('no-scroll');
  }

  closeLightbox() {
    this.isLightboxOpen.set(false);
    this.doc.documentElement.classList.remove('no-scroll');
  }

  stopPropagation(e: Event) {
    e.stopPropagation();
  }

  onGalleryMouseEnter() {
    this.isHoveringGallery.set(true);
  }

  onGalleryMouseLeave() {
    this.isHoveringGallery.set(false);
  }

  private stopAutoSlide() {
    if (this.autoSlideTimer) window.clearInterval(this.autoSlideTimer);
  }

  // -------- Form submit --------
  async onSubmit() {
    this.submitted = true;

    if (this.contactForm.invalid) {
      this.showToast('error', 'Please check the form', 'Fill all required fields correctly.');
      return;
    }

    try {
      this.isSubmitting = true;

      const payload = new FormData();
      payload.append('name', this.f.fullName.value ?? '');
      payload.append('phone', this.f.phone.value ?? '');
      payload.append('email', this.f.email.value ?? '');
      payload.append('message', this.f.message.value ?? '');

      const res = await fetch(this.formSubmitAction, {
        method: 'POST',
        body: payload,
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) throw new Error('Submit failed');

      this.contactForm.reset();
      this.submitted = false;
      this.showToast('success', 'Query submitted', 'We will contact you shortly with the best options.');
    } catch {
      this.showToast('error', 'Something went wrong', 'Please try again or contact us on WhatsApp.');
    } finally {
      this.isSubmitting = false;
    }
  }

  showToast(type: 'success' | 'error', title: string, message: string) {
    this.toast = { visible: true, type, title, message };
    if (this.toastTimer) window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.hideToast(), 4000);
  }

  hideToast() {
    this.toast.visible = false;
  }

}
