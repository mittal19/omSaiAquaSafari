import { CommonModule } from '@angular/common';
import { Component, computed, signal, ElementRef, ViewChild } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

type Testimonial = {
  author: string;
  yacht: 'Peagus' | 'Aquila' | 'Coco';
  date: string;
  rating: number;
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

  @ViewChild('testimonialSection') testimonialSection!: ElementRef;

  readonly testimonials = signal<Testimonial[]>([
    {
      author: 'Ray Robertson',
      yacht: 'Peagus',
      date: '01 Feb, 2024',
      rating: 5,
      text: 'Beautiful yacht, smooth booking, and an unforgettable sunset experience.',
    },
    {
      author: 'Aisha Khan',
      yacht: 'Aquila',
      date: '22 Mar, 2024',
      rating: 5,
      text: 'Very professional crew. Great for family and friends. Highly recommended!',
    },
    {
      author: 'Karan Mehta',
      yacht: 'Coco',
      date: '05 May, 2024',
      rating: 4,
      text: 'Great cruise views and comfortable seating. Worth it for the experience.',
    },
    {
      author: 'Neha Sharma',
      yacht: 'Peagus',
      date: '18 Jun, 2024',
      rating: 5,
      text: 'Excellent hospitality and well-maintained yacht. Booking was super easy.',
    },
    {
      author: 'Rohit Verma',
      yacht: 'Aquila',
      date: '09 Jul, 2024',
      rating: 5,
      text: 'Perfect for a special occasion. Crew was polite and the route was scenic.',
    },
    {
      author: 'Simran Kaur',
      yacht: 'Coco',
      date: '14 Aug, 2024',
      rating: 4,
      text: 'Good service and clean yacht. Loved the overall vibe and photos came out great.',
    },
  ]);

  isTestimonialRoute = false;
  // Pagination
  readonly pageSize = 3;
  readonly visibleCount = signal(this.pageSize);

  readonly canShowLess = computed(() => this.visibleCount() > this.pageSize);
  readonly hasMore = computed(() => this.visibleCount() < this.testimonials().length);

  readonly visibleTestimonials = computed(() => {
    const list = this.testimonials();
    return list.slice(0, Math.min(this.visibleCount(), list.length));
  });

  readonly totalReviews = computed(() => this.testimonials().length);

  readonly averageRating = computed(() => {
    const list = this.testimonials();
    if (!list.length) return 0;
    const sum = list.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / list.length) * 10) / 10;
  });

  constructor(private title: Title, private meta: Meta,private router: Router) {
    this.title.setTitle('Customer Reviews | Yacht Experiences in Goa');
    this.meta.updateTag({
      name: 'description',
      content:
        'Read authentic customer reviews for Peagus, Aquila, and Coco yachts in Goa.',
    });
  }

   ngOnInit() {
    this.isTestimonialRoute = this.router.url === '/reviews';
  }


  showMore() {
    const total = this.testimonials().length;
    this.visibleCount.update((c) => Math.min(c + this.pageSize, total));
  }

  showLess() {
    this.visibleCount.set(this.pageSize);

    setTimeout(() => {
      this.testimonialSection?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }

  starsFor(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  jsonLd() {
    const list = this.testimonials();
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Yacht Experiences Goa',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: this.averageRating(),
        reviewCount: this.totalReviews(),
      },
      review: list.map((t) => ({
        '@type': 'Review',
        itemReviewed: {
          '@type': 'Service',
          name: `${t.yacht} Yacht Experience`
        },
        author: { '@type': 'Person', name: t.author },
        datePublished: t.date,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: t.rating,
          bestRating: 5
        },
        reviewBody: t.text,
      })),
    };
  }
}