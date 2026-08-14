export type TurmaLesson = {
  /** ISO yyyy-MM-dd */
  date: string;
  /** Aula de reposição, inserida manualmente pelo líder. */
  isReposicao: boolean;
  /** Nome do feriado nacional na data, se houver (líder decidiu manter). */
  holidayName: string | null;
};

export type TurmaStudent = {
  seedId: string;
  enrolledAt: string;
  /** Presença por índice da aula em lessons. Ausente do mapa = não registrado. */
  attendance: Record<number, boolean>;
  /** Marco Visão Rhema já registrado na conclusão da turma. */
  concludedAt: string | null;
};

export type Turma = {
  id: string;
  name: string;
  /** Curso: 5 aulas semanais; reposição entra manualmente. */
  lessons: TurmaLesson[];
  students: TurmaStudent[];
  /** URL opcional da arte do certificado. */
  certificateArtUrl: string | null;
  createdAt: string;
};

export type TurmaStore = {
  turmas: Turma[];
};

export const RHEMA_TOTAL_AULAS = 5;
export const RHEMA_MAX_FALTAS = 2;

export type StudentStatus = 'cursando' | 'aprovado' | 'reprovado' | 'concluido';

/** Faltas = aulas passadas sem presença registrada (reposição compensa presença). */
export function countAbsences(turma: Turma, student: TurmaStudent, today: string): number {
  return turma.lessons.filter(
    (lesson, index) => lesson.date < today && !student.attendance[index],
  ).length;
}

export function getStudentStatus(
  turma: Turma,
  student: TurmaStudent,
  today: string,
): StudentStatus {
  if (student.concludedAt) {
    return 'concluido';
  }

  if (countAbsences(turma, student, today) > RHEMA_MAX_FALTAS) {
    return 'reprovado';
  }

  const allPast = turma.lessons.every((lesson) => lesson.date < today);
  return allPast ? 'aprovado' : 'cursando';
}

export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  cursando: 'Cursando',
  aprovado: 'Aprovado',
  reprovado: 'Reprovado',
  concluido: 'Concluído',
};
