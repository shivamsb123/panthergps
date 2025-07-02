import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateLocationComponent } from './generate-location.component';

describe('GenerateLocationComponent', () => {
  let component: GenerateLocationComponent;
  let fixture: ComponentFixture<GenerateLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateLocationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
