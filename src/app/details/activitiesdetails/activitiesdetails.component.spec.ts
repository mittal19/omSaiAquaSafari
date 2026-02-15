import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitiesdetailsComponent } from './activitiesdetails.component';

describe('ActivitiesdetailsComponent', () => {
  let component: ActivitiesdetailsComponent;
  let fixture: ComponentFixture<ActivitiesdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivitiesdetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivitiesdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
