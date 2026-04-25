import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilePlus, Table, UserCircle, CheckCircle, Clock, Users } from "lucide-react";
import { getLogs } from "@/lib/storage";
import { LogEntry } from "@/lib/types";
import { format } from "date-fns";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getLogs();
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const totalEntriesToday = logs.filter((log) => log.date === today).length;
  const pendingApprovals = logs.filter((log) => !log.teacher_approved).length;
  const activeInField = logs.filter((log) => log.date === today && !log.student_submitted).length;

  const stats = [
    {
      title: "Total Logs Today",
      value: totalEntriesToday,
      label: "Logs submitted today",
      icon: Clock,
      color: "text-brand-blue",
    },
    {
      title: "Active in Field",
      value: activeInField,
      label: "Students currently logging",
      icon: Users,
      color: "text-brand-blue",
    },
    {
      title: "Pending Approvals",
      value: pendingApprovals,
      label: "Awaiting teacher review",
      icon: CheckCircle,
      color: "text-brand-warning",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
           {[1, 2, 3].map(i => (
             <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
           ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="h-64 bg-slate-200 rounded-xl"></div>
           <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="stats-row !p-0 grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="stat-card bg-white p-5 rounded-xl border border-brand-border flex flex-col"
          >
            <div className="stat-label text-xs font-semibold text-brand-slate-sub uppercase tracking-wider mb-1">
              {stat.title}
            </div>
            <div className={cn("stat-value text-2xl font-bold font-sans", stat.color)}>
              {stat.value.toString().padStart(2, '0')}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-brand-border shadow-none rounded-xl">
          <CardHeader className="border-b border-brand-border px-6 py-4">
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-6">
            <Link to="/add">
              <Button className="w-full justify-start gap-3 h-11 bg-white hover:bg-slate-50 text-brand-slate-main border-brand-border" variant="outline">
                <FilePlus className="text-brand-blue" size={18} strokeWidth={2.5} />
                Add New Entry
              </Button>
            </Link>
            <Link to="/sheet">
              <Button className="w-full justify-start gap-3 h-11 bg-white hover:bg-slate-50 text-brand-slate-main border-brand-border" variant="outline">
                <Table className="text-brand-success" size={18} strokeWidth={2.5} />
                View Daily Master Sheet
              </Button>
            </Link>
            <Link to="/logbook">
              <Button className="w-full justify-start gap-3 h-11 bg-white hover:bg-slate-50 text-brand-slate-main border-brand-border" variant="outline">
                <UserCircle className="text-indigo-600" size={18} strokeWidth={2.5} />
                View Individual Logbook
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-brand-border shadow-none rounded-xl">
          <CardHeader className="border-b border-brand-border px-6 py-4">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             {logs.length === 0 ? (
               <div className="text-center py-12 text-brand-slate-sub text-sm">
                 No activity recorded yet.
               </div>
             ) : (
               <div className="divide-y divide-brand-border">
                 {logs.slice(0, 4).map((log) => (
                   <div key={log.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                     <div className="flex flex-col">
                       <span className="text-sm font-semibold">{log.student_name}</span>
                       <span className="text-[11px] text-brand-slate-sub">{format(new Date(log.date), "MMM d")} • {log.actual_work_time}</span>
                     </div>
                     <Badge variant="outline" className={cn(
                       "text-[10px] font-bold px-2 py-0.5 rounded uppercase border-none",
                       log.teacher_approved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                     )}>
                       {log.teacher_approved ? 'Approved' : 'Pending'}
                     </Badge>
                   </div>
                 ))}
               </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
