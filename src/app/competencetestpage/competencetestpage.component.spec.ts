import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetencetestpageComponent } from './competencetestpage.component';

describe('CompetencetestpageComponent', () => {
  let component: CompetencetestpageComponent;
  let fixture: ComponentFixture<CompetencetestpageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompetencetestpageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompetencetestpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
