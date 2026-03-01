import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

/**
 * Minimal SEO helper:
 * - Updates document title + meta description
 * - Updates canonical + OpenGraph/Twitter tags
 * - Keeps logic centralized (no component changes required)
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  private readonly baseUrl = 'https://searidergoa.com';
  private readonly defaultTitle = 'Sea Rider Goa | Yacht & Boat Booking in Goa';
  private readonly defaultDescription =
    'Book luxury yachts and boats in Goa with Sea Rider Goa. Browse yacht options, galleries, reviews, and get a quick quote for your trip.';
  private readonly defaultImage = this.baseUrl + '/assets/header.png';

  updateFromUrl(url: string): void {
    const path = (url || '/').split('?')[0].split('#')[0] || '/';

    const meta = this.getMetaForPath(path);

    this.setTitle(meta.title);
    this.setDescription(meta.description);
    this.setCanonical(this.baseUrl + path);
    this.setOpenGraph(meta.title, meta.description, this.baseUrl + path, meta.image ?? this.defaultImage);
    this.setTwitter(meta.title, meta.description, meta.image ?? this.defaultImage);
  }

  private getMetaForPath(path: string): { title: string; description: string; image?: string } {
    // Keep it simple & safe. Dynamic pages use generic copy.
    if (path === '/' || path === '') {
      return {
        title: this.defaultTitle,
        description: this.defaultDescription,
      };
    }

    if (path === '/book-yacht' || path === '/yachts') {
      return {
        title: 'Yacht Options & Pricing | Sea Rider Goa',
        description:
          'Explore yacht options in Goa with Sea Rider Goa. Compare packages, amenities, and book your preferred yacht in minutes.',
      };
    }

    if (path.startsWith('/book-yacht/')) {
      return {
        title: 'Book Your Yacht | Sea Rider Goa',
        description:
          'Choose your preferred yacht and submit a quick booking request. Our team will confirm availability and pricing.',
      };
    }

    if (path === '/explore') {
      return {
        title: 'Explore Experiences | Sea Rider Goa',
        description:
          'Discover yacht experiences in Goa—sunset cruises, celebrations, and private trips curated by Sea Rider Goa.',
      };
    }

    if (path === '/gallery') {
      return {
        title: 'Gallery | Sea Rider Goa',
        description:
          'See photos and videos of our yachts and experiences in Goa. Get a feel for the vibe before you book.',
      };
    }

    if (path === '/reviews') {
      return {
        title: 'Reviews | Sea Rider Goa',
        description:
          'Read customer reviews and testimonials about Sea Rider Goa yacht experiences, service quality, and bookings.',
      };
    }

    if (path === '/quick-quote') {
      return {
        title: 'Quick Quote | Sea Rider Goa',
        description:
          'Get a quick quote for your Goa yacht booking. Share your trip details and we’ll respond with the best options.',
      };
    }

    if (path === '/contact') {
      return {
        title: 'Contact | Sea Rider Goa',
        description:
          'Contact Sea Rider Goa for yacht bookings, availability, and custom packages. We’re here to help plan your trip.',
      };
    }

    if (path === '/events-details') {
      return {
        title: 'Events | Sea Rider Goa',
        description:
          'Explore event and celebration options on yachts in Goa—birthday parties, proposals, corporate outings and more.',
      };
    }

    return { title: this.defaultTitle, description: this.defaultDescription };
  }

  private setTitle(title: string): void {
    this.title.setTitle(title || this.defaultTitle);
    this.meta.updateTag({ property: 'og:title', content: title || this.defaultTitle });
  }

  private setDescription(description: string): void {
    const desc = description || this.defaultDescription;
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
  }

  private setCanonical(url: string): void {
    const head = this.doc.head;
    let link: HTMLLinkElement | null = head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setOpenGraph(title: string, description: string, url: string, image: string): void {
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Sea Rider Goa' });
    this.meta.updateTag({ property: 'og:title', content: title || this.defaultTitle });
    this.meta.updateTag({ property: 'og:description', content: description || this.defaultDescription });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
  }

  private setTwitter(title: string, description: string, image: string): void {
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title || this.defaultTitle });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    this.meta.updateTag({ name: 'twitter:description', content: description || this.defaultDescription });
  }
}
