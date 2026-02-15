import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-activitiesdetails',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activitiesdetails.component.html',
  styleUrl: './activitiesdetails.component.css'
})
export class ActivitiesdetailsComponent {
  activities:any[] = [
    {
      id: 1,
      title: 'North Island Scuba Diving & Watersports in Goa Combo',
      images: ['assets/images/scuba-diving.jpg', 'assets/images/scuba-diving-2.jpg', 'assets/images/scuba-diving-3.jpg'],
      duration: '60 mins',
      originalPrice: 3000,
      discountedPrice: 2400,
      discount: 20
    },
    {
      id: 2,
      title: 'Watersports with Open Sea Boat Party in Goa',
      images: ['assets/images/boat-party.jpg', 'assets/images/boat-party-2.jpg', 'assets/images/boat-party-3.jpg'],
      duration: '90 mins',
      originalPrice: 2500,
      discountedPrice: 1750,
      discount: 30
    },
    {
      id: 3,
      title: 'Special Open Sea Boat Party in Goa',
      images: ['assets/images/jet-ski.jpg', 'assets/images/jet-ski-2.jpg', 'assets/images/jet-ski-3.jpg'],
      duration: '120 mins',
      originalPrice: 3500,
      discountedPrice: 2450,
      discount: 30
    },
    {
      id: 4,
      title: 'Scuba Diving & Water Sports in South Goa Package',
      images: ['assets/images/scuba-water-sports.jpg', 'assets/images/scuba-water-sports-2.jpg', 'assets/images/scuba-water-sports-3.jpg'],
      duration: '75 mins',
      originalPrice: 2800,
      discountedPrice: 2100,
      discount: 25
    },
    {
      id: 5,
      title: 'Scuba Diving with Hand Tie in Goa',
      images: ['assets/images/hand-tie-scuba.jpg', 'assets/images/hand-tie-scuba-2.jpg', 'assets/images/hand-tie-scuba-3.jpg'],
      duration: '60 mins',
      originalPrice: 2600,
      discountedPrice: 2080,
      discount: 20
    },
    {
      id: 6,
      title: 'SURFING IN GOA ( LESSONS & SPOT )',
      images: ['assets/images/surfing.jpg', 'assets/images/surfing-2.jpg', 'assets/images/surfing-3.jpg'],
      duration: '90 mins',
      originalPrice: 3200,
      discountedPrice: 2240,
      discount: 30
    }
  ];

  bookActivity(activityId: number): void {
    // Here you would implement the WhatsApp booking functionality
    // For example, opening WhatsApp with a predefined message
    const activity = this.activities.find(a => a.id === activityId);
    
    if (activity) {
      const message = `Hi, I would like to book "${activity.title}" activity.`;
      const whatsappNumber = '919876543210'; // Replace with your actual WhatsApp number
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
    }
  }

}
