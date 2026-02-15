import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

type Testimonial = {
  author: string;
  position: string;
  date: string;
  rating: number; // 1..5
  text: string;
};

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css'],
})
export class TestimonialsComponent {
  readonly testimonials = signal<Testimonial[]>([
    // Replace these with real reviews
    {
      author: 'Ray Robertson',
      position: 'Guest',
      date: '10 Feb, 2023',
      rating: 5,
      text: 'Beautiful yacht, smooth booking, and an unforgettable sunset experience.',
    },
    {
      author: 'Aisha Khan',
      position: 'Guest',
      date: '22 Mar, 2024',
      rating: 5,
      text: 'Very professional crew. Great for family and friends. Highly recommended!',
    },
    {
      author: 'Karan Mehta',
      position: 'Guest',
      date: '05 May, 2024',
      rating: 4,
      text: 'Great cruise views and comfortable ride. Support team was quick on WhatsApp.',
    },
    {
      author: 'Neha Sharma',
      position: 'Guest',
      date: '18 Jun, 2024',
      rating: 5,
      text: 'Loved the private yacht setup—clean, safe, and premium.',
    },
    {
      author: 'Rahul Verma',
      position: 'Guest',
      date: '02 Aug, 2024',
      rating: 5,
      text: 'Amazing experience. Booking was easy and pricing was transparent.',
    },
    {
      author: 'Sneha Patil',
      position: 'Guest',
      date: '14 Sep, 2024',
      rating: 4,
      text: 'Perfect for a small celebration. Would book again!',
    },
     {
      author: 'Rahul Verma',
      position: 'Guest',
      date: '02 Aug, 2024',
      rating: 5,
      text: 'Amazing experience. Booking was easy and pricing was transparent.',
    },
    {
      author: 'Sneha Patil',
      position: 'Guest',
      date: '14 Sep, 2024',
      rating: 4,
      text: 'Perfect for a small celebration. Would book again!',
    },
  ]);

  readonly showAll = signal(false);

  readonly visibleTestimonials = computed(() => {
    const list = this.testimonials();
    return this.showAll() ? list : list.slice(0, 3);
  });

  readonly averageRating = computed(() => {
    const list = this.testimonials();
    if (!list.length) return '0.0';
    const sum = list.reduce((a, b) => a + b.rating, 0);
    return (sum / list.length).toFixed(1);
  });

  readonly jsonLd = computed(() => {
    const list = this.testimonials();
    const avg = Number(this.averageRating() || 0);

    return JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Om Sai Aqua Safari',
        areaServed: 'Goa, India',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: avg,
          reviewCount: list.length,
        },
        review: list.slice(0, 10).map((t) => ({
          '@type': 'Review',
          reviewRating: { '@type': 'Rating', ratingValue: t.rating },
          author: { '@type': 'Person', name: t.author },
          datePublished: t.date,
          reviewBody: t.text,
        })),
      },
      null,
      2
    );
  });

  constructor(private title: Title, private meta: Meta) {
    // SEO
    this.title.setTitle('Reviews | Om Sai Aqua Safari - Yacht & Cruise in Goa');
    this.meta.updateTag({
      name: 'description',
      content:
        'Read customer reviews for Om Sai Aqua Safari in Goa. Premium yacht rentals and cruise experiences with trusted crew and smooth booking.',
    });
    this.meta.updateTag({ property: 'og:title', content: 'Reviews | Om Sai Aqua Safari' });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Customer reviews for yacht rentals & cruises in Goa.',
    });
  }

  toggleShowAll() {
    this.showAll.update((v) => !v);
  }

  starsFor(n: number): number[] {
    return Array.from({ length: Math.max(0, n) }, (_, i) => i);
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join('');
  }
}
