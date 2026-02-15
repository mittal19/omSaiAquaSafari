import { Component, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css'],
})
export class ExploreComponent {
  // Keep structured data as plain string; safe via [textContent] binding.
  jsonLd = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Om Sai Aqua Safari',
      description: 'Yacht and cruise rentals in Goa. Book private yachts and curated cruise experiences.',
      areaServed: 'Goa, India',
      serviceType: ['Yacht Rental', 'Cruise Booking'],
    },
    null,
    2
  );

  constructor(
    private router: Router,
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {
    // SEO
    this.title.setTitle('Explore Yacht & Cruise Options in Goa | Om Sai Aqua Safari');
    this.meta.updateTag({
      name: 'description',
      content:
        'Explore premium yacht rentals and curated cruise experiences in Goa. Perfect for parties, families, couples, and sunset rides.',
    });
    this.meta.updateTag({ property: 'og:title', content: 'Explore | Om Sai Aqua Safari' });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Book yacht rentals and cruise experiences in Goa with Om Sai Aqua Safari.',
    });
  }

  bookYacht(): void {
    // adjust if your route is different
    this.router.navigateByUrl('/book-yacht');
  }

  bookCruise(): void {
    // adjust if your route is different
    this.router.navigateByUrl('/book-cruise');
  }

  scrollTo(id: string): void {
    const el = this.document.getElementById(id);
    if (!el) return;

    // Your global CSS already sets scroll-padding-top / scroll-margin-top for fixed header.
    // So normal scrollIntoView works correctly.
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
