import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileInfPage } from './profile-info.page';

describe('ProfileInfPage', () => {
  let component: ProfileInfPage;
  let fixture: ComponentFixture<ProfileInfPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileInfPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
