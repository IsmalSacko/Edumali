export interface StudentBrief {
	id: number;
	username?: string;
	first_name?: string;
	last_name?: string;
}

export interface TeacherBrief {
	id: number;
	username?: string;
	first_name?: string;
	last_name?: string;
}

export interface MatiereBrief {
	id: number;
	nom: string;
	coefficient?: number;
}

export type EvalType = 'CC' | 'EX' | 'TP' | 'DS' | 'RA';

export interface Evaluation {
	id: number;
	student: StudentBrief;
	matiere: MatiereBrief;
	teacher?: TeacherBrief | null;
	eval_type: EvalType;
	score: number;
	max_score: number;
	date?: string | null; // 'YYYY-MM-DD'
	trimester: 1 | 2 | 3;
	cycle?: 'primaire' | 'secondaire' | 'lycee' | null;
	comment?: string | null;
	created_at?: string;
}

export class EvaluationModel implements Evaluation {
	id: number;
	student: StudentBrief;
	matiere: MatiereBrief;
	teacher?: TeacherBrief | null;
	eval_type: EvalType;
	score: number;
	max_score: number;
	date?: string | null;
	trimester: 1 | 2 | 3;
	cycle?: 'primaire' | 'secondaire' | 'lycee' | null;
	comment?: string | null;
	created_at?: string;

	constructor(data: Partial<Evaluation> = {}) {
		this.id = data.id ?? 0;
		this.student = data.student ?? { id: 0 };
		this.matiere = data.matiere ?? { id: 0, nom: '' };
		this.teacher = data.teacher ?? null;
		this.eval_type = (data.eval_type ?? 'CC') as EvalType;
		this.score = Number(data.score ?? 0);
		this.max_score = Number(data.max_score ?? 20);
		this.date = data.date ?? null;
		this.trimester = (data.trimester ?? 1) as 1 | 2 | 3;
		this.cycle = data.cycle ?? null;
		this.comment = data.comment ?? null;
		this.created_at = data.created_at;
	}


}

export default EvaluationModel;
