import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';

type ToastType = 'success' | 'error';

interface ToastState {
  visible: boolean;
  type: ToastType;
  title: string;
  message: string;
}

@Component({
  selector: 'app-enquire',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './enquire.component.html',
  styleUrl: './enquire.component.css',
})
export class EnquireComponent implements OnInit, OnDestroy {
  @ViewChild('nativeForm', { static: false })
  nativeForm?: ElementRef<HTMLFormElement>;

  contactForm!: FormGroup;
  submitted = false;
  isSubmitting = false;

  toast: ToastState = {
    visible: false,
    type: 'success',
    title: '',
    message: '',
  };

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

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
      // Email is optional, but if provided it must be valid
      email: ['', [Validators.email]],
      // Phone is mandatory (10 digits)
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });

    // SEO (works best when this is a routed page/section)
    this.title.setTitle('Quick Quote | Sea Rider Goa - Yacht Service');
    this.meta.updateTag({
      name: 'description',
      content:
        'Request a quick quote for yacht and cruise rentals in Goa. Share your details and we will get back with the best options for your trip.',
    });
  }

  ngOnDestroy(): void {
    this.clearToastTimer();
  }

  get f() {
    return this.contactForm.controls;
  }

  showToast(type: ToastType, titleText: string, messageText: string): void {
    this.clearToastTimer();

    this.toast = {
      visible: true,
      type,
      title: titleText,
      message: messageText,
    };

    this.toastTimer = setTimeout(() => {
      this.hideToast();
    }, 3800);
  }

  hideToast(): void {
    this.toast = { ...this.toast, visible: false };
    this.clearToastTimer();
  }

  private clearToastTimer(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;

    if (this.contactForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    // Prefer using native form field names (important for FormSubmit helpers)
    const formEl = this.nativeForm?.nativeElement;
    let formData: FormData;

    if (formEl) {
      formData = new FormData(formEl);
    } else {
      // Fallback (should rarely happen)
      formData = new FormData();
      formData.append('name', String(this.contactForm.value.fullName ?? ''));
      formData.append('email', String(this.contactForm.value.email ?? ''));
      formData.append('phone', String(this.contactForm.value.phone ?? ''));
      formData.append('message', String(this.contactForm.value.message ?? ''));
      formData.append('_subject', 'New Quick Quote Request');
      formData.append('_captcha', 'false');
    }

    try {
      const res = await fetch(this.formSubmitAction, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        this.showToast(
          'success',
          'Query submitted',
          'Thanks! We’ll contact you shortly with the best options.'
        );
        this.contactForm.reset();
        this.submitted = false;
      } else {
        this.showToast(
          'error',
          'Could not submit',
          'Please try again in a moment.'
        );
      }
    } catch {
      this.showToast(
        'error',
        'Network issue',
        'Please check your connection and try again.'
      );
    } finally {
      this.isSubmitting = false;
    }
  }
}
