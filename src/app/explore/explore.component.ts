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
  imageSrc: string;
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

  readonly cards: ExploreCard[] = [
    {
      title: 'Yachts',
      subtitle: 'From Private Charters to Mega Yachts',
      cta: 'View Yachts',
      route: '/yachts',
      imageSrc: 'assets/explore/yacht.jpeg',
      imageAlt: 'Luxury yacht on calm water',
      area: 'yachts',
    },
    {
      title: 'Events or Private Celebrations',
      subtitle: 'Unforgettable Personal Milestones',
      cta: 'Learn More',
      route: '/events-details',
      imageSrc: 'assets/explore/celebrations.png',
      imageAlt: 'Friends celebrating on a yacht, Couple relaxing during a private celebration on water',
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
          const isInView = entry.isIntersecting;
          el.classList.toggle('is-inview', isInView);
        }
      },
      {
        root: null,
        threshold: 0.35,
        rootMargin: '0px 0px -12% 0px',
      }
    );

    // Observe each card
    this.cardEls.forEach((ref) => io.observe(ref.nativeElement));

    // Handle any future list changes (if cards ever become dynamic)
    const sub = this.cardEls.changes.subscribe((list: QueryList<ElementRef<HTMLElement>>) => {
      list.forEach((ref) => io.observe(ref.nativeElement));
    });

    this.destroyRef.onDestroy(() => {
      sub.unsubscribe();
      io.disconnect();
    });
  }
}