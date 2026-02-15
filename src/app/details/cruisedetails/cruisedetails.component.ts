import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
interface Review {
  rating: number;
  text: string;
  author: string;
}

interface ThumbnailImage {
  src: string;
  alt: string;
}


@Component({
  selector: 'app-cruisedetails',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cruisedetails.component.html',
  styleUrl: './cruisedetails.component.css'
})
export class CruisedetailsComponent {
  mainImage: string = 'assets/images/azimut-45-main.jpg';
  
  thumbnailImages: ThumbnailImage[] = [
    { src: 'assets/images/azimut-45-main.jpg', alt: 'Azimut 45 Exterior' },
    { src: 'assets/images/azimut-45-salon.jpg', alt: 'Azimut 45 Salon' },
    { src: 'assets/images/azimut-45-cabin.jpg', alt: 'Azimut 45 Cabin' },
    { src: 'assets/images/azimut-45-flybridge.jpg', alt: 'Azimut 45 Flybridge' }
  ];
  
  customerReviews: Review[] = [
    {
      rating: 5,
      text: 'Our day on the Azimut 45 was absolutely perfect. The yacht is incredibly luxurious and the captain was very professional. Will definitely rent again!',
      author: 'Michael R.'
    },
    {
      rating: 5,
      text: 'We had an amazing weekend trip. The boat is beautiful, spacious and very well maintained. The three cabins were perfect for our family.',
      author: 'Sarah T.'
    },
    {
      rating: 4,
      text: 'Excellent experience overall. The yacht was stunning and comfortable. Only giving 4 stars because we had a slight delay at departure.',
      author: 'David M.'
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  setMainImage(index: number): void {
    this.mainImage = this.thumbnailImages[index].src;
  }


}
