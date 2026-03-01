import { Component } from '@angular/core';

@Component({
  selector: 'app-whatsapp',
  standalone: true,
  imports: [],
  templateUrl: './whatsapp.component.html',
  styleUrl: './whatsapp.component.css'
})
export class WhatsappComponent {
  phoneNumber = '9168284787'; // Replace with your actual WhatsApp number
  
  openWhatsApp() {
    const message = encodeURIComponent('Hello SeaRider Goa, I want to book a yacht. Please share slots & pricing.');
    window.open(`https://wa.me/${this.phoneNumber}?text=${message}`, '_blank');
  }
}
