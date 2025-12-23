import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnseignantListPage } from './enseignant-list.page';

describe('EnseignantListPage', () => {
  let component: EnseignantListPage;
  let fixture: ComponentFixture<EnseignantListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EnseignantListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
