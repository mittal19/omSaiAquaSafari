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
  readonly phoneDisplay = '+91 98765 43210';
  readonly phoneTel = '+919876543210';

  readonly email = 'info@omsaiaquasafari.com';

  readonly addressLines = ['Om Sai Aqua Safari', 'Goa, India'];

  readonly mapQuery = 'Om Sai Aqua Safari Goa';

  // Optional socials (leave empty to hide the button automatically)
  readonly instagramUrl = '';
  readonly facebookUrl = '';

  constructor(private readonly title: Title, private readonly meta: Meta) {}

  ngOnInit(): void {
    this.title.setTitle('Contact | Om Sai Aqua Safari');
    this.meta.updateTag({
      name: 'description',
      content:
        'Contact Om Sai Aqua Safari for yacht and cruise rentals in Goa. Call, email, or get directions for quick assistance.',
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