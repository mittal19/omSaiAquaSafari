import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { NgOptimizedImage } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { fromEvent, merge } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { GALLERY_ITEMS, MediaItem } from './gallery.data';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent {
  private meta = inject(Meta);
  private title = inject(Title);
  private destroyRef = inject(DestroyRef);
  private doc = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  readonly items = signal<MediaItem[]>(GALLERY_ITEMS);

  // Modal state
  readonly isOpen = signal(false);
  readonly activeIndex = signal(0);
  readonly activeItem = computed(() => this.items()[this.activeIndex()]);

  // Slider controls
  readonly autoPlay = signal(true);
  readonly intervalMs = 3500;

  private timerId: number | null = null;

  constructor() {
    // SEO
    this.title.setTitle('Gallery | Om Sai Aqua Safari');
    this.meta.updateTag({
      name: 'description',
      content: 'Explore photos and videos of yacht cruises and water activities by Om Sai Aqua Safari in Goa.',
    });
    this.meta.updateTag({ property: 'og:title', content: 'Gallery | Om Sai Aqua Safari' });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Photos and videos of our yachts, cruises, and water activities in Goa.',
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });

    // Structured Data (simple)
    this.setJsonLd();

    // Pause autoplay when user switches tab or resizes / scrolls (avoid waste)
    if (isPlatformBrowser(this.platformId)) {
      merge(
        fromEvent(document, 'visibilitychange'),
        fromEvent(window, 'resize'),
        fromEvent(window, 'scroll')
      )
        .pipe(debounceTime(150), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          if (document.visibilityState !== 'visible') this.stopAuto();
        });
    }

    // Start/stop autoplay based on modal open + autoPlay
    effect(() => {
      const open = this.isOpen();
      const play = this.autoPlay();

      if (open && play) this.startAuto();
      else this.stopAuto();
    });
  }

  openAt(index: number) {
    this.activeIndex.set(index);
    this.isOpen.set(true);

    // Prevent background scroll (small UX improvement)
    this.doc.documentElement.style.overflow = 'hidden';
  }

  close() {
    this.isOpen.set(false);
    this.doc.documentElement.style.overflow = '';
  }

  next() {
    const list = this.items();
    this.activeIndex.update(i => (i + 1) % list.length);
  }

  prev() {
    const list = this.items();
    this.activeIndex.update(i => (i - 1 + list.length) % list.length);
  }

  toggleAutoplay() {
    this.autoPlay.update(v => !v);
  }

  // Keyboard support
  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (!this.isOpen()) return;

    if (e.key === 'Escape') this.close();
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'ArrowLeft') this.prev();
  }

  // Only create <video> element when needed (fast initial load)
  isVideo(item: MediaItem) {
    return item.type === 'video';
  }

  private startAuto() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.timerId != null) return;

    this.timerId = window.setInterval(() => {
      // Auto-advance only when modal open + visible tab
      if (this.isOpen() && document.visibilityState === 'visible') this.next();
    }, this.intervalMs);
  }

  private stopAuto() {
    if (this.timerId == null) return;
    window.clearInterval(this.timerId);
    this.timerId = null;
  }

  private setJsonLd() {
    // Minimal JSON-LD that won’t bloat. Adjust URLs to your real domain.
    const json = {
      '@context': 'https://schema.org',
      '@type': 'ImageGallery',
      name: 'Om Sai Aqua Safari Gallery',
      description: 'Photos and videos of yacht cruises and water activities in Goa.',
    };

    const scriptId = 'gallery-jsonld';
    const existing = this.doc.getElementById(scriptId);
    if (existing) existing.remove();

    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.id = scriptId;
    script.text = JSON.stringify(json);
    this.doc.head.appendChild(script);
  }
}
