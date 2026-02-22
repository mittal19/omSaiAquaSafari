import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Component,
  PLATFORM_ID,
  inject,
  signal,
  computed,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

type MediaItem =
  | {
      id: string;
      kind: 'image';
      thumbUrl: string; // small thumbnail (webp/avif preferred)
      fullUrl: string;  // full image (webp/avif preferred)
      alt: string;
      width?: number;
      height?: number;
    }
  | {
      id: string;
      kind: 'video';
      thumbUrl: string; // poster/thumbnail image
      videoUrl: string; // mp4 (preferred) OR youtube embed url
      title: string;
      provider?: 'mp4' | 'youtube';
    };

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
})
export class GalleryComponent {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly doc = inject(DOCUMENT);

  // ✅ Put your real media here (use THUMBNAILS, not full-res images)
  readonly items = signal<MediaItem[]>([
    {
      id: 'y1',
      kind: 'image',
      thumbUrl: 'assets/gallery/1.jpg',
      fullUrl: 'assets/gallery/1.jpg',
      alt: 'Luxury yacht experience in Goa',
      width: 1600,
      height: 1067,
    },
    {
      id: 'c1',
      kind: 'image',
      thumbUrl: 'assets/gallery/2.jpg',
      fullUrl: 'assets/gallery/2.jpg',
      alt: 'Sunset cruise in Goa',
      width: 1600,
      height: 1067,
    },
    {
      id: 'v1',
      kind: 'video',
      thumbUrl: 'assets/gallery/3.jpg',
      videoUrl: 'assets/gallery/3.jpg',
      title: 'Yacht experience video in Goa',
      provider: 'mp4',
    }
    // add more...
  ]);

  readonly isOpen = signal(false);
  readonly activeId = signal<string | null>(null);

  readonly activeItem = computed(() => {
    const id = this.activeId();
    if (!id) return null;
    return this.items().find((x) => x.id === id) ?? null;
  });

  // ✅ Only load video player when user opens the modal
  readonly shouldLoadVideo = signal(false);

  constructor( private router: Router,) {
    // SEO (works with SSR too)
    this.title.setTitle('Gallery | Om Sai Aqua Safari - Yacht & Cruise in Goa');
    this.meta.updateTag({
      name: 'description',
      content:
        'Explore photos and videos of our yacht rentals and cruise experiences in Goa. Premium private yachts, sunset cruises, and curated sea experiences.',
    });

    this.meta.updateTag({ property: 'og:title', content: 'Gallery | Om Sai Aqua Safari' });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Photos and videos of yacht rentals & cruises in Goa.',
    });
  }

  open(item: MediaItem) {
    this.activeId.set(item.id);
    this.isOpen.set(true);

    // lock background scroll (browser-only)
    if (isPlatformBrowser(this.platformId)) {
      this.doc.body.style.overflow = 'hidden';
    }

    // only enable video loading inside modal (for performance)
    this.shouldLoadVideo.set(item.kind === 'video');
  }

  close() {
    this.isOpen.set(false);
    this.activeId.set(null);
    this.shouldLoadVideo.set(false);

    if (isPlatformBrowser(this.platformId)) {
      this.doc.body.style.overflow = '';
    }
  }

  next() {
    const list = this.items();
    const current = this.activeItem();
    if (!current) return;

    const idx = list.findIndex((x) => x.id === current.id);
    const next = list[(idx + 1) % list.length];
    this.open(next);
  }

  prev() {
    const list = this.items();
    const current = this.activeItem();
    if (!current) return;

    const idx = list.findIndex((x) => x.id === current.id);
    const prev = list[(idx - 1 + list.length) % list.length];
    this.open(prev);
  }

  seeMore(): void {
  this.router.navigateByUrl('/gallery');
}


}
