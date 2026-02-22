import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
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
  rate: string;
  cruiseTime: string;
  anchoringTime: string;
  totalTime: string;
  imageUrl: string;
  imageAlt: string;
  bookRoute: any[]; // routerLink array
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
      totalTime: '1 day',
      rate: "23,000 Rs",
      imageUrl: 'assets/yacht/type/peagus.jpeg',
      imageAlt: 'Peagus luxury yacht in Goa',
      bookRoute: ['/book-yacht', 'peagus-yacht'],
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
      rate: "15,000 Rs",
      cruiseTime: '1 hour',
      anchoringTime : '1 hour',
      totalTime : '2 hours',
      imageUrl: 'assets/yacht/type/aquila.jpeg',
      imageAlt: 'Aquila luxury yacht in Goa',
      bookRoute: ['/book-yacht', 'peagus-yacht'],
    },
    {
      id: 'coco-yacht',
      name: 'Coco Yacht',
      capacity: 22,
      length: '16 meters',
      speed: '12 knots',
      sleeping: 0,
      cabin: 0,
      crew: 0,
      cruiseTime: '1 hour',
      anchoringTime : '1 hour',
      totalTime: '2 hours',
      rate: "20,000 Rs",
      imageUrl: 'assets/yacht/type/coco.jpeg',
      imageAlt: 'Coco luxury yacht in Goa',
      bookRoute: ['/book-yacht', 'peagus-yacht'],
    }
  ];

  constructor(private title: Title, private meta: Meta) {}

  ngOnInit(): void {
    // SEO
    this.title.setTitle('Luxury Yacht Options in Goa | Om Sai Aqua Safari');
    this.meta.updateTag({
      name: 'description',
      content:
        'Explore our most loved luxury yachts in Goa. Compare capacity, rating, year and size. Book your private yacht experience with Om Sai Aqua Safari.',
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

}