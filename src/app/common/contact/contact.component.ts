import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

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

  readonly addressLines = ['Dharma Jetty, Britona, Alto Porvorim, Penha de Franc, Bardez', 'Goa 403101'];

  readonly mapQuery = 'Sea Rider Goa';

  // Optional socials (leave empty to hide the button automatically)
  readonly instagramUrl = '';
  readonly facebookUrl = '';

  constructor(private readonly title: Title, private readonly meta: Meta) {}

  ngOnInit(): void {
    this.title.setTitle('Contact | Sea Rider Goa - Yacht Service');
    this.meta.updateTag({
      name: 'description',
      content:
        'Contact Sea Rider Goa for yacht and cruise rentals in Goa. Call, email, or get directions for quick assistance.',
    });
  }

  get mapUrl(): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      this.mapQuery
    )}`;
  }

  get whatsAppUrl(): string {
    // whatsapp expects digits only (country code + number)
    const digits = (this.phoneTel || '').replace(/[^\d]/g, '');
    return digits ? `https://wa.me/${digits}` : '';
  }
}