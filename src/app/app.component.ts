import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ContactComponent } from './common/contact/contact.component';
import { EnquireComponent } from './common/enquire/enquire.component';
import { FooterComponent } from './common/footer/footer.component';
import { HeaderComponent } from './common/header/header.component';
import { WhatsappComponent } from './common/whatsapp/whatsapp.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,RouterOutlet,HeaderComponent, FooterComponent, ContactComponent, WhatsappComponent, EnquireComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  showEnquire = true;
  showContact = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentUrl = this.router.url;

        // Hide enquire on quick-quote and book-yacht/:id
        this.showEnquire =
          !currentUrl.includes('/quick-quote') &&
          !currentUrl.includes('/book-yacht/');

        // Hide contact & enquire on contact page
        if (currentUrl.includes('/contact')) {
          this.showContact = false;
          this.showEnquire = false;
        } else {
          this.showContact = true;
        }
      });
  }
}