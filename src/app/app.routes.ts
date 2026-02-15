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
    component:YachtdetailsComponent
  },
  { path: 'book-yacht/:id', component: YachtBookComponent },
  {
    path: 'book-cruise',
    component:CruisedetailsComponent
  },
  {
    path: 'book-water-activities',
    component:ActivitiesdetailsComponent
  },
  {
    path: 'gallery',
    loadComponent: () =>
      import('./gallery/gallery.component').then(m => m.GalleryComponent),
    title: 'Gallery | Om Sai Aqua Safari',
  },
];
