import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  PLATFORM_ID,
  inject,
  signal,
  afterNextRender,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { fromEvent } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type NavLink =
  | { label: string; kind: 'route'; path: string }
  | { label: string; kind: 'fragment'; fragment: string };

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly isMenuOpen = signal(false);
  readonly isMobile = signal(false);

  readonly links: NavLink[] = [
    { label: 'Home', kind: 'fragment', fragment: 'home' },
    { label: 'Explore', kind: 'fragment', fragment: 'explore' },
    { label: 'Book Yacht', kind: 'route', path: '/book-yacht' },
    { label: 'Book Cruise', kind: 'route', path: '/book-cruise' },
    { label: 'Gallery', kind: 'fragment', fragment: 'gallery' },
    { label: 'Reviews', kind: 'fragment', fragment: 'reviews-testimonials' },
     { label: 'Quick Quote', kind: 'fragment', fragment: 'enquire' },
    { label: 'Contact', kind: 'fragment', fragment: 'contactus' },
  ];

  readonly activeFragment = signal<string | null>(null);


  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    afterNextRender(() => {
      this.updateIsMobile();

      fromEvent(window, 'resize')
        .pipe(debounceTime(120), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.updateIsMobile());

      // Close menu if user clicks outside
      fromEvent<MouseEvent>(document, 'click')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((event) => {
          const target = event.target as HTMLElement | null;
          if (!target) return;
          if (!target.closest('[data-header-root]')) {
            this.isMenuOpen.set(false);
          }
        });

      // Close menu on Escape
      fromEvent<KeyboardEvent>(document, 'keydown')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((e) => {
          if (e.key === 'Escape') this.isMenuOpen.set(false);
        });

          // initial fragment
      this.activeFragment.set(window.location.hash?.replace('#', '') || null);

      this.router.events
        .pipe(
          filter((e) => e instanceof NavigationEnd),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          this.activeFragment.set(window.location.hash?.replace('#', '') || null);
        });
    });
  }


  isActive(item: NavLink): boolean {
  if (item.kind === 'route') {
    return this.router.isActive(item.path, {
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }
  return this.activeFragment() === item.fragment;
}

  goToHome() {
    this.isMenuOpen.set(false);
    this.router.navigate(['/'], { fragment: 'home' });
  }

  toggleMenu() {
    this.isMenuOpen.update((v) => !v);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  onNavClick() {
    // Close menu after selection on mobile
    if (this.isMobile()) this.isMenuOpen.set(false);
  }

  private updateIsMobile() {
    this.isMobile.set(window.innerWidth < 960);
    if (!this.isMobile()) this.isMenuOpen.set(false);
  }
}
