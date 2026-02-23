import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl, Title, Meta } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

type MediaItem =
  | {
      id: string;
      kind: 'image';
      thumbUrl: string;
      fullUrl: string;
      alt: string;
      width?: number;
      height?: number;
    }
  | {
      id: string;
      kind: 'video';
      thumbUrl: string;
      title: string;
      provider: 'mp4' | 'youtube';
      videoUrl: string;
    };

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
})
export class GalleryComponent {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('infiniteSentinel') infiniteSentinel?: ElementRef<HTMLElement>;
  private io?: IntersectionObserver;

  /** Home/embedded gallery items (KEEP your current view intact) */
  private readonly homeItems = signal<MediaItem[]>([
    {
      id: 'y1',
      kind: 'image',
      thumbUrl: 'assets/gallery/27.jpeg',
      fullUrl: 'assets/gallery/27.jpeg',
      alt: 'Luxury yacht experience in Goa',
      width: 1600,
      height: 1067,
    },
    {
      id: 'c1',
      kind: 'image',
      thumbUrl: 'assets/gallery/5.jpeg',
      fullUrl: 'assets/gallery/5.jpeg',
      alt: 'Sunset cruise in Goa',
      width: 1600,
      height: 1067,
    },
    {
      id: 'v1',
      kind: 'video',
      thumbUrl: 'assets/gallery/goaVideoThumb.png',
      videoUrl: 'assets/gallery/goaVideo.mp4',
      title: 'Yacht experience video in Goa',
      provider: 'mp4',
    },
  ]);

  /** Full-page (/gallery) items loaded from manifest */
  private readonly fullAllItems = signal<MediaItem[]>([]);
  private readonly fullVisibleCount = signal(18);
  private readonly pageSize = 6;

  /** Detect when component is shown on /gallery route */
  readonly isFullPage = signal(false);

  /** Items exposed to template */
  readonly items = computed<MediaItem[]>(() => {
    if (!this.isFullPage()) return this.homeItems();
    const all = this.fullAllItems();
    const count = this.fullVisibleCount();
    return all.slice(0, Math.min(count, all.length));
  });

  readonly canLoadMore = computed(() => {
    if (!this.isFullPage()) return false;
    return this.items().length < this.fullAllItems().length;
  });

  /** Lightbox state */
  readonly isOpen = signal(false);
  private readonly activeIndex = signal<number>(-1);

  /** Lazy-load video only after modal opens */
  private readonly loadVideo = signal(false);

  /** Touch swipe */
  private touchStartX = 0;

  readonly activeItem = computed<MediaItem | null>(() => {
    const list = this.items();
    const idx = this.activeIndex();
    return idx >= 0 && idx < list.length ? list[idx] : null;
  });

  readonly counterText = computed(() => {
    const list = this.items();
    const idx = this.activeIndex();
    if (idx < 0 || idx >= list.length) return '';
    return `${idx + 1} / ${list.length}`;
  });

  readonly safeEmbedUrl = computed<SafeResourceUrl | null>(() => {
    const active = this.activeItem();
    if (!active || active.kind !== 'video' || active.provider !== 'youtube') return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(active.videoUrl);
  });

  constructor() {
    // SEO basics
    this.title.setTitle('Gallery | Om Sai Aqua Safari');
    this.meta.updateTag({
      name: 'description',
      content: 'Photo and video gallery of our yacht and cruise experiences in Goa.',
    });

    // Set initial route mode + subscribe to route changes
    this.applyRouteMode(this.router.url);

    if (isPlatformBrowser(this.platformId)) {
      const sub = this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe((e) => this.applyRouteMode(e.urlAfterRedirects));

      this.destroyRef.onDestroy(() => sub.unsubscribe());
    }

    // ✅ Modal side-effects (this writes signals, so allowSignalWrites is required)
    effect(
      () => {
        const open = this.isOpen();

        if (!isPlatformBrowser(this.platformId)) return;

        if (open) {
          this.doc.documentElement.classList.add('no-scroll');
          queueMicrotask(() => this.loadVideo.set(true));
        } else {
          this.doc.documentElement.classList.remove('no-scroll');
          this.loadVideo.set(false);
          this.activeIndex.set(-1);
        }
      },
      { allowSignalWrites: true }
    );

    // Keyboard controls (no effect needed)
    if (isPlatformBrowser(this.platformId)) {
      const controller = new AbortController();
      this.doc.addEventListener(
        'keydown',
        (e: KeyboardEvent) => {
          if (!this.isOpen()) return;

          if (e.key === 'Escape') {
            e.preventDefault();
            this.close();
            return;
          }
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.prev();
            return;
          }
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.next();
            return;
          }
        },
        { signal: controller.signal }
      );

      this.destroyRef.onDestroy(() => controller.abort());
    }

//     effect(() => {
//   if (!isPlatformBrowser(this.platformId)) return;
//   if (!this.isFullPage()) return;

//   // wait until Angular renders the sentinel into the DOM
//   afterNextRender(() => this.setupInfiniteObserver());
// });

  }

  private scheduleObserverRebind(): void {
  if (!isPlatformBrowser(this.platformId)) return;

  // Let Angular finish rendering first
  queueMicrotask(() => {
    requestAnimationFrame(() => this.setupInfiniteObserver());
  });
}


