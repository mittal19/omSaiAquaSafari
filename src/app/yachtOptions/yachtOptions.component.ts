import { CommonModule, DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  ViewChildren,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

type YachtCard = {
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

@Component({
  selector: 'app-yacht-options',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage],
  templateUrl: './yachtOptions.component.html',
  styleUrls: ['../explore/explore.component.css', './yachtOptions.component.css'],
})
export class YachtOptionsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('yachtCardEl', { read: ElementRef }) yachtCardEls!: QueryList<ElementRef<HTMLElement>>;

  private inViewObserver?: IntersectionObserver;
  private jsonLdEl?: HTMLScriptElement;

  readonly yachts: YachtCard[] = [
    {
      id: 'peagus-yacht',
      name: 'Peagus Yacht',
      capacity: 23,

      length: '16 meters',
      speed: '15 knots',
      sleeping: 2,
      cabin: 2,
      crew: 3,
      cruiseTime: '',
      anchoringTime: '',
      inclusions:
        'Soft drinks & Mineral water, Ice cubes & Ice Box, Bluetooth music, 1 Bedroom, Lounge area, Sundeck area, Washroom, Glasses & Plates, Fuel & Jetty Charges, All Life saving equipments onboard',
      totalTime: '1 day',
      morningRate: '22,999 Rs',
      eveningRate: '31,999 Rs',
      startingFrom: '22,999 Rs',
      imageUrl: 'assets/yacht/type/peagus.jpeg',
      imageAlt: 'Peagus luxury yacht in Goa',
      images: [
        'assets/yacht/type/peagus.jpeg',
        'assets/yacht/type/coco.jpeg',
        'assets/yacht/type/aquila.jpeg',
        'assets/yacht/type/peagus.jpeg',
        'assets/yacht/type/coco.jpeg',
        'assets/yacht/type/aquila.jpeg',
        'assets/yacht/type/peagus.jpeg',
      ],
      description:
        'Spacious luxury yacht for premium private parties and day charters in Goa. Great for groups who want comfort, lounge space, and a complete onboard setup.',
      additions: 'Drone, PhotoGarphy, Videography, Decorations',
    },
    {
      id: 'coco-yacht',
      name: 'Coco Yacht',
      capacity: 22,
      length: '16 meters',
      speed: '12 knots',
      inclusions:
        'Soft drinks & Mineral water, Ice cubes & Ice Box, Bluetooth music, 1 Bedroom, Lounge area, Sundeck area, Washroom, Glasses & Plates, Fuel & Jetty Charges, All Life saving equipments onboard',
      sleeping: 0,
      cabin: 0,
      crew: 0,
      cruiseTime: '1 hour',
      anchoringTime: '1 hour',
      totalTime: '2 hours',
      description:
        'Perfect for short cruises and sunset plans in Goa. Comfortable, clean, and ideal for birthdays, small events, and quick private experiences.',
      morningRate: '22,999 Rs',
      eveningRate: '26,999 Rs',
      startingFrom: '22,999 Rs',
      imageUrl: 'assets/yacht/type/coco.jpeg',
      imageAlt: 'Coco luxury yacht in Goa',
      images: ['assets/yacht/type/coco.jpeg', 'assets/yacht/type/aquila.jpeg', 'assets/yacht/type/peagus.jpeg'],
      additions: 'Drone, PhotoGarphy, Videography, Decorations',
    },
    {
      id: 'aquila-yacht',
      name: 'Aquila Yacht',
      capacity: 12,
      length: '12 meters',
      speed: '20 knots',
      sleeping: 0,
      cabin: 0,
      crew: 0,
      morningRate: '18,999 Rs',
      eveningRate: '22,999 Rs',
      startingFrom: '18,999 Rs',
      cruiseTime: '1 hour',
      anchoringTime: '1 hour',
      totalTime: '2 hours',
      imageUrl: 'assets/yacht/type/aquila.jpeg',
      imageAlt: 'Aquila luxury yacht in Goa',
      description:
        'A fast, compact luxury yacht for smaller groups. Great for couples, proposals, and intimate celebrations with a premium vibe.',
      inclusions:
        'Soft drinks & Mineral water, Ice cubes & Ice Box, Bluetooth music, 1 Bedroom, Lounge area, Sundeck area, Washroom, Glasses & Plates, Fuel & Jetty Charges, All Life saving equipments onboard',
      images: ['assets/yacht/type/aquila.jpeg', 'assets/yacht/type/peagus.jpeg', 'assets/yacht/type/coco.jpeg'],
      additions: 'Drone, PhotoGarphy, Videography, Decorations',
    },
  ];

  isYachtOptions = false;

  constructor(
    private title: Title,
    private meta: Meta,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.isYachtOptions = this.router.url === '/book-yacht' || this.router.url === '/yachts';

    // SEO
    this.title.setTitle('Luxury Yacht Options in Goa | Sea Rider Goa - Yacht Service');
    this.meta.updateTag({
      name: 'description',
      content:
        'Explore our most loved luxury yachts in Goa. Compare yacht capacity, duration, length, and starting price. Book your private yacht experience with Sea Rider Goa - Yacht Service.',
    });
    this.meta.updateTag({ name: 'robots', content: 'index,follow' });

    // OG
    this.meta.updateTag({ property: 'og:title', content: 'Luxury Yacht Options in Goa' });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Explore our most loved luxury yachts in Goa. Compare key details and book now.',
    });
    this.meta.updateTag({ property: 'og:image', content: 'assets/yacht/type/peagus.jpeg' });

    this.upsertCanonical();
    this.upsertJsonLd();
  }

  ngAfterViewInit(): void {
    // Entrance animations on scroll (respects prefers-reduced-motion via CSS)
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    this.inViewObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) (e.target as HTMLElement).classList.add('is-inview');
        }
      },
      { root: null, threshold: 0.18 }
    );

    const observeAll = () => {
      this.yachtCardEls?.forEach((ref) => this.inViewObserver?.observe(ref.nativeElement));
    };
    observeAll();
    this.yachtCardEls.changes.subscribe(() => observeAll());
  }

  ngOnDestroy(): void {
    this.inViewObserver?.disconnect();
    this.inViewObserver = undefined;

    if (this.jsonLdEl?.parentNode) this.jsonLdEl.parentNode.removeChild(this.jsonLdEl);
    this.jsonLdEl = undefined;
  }

  private upsertCanonical(): void {
    const href = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
    if (!href) return;

    const head = this.document.head;

    let linkEl = head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    if (!linkEl) {
      linkEl = this.renderer.createElement('link') as HTMLLinkElement;
      linkEl.setAttribute('rel', 'canonical');
      this.renderer.appendChild(head, linkEl);
    }

    linkEl.setAttribute('href', href);
  }

  private upsertJsonLd(): void {
    const toNumber = (v: string): number | null => {
      const n = Number(String(v).replace(/[^\d.]/g, ''));
      return Number.isFinite(n) && n > 0 ? n : null;
    };

    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Luxury Yacht Options in Goa',
      itemListElement: this.yachts.map((y, i) => {
        const price = toNumber(y.startingFrom);
        const base: any = {
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Service',
            name: y.name,
            description: y.description,
            image: y.imageUrl,
            areaServed: 'Goa, India',
            provider: {
              '@type': 'Organization',
              name: 'Sea Rider Goa - Yacht Service',
            },
          },
        };
        if (price) {
          base.item.offers = {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price,
            availability: 'https://schema.org/InStock',
          };
        }
        return base;
      }),
    };

    const script = this.jsonLdEl ?? this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(itemList);
    if (!this.jsonLdEl) this.renderer.appendChild(this.document.head, script);
    this.jsonLdEl = script;
  }

  trackById(_: number, item: YachtCard): string {
    return item.id;
  }

  get gridCols(): number {
    return Math.min(3, this.yachts.length);
  }

  goToYacht(yacht: YachtCard) {
    this.router.navigate(['/book-yacht', yacht.id], {
      state: yacht,
    });
  }
}