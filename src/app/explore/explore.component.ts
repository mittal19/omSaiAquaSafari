import {
  AfterViewInit,
  OnInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  QueryList,
  ViewChildren,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { filter } from 'rxjs';

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
export class ExploreComponent implements OnInit, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  isExploreRoute = false;

  @ViewChildren('cardEl') cardEls!: QueryList<ElementRef<HTMLElement>>;

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
        'Friends celebrating on a yacht, couple relaxing during a private celebration on water',
      area: 'celebrations',
    },
  ];

  constructor(private router: Router, private title: Title, private meta: Meta) {}

  ngOnInit() {
    // Keep route flag updated (component can be reused on multiple pages)
    this.isExploreRoute = this.router.url === '/explore';
    this.applySeo();

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.isExploreRoute = this.router.url === '/explore';
        this.applySeo();
      });
  }

  private applySeo() {
    // Only set page-level SEO tags when Explore is the main route
    if (!this.isExploreRoute) return;

    const pageTitle = 'Explore Yacht & Celebration Experiences in Goa | SeaRider';
    const description =
      'Explore luxury yacht rentals and private celebration experiences in Goa with SeaRider. Compare options, view photos, and enquire instantly for the best sea experience.';

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });

    // Open Graph (helps when shared on WhatsApp/Facebook, etc.)
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
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