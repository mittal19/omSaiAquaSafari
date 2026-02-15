import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CruisedetailsComponent } from './cruisedetails.component';

describe('CruisedetailsComponent', () => {
  let component: CruisedetailsComponent;
  let fixture: ComponentFixture<CruisedetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CruisedetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CruisedetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
