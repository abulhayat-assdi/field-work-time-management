export interface LogEntry {
  id: string;
  created_at: string;
  date: string;
  student_name: string;
  roll_number: string;
  out_time: string;
  in_time: string;
  work_duration_value: number;
  work_duration_unit: 'Hours' | 'Minutes';
  teacher_approved: boolean;
}

export interface DashboardStats {
  totalEntriesToday: number;
  pendingApprovals: number;
}
