import { CommonModule, isPlatformBrowser } from '@angular/common';
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
import { debounceTime, filter } from 'rxjs/operators';
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

  readonly isMenuOpen = signal(false);
  readonly isMobile = signal(false);

  // ✅ Use E.164 for best compatibility. Change as needed.
  readonly phoneNumberDisplay = '+91 90275 04141';
  readonly phoneNumberDial = '+919027504141';

  // ✅ Dialer link (SEO-safe: it’s a normal href)
  readonly telHref = computed(() => `tel:${this.phoneNumberDial}`);

  // ✅ WhatsApp link
  readonly whatsappHref = computed(() => {
    const msg = encodeURIComponent('Hello! I want to book a yacht/cruise in Goa.');
    // wa.me expects digits (no +). Keep country code.
    const digits = this.phoneNumberDial.replace(/\D/g, '');
    return `https://wa.me/${digits}?text=${msg}`;
  });

  readonly links: NavLink[] = [
    { label: 'Home', path: '', exact: true },
    { label: 'Explore', path: '/explore' },
    { label: 'Book Yacht', path: '/book-yacht' },
    { label: 'Gallery', path: '/gallery' }, // change if your route differs
    { label: 'Reviews', path: '/reviews' },
    { label: 'Contact', path: '/contact' },
     { label: 'Quick Quote', path: '/quick-quote' },
  ];

  readonly trackByPath = (_: number, item: NavLink) => item.path;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    afterNextRender(() => {
      this.updateIsMobile();

      fromEvent(window, 'resize')
        .pipe(debounceTime(120), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.updateIsMobile());

      // Close menu if user clicks outside header
      fromEvent<MouseEvent>(document, 'click')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((event) => {
          const target = event.target as HTMLElement | null;
          if (!target) return;
          if (!target.closest('[data-header-root]')) this.isMenuOpen.set(false);
        });

      // Close menu on Escape
      fromEvent<KeyboardEvent>(document, 'keydown')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((e) => {
          if (e.key === 'Escape') this.isMenuOpen.set(false);
        });

      // Close menu on route change (best UX on mobile)
      this.router.events
        .pipe(
          filter((e) => e instanceof NavigationEnd),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => this.isMenuOpen.set(false));
    });
  }

  toggleMenu() {
    this.isMenuOpen.update((v) => !v);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  onNavClick() {
    if (this.isMobile()) this.isMenuOpen.set(false);
  }

  goToHome() {
    this.isMenuOpen.set(false);
    this.router.navigate(['/']);
  }

  private updateIsMobile() {
    this.isMobile.set(window.innerWidth < 960);
    if (!this.isMobile()) this.isMenuOpen.set(false);
  }
}
