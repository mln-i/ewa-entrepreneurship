import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudenthomepageComponent } from './studenthomepage.component';

describe('StudenthomepageComponent', () => {
  let component: StudenthomepageComponent;
  let fixture: ComponentFixture<StudenthomepageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudenthomepageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudenthomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
