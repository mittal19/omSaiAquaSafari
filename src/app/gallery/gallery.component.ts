import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl, Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';

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
      /** mp4 url OR youtube embed url */
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

  /** Replace with your real gallery data (keep ids stable). */
  readonly items = signal<MediaItem[]>([
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
    }
  ]);

  /** Lightbox state */
  readonly isOpen = signal(false);
  private readonly activeIndex = signal<number>(-1);

  /** Lazy-load video only after modal opens (keeps initial load fast). */
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
    // Use youtube-nocookie embed urls when possible.
    return this.sanitizer.bypassSecurityTrustResourceUrl(active.videoUrl);
  });

  constructor() {
    // Basic SEO for the Gallery route/section
    this.title.setTitle('Gallery | Om Sai Aqua Safari');
    this.meta.updateTag({
      name: 'description',
      content: 'Photo and video gallery of our yacht and cruise experiences in Goa.',
    });

    // When modal opens/closes, control video lazy loading + prevent background scroll.
    effect(() => {
      const open = this.isOpen();
      if (!isPlatformBrowser(this.platformId)) return;

      if (open) {
        this.doc.documentElement.classList.add('no-scroll');
        // load video on next tick so CSS animation feels smooth
        queueMicrotask(() => this.loadVideo.set(true));
      } else {
        this.doc.documentElement.classList.remove('no-scroll');
        this.loadVideo.set(false);
        this.activeIndex.set(-1);
      }
    });

    // Keyboard controls (Esc, ←, →)
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

    // Reset video loading momentarily so mp4/iframe re-mounts (stops audio)
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

  /** Only load the video element when the modal is open (better performance). */
  shouldLoadVideo(): boolean {
    return this.isOpen() && this.loadVideo();
  }

  /** Backdrop click closes modal; clicks inside modal should not. */
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
