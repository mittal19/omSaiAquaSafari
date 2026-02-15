import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YachtdetailsComponent } from './yachtdetails.component';

describe('YachtdetailsComponent', () => {
  let component: YachtdetailsComponent;
  let fixture: ComponentFixture<YachtdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YachtdetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(YachtdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
