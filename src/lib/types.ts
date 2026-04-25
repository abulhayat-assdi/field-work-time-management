export interface LogEntry {
  id: string;
  date: string;
  student_name: string;
  student_id: string;
  out_time: string;
  in_time: string;
  actual_work_time: string;
  student_submitted: boolean;
  teacher_approved: boolean;
  created_at: string;
}

export interface DashboardStats {
  totalEntriesToday: number;
  pendingApprovals: number;
}
