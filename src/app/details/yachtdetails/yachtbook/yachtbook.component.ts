import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Yacht, YACHTS } from '../yacht-data';
import { buildMockAvailability } from '../availability-util';

// PrimeNG
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-yacht-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, DatePipe,
    ReactiveFormsModule,
    CalendarModule,
    DropdownModule,
    InputTextModule,
    InputTextareaModule,
    ButtonModule,],
  templateUrl: './yachtbook.component.html',
  styleUrl: './yachtbook.component.css',
})
export class YachtBookComponent implements OnInit {
  readonly yacht = signal<Yacht | null>(null);

  // lazy image loading strategy
  readonly visibleThumbCount = signal<number>(6);
  readonly selectedImage = signal<string | null>(null);

  // availability (mocked)
  readonly availableDates = signal<string[]>([]);
  readonly timesByDate = signal<Record<string, string[]>>({});
  readonly selectedDate = signal<string | null>(null);
  readonly availableTimesForSelectedDate = computed(() => {
    const d = this.selectedDate();
    return d ? this.timesByDate()[d] ?? [] : [];
  });

    private readonly disabledDateStrings = new Set<string>([
    '2026-03-10',
    '2026-03-20',
  ]);

   // PrimeNG uses Date[] for disabledDates
  readonly disabledDates = Array.from(this.disabledDateStrings).map((d) => this.parseYMD(d));

    // Helpers
  private parseYMD(ymd: string): Date {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }

  readonly minDate = new Date();
    readonly maxDate = this.addMonths(new Date(), 6);

    
  private addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }


  submitted = false;
  isSubmitting = false;

  // form (email & message optional)
  readonly form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    email: ['', [Validators.email]],
    date: ['', [Validators.required]],
    time: ['', [Validators.required]],
    message: ['', [Validators.minLength(10)]],
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly title: Title,
    private readonly meta: Meta
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const found = YACHTS.find((y) => y.id === id) ?? null;
    this.yacht.set(found);

    if (!found) {
      this.title.setTitle('Yacht not found | Om Sai Aqua Safari');
      this.meta.updateTag({
        name: 'description',
        content: 'The requested yacht could not be found.',
      });
      return;
    }

    // SEO for sub page
    this.title.setTitle(`${found.name} | Book Yacht | Om Sai Aqua Safari`);
    this.meta.updateTag({
      name: 'description',
      content: `View ${found.name} yacht details, gallery, pricing and availability in Goa. Select date & time and raise a booking query.`,
    });

    // init images
    this.selectedImage.set(found.heroImage);

    // build mock availability from yachtId
    const avail = buildMockAvailability(found.id, 21);
    this.availableDates.set(avail.availableDates);
    this.timesByDate.set(avail.timesByDate);

    // optional: preselect first available date
    const firstDate = avail.availableDates[0] ?? null;
    if (firstDate) {
      this.pickDate(firstDate);
    }
  }

  formatINR(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  trackByIndex(i: number) {
    return i;
  }

  loadMoreThumbs() {
    this.visibleThumbCount.set(this.visibleThumbCount() + 6);
  }

  pickImage(url: string) {
    this.selectedImage.set(url);
  }

  // Date picker constraint: only allow available dates
  isDateAllowed(date: string): boolean {
    return this.availableDates().includes(date);
  }

  pickDate(date: string) {
    this.selectedDate.set(date);
    this.form.controls.date.setValue(date);

    // reset time when date changes
    this.form.controls.time.setValue('');

    // auto-pick first available time
    const times = this.timesByDate()[date] ?? [];
    if (times.length) this.form.controls.time.setValue(times[0]);
  }

  onDateInputChange(value: string) {
    // user typed or selected date in native picker
    if (this.isDateAllowed(value)) {
      this.pickDate(value);
    } else {
      // invalid selection (not allowed) -> clear
      this.selectedDate.set(null);
      this.form.controls.date.setValue('');
      this.form.controls.time.setValue('');
    }
  }

  onSubmit() {
    this.submitted = true;
    this.isSubmitting = true;

    const y = this.yacht();
    if (!y || this.form.invalid) {
      this.isSubmitting = false;
      return;
    }

    // Ensure date is allowed & time is allowed
    const date = this.form.controls.date.value ?? '';
    const time = this.form.controls.time.value ?? '';
    const allowedDates = this.availableDates();
    const allowedTimes = this.timesByDate()[date] ?? [];

    if (!allowedDates.includes(date) || !allowedTimes.includes(time)) {
      this.isSubmitting = false;
      return;
    }

    const payload = {
      yachtId: y.id,
      yachtName: y.name,
      ...this.form.value,
    };

    console.log('Yacht Booking Query:', payload);

    this.isSubmitting = false;
    this.submitted = false;
    this.form.reset();
    this.selectedDate.set(null);
  }
}
