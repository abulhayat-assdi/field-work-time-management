import { supabase } from "./supabase";
import { LogEntry, Batch } from "./types";

export const getBatches = async (): Promise<Batch[]> => {
  const { data, error } = await supabase.from("batches").select("*").order("name", { ascending: true });
  if (error) {
    console.error("Error fetching batches:", error);
    return [];
  }
  return data || [];
};

export const addBatch = async (name: string) => {
  const { data, error } = await supabase.from("batches").insert([{ name }]).select();
  if (error) throw error;
  return data?.[0];
};

export const getExportLogs = async (startDate: string, endDate: string, batch: string): Promise<LogEntry[]> => {
  let query = supabase.from("fieldwork_logs").select("*").gte("date", startDate).lte("date", endDate);
  if (batch && batch !== "all") {
    query = query.eq("batch", batch);
  }
  const { data, error } = await query.order("date", { ascending: true });
  if (error) {
    console.error("Error fetching export logs:", error);
    return [];
  }
  return data || [];
};

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

export const getDailyLogs = async (startDate?: string, endDate?: string, batch?: string): Promise<LogEntry[]> => {
  let query = supabase.from("fieldwork_logs").select("*");
  if (startDate) {
    query = query.gte("date", startDate);
  }
  if (endDate) {
    query = query.lte("date", endDate);
  }
  if (batch && batch !== "all") {
    query = query.eq("batch", batch);
  }
  const { data, error } = await query.order("date", { ascending: false }).order("created_at", { ascending: false });

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
