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

type ToastType = 'success' | 'error';

interface ToastState {
  visible: boolean;
  type: ToastType;
  title: string;
  message: string;
}

interface GalleryImage {
  url: string;
  alt: string;
}

type YachtPackage = {
  label: string;
  price?: string;
  subtitle?: string;
};

type YachtDetail = {
  id?: string;
  name: string;
  length?: string;
  rating?: number;
  capacity?: number;
  speed?: string;
  cabin?: number;
  crew?: number;
  totalTime?: string;
  rate?: string;
  description?: string;
  highlights?: string[];
  imageUrl?: string;
  imageAlt?: string;
  images?: string[];
  packages?: YachtPackage[];
  // You were mapping state.slider -> images in ngOnInit already
  slider?: string[];
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

  // --- Enquire-style state (same behaviour) ---
  contactForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    // Email is optional, but if provided it must be valid
    email: ['', [Validators.email]],
    // Phone is mandatory (10 digits)
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  submitted = false;
  isSubmitting = false;

  toast: ToastState = {
    visible: false,
    type: 'success',
    title: '',
    message: '',
  };

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  /** Keep this in ONE place (easy to change later) */
  readonly formSubmitAction = 'https://formsubmit.co/mittalpriyanshu19@gmail.com';

  // --- Existing yacht page state ---
  readonly yacht = signal<YachtDetail | null>(null);

  // Gallery (auto-slider + lightbox)
  readonly activeImgIndex = signal(0);

  readonly galleryImages = computed<GalleryImage[]>(() => {
    const y = this.yacht();
    const imgs = (y?.images?.length ? y.images : y?.imageUrl ? [y.imageUrl] : []) as string[];

    const baseAlt = y?.name ? `${y.name} yacht photo` : 'Yacht photo';
    return imgs.filter(Boolean).map((url, i) => ({ url, alt: `${baseAlt} ${i + 1}` }));
  });

  readonly activeImg = computed(() => this.galleryImages()[this.activeImgIndex()] ?? null);

  // Autoplay
  private autoplayTimer: ReturnType<typeof setInterval> | null = null;
  readonly isAutoplayPaused = signal(false);

  // Lightbox (same UX as Gallery modal)
  readonly isLightboxOpen = signal(false);
  readonly lightboxIndex = signal(0);
  readonly lightboxItem = computed(() => this.galleryImages()[this.lightboxIndex()] ?? null);

  private readonly keyHandler = (e: KeyboardEvent) => {
    if (!this.isLightboxOpen()) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      this.closeLightbox();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.prevLightbox();
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.nextLightbox();
      return;
    }
  };

  private touchStartX = 0;

  // Packages
  readonly packages = computed(() => this.yacht()?.packages ?? []);
  readonly selectedPackageLabel = signal<string>('');

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly title: Title,
    private readonly meta: Meta
  ) {}

  get f() {
    return this.contactForm.controls;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    const state = history.state;

    // You were mapping slider -> images; keeping that logic stable
    const y = { ...state, images: state.slider } as YachtDetail;

    this.yacht.set(y);
    this.activeImgIndex.set(0);
    this.resetAutoplay();

    // Default package preselect (first package)
    const firstPkg = y.packages?.[0]?.label ?? '';
    if (firstPkg) this.selectedPackageLabel.set(firstPkg);

    // SEO
    const pageTitle = `${y.name} | Book Yacht in Goa`;
    this.title.setTitle(pageTitle);
    this.meta.updateTag({
      name: 'description',
      content: `Book ${y.name} in Goa. View photos, packages, capacity and submit your booking request in seconds.`,
    });
    this.meta.updateTag({ name: 'robots', content: 'index,follow' });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({
      property: 'og:description',
      content: `Packages, gallery, quick specs, and booking request for ${y.name}.`,
    });

    // Optional: prefill message with yacht/package context WITHOUT changing fields
    const initialPkg = this.selectedPackageLabel();
    const yName = y.name;
    const prefill = `Yacht: ${yName}${initialPkg ? ` | Package: ${initialPkg}` : ''}\n\nMessage: `;
    if (!this.contactForm.get('message')?.value) {
      this.contactForm.patchValue({ message: prefill });
    }
  }

  ngOnDestroy(): void {
    this.clearToastTimer();
    this.stopAutoplay();
    this.unlockScroll();
    window.removeEventListener('keydown', this.keyHandler);
  }

  private showToast(type: ToastType, title: string, message: string): void {
    this.toast = { visible: true, type, title, message };
    this.clearToastTimer();
    this.toastTimer = setTimeout(() => this.hideToast(), 3500);
  }

  hideToast(): void {
    this.toast = { ...this.toast, visible: false };
    this.clearToastTimer();
  }

  private clearToastTimer(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
  }

  // --- SAME submit logic as Enquire ---
  async onSubmit(): Promise<void> {
    this.submitted = true;

    if (this.contactForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;

    try {
      const formEl = this.nativeForm?.nativeElement;
      let formData: FormData;

      if (formEl) {
        formData = new FormData(formEl);
      } else {
        formData = new FormData();
        formData.append('name', String(this.contactForm.value.fullName ?? ''));
        formData.append('email', String(this.contactForm.value.email ?? ''));
        formData.append('phone', String(this.contactForm.value.phone ?? ''));
        formData.append('message', String(this.contactForm.value.message ?? ''));
      }

      const res = await fetch(this.formSubmitAction, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) throw new Error('Bad response');

      this.showToast('success', 'Query submitted', 'We’ll get back to you shortly.');
      this.contactForm.reset();
      this.submitted = false;
    } catch {
      this.showToast('error', 'Network issue', 'Please check your connection and try again.');
    } finally {
      this.isSubmitting = false;
    }
  }

  // ===== Gallery controls =====

  setActiveImg(i: number) {
    const count = this.galleryImages().length;
    if (!count) return;
    this.activeImgIndex.set(Math.max(0, Math.min(i, count - 1)));
    this.bumpAutoplay();
  }

  prevMain(): void {
    const count = this.galleryImages().length;
    if (count <= 1) return;
    const next = (this.activeImgIndex() - 1 + count) % count;
    this.activeImgIndex.set(next);
    this.bumpAutoplay();
  }

  nextMain(): void {
    const count = this.galleryImages().length;
    if (count <= 1) return;
    const next = (this.activeImgIndex() + 1) % count;
    this.activeImgIndex.set(next);
    this.bumpAutoplay();
  }

  onGalleryMouseEnter(): void {
    this.isAutoplayPaused.set(true);
  }

  onGalleryMouseLeave(): void {
    this.isAutoplayPaused.set(false);
  }

  // --- Autoplay helpers ---
  private resetAutoplay(): void {
    this.stopAutoplay();
    const count = this.galleryImages().length;
    if (count <= 1) return;

    this.autoplayTimer = setInterval(() => {
      if (this.isAutoplayPaused() || this.isLightboxOpen()) return;
      const c = this.galleryImages().length;
      if (c <= 1) return;
      this.activeImgIndex.set((this.activeImgIndex() + 1) % c);
    }, 3500);
  }

  private stopAutoplay(): void {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  private bumpAutoplay(): void {
    // quick restart so the user has time to see their chosen image
    this.stopAutoplay();
    const count = this.galleryImages().length;
    if (count <= 1) return;

    this.autoplayTimer = setInterval(() => {
      if (this.isAutoplayPaused() || this.isLightboxOpen()) return;
      const c = this.galleryImages().length;
      if (c <= 1) return;
      this.activeImgIndex.set((this.activeImgIndex() + 1) % c);
    }, 3500);
  }

  // --- Lightbox (Gallery-like) ---
  openLightbox(index = this.activeImgIndex()): void {
    const count = this.galleryImages().length;
    if (!count) return;
    this.lightboxIndex.set(Math.max(0, Math.min(index, count - 1)));
    this.isLightboxOpen.set(true);
    this.lockScroll();
    window.addEventListener('keydown', this.keyHandler, { passive: false });
  }

  closeLightbox(): void {
    this.isLightboxOpen.set(false);
    this.unlockScroll();
    window.removeEventListener('keydown', this.keyHandler);
  }

  stopPropagation(e: Event): void {
    e.stopPropagation();
  }

  prevLightbox(): void {
    const count = this.galleryImages().length;
    if (count <= 1) return;
    const next = (this.lightboxIndex() - 1 + count) % count;
    this.lightboxIndex.set(next);
  }

  nextLightbox(): void {
    const count = this.galleryImages().length;
    if (count <= 1) return;
    const next = (this.lightboxIndex() + 1) % count;
    this.lightboxIndex.set(next);
  }

  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.changedTouches?.[0]?.clientX ?? 0;
  }

  onTouchEnd(e: TouchEvent): void {
    const endX = e.changedTouches?.[0]?.clientX ?? 0;
    const dx = endX - this.touchStartX;
    const threshold = 40;

    if (Math.abs(dx) < threshold) return;
    if (dx > 0) this.prevLightbox();
    else this.nextLightbox();
  }

  private lockScroll(): void {
    document.documentElement.classList.add('no-scroll');
  }

  private unlockScroll(): void {
    document.documentElement.classList.remove('no-scroll');
  }
}