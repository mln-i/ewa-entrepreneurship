import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherhomepageComponent } from './teacherhomepage.component';

describe('TeacherhomepageComponent', () => {
  let component: TeacherhomepageComponent;
  let fixture: ComponentFixture<TeacherhomepageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherhomepageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherhomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
