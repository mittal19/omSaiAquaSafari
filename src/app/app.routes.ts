import { Routes } from '@angular/router';
import { YachtdetailsComponent } from './details/yachtdetails/yachtdetails.component';
import { CruisedetailsComponent } from './details/cruisedetails/cruisedetails.component';
import { ActivitiesdetailsComponent } from './details/activitiesdetails/activitiesdetails.component';
import { HomeComponent } from './home/home.component';
import { YachtBookComponent } from './details/yachtdetails/yachtbook/yachtbook.component';

export const routes: Routes = [
  {
    path: '',
    component:HomeComponent
  },
  {
    path: 'book-yacht',
    loadComponent: () =>
      import('./details/yachtdetails/yachtdetails.component').then(m => m.YachtdetailsComponent),
  },
  {
    path: 'explore',
    loadComponent: () =>
      import('./explore/explore.component').then(m => m.ExploreComponent),
  },
  {
    path: 'gallery',
    loadComponent: () =>
      import('./home/gallery/gallery.component').then(m => m.GalleryComponent),
  },
  {
    path: 'reviews',
    loadComponent: () =>
      import('./home/testimonials/testimonials.component').then(m => m.TestimonialsComponent),
  },
  {
    path: 'quick-quote',
    loadComponent: () =>
      import('./common/enquire/enquire.component').then(m => m.EnquireComponent),
  },

  { path: 'book-yacht/:id',
    loadComponent: () =>
      import('./details/yachtdetails/yachtbook/yachtbook.component').then(m => m.YachtBookComponent),
   },
    { path: 'contact',
    loadComponent: () =>
      import('./common/contact/contact.component').then(m => m.ContactComponent),
   },
 /* {
    path: 'gallery',
    loadComponent: () =>
      import('./gallery/gallery.component').then(m => m.GalleryComponent),
    title: 'Gallery | Om Sai Aqua Safari',
  },*/
];
