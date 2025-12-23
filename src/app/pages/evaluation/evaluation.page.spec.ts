import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EvaluationPage } from './evaluation.page';
import { EvaluationService } from '../services/evaluation/evaluation.service';
import { AuthService } from '../services/auth/auth.service';

describe('EvaluationPage', () => {
  let component: EvaluationPage;
  let fixture: ComponentFixture<EvaluationPage>;
  let evaluationService: jasmine.SpyObj<EvaluationService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const evaluationServiceSpy = jasmine.createSpyObj('EvaluationService', [
      'getAll',
      'getById',
      'getByStudent',
      'getByClasse',
      'getBulletin',
      'resetFilter',
    ]);

    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAdmin']);

    await TestBed.configureTestingModule({
      imports: [EvaluationPage],
      providers: [
        { provide: EvaluationService, useValue: evaluationServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    evaluationService = TestBed.inject(EvaluationService) as jasmine.SpyObj<EvaluationService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    fixture = TestBed.createComponent(EvaluationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load evaluations on init', async () => {
    evaluationService.getAll.and.returnValue(Promise.resolve([]));

    await component.loadEvaluations();

    expect(evaluationService.getAll).toHaveBeenCalled();
  });

  it('should change view mode', () => {
    component.changeViewMode('bulletin');
    expect(component.viewMode()).toBe('bulletin');

    component.changeViewMode('stats');
    expect(component.viewMode()).toBe('stats');
  });

  it('should calculate correct score on 20', () => {
    const evaluation = {
      id: 1,
      student: { id: 1, first_name: 'John', last_name: 'Doe' },
      matiere: { id: 1, nom: 'Math' },
      eval_type: 'CC' as const,
      score: 15,
      max_score: 20,
      trimester: 1 as const,
    };

    const score = component.getScore20(evaluation);
    expect(score).toBe(15);
  });

  it('should return correct score color', () => {
    const excellentEval = { score: 18, max_score: 20 };
    const goodEval = { score: 14, max_score: 20 };
    const mediumEval = { score: 12, max_score: 20 };
    const poorEval = { score: 8, max_score: 20 };

    expect(component.getScoreColor(excellentEval as any)).toBe('success');
    expect(component.getScoreColor(goodEval as any)).toBe('warning');
    expect(component.getScoreColor(mediumEval as any)).toBe('medium');
    expect(component.getScoreColor(poorEval as any)).toBe('danger');
  });
});
