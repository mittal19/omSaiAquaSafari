import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-enquire',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './enquire.component.html',
  styleUrl: './enquire.component.css',
})
export class EnquireComponent implements OnInit {
  @ViewChild('nativeForm', { static: false })
  nativeForm?: ElementRef<HTMLFormElement>;

  contactForm!: FormGroup;
  submitted = false;
  isSubmitting = false;

  /** Keep this in ONE place (easy to change later) */
  readonly formSubmitAction =
    'https://formsubmit.co/mittalpriyanshu19@gmail.com';

  constructor(
    private readonly fb: FormBuilder,
    private readonly title: Title,
    private readonly meta: Meta
  ) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });

    // SEO (works best when this is a routed page/section)
    this.title.setTitle('Quick Quote | Om Sai Aqua Safari');
    this.meta.updateTag({
      name: 'description',
      content:
        'Request a quick quote for yacht and cruise rentals in Goa. Share your details and we will get back with the best options for your trip.',
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.isSubmitting = true;

    if (this.contactForm.invalid) {
      this.isSubmitting = false;
      return;
    }

    // Keep FormSubmit's native POST
    queueMicrotask(() => {
      this.nativeForm?.nativeElement?.submit();
      this.isSubmitting = false;
    });
  }
}
