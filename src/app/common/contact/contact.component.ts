import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent implements OnInit {
  // Replace these with your real details
  readonly phoneDisplay = '+91 91682 84787';
  readonly phoneTel = '+919168284787';

  readonly email = 'bookings.searider@gmail.com';

  readonly addressLines = [
    'Dharma Jetty, Britona, Alto Porvorim, Penha de Franc, Bardez',
    'Goa 403101',
  ];

  readonly mapQuery = 'Sea Rider Goa';

  // Optional socials (leave empty to hide the button automatically)
  readonly instagramUrl = '';
  readonly facebookUrl = '';

  isContactRoute = false;

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly router: Router,
    private readonly renderer: Renderer2,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  ngOnInit(): void {
    this.isContactRoute = this.router.url === '/contact';

    const pageTitle = 'Contact | Sea Rider Goa - Yacht Booking & Events';
    const description =
      'Contact Sea Rider Goa for yacht bookings, events, pricing, timings, and pickup guidance. Call, email, or get directions for quick assistance.';

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index,follow' });

    // Social previews
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    // Structured data (LocalBusiness) for SEO
    this.injectJsonLd();
  }

  private injectJsonLd(): void {
    const id = 'sr-contact-jsonld';
    const existing = this.document.getElementById(id);
    if (existing) return;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Sea Rider Goa',
      email: this.email,
      telephone: this.phoneDisplay,
      address: {
        '@type': 'PostalAddress',
        streetAddress: this.addressLines[0],
        addressRegion: 'Goa',
        postalCode: '403101',
        addressCountry: 'IN',
      },
      areaServed: 'Goa, India',
      sameAs: [this.instagramUrl, this.facebookUrl].filter(Boolean),
    };

    const script = this.renderer.createElement('script');
    this.renderer.setAttribute(script, 'type', 'application/ld+json');
    this.renderer.setAttribute(script, 'id', id);
    script.text = JSON.stringify(jsonLd);
    this.renderer.appendChild(this.document.head, script);
  }

  get mapUrl(): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.mapQuery)}`;
  }

  get whatsAppUrl(): string {
    // whatsapp expects digits only (country code + number)
    const digits = (this.phoneTel || '').replace(/[^\d]/g, '');
    return digits ? `https://wa.me/${digits}` : '';
  }
}