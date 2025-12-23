import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatPage } from './stat.page';

describe('StatPage', () => {
  let component: StatPage;
  let fixture: ComponentFixture<StatPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
