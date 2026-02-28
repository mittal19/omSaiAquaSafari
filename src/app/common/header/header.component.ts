import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { fromEvent } from 'rxjs';
import { debounceTime, filter, throttleTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type NavLink = { label: string; path: string; exact?: boolean };

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
  private readonly document = inject(DOCUMENT);

  readonly isMenuOpen = signal(false);
  readonly isMobile = signal(false);
  readonly isScrolled = signal(false);

  // ✅ Set your number here
  readonly phoneNumberDial = '+919168284787';

  readonly telHref = computed(() => `tel:${this.phoneNumberDial}`);

  readonly whatsappHref = computed(() => {
    const msg = encodeURIComponent('Hello SeaRider Goa, I want to book a yacht. Please share slots & pricing.');
    const digits = this.phoneNumberDial.replace(/\D/g, '');
    return `https://wa.me/${digits}?text=${msg}`;
  });

  readonly links: NavLink[] = [
    { label: 'Home', path: '', exact: true },
    { label: 'Explore', path: '/explore' },
    { label: 'Book Yacht', path: '/book-yacht' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Reviews', path: '/reviews' },
    { label: 'Contact', path: '/contact' },
    { label: 'Quick Quote', path: '/quick-quote' },
  ];

  readonly trackByPath = (_: number, item: NavLink) => item.path;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    afterNextRender(() => {
      this.updateIsMobile();
      this.updateScrolled();

      fromEvent(window, 'resize')
        .pipe(debounceTime(120), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.updateIsMobile());

      fromEvent(window, 'scroll')
        .pipe(throttleTime(120), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.updateScrolled());

      // Close menu if user clicks outside header
      fromEvent<MouseEvent>(document, 'click')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((event) => {
          const target = event.target as HTMLElement | null;
          if (!target) return;
          if (!target.closest('[data-header-root]') && !target.closest('#srOffcanvas')) this.closeMenu();
        });

      // Close menu on Escape
      fromEvent<KeyboardEvent>(document, 'keydown')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((e) => {
          if (e.key === 'Escape') this.closeMenu();
        });

      // Close menu on route change (best UX on mobile)
      this.router.events
        .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.closeMenu());
    });
  }

  toggleMenu() {
    this.isMenuOpen.update((v) => {
      const next = !v;
      this.syncBodyScrollLock(next);
      return next;
    });
  }

  closeMenu() {
    this.isMenuOpen.set(false);
    this.syncBodyScrollLock(false);
  }

  onNavClick() {
    if (this.isMobile()) this.closeMenu();
  }

  goToHome() {
    this.closeMenu();
    this.router.navigate(['/']);
  }

  private updateIsMobile() {
    // Bootstrap lg breakpoint: 992px
    this.isMobile.set(window.innerWidth < 992);
    if (!this.isMobile()) this.closeMenu();
  }

  private updateScrolled() {
    this.isScrolled.set(window.scrollY > 8);
  }

  private syncBodyScrollLock(lock: boolean) {
    this.document?.body?.classList.toggle('overflow-hidden', lock);
  }
}