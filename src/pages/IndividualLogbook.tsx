import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getStudentLogs } from "@/lib/storage";
import { LogEntry } from "@/lib/types";
import { format } from "date-fns";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Search, User, ClipboardList, CheckCircle } from "lucide-react";

export default function IndividualLogbook() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState("");

  useEffect(() => {
    if (!searchId) {
      setLogs([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getStudentLogs(searchId);
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchId]);

  const uniqueStudent = logs.length > 0 ? {
    name: logs[0].student_name,
    id: logs[0].student_id
  } : null;

  const stats = logs.length > 0 ? {
    totalEntries: logs.length,
    approved: logs.filter(l => l.teacher_approved).length,
    pending: logs.filter(l => !l.teacher_approved).length,
  } : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-brand-slate-main">Individual Logbook</h2>
          <p className="text-sm text-brand-slate-sub">Track professional history for a specific student.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-slate-sub" size={16} />
          <Input
            placeholder="Search Student ID..."
            className="pl-9 h-10 bg-white border-brand-border focus-visible:ring-brand-blue"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-dashed border-brand-border text-brand-slate-sub">
           <div className="w-8 h-8 rounded-full border-4 border-brand-blue border-t-transparent animate-spin mb-4"></div>
           <p className="text-sm font-semibold opacity-60">Fetching student history...</p>
        </div>
      ) : searchId && logs.length > 0 ? (
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
             <div className="bg-white border border-brand-border rounded-xl flex items-center p-5 gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-brand-blue">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-brand-slate-sub font-bold uppercase tracking-wider">Student Name</p>
                  <p className="font-bold text-sm">{uniqueStudent?.name}</p>
                </div>
             </div>
             <div className="bg-white border border-brand-border rounded-xl flex items-center p-5 gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-brand-slate-sub">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-brand-slate-sub font-bold uppercase tracking-wider">Total Logs</p>
                  <p className="font-bold text-sm tracking-tight">{stats?.totalEntries.toString().padStart(2, '0')}</p>
                </div>
             </div>
             <div className="bg-white border border-brand-border rounded-xl flex items-center p-5 gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-brand-success">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-brand-slate-sub font-bold uppercase tracking-wider">Approved</p>
                  <p className="font-bold text-sm tracking-tight">{stats?.approved.toString().padStart(2, '0')}</p>
                </div>
             </div>
          </div>

          <Card className="border-brand-border shadow-none rounded-xl overflow-hidden bg-white">
            <div className="px-6 py-4 border-b border-brand-border flex justify-between items-center">
              <span className="font-semibold text-sm">Professional History: {uniqueStudent?.id}</span>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#F9FAFB]">
                    <TableRow className="border-b border-brand-border">
                      <TableHead className="px-6 py-3 text-[11px] uppercase font-bold text-brand-slate-sub">Date</TableHead>
                      <TableHead className="px-6 py-3 text-[11px] uppercase font-bold text-brand-slate-sub">Times (Out - In)</TableHead>
                      <TableHead className="px-6 py-3 text-[11px] uppercase font-bold text-brand-slate-sub">Working Time</TableHead>
                      <TableHead className="px-6 py-3 text-[11px] uppercase font-bold text-brand-slate-sub">Status</TableHead>
                      <TableHead className="px-6 py-3 text-right text-[11px] uppercase font-bold text-brand-slate-sub">Teacher Approval</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} className="border-b border-brand-border hover:bg-slate-50/50 transition-colors">
                        <TableCell className="px-6 py-4 font-semibold text-sm">{format(new Date(log.date), "MMM d, yyyy")}</TableCell>
                        <TableCell className="px-6 py-4 text-sm">{log.out_time} - {log.in_time}</TableCell>
                        <TableCell className="px-6 py-4 text-sm">{log.actual_work_time}</TableCell>
                        <TableCell className="px-6 py-4">
                           {log.student_submitted ? (
                             <Badge className="bg-[#DCFCE7] text-[#166534] border-none text-[10px] font-bold px-2 py-0.5 rounded">Submitted</Badge>
                           ) : (
                             <Badge variant="outline" className="text-brand-slate-sub border-brand-border text-[10px]">Pending</Badge>
                           )}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            log.teacher_approved ? 'text-brand-success' : 'text-brand-warning'
                          )}>
                            {log.teacher_approved ? '✓ Approved' : '○ Awaiting'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-dashed border-brand-border text-brand-slate-sub">
           <Search size={40} strokeWidth={1.5} className="mb-4 opacity-20 text-brand-blue" />
           <p className="text-sm font-semibold opacity-60">Search a Student ID to view records</p>
           {searchId && <p className="text-xs mt-2 italic">No logs found for "{searchId}"</p>}
        </div>
      )}
    </motion.div>
  );
}
