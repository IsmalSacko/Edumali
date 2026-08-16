export type AttendanceStatus = 'present' | 'absent' | 'justified';

export interface AttendanceStudentInfo {
  id: number;
  prenom?: string;
  nom?: string;
  matricule?: string;
}

// Aligné sur AttendanceSerializer (apps/attendance/serializers.py)
export interface Attendance {
  id?: number;
  student: number;
  student_info?: AttendanceStudentInfo | null;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  status_display?: string;
  remark?: string | null;
}

// Une ligne du roster (GET /attendance/roster/?classe=&date=)
export interface AttendanceRosterEntry {
  student_id: number;
  student_name: string;
  matricule: string;
  attendance_id: number | null;
  status: AttendanceStatus | null;
  remark: string;
}

export interface AttendanceBulkEntry {
  student: number;
  status: AttendanceStatus;
  remark?: string;
}

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Présent',
  absent: 'Absent',
  justified: 'Justifié',
};
