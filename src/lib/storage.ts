import { supabase } from "./supabase";
import { LogEntry } from "./types";

export const getLogs = async (): Promise<LogEntry[]> => {
  const { data, error } = await supabase
    .from("fieldwork_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
  return data || [];
};

export const getStudentLogs = async (rollNumber: string): Promise<LogEntry[]> => {
  const { data, error } = await supabase
    .from("fieldwork_logs")
    .select("*")
    .eq("roll_number", rollNumber)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching student logs:", error);
    return [];
  }
  return data || [];
};

export const getDailyLogs = async (date: string): Promise<LogEntry[]> => {
  const { data, error } = await supabase
    .from("fieldwork_logs")
    .select("*")
    .eq("date", date)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching daily logs:", error);
    return [];
  }
  return data || [];
};

export const addLog = async (log: Omit<LogEntry, "id" | "created_at">) => {
  const { data, error } = await supabase
    .from("fieldwork_logs")
    .insert([log])
    .select();

  if (error) throw error;
  return data?.[0];
};

export const updateLog = async (id: string, updates: Partial<LogEntry>) => {
  const { error } = await supabase
    .from("fieldwork_logs")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
};

export const deleteLog = async (id: string) => {
  const { error } = await supabase
    .from("fieldwork_logs")
    .delete()
    .eq("id", id);

  if (error) throw error;
};
