import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetenceresultpageComponent } from './competenceresultpage.component';

describe('CompetenceresultpageComponent', () => {
  let component: CompetenceresultpageComponent;
  let fixture: ComponentFixture<CompetenceresultpageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompetenceresultpageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompetenceresultpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
