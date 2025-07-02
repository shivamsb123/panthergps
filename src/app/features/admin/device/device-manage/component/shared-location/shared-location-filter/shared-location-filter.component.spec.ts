import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedLocationFilterComponent } from './shared-location-filter.component';

describe('SharedLocationFilterComponent', () => {
  let component: SharedLocationFilterComponent;
  let fixture: ComponentFixture<SharedLocationFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SharedLocationFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedLocationFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
