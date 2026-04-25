import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getDailyLogs, updateLog } from "@/lib/storage";
import { LogEntry } from "@/lib/types";
import { format } from "date-fns";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, CheckCircle2, XCircle } from "lucide-react";

export default function MasterSheet() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const fetchDailyLogs = async () => {
    setLoading(true);
    try {
      const data = await getDailyLogs(selectedDate);
      setLogs(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyLogs();
  }, [selectedDate]);

  const handleApprove = async (id: string) => {
    try {
      await updateLog(id, { teacher_approved: true });
      fetchDailyLogs();
      toast.success("Entry approved by teacher.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Approval failed.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-brand-slate-main">Daily Master Sheet</h2>
          <p className="text-sm text-brand-slate-sub">Review student activities for {format(new Date(selectedDate), "MMMM d, yyyy")}</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-brand-border shadow-sm">
          <CalendarIcon size={16} className="text-brand-slate-sub" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-none h-8 p-0 focus-visible:ring-0 w-auto bg-transparent text-sm font-medium"
          />
        </div>
      </div>

      <Card className="border-brand-border shadow-none rounded-xl overflow-hidden bg-white">
        <div className="table-header px-6 py-4 border-b border-brand-border bg-white flex justify-between items-center">
          <span className="font-semibold text-sm">Activities Records</span>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-slate-50 text-brand-slate-sub border-none font-medium text-[11px]">
              {loading ? "..." : `${logs.length} Entries`}
            </Badge>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="data-table">
              <TableHeader className="bg-[#F9FAFB]">
                <TableRow className="hover:bg-transparent border-b border-brand-border">
                  <TableHead className="w-[60px] text-[11px] uppercase font-bold text-brand-slate-sub px-6 py-3">SL</TableHead>
                  <TableHead className="text-[11px] uppercase font-bold text-brand-slate-sub px-6 py-3">Student Details</TableHead>
                  <TableHead className="text-[11px] uppercase font-bold text-brand-slate-sub px-6 py-3">Out / In Time</TableHead>
                  <TableHead className="text-[11px] uppercase font-bold text-brand-slate-sub px-6 py-3">Working Time</TableHead>
                  <TableHead className="text-[11px] uppercase font-bold text-brand-slate-sub px-6 py-3">Status</TableHead>
                  <TableHead className="text-right text-[11px] uppercase font-bold text-brand-slate-sub px-6 py-3">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-brand-slate-sub text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-brand-blue border-t-transparent animate-spin"></div>
                        Searching records...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-brand-slate-sub text-sm">
                      No logs found for this date.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log, index) => (
                    <TableRow key={log.id} className="border-b border-brand-border hover:bg-slate-50/50 transition-colors">
                      <TableCell className="px-6 py-4 text-brand-slate-sub font-medium">{(index + 1).toString().padStart(2, '0')}</TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-brand-slate-main">{log.student_name}</span>
                          <span className="text-[11px] text-brand-slate-sub uppercase tracking-wider">ID: {log.student_id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-brand-slate-main">{log.out_time} - {log.in_time}</TableCell>
                      <TableCell className="px-6 py-4 text-sm font-medium">{log.actual_work_time}</TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge className={cn(
                          "px-2 py-0.5 rounded text-[11px] font-bold border-none",
                          log.student_submitted ? "badge-success bg-[#DCFCE7] text-[#166534]" : "badge-pending bg-[#FEF3C7] text-[#92400E]"
                        )}>
                          {log.student_submitted ? "Submitted" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        {log.teacher_approved ? (
                           <div className="flex items-center justify-end text-brand-success gap-1.5">
                             <CheckCircle2 size={16} strokeWidth={3} />
                             <span className="text-[11px] font-bold uppercase tracking-wider">Approved</span>
                           </div>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-brand-blue hover:bg-blue-700 h-8 px-4 text-[11px] font-bold rounded shadow-none"
                            onClick={() => handleApprove(log.id)}
                          >
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