ngAfterViewInit(): void {
  this.setupInfiniteObserver(); // initial bind
}

  private applyRouteMode(url: string): void {
    const isGallery = url === '/gallery' || url.startsWith('/gallery?');
    const wasFull = this.isFullPage();

    this.isFullPage.set(isGallery);

    // entering /gallery
    if (isGallery && !wasFull && isPlatformBrowser(this.platformId)) {
      this.fullVisibleCount.set(this.pageSize);

      if (this.fullAllItems().length === 0) {
        void this.loadFromManifest();
      }

      // observer may not exist yet (ViewChild not ready until AfterViewInit)
      queueMicrotask(() => this.setupInfiniteObserver());
    }

    // leaving /gallery (optional cleanup)
    if (!isGallery && wasFull) {
      this.io?.disconnect();
      this.io = undefined;
    }
  }

  private setupInfiniteObserver(): void {
  if (!isPlatformBrowser(this.platformId)) return;

  // Reset old observer
  this.io?.disconnect();
  this.io = undefined;

  if (!this.isFullPage()) return;

  const el = this.infiniteSentinel?.nativeElement;
  if (!el) return;

  // If we're already fully loaded, no need to observe
  if (!this.canLoadMore()) return;

  this.io = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting) {
        this.loadMore();
      }
    },
    { root: null, rootMargin: '900px 0px', threshold: 0.01 }
  );

  this.io.observe(el);
}

  private async loadFromManifest(): Promise<void> {
  try {
    const res = await fetch('assets/gallery/manifest.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`manifest fetch failed: ${res.status}`);
    const raw = (await res.json()) as string[];

    // ✅ Deduplicate while keeping order
    const files: string[] = [];
    const seen = new Set<string>();
    for (const f of raw) {
      const key = (f ?? '').trim();
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      files.push(key);
    }

    const items: MediaItem[] = files
      .filter((f) => /\.(png|jpe?g|webp|avif|mp4)$/i.test(f)) // ✅ include mp4
      .map((file, idx) => {
        const url = `assets/gallery/${file}`;
        const isVideo = /\.mp4$/i.test(file);

        if (isVideo) {
          return {
            id: `vid-${idx}-${file}`,
            kind: 'video' as const,
            provider: 'mp4' as const,
            videoUrl: url,
            // ✅ use a common poster/thumb (add one image in assets/gallery/)
            thumbUrl: 'assets/gallery/goaVideoThumb.png',
            title: 'Yacht experience video in Goa',
          };
        }

        return {
          id: `img-${idx}-${file}`,
          kind: 'image' as const,
          thumbUrl: url,
          fullUrl: url,
          alt: 'Yacht & cruise gallery photo in Goa',
        };
      });

    this.fullAllItems.set(items);
    this.scheduleObserverRebind();

    // ✅ Ensure infinite scroll observer attaches AFTER sentinel is in DOM
    queueMicrotask(() => this.setupInfiniteObserver());
  } catch (e) {
    // Fallback: don't crash
    this.fullAllItems.set(this.homeItems());
    queueMicrotask(() => this.setupInfiniteObserver());
  }
}

  private loadMore(): void {
    if (!this.canLoadMore()) return;
    this.fullVisibleCount.update((n) => n + this.pageSize);
    // rebind so sentinel stays watched after DOM grows
  this.scheduleObserverRebind();
  }

  open(item: MediaItem): void {
    const list = this.items();
    const idx = list.findIndex((x) => x.id === item.id);
    if (idx === -1) return;

    this.activeIndex.set(idx);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  next(): void {
    const list = this.items();
    if (!list.length) return;

    const idx = this.activeIndex();
    const nextIdx = idx < 0 ? 0 : (idx + 1) % list.length;

    this.loadVideo.set(false);
    this.activeIndex.set(nextIdx);
    queueMicrotask(() => this.loadVideo.set(true));
  }

  prev(): void {
    const list = this.items();
    if (!list.length) return;

    const idx = this.activeIndex();
    const prevIdx = idx < 0 ? 0 : (idx - 1 + list.length) % list.length;

    this.loadVideo.set(false);
    this.activeIndex.set(prevIdx);
    queueMicrotask(() => this.loadVideo.set(true));
  }

  shouldLoadVideo(): boolean {
    return this.isOpen() && this.loadVideo();
  }

  stopPropagation(ev: Event): void {
    ev.stopPropagation();
  }

  onTouchStart(ev: TouchEvent): void {
    if (!this.isOpen()) return;
    this.touchStartX = ev.touches?.[0]?.clientX ?? 0;
  }

  onTouchEnd(ev: TouchEvent): void {
    if (!this.isOpen()) return;
    const endX = ev.changedTouches?.[0]?.clientX ?? 0;
    const dx = endX - this.touchStartX;
    const threshold = 44;
    if (Math.abs(dx) < threshold) return;

    if (dx > 0) this.prev();
    else this.next();
  }

  seeMore(): void {
    this.router.navigateByUrl('/gallery');
  }
}