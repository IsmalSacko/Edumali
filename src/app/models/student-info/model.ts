export interface PersonInfo {
	id: number;
	prenom?: string | null;
	nom?: string | null;
	username?: string | null;
}

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

export interface MatiereInfo {
	id: number;
	nom: string;
	coefficient: number;
}

export type EvalType = 'CC' | 'EX' | 'TP' | 'DS' | 'RA';

export interface Evaluation {
	id: number;
	student: number | StudentBrief;
	matiere: number | MatiereBrief;
	teacher?: number | TeacherBrief | null;
	student_info?: PersonInfo | null;
	teacher_info?: PersonInfo | null;
	matiere_info?: MatiereInfo | null;
	eval_type: EvalType;
	eval_type_display?: string;
	score: number;
	max_score: number;
	normalized_note?: number | null;
	note_ponderee?: number | null;
	date?: string | null;
	trimester: 1 | 2 | 3;
	cycle?: 'primaire' | 'secondaire' | 'lycee' | null;
	comment?: string | null;
	created_at?: string;
}

export interface MatiereFinalNote {
	student_id: number;
	matiere_id: number;
	trimester: number;
	note_finale: number;
}

export interface BulletinGrade {
	matiere_id: number;
	matiere_name: string;
	average: number;
	count: number;
	coefficient: number;
	noteLabel?: string;
}

export interface Bulletin {
	student_id: number;
	student_name: string;
	trimester: number;
	average: number;
	comments?: string;
	total_coeffs?: number;
	student_photo?: string;
	profile_photo?: string;
	grades: BulletinGrade[];
}

export class EvaluationModel implements Evaluation {
	id: number;
	student: number | StudentBrief;
	matiere: number | MatiereBrief;
	teacher?: number | TeacherBrief | null;
	student_info?: PersonInfo | null;
	teacher_info?: PersonInfo | null;
	matiere_info?: MatiereInfo | null;
	eval_type: EvalType;
	eval_type_display?: string;
	score: number;
	max_score: number;
	normalized_note?: number | null;
	note_ponderee?: number | null;
	date?: string | null;
	trimester: 1 | 2 | 3;
	cycle?: 'primaire' | 'secondaire' | 'lycee' | null;
	comment?: string | null;
	created_at?: string;

	constructor(data: Partial<Evaluation> = {}) {
		this.id = data.id ?? 0;
		this.student = data.student ?? 0;
		this.matiere = data.matiere ?? 0;
		this.teacher = data.teacher ?? null;
		this.student_info = data.student_info ?? null;
		this.teacher_info = data.teacher_info ?? null;
		this.matiere_info = data.matiere_info ?? null;
		this.eval_type = (data.eval_type ?? 'CC') as EvalType;
		this.eval_type_display = data.eval_type_display;
		this.score = Number(data.score ?? 0);
		this.max_score = Number(data.max_score ?? 20);
		this.normalized_note = data.normalized_note ?? null;
		this.note_ponderee = data.note_ponderee ?? null;
		this.date = data.date ?? null;
		this.trimester = (data.trimester ?? 1) as 1 | 2 | 3;
		this.cycle = data.cycle ?? null;
		this.comment = data.comment ?? null;
		this.created_at = data.created_at;
	}

	/** Retourne le nom de l'élève depuis student_info ou student */
	getStudentName(): string {
		if (this.student_info) {
			return `${this.student_info.prenom || ''} ${this.student_info.nom || ''}`.trim();
		}
		if (typeof this.student !== 'number' && this.student) {
			return `${this.student.first_name || ''} ${this.student.last_name || ''}`.trim();
		}
		return 'Inconnu';
	}

	/** Retourne le nom du professeur */
	getTeacherName(): string {
		if (this.teacher_info) {
			return `${this.teacher_info.prenom || ''} ${this.teacher_info.nom || ''}`.trim();
		}
		if (typeof this.teacher !== 'number' && this.teacher) {
			return `${this.teacher.first_name || ''} ${this.teacher.last_name || ''}`.trim();
		}
		return 'N/A';
	}

	/** Retourne le nom de la matière */
	getMatiereName(): string {
		if (this.matiere_info) {
			return this.matiere_info.nom;
		}
		if (typeof this.matiere !== 'number' && this.matiere) {
			return this.matiere.nom;
		}
		return 'Inconnu';
	}

	/** Retourne le coefficient de la matière */
	getMatiereCoefficient(): number {
		if (this.matiere_info) {
			return this.matiere_info.coefficient ?? 1;
		}
		if (typeof this.matiere !== 'number' && this.matiere) {
			return this.matiere.coefficient ?? 1;
		}
		return 1;
	}
}

export default EvaluationModel;
