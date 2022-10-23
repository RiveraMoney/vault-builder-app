import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValutListComponent } from './valut-list.component';

describe('ValutListComponent', () => {
  let component: ValutListComponent;
  let fixture: ComponentFixture<ValutListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValutListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValutListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
