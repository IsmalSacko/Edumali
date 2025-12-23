import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmploisDuTempsPage } from './emplois-du-temps.page';

describe('EmploisDuTempsPage', () => {
  let component: EmploisDuTempsPage;
  let fixture: ComponentFixture<EmploisDuTempsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmploisDuTempsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
