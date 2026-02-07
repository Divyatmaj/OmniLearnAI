/** Study planner types (API + frontend). */
export interface DailyPlanItem {
  day: number;
  title: string;
  tasks: string[];
  completed?: boolean;
}

export interface StudyPlanPayload {
  userId: string;
  examDate: string; // ISO date
}

export interface StudyPlanUpdatePayload {
  planId: string;
  dailyPlan: DailyPlanItem[];
  progress: number;
}
