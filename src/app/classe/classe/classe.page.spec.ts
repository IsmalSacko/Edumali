import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassePage } from './classe.page';

describe('ClassePage', () => {
  let component: ClassePage;
  let fixture: ComponentFixture<ClassePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
