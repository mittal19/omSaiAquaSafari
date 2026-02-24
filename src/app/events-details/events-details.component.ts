import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './events-details.component.html',
  styleUrls: ['./events-details.component.css'],
})
export class EventsDetailsComponent implements OnInit {
  readonly faqs = [
    {
      q: 'How early should I book an event yacht in Goa?',
      a: 'For weekends and sunset slots, book early. Weekday availability is usually better. Share your date and guest count and we’ll confirm the best options quickly.',
    },
    {
      q: 'Can I customise décor, music, and photography?',
      a: 'Yes—most events can include decorations, photography, videography, and drone shots as add-ons, depending on timing and yacht policy.',
    },
    {
      q: 'What should guests carry?',
      a: 'Carry an ID, comfortable footwear, and light layers for evening cruises. Avoid bringing valuables and follow crew safety instructions during boarding and cruising.',
    },
    {
      q: 'Is it safe for families and kids?',
      a: 'Safety is a priority—life-saving equipment is available onboard and crew will guide you. Kids should be supervised by guardians at all times.',
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly router: Router,
    private readonly renderer: Renderer2,
    @Inject(DOCUMENT) private readonly doc: Document
  ) {}

  ngOnInit(): void {
    // Ensure the user starts at top (good UX + SEO crawl)
    this.scrollToTop();

    // ===== SEO: Title & Meta =====
    const pageTitle = 'Yacht Events in Goa | Birthdays, Proposals, Corporate Cruises';
    const description =
      'Plan unforgettable yacht events in Goa—birthdays, anniversaries, proposals, corporate outings & sunset celebrations. Custom décor, music, photography & trusted crew onboard.';

    this.title.setTitle(pageTitle);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });

    // Twitter
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    // Canonical (best practice for SPA)
    this.setCanonicalUrl();

    // JSON-LD structured data (FAQPage + WebPage)
    this.injectJsonLd(this.buildJsonLd());
  }

  private scrollToTop(): void {
    // Don’t force smooth; keep it instant for route changes.
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }

  private setCanonicalUrl(): void {
    try {
      const existing = this.doc.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      const canonicalUrl = this.doc.location?.origin
        ? `${this.doc.location.origin}${this.router.url.split('?')[0]}`
        : this.router.url.split('?')[0];

      if (existing) {
        existing.href = canonicalUrl;
        return;
      }

      const link: HTMLLinkElement = this.renderer.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', canonicalUrl);
      this.renderer.appendChild(this.doc.head, link);
    } catch {
      // no-op (SSR/head restrictions)
    }
  }

  private injectJsonLd(json: object): void {
    try {
      const id = 'events-jsonld';
      const existing = this.doc.getElementById(id);
      if (existing) existing.remove();

      const script = this.renderer.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      script.text = JSON.stringify(json);
      this.renderer.appendChild(this.doc.head, script);
    } catch {
      // no-op
    }
  }

  private buildJsonLd(): object {
    const origin = this.doc.location?.origin ?? '';
    const path = this.router.url.split('?')[0] || '/events';
    const url = origin ? `${origin}${path}` : path;

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          name: 'Yacht Events in Goa',
          url,
          description:
            'Plan yacht events in Goa—birthdays, anniversaries, proposals and corporate outings with custom décor, music and media add-ons.',
        },
        {
          '@type': 'FAQPage',
          mainEntity: this.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.a,
            },
          })),
        },
      ],
    };
  }
}