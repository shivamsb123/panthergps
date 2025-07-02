import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedLocationManageComponent } from './shared-location-manage.component';

describe('SharedLocationManageComponent', () => {
  let component: SharedLocationManageComponent;
  let fixture: ComponentFixture<SharedLocationManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SharedLocationManageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedLocationManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
