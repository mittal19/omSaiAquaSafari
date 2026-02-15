import { Component } from '@angular/core';

@Component({
  selector: 'app-whatsapp',
  standalone: true,
  imports: [],
  templateUrl: './whatsapp.component.html',
  styleUrl: './whatsapp.component.css'
})
export class WhatsappComponent {
  phoneNumber = '9027504141'; // Replace with your actual WhatsApp number
  
  openWhatsApp() {
    const message = encodeURIComponent('Hello from OmSaiWaveRiders!');
    window.open(`https://wa.me/${this.phoneNumber}?text=${message}`, '_blank');
  }
}
