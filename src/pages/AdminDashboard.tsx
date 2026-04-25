import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getDailyLogs, getStudentLogs, updateLog } from "@/lib/storage";
import { calculateTimeDifference } from "@/lib/time-utils";
import { LogEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Calendar as CalendarIcon, Download, Search, CheckCircle2, FileText, UserSquare2 } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("daily");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [searchRoll, setSearchRoll] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      if (activeTab === "daily") {
        const data = await getDailyLogs(selectedDate);
        setLogs(data);
      } else if (activeTab === "individual" && searchRoll) {
        const data = await getStudentLogs(searchRoll);
        setLogs(data);
      }
    } catch (err) {
      toast.error("Failed to sync records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedDate, activeTab]);

  const handleApprove = async (id: string, current: boolean) => {
    try {
      await updateLog(id, { teacher_approved: !current });
      toast.success(`Entry ${current ? 'un-approved' : 'approved'} successfully.`);
      fetchLogs();
    } catch (err) {
      toast.error("Operation failed.");
    }
  };

  const exportToCSV = () => {
    if (logs.length === 0) return;

    const headers = ["SL No", "Name", "Roll No", "Date", "Out Time", "In Time", "Actual Working Time", "Total Outing Time"];
    const rows = logs.map((log, idx) => [
      (idx + 1).toString(),
      log.student_name,
      log.roll_number,
      log.date,
      log.out_time,
      log.in_time,
      `${log.work_duration_value} ${log.work_duration_unit}`,
      calculateTimeDifference(log.out_time, log.in_time)
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `fieldwork_logs_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-slate-main tracking-tight">Admin Console</h1>
          <p className="text-brand-slate-sub font-medium mt-1">Academic oversight and log approval system.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={exportToCSV} variant="outline" className="h-10 border-brand-border bg-white text-xs font-bold gap-2">
            <Download size={16} />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <TabsList className="bg-slate-200/50 p-1 rounded-xl w-fit">
            <TabsTrigger value="daily" className="data-[state=active]:bg-white data-[state=active]:text-brand-blue rounded-lg px-6 font-bold text-xs h-9">
              <CalendarIcon size={14} className="mr-2" />
              Daily Master Sheet
            </TabsTrigger>
            <TabsTrigger value="individual" className="data-[state=active]:bg-white data-[state=active]:text-brand-blue rounded-lg px-6 font-bold text-xs h-9">
              <UserSquare2 size={14} className="mr-2" />
              Individual Logbook
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            {activeTab === "daily" ? (
               <div className="bg-white border border-brand-border rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
                 <CalendarIcon size={16} className="text-brand-slate-sub" />
                 <Input
                   type="date"
                   value={selectedDate}
                   onChange={(e) => setSelectedDate(e.target.value)}
                   className="border-none h-auto p-0 focus-visible:ring-0 text-sm font-bold w-36"
                 />
               </div>
            ) : (
               <div className="relative w-full md:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-slate-sub" size={16} />
                 <form onSubmit={(e) => { e.preventDefault(); fetchLogs(); }}>
                    <Input
                      placeholder="Search Roll No..."
                      className="pl-9 h-11 bg-white border-brand-border rounded-xl font-medium focus-visible:ring-brand-blue"
                      value={searchRoll}
                      onChange={(e) => setSearchRoll(e.target.value)}
                    />
                 </form>
               </div>
            )}
          </div>
        </div>

        <Card className="border-brand-border shadow-none rounded-2xl overflow-hidden bg-white">
          <TabsContent value="daily" className="m-0">
             <div className="px-6 py-4 border-b border-brand-border flex justify-between items-center bg-slate-50/30">
               <span className="text-sm font-bold text-brand-slate-main uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} className="text-brand-blue" />
                  Attendance Summary
               </span>
               <Badge variant="outline" className="font-bold border-brand-border bg-white">
                 {loading ? "..." : `${logs.length} Submissions`}
               </Badge>
             </div>
             {renderTable(logs, loading, handleApprove)}
          </TabsContent>

          <TabsContent value="individual" className="m-0">
             <div className="px-6 py-4 border-b border-brand-border flex justify-between items-center bg-slate-50/30">
               <span className="text-sm font-bold text-brand-slate-main uppercase tracking-wider flex items-center gap-2">
                  <UserSquare2 size={16} className="text-brand-blue" />
                  Student History
               </span>
               {logs.length > 0 && (
                 <span className="text-xs font-bold text-brand-slate-sub">Records for: {searchRoll}</span>
               )}
             </div>
             {renderTable(logs, loading, handleApprove)}
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
}

function renderTable(logs: LogEntry[], loading: boolean, onApprove: (id: string, cur: boolean) => void) {
  return (
    <div className="overflow-x-auto">
      <Table className="data-table">
        <TableHeader className="bg-[#F9FAFB]">
          <TableRow className="border-b border-brand-border hover:bg-transparent">
            <TableHead className="w-[60px] text-[10px] uppercase font-bold text-brand-slate-sub px-6 py-4">SL</TableHead>
            <TableHead className="text-[10px] uppercase font-bold text-brand-slate-sub px-6 py-4">Student Info</TableHead>
            <TableHead className="text-[10px] uppercase font-bold text-brand-slate-sub px-6 py-4">Out / In Time</TableHead>
            <TableHead className="text-[10px] uppercase font-bold text-brand-slate-sub px-6 py-4">Work Duration</TableHead>
            <TableHead className="text-[10px] uppercase font-bold text-brand-slate-sub px-6 py-4 text-brand-blue italic">Total Outing (Auto)</TableHead>
            <TableHead className="text-[10px] uppercase font-bold text-brand-slate-sub px-6 py-4 text-right">Approval</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-64 text-center">
                 <div className="flex flex-col items-center gap-3">
                   <div className="w-8 h-8 rounded-full border-4 border-brand-blue border-t-transparent animate-spin"></div>
                   <p className="text-sm font-bold text-brand-slate-sub animate-pulse">Syncing Cloud Database...</p>
                 </div>
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-64 text-center">
                <div className="flex flex-col items-center opacity-30 italic font-medium text-brand-slate-sub">
                  <Search size={48} strokeWidth={1} className="mb-4" />
                  <p>No fieldwork records found.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log, index) => (
              <TableRow key={log.id} className="border-b border-brand-border hover:bg-slate-50/50 transition-all">
                <TableCell className="px-6 py-5 text-xs font-bold text-brand-slate-sub">{(index + 1).toString().padStart(2, '0')}</TableCell>
                <TableCell className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-brand-slate-main">{log.student_name}</span>
                    <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mt-0.5">#{log.roll_number}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5 text-xs font-semibold">
                  <span className="text-brand-slate-main">{log.out_time}</span>
                  <span className="mx-2 text-brand-slate-sub">→</span>
                  <span className="text-brand-slate-main">{log.in_time}</span>
                </TableCell>
                <TableCell className="px-6 py-5">
                   <Badge variant="outline" className="bg-slate-50 border-brand-border text-brand-slate-main text-[10px] px-2 py-1 font-bold">
                     {log.work_duration_value} {log.work_duration_unit}
                   </Badge>
                </TableCell>
                <TableCell className="px-6 py-5">
                   <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                     {calculateTimeDifference(log.out_time, log.in_time)}
                   </span>
                </TableCell>
                <TableCell className="px-6 py-5 text-right">
                   <button 
                     onClick={() => onApprove(log.id, log.teacher_approved)}
                     className={cn(
                       "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all ring-1",
                       log.teacher_approved 
                         ? "bg-emerald-50 text-emerald-700 ring-emerald-200" 
                         : "bg-white text-brand-slate-sub ring-brand-border hover:ring-brand-blue hover:text-brand-blue"
                     )}
                   >
                     {log.teacher_approved ? <CheckCircle2 size={12} strokeWidth={3} /> : null}
                     {log.teacher_approved ? "Approved" : "Pending"}
                   </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
