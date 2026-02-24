import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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

type PackageOption = {
  title: string;
  duration: string;
  price: string;
  points: string[];
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
  points?: string[];
};

@Component({
  selector: 'app-yachtbook',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './yachtbook.component.html',
  styleUrls: ['./yachtbook.component.css'],
})
export class YachtBookComponent implements OnInit, OnDestroy {
  @ViewChild('nativeForm') nativeForm?: ElementRef<HTMLFormElement>;

  readonly yacht = signal<YachtDetail | null>(null);

  /** UI helpers: show only fields that actually exist (no fake 0 / — noise) */
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

    // Keep only the most decision-driving info in the header
    add('Guests', y.capacity);
    add('Length', y.length);
    add('Speed', y.speed);
    add('Total time', y.totalTime);
    add('Starting from', y.startingFrom);

    // Keep it tidy on the top row
    return out.slice(0, 5);
  });

  readonly specItems = computed(() => {
    const y = this.yacht();
    if (!y) return [] as Array<{ k: string; v: string }>;

    const out: Array<{ k: string; v: string }> = [];
    const add = (k: string, v?: string | number | null, formatter?: (x: any) => string) => {
      if (v === undefined || v === null) return;
      const s = formatter ? formatter(v) : String(v);
      const val = String(s).trim();
      if (!val || val === '0') return; // don't show meaningless zeros
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

    // Supports comma-separated or newline-separated inclusions
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

  /** Pricing cards (better UX than hiding prices inside text) */
  readonly pricingCards = computed(() => {
    const y = this.yacht();
    if (!y) return [] as PriceCard[];

    const cards: PriceCard[] = [];
    const addCard = (title: string, price?: string, sub?: string, points?: string[]) => {
      const p = (price ?? '').trim();
      if (!p) return;
      cards.push({ title, price: p, sub, points });
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

    // Show “starting from” only when it adds new info
    const start = (y.startingFrom ?? '').trim();
    const morning = (y.morningRate ?? '').trim();
    const evening = (y.eveningRate ?? '').trim();
    if (start && start !== morning && start !== evening) {
      addCard('Starting from', start, durationLine);
    }

    return cards;
  });

  /** JSON-LD for better SEO (safe textContent binding) */
  readonly seoJsonLd = computed(() => {
    const y = this.yacht();
    if (!y) return '';

    const offerPrices = [y.startingFrom, y.morningRate, y.eveningRate]
      .map(v => String(v ?? '').trim())
      .filter(Boolean);

    const jsonLd: any = {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      name: `${y.name} Yacht Booking`,
      description: (y.description ?? '').trim() || `Book ${y.name} yacht in Goa.`,
      touristType: ['Luxury travel', 'Private charter'],
      provider: { '@type': 'LocalBusiness', name: 'Yacht Charter Goa' },
      location: { '@type': 'Place', name: 'Goa, India' },
    };

    if (offerPrices.length) {
      jsonLd.offers = offerPrices.map(p => ({
        '@type': 'Offer',
        price: p.replace(/[^0-9.]/g, ''),
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: this.router.url,
      }));
    }

    return JSON.stringify(jsonLd);
  });

  /**
   * Trip details (section like the provided screenshot)
   * - keeps the content stable, but uses yacht data where it helps (guests, duration)
   */
  readonly tripDetails = computed(() => {
    const y = this.yacht();
    if (!y) return [] as TripDetailItem[];

    const totalTime = (y.totalTime ?? '').trim();
    const minHoursText = totalTime
      ? `Minimum ${totalTime} are necessary to book this yacht, additional hours can be taken.`
      : 'Minimum 2 hours are necessary to book this yacht, additional hours can be taken.';

    const maxGuests = y.capacity ? `${y.capacity} Pax` : '—';

    const items: TripDetailItem[] = [
      { icon: '⚓', label: 'Activity Location', value: 'Panjim, North Goa' },
      { icon: '🛥️', label: 'Departure Point', value: 'Will be shared after booking.' },
      { icon: '📍', label: 'Reporting Time', value: '30 mins prior to the departure time' },
      {
        icon: '⏱️',
        label: 'Timings & Duration',
        value: `Custom timing as per the requirement between 9:00 AM to 11:00 PM, available 7 days a week in season. ${minHoursText}`,
      },
      { icon: '🛟', label: 'End point', value: 'This activity ends back at the departure point.' },
      { icon: '👥', label: 'Max Guests Allowed', value: maxGuests },
    ];

    return items;
  });

  // Gallery state
  readonly galleryImages = computed(() => {
    const y = this.yacht();
    if (!y) return [];
    const baseAlt = y.imageAlt || `${y.name} yacht in Goa`;
    const imgs = (y.images && y.images.length ? y.images : []).map((url, i) => ({
      url,
      alt: `${baseAlt} - image ${i + 1}`,
    }));
    return imgs;
  });

  readonly activeImgIndex = signal(0);
  readonly isLightboxOpen = signal(false);
  readonly isHoveringGallery = signal(false);

  // Packages (kept safe even if you don’t render packages)
  readonly packages = signal<PackageOption[]>([]);
  readonly selectedPackageIndex = signal<number>(0);

  // Toast + submit
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

  formSubmitAction = 'https://formsubmit.co/ajax/YOUR_EMAIL_HERE';

  private autoSlideTimer?: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly title: Title,
    private readonly meta: Meta
  ) {}

  ngOnInit(): void {
    const state = history.state as any;

    // Prefer router state payload when coming from YachtOptions
    const incoming = state && (state.id || state.name) ? (state as YachtDetail) : null;

    if (incoming) {
      this.yacht.set({
        ...incoming,
        // YachtOptions uses "slider" — normalize to images if needed
        images: incoming.images,
        imageAlt: incoming.imageAlt ?? state.imageAlt ?? `${incoming.name} yacht in Goa`,
      });
    }

    // Ensure gallery starts at 0
    this.activeImgIndex.set(0);

    // SEO (best practice: unique title + meta description)
    const y = this.yacht();
    if (y?.name) {
      this.title.setTitle(`${y.name} Yacht Booking in Goa | Quick Quote`);
      this.meta.updateTag({
        name: 'description',
        content: `Book ${y.name} yacht in Goa. View photos, inclusions, quick specs and submit your booking request in seconds.`,
      });
      this.meta.updateTag({ property: 'og:title', content: `${y.name} Yacht Booking in Goa` });
      this.meta.updateTag({
        property: 'og:description',
        content: `Gallery, inclusions, quick specs, and booking request for ${y.name}.`,
      });
    } else {
      this.title.setTitle('Yacht Booking in Goa | Quick Quote');
      this.meta.updateTag({
        name: 'description',
        content: 'Book a premium yacht experience in Goa. Browse photos, specs and request a quick quote.',
      });
    }

    // Prefill message (optional)
    if (y?.name) {
      const base = `Hi, I want to book ${y.name}. Please share availability and best price.`;
      this.contactForm.patchValue({ message: base });
    }

    // Auto-slide gallery on hover
    this.startAutoSlideOnHover();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  // -------- Gallery / Lightbox --------

  activeImg = computed(() => this.galleryImages()[this.activeImgIndex()] ?? null);

  setActiveImg(i: number) {
    const total = this.galleryImages().length;
    if (!total) return;
    const safe = Math.max(0, Math.min(i, total - 1));
    this.activeImgIndex.set(safe);
  }

  prevMain() {
    const total = this.galleryImages().length;
    if (!total) return;
    const next = (this.activeImgIndex() - 1 + total) % total;
    this.activeImgIndex.set(next);
  }

  nextMain() {
    const total = this.galleryImages().length;
    if (!total) return;
    const next = (this.activeImgIndex() + 1) % total;
    this.activeImgIndex.set(next);
  }

  openLightbox(index: number) {
    this.setActiveImg(index);
    this.isLightboxOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.isLightboxOpen.set(false);
    document.body.style.overflow = '';
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

  private startAutoSlideOnHover() {
    this.autoSlideTimer = setInterval(() => {
      if (!this.isHoveringGallery()) return;
      if (this.isLightboxOpen()) return;
      if (this.galleryImages().length <= 1) return;
      this.nextMain();
    }, 2200);
  }

  private stopAutoSlide() {
    if (this.autoSlideTimer) clearInterval(this.autoSlideTimer);
  }

  // -------- Form submit (same behavior) --------

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
    setTimeout(() => this.hideToast(), 4000);
  }

  hideToast() {
    this.toast.visible = false;
  }

  // Touch swipe handlers
  private touchStartX = 0;
  onTouchStart(e: TouchEvent) {
    this.touchStartX = e.changedTouches[0]?.clientX ?? 0;
  }
  onTouchEnd(e: TouchEvent) {
    const endX = e.changedTouches[0]?.clientX ?? 0;
    const dx = endX - this.touchStartX;
    if (Math.abs(dx) < 40) return;
    dx > 0 ? this.prevMain() : this.nextMain();
  }
}