import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type FooterLink = { label: string; href?: string; routerLink?: string; ariaLabel?: string };

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();

  // Keep links declarative (easy to maintain + avoids unused template code)
  readonly quickLinks: FooterLink[] = [
    { label: 'Home', routerLink: '', ariaLabel: 'Go to Home section' },
    { label: 'Explore', routerLink: 'explore', ariaLabel: 'Go to Explore section' },
    { label: 'Gallery', routerLink: 'gallery', ariaLabel: 'Go to Gallery section' },
    { label: 'Reviews', routerLink: 'reviews', ariaLabel: 'Go to Reviews section' },
    { label: 'Quick Quote', routerLink: 'quick-quote', ariaLabel: 'Go to Quick Quote section' },
    { label: 'Contact', routerLink: 'contact', ariaLabel: 'Go to Contact section' },
  ];
}
