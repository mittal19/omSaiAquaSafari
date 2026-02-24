import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

type YachtCard = {
  id: string;
  name: string;
  capacity: number; 
  length: string;
  speed: string;
  sleeping: number;
  cabin:number;
  crew: number;
    morningRate: string;
      eveningRate: string;
      startingFrom: string;
  cruiseTime: string;
  anchoringTime: string;
  totalTime: string;
  imageUrl: string;
  imageAlt: string;
  images: string[];
  inclusions: string;
  description: string;
  additions: string;
};

@Component({
  selector: 'app-yachtOptions',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage],
  templateUrl: './yachtOptions.component.html',
  styleUrls:[
  '../explore/explore.component.css',
  './yachtOptions.component.css'
],
})
export class YachtOptionsComponent implements OnInit {
  readonly yachts: YachtCard[] = [
    {
      id: 'peagus-yacht',
      name: 'Peagus Yacht',
      capacity: 23,
      length: '16 meters',
      speed: '15 knots',
      sleeping: 2,
      cabin: 2,
      crew: 3,
      cruiseTime: '',
      anchoringTime: '',
       inclusions:'Soft drinks & Mineral water, Ice cubes & Ice Box, Bluetooth music, 1 Bedroom, Lounge area, Sundeck area, Washroom, Glasses & Plates, Fuel & Jetty Charges, All Life saving equipments onboard',
      totalTime: '1 day',
    morningRate: "22,999 Rs",
      eveningRate: "31,999 Rs",
      startingFrom: "22,999 Rs",
      imageUrl: 'assets/yacht/type/peagus.jpeg',
      imageAlt: 'Peagus luxury yacht in Goa',
             images:['assets/yacht/type/peagus.jpeg','assets/yacht/type/coco.jpeg','assets/yacht/type/aquila.jpeg','assets/yacht/type/peagus.jpeg','assets/yacht/type/coco.jpeg','assets/yacht/type/aquila.jpeg','assets/yacht/type/peagus.jpeg','assets/yacht/type/coco.jpeg','assets/yacht/type/aquila.jpeg'],
description:"Experience elegance on the waters with the Peagus Yacht, a 16-meter luxury cruiser designed for comfort, celebration, and unforgettable moments. Perfect for private parties, sunset cruises, birthday celebrations, corporate gatherings, or romantic escapes, this yacht offers a smooth sailing experience at 15 knots with a professional 3-member crew ensuring safety and premium hospitality. With a spacious layout accommodating up to 23 guests, Peagus Yacht features a stylish lounge area, relaxing sundeck, and a comfortable 1-bedroom cabin setup with washroom access. The upper deck offers panoramic river and ocean views — ideal for sunset photography and special occasions. Whether you're cruising along Goa’s scenic coastline or anchoring for a peaceful floating party, this yacht combines luxury, comfort, and performance for a full-day private charter experience.",
additions:'Drone, PhotoGarphy, Videography, Decorations'
    },
    {
       id: 'aquila-yacht',
      name: 'Aquila Yacht',
      capacity: 12,
      length: '12 meters',
      speed: '20 knots',
      sleeping: 0,
      cabin: 0,
      crew: 0,
      morningRate: "18,999 Rs",
      eveningRate: "22,999 Rs",
      startingFrom: "18,999 Rs",
      cruiseTime: '1 hour',
      anchoringTime : '1 hour',
      totalTime : '2 hours',
      imageUrl: 'assets/yacht/type/aquila.jpeg',
      imageAlt: 'Aquila luxury yacht in Goa',
     description: `
Experience luxury cruising in Goa aboard the elegant Aquila Yacht, a 12-meter premium motor yacht designed for comfort, style, and smooth performance. Perfect for private parties, birthdays, anniversaries, corporate outings, and sunset cruises, Aquila accommodates up to 12 guests comfortably.

Cruising at speeds of up to 20 knots, this yacht delivers a stable and relaxing ride through Goa’s scenic rivers and coastal waters. The spacious front sundeck is ideal for lounging and sunbathing, while the shaded cockpit seating area provides a comfortable space to relax, socialize, and enjoy music with your group.

Whether you're planning a romantic evening cruise or a fun celebration with friends, Aquila Yacht offers the perfect blend of luxury, privacy, and adventure. Capture stunning moments against Goa’s beautiful waterfront backdrop while enjoying a premium yachting experience.

Book Aquila Yacht in Goa today for an unforgettable 2-hour cruise experience including cruising and anchoring time.
`,
   inclusions:'Soft drinks & Mineral water, Ice cubes & Ice Box, Bluetooth music, 1 Bedroom, Lounge area, Sundeck area, Washroom, Glasses & Plates, Fuel & Jetty Charges, All Life saving equipments onboard',
         images:['assets/yacht/type/aquila.jpeg','assets/yacht/type/peagus.jpeg','assets/yacht/type/coco.jpeg'],
         additions:'Drone, PhotoGarphy, Videography, Decorations'
    },
    {
      id: 'coco-yacht',
      name: 'Coco Yacht',
      capacity: 22,
      length: '16 meters',
      speed: '12 knots',
    inclusions:'Soft drinks & Mineral water, Ice cubes & Ice Box, Bluetooth music, 1 Bedroom, Lounge area, Sundeck area, Washroom, Glasses & Plates, Fuel & Jetty Charges, All Life saving equipments onboard',
       sleeping: 0,
      cabin: 0,
      crew: 0,
      cruiseTime: '1 hour',
      anchoringTime : '1 hour',
      totalTime: '2 hours',
      description:`Experience elegance and comfort on the waters of Goa with the Coco Yacht, a beautifully designed 16-meter luxury yacht perfect for private celebrations, sunset cruises, and memorable gatherings. With a spacious capacity of up to 22 guests, Coco Yacht offers the ideal blend of relaxation, style, and premium cruising experience.

Cruise smoothly at 12 knots while enjoying a well-planned 2-hour experience that includes 1 hour of scenic cruising and 1 hour of anchoring. Whether you’re planning a birthday party, pre-wedding shoot, corporate outing, or a private celebration with friends and family, Coco Yacht provides the perfect setting against Goa’s stunning coastline.

Step aboard and enjoy a comfortable lounge area, relaxing sundeck, private bedroom space, and a fully equipped washroom. The yacht comes with complimentary soft drinks, mineral water, ice cubes, glasses, plates, and a Bluetooth music system to set the mood. All fuel charges, jetty charges, and life-saving equipment are included for a safe and seamless experience.

Enhance your celebration with optional add-ons such as drone shoots, professional photography, videography, and custom decorations to make your event truly unforgettable.
Starting from ₹22,999, Coco Yacht promises luxury, comfort, and unforgettable moments on the Arabian Sea.`,
     morningRate: "22,999 Rs",
      eveningRate: "26,999 Rs",
      startingFrom: "22,999 Rs",
      imageUrl: 'assets/yacht/type/coco.jpeg',
      imageAlt: 'Coco luxury yacht in Goa',
        images:['assets/yacht/type/coco.jpeg','assets/yacht/type/aquila.jpeg','assets/yacht/type/peagus.jpeg'],
        additions:'Drone, PhotoGarphy, Videography, Decorations'
    }
  ];

