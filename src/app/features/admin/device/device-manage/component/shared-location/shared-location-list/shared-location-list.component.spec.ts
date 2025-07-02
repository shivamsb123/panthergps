import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedLocationListComponent } from './shared-location-list.component';

describe('SharedLocationListComponent', () => {
  let component: SharedLocationListComponent;
  let fixture: ComponentFixture<SharedLocationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SharedLocationListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedLocationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
