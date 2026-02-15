import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { Yacht, YACHTS } from './yacht-data';

@Component({
  selector: 'app-yachtdetails',
  standalone: true,
  imports: [CommonModule,  RouterModule],
  templateUrl: './yachtdetails.component.html',
  styleUrl: './yachtdetails.component.css'
})
export class YachtdetailsComponent {

  readonly yachts: Yacht[] = YACHTS;

  constructor(private readonly title: Title, private readonly meta: Meta) {}

  ngOnInit(): void {
    this.title.setTitle('Book a Yacht | Om Sai Aqua Safari');
    this.meta.updateTag({
      name: 'description',
      content:
        'Browse yacht options in Goa with pricing, capacity, inclusions and details. Open a yacht to check availability and raise a booking query.',
    });
  }

  trackById(_: number, y: Yacht) {
    return y.id;
  }

  formatINR(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