  isYachtOptions = false;
  constructor(private title: Title, private meta: Meta,private router: Router) {}

  ngOnInit(): void {
    this.isYachtOptions = this.router.url === '/book-yacht' || this.router.url === '/yachts';
    // SEO
    this.title.setTitle('Luxury Yacht Options in Goa | Sea Rider Goa - Yacht Service');
    this.meta.updateTag({
      name: 'description',
      content:
        'Explore our most loved luxury yachts in Goa. Compare capacity, rating, year and size. Book your private yacht experience with Sea Rider Goa - Yacht Service.',
    });
    this.meta.updateTag({
      name: 'robots',
      content: 'index,follow',
    });
    // Optional OG tags
    this.meta.updateTag({ property: 'og:title', content: 'Luxury Yacht Options in Goa' });
    this.meta.updateTag({
      property: 'og:description',
      content:
        'Explore our most loved luxury yachts in Goa. Compare capacity, rating, year and size. Book now.',
    });
  }

  trackById(_: number, item: YachtCard): string {
    return item.id;
  }

  // Small helper for template
  stars(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  get gridCols(): number {
  return Math.min(3, this.yachts.length);
}

goToYacht(yacht:YachtCard) {
  this.router.navigate(['/book-yacht',yacht.id], {
    state: yacht
  });
}

}