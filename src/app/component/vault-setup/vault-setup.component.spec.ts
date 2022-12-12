import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VaultSetupComponent } from './vault-setup.component';

describe('VaultSetupComponent', () => {
  let component: VaultSetupComponent;
  let fixture: ComponentFixture<VaultSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VaultSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VaultSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
