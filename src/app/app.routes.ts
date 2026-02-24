import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {
    path: '',
    component:HomeComponent
  },
  { 
    path: 'book-yacht',
    loadComponent: () =>
      import('./yachtOptions/yachtOptions.component').then(m => m.YachtOptionsComponent),
  },
  { 
    path: 'yachts',
    loadComponent: () =>
      import('./yachtOptions/yachtOptions.component').then(m => m.YachtOptionsComponent),
  },
  {
    path: 'explore',
    loadComponent: () =>
      import('./explore/explore.component').then(m => m.ExploreComponent),
  },
  {
    path: 'gallery',
    loadComponent: () =>
      import('./gallery/gallery.component').then(m => m.GalleryComponent),
  },
  {
    path: 'reviews',
    loadComponent: () =>
      import('./testimonials/testimonials.component').then(m => m.TestimonialsComponent),
  },
  {
    path: 'quick-quote',
    loadComponent: () =>
      import('./common/enquire/enquire.component').then(m => m.EnquireComponent),
  },

  { path: 'book-yacht/:id',
    loadComponent: () =>
      import('./yachtbook/yachtbook.component').then(m => m.YachtBookComponent),
   },
    { path: 'contact',
    loadComponent: () =>
      import('./common/contact/contact.component').then(m => m.ContactComponent),
   },
];
