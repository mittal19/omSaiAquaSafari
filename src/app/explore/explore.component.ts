import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  QueryList,
  ViewChildren,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

type ExploreCard = {
  title: string;
  subtitle: string;
  cta: string;
  route: string;

  // default/fallback image (mobile)
  imageSrc: string;

  // optional: image for tablet + desktop
  tabletImageSrc?: string;
  tabletMediaQuery?: string;

  // responsive sources (kept for other cards if needed)
  imageSrcset?: string;
  imageSizes?: string;

  imageAlt: string;
  area: 'yachts' | 'celebrations';
};

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExploreComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  isExploreRoute = false;

  @ViewChildren('cardEl') cardEls!: QueryList<ElementRef<HTMLElement>>;

  private readonly defaultSizes = '(max-width: 900px) 100vw, 50vw';

  readonly cards: ExploreCard[] = [
    {
      title: 'Yachts',
      subtitle: 'From Private Charters to Mega Yachts',
      cta: 'View Yachts',
      route: '/yachts',

      // Mobile => 1st image
      imageSrc: 'assets/explore/yachtMobile.jpeg',

      // Tablet + Desktop => 2nd image
      tabletImageSrc: 'assets/explore/yachtTab.jpeg',
      tabletMediaQuery: '(min-width: 561px)',

      imageAlt: 'Luxury yacht on calm water',
      area: 'yachts',
    },
    {
      title: 'Events or Private Celebrations',
      subtitle: 'Unforgettable Personal Milestones',
      cta: 'Learn More',
      route: '/events-details',

      imageSrc: 'assets/explore/celebrationsMobile.png',
     // Tablet + Desktop => 2nd image
      tabletImageSrc: 'assets/explore/celebrationsTab.png',
      tabletMediaQuery: '(min-width: 561px)',

      imageAlt:
        'Friends celebrating on a yacht, Couple relaxing during a private celebration on water',
      area: 'celebrations',
    },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.isExploreRoute = this.router.url === '/explore';
  }

  ngAfterViewInit(): void {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          el.classList.toggle('is-inview', entry.isIntersecting);
        }
      },
      { root: null, threshold: 0.35, rootMargin: '0px 0px -12% 0px' }
    );

    this.cardEls.forEach((ref) => io.observe(ref.nativeElement));

    const sub = this.cardEls.changes.subscribe(
      (list: QueryList<ElementRef<HTMLElement>>) => {
        list.forEach((ref) => io.observe(ref.nativeElement));
      }
    );

    this.destroyRef.onDestroy(() => {
      sub.unsubscribe();
      io.disconnect();
    });
  }
}