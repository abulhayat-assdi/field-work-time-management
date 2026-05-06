import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getDailyLogs, getStudentLogs, updateLog, deleteLog, getBatches, addBatch, getExportLogs, getStudents, addStudent, deleteStudent } from "@/lib/storage";
import { calculateTimeDifference, displayAsAMPM } from "@/lib/time-utils";
import { LogEntry, Batch, Student } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Calendar as CalendarIcon, Download, Search, CheckCircle2, FileText, UserSquare2, Plus, CheckCheck, Edit3, Trash2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { BatchManagerDialog } from "@/components/admin/BatchManagerDialog";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("daily");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchRoll, setSearchRoll] = useState("");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState("all");
  
  const [isBatchManagerOpen, setIsBatchManagerOpen] = useState(false);
  
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [exportEndDate, setExportEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [exportBatch, setExportBatch] = useState("all");

  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudent, setNewStudent] = useState({ name: "", roll_number: "", batch: "" });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editLogData, setEditLogData] = useState<LogEntry | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      if (activeTab === "daily") {
        const data = await getDailyLogs(startDate, endDate, selectedBatchFilter);
        setLogs(data);
      } else if (activeTab === "individual" && searchRoll) {
        const data = await getStudentLogs(searchRoll);
        setLogs(data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to sync records.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchesData = async () => {
    const data = await getBatches();
    setBatches(data);
  };

  useEffect(() => {
    const fetchStudentsData = async () => {
      const data = await getStudents();
      setStudents(data);
    };
    fetchBatchesData();
    fetchStudentsData();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [startDate, endDate, activeTab, selectedBatchFilter]);

  const handleApprove = async (id: string, current: boolean) => {
    try {
      await updateLog(id, { teacher_approved: !current });
      toast.success(`Entry ${current ? 'un-approved' : 'approved'} successfully.`);
      fetchLogs();
    } catch (err: any) {
      toast.error(err.message || "Operation failed.");
    }
  };

  const handleBulkApprove = async () => {
    const unapprovedLogs = logs.filter(log => !log.teacher_approved);
    if (unapprovedLogs.length === 0) {
      toast.info("All logs are already approved!");
      return;
    }
    
    setLoading(true);
    try {
      await Promise.all(unapprovedLogs.map(log => updateLog(log.id, { teacher_approved: true })));
      toast.success(`${unapprovedLogs.length} logs approved successfully!`);
      fetchLogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to bulk approve.");
      setLoading(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this record? This action cannot be undone.")) return;
    try {
      await deleteLog(id);
      toast.success("Log deleted successfully!");
      fetchLogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete log.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLogData) return;
    try {
      await updateLog(editLogData.id, editLogData);
      toast.success("Log updated successfully!");
      setIsEditDialogOpen(false);
      fetchLogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to update log.");
    }
  };



  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.roll_number || !newStudent.batch) {
      toast.error("Please fill all fields.");
      return;
    }
    try {
      await addStudent(newStudent);
      toast.success("Student added successfully!");
      setNewStudent({ name: "", roll_number: "", batch: "" });
      const data = await getStudents();
      setStudents(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to add student.");
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await deleteStudent(id);
      toast.success("Student deleted successfully!");
      const data = await getStudents();
      setStudents(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete student.");
    }
  };

  const handleExportData = async () => {
    try {
      const exportLogs = await getExportLogs(exportStartDate, exportEndDate, exportBatch);
      if (exportLogs.length === 0) {
        toast.info("No data found for the selected criteria.");
        return;
      }

      const headers = ["SL No", "Name", "Roll No", "Batch", "Date", "Out Time", "In Time", "Actual Working Time", "Total Outing Time"];
      const rows = exportLogs.map((log, idx) => [
        (idx + 1).toString(),
        log.student_name,
        log.roll_number,
        log.batch || "-",
        log.date,
        displayAsAMPM(log.out_time),
        displayAsAMPM(log.in_time),
        `${log.work_duration_value} ${log.work_duration_unit}`,
        calculateTimeDifference(log.out_time, log.in_time)
      ]);

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `fieldwork_logs_${exportStartDate}_to_${exportEndDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExportDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to export data.");
    }
  };

  return (
    <div className="min-h-[90vh] bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50/80 p-4 md:p-8 rounded-3xl space-y-8 pb-12 shadow-inner border border-white">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white shadow-sm"
      >
        <div className="flex items-center gap-4">
          <Logo />
          <div className="ml-2">
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 tracking-tight">
              Admin Console
            </h1>
            <p className="text-brand-slate-sub font-medium mt-1">The Art of Sales & Marketing</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={handleBulkApprove} 
            className="h-12 px-6 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold gap-2 shadow-sm transition-all border border-emerald-100"
          >
            <CheckCheck size={16} />
            Approve All
          </Button>
          <Button 
            onClick={() => setIsBatchManagerOpen(true)} 
            className="h-12 px-6 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold gap-2 shadow-sm transition-all"
          >
            <Plus size={16} />
            Manage Batch
          </Button>
          <Button 
            onClick={() => setIsStudentDialogOpen(true)} 
            className="h-12 px-6 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold gap-2 shadow-sm transition-all"
          >
            <UserSquare2 size={16} />
            Manage Students
          </Button>
          <Button 
            onClick={() => setIsExportDialogOpen(true)} 
            variant="outline" 
            className="h-12 px-6 rounded-xl border-brand-border bg-white text-xs font-bold gap-2 hover:bg-slate-50 hover:text-brand-blue transition-all shadow-sm active:scale-95"
          >
            <Download size={16} className="text-brand-blue" />
            Export Data (CSV)
          </Button>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <TabsList className="bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl w-fit shadow-sm border border-slate-100">
            <TabsTrigger value="daily" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white rounded-xl px-6 py-2.5 font-bold text-xs transition-all data-[state=active]:shadow-md">
              <CalendarIcon size={16} className="mr-2 opacity-80" />
              Daily Master Sheet
            </TabsTrigger>
            <TabsTrigger value="individual" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white rounded-xl px-6 py-2.5 font-bold text-xs transition-all data-[state=active]:shadow-md">
              <UserSquare2 size={16} className="mr-2 opacity-80" />
              Individual Logbook
            </TabsTrigger>
          </TabsList>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {activeTab === "daily" ? (
               <div className="flex flex-col lg:flex-row gap-3 w-full md:w-auto">
                 <div className="bg-white border-2 border-brand-blue/10 focus-within:border-brand-blue/30 transition-colors rounded-2xl px-5 py-2.5 flex items-center gap-3 shadow-sm hover:shadow-md h-12">
                   <CalendarIcon size={18} className="text-brand-blue shrink-0" />
                   <div className="flex items-center gap-2">
                     <Input
                       type="date"
                       value={startDate}
                       onChange={(e) => setStartDate(e.target.value)}
                       className="border-none h-auto p-0 focus-visible:ring-0 text-sm font-bold text-slate-700 w-32 bg-transparent"
                     />
                     <span className="text-slate-400 font-bold text-sm">to</span>
                     <Input
                       type="date"
                       value={endDate}
                       onChange={(e) => setEndDate(e.target.value)}
                       className="border-none h-auto p-0 focus-visible:ring-0 text-sm font-bold text-slate-700 w-32 bg-transparent"
                     />
                   </div>
                 </div>
                 <Select value={selectedBatchFilter} onValueChange={setSelectedBatchFilter}>
                    <SelectTrigger className="w-[180px] bg-white border-2 border-brand-blue/10 focus:ring-0 rounded-2xl shadow-sm h-12 text-sm font-bold text-slate-700">
                      <SelectValue placeholder="All Batches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Batches</SelectItem>
                      {batches.map(b => (
                        <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                 </Select>
               </div>
            ) : (
               <div className="relative w-full md:w-72 group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-blue/50 group-focus-within:text-brand-blue transition-colors" size={18} />
                 <form onSubmit={(e) => { e.preventDefault(); fetchLogs(); }}>
                    <Input
                      placeholder="Search Roll No..."
                      className="pl-12 h-12 bg-white border-2 border-brand-blue/10 rounded-2xl font-bold focus-visible:border-brand-blue/30 focus-visible:ring-0 shadow-sm transition-all"
                      value={searchRoll}
                      onChange={(e) => setSearchRoll(e.target.value)}
                    />
                 </form>
               </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white/90 backdrop-blur-sm">
            <TabsContent value="daily" className="m-0 focus-visible:ring-0">
               <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-50 text-brand-blue rounded-lg">
                     <FileText size={18} strokeWidth={2.5} />
                   </div>
                   <span className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                      Attendance Summary
                   </span>
                 </div>
                 <Badge variant="secondary" className="font-bold bg-white text-brand-blue border border-brand-blue/20 shadow-sm px-3 py-1 rounded-lg">
                   {loading ? "Syncing..." : `${logs.length} Submissions`}
                 </Badge>
               </div>
               {renderTable(logs, loading, handleApprove, (log) => { setEditLogData(log); setIsEditDialogOpen(true); }, handleDeleteLog)}
            </TabsContent>

            <TabsContent value="individual" className="m-0 focus-visible:ring-0">
               <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                     <UserSquare2 size={18} strokeWidth={2.5} />
                   </div>
                   <span className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                      Student History
                   </span>
                 </div>
                 {logs.length > 0 && searchRoll && (
                   <Badge variant="secondary" className="font-bold bg-white text-indigo-600 border border-indigo-200 shadow-sm px-3 py-1 rounded-lg">
                     Records for: {searchRoll}
                   </Badge>
                 )}
               </div>
               {renderTable(logs, loading, handleApprove, (log) => { setEditLogData(log); setIsEditDialogOpen(true); }, handleDeleteLog)}
            </TabsContent>
          </Card>
        </motion.div>
      </Tabs>

      <BatchManagerDialog 
        open={isBatchManagerOpen} 
        onOpenChange={setIsBatchManagerOpen} 
        onBatchesUpdated={fetchBatchesData}
      />

      <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Manage Students</DialogTitle>
            <DialogDescription>Add or remove students from the system.</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddStudent} className="space-y-4 mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wider">Add New Student</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Full Name</Label>
                <Input placeholder="Student Name" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} required className="h-10 rounded-lg" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Roll Number</Label>
                <Input placeholder="Roll No" value={newStudent.roll_number} onChange={(e) => setNewStudent({ ...newStudent, roll_number: e.target.value })} required className="h-10 rounded-lg" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Batch</Label>
                <Select value={newStudent.batch} onValueChange={(val) => setNewStudent({ ...newStudent, batch: val })}>
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue placeholder="Select Batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map(b => (
                      <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full bg-brand-blue hover:bg-blue-700 rounded-lg h-10 font-bold">
              <Plus size={16} className="mr-2" /> Add Student
            </Button>
          </form>

          <div className="mt-8">
            <h4 className="font-bold text-sm text-slate-700 mb-4 uppercase tracking-wider">Student List ({students.length})</h4>
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-xs">Roll No</TableHead>
                    <TableHead className="font-bold text-xs">Name</TableHead>
                    <TableHead className="font-bold text-xs">Batch</TableHead>
                    <TableHead className="text-right font-bold text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-400 font-medium">No students added yet.</TableCell>
                    </TableRow>
                  ) : (
                    students.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-bold text-xs">{s.roll_number}</TableCell>
                        <TableCell className="text-xs">{s.name}</TableCell>
                        <TableCell className="text-xs font-medium text-indigo-600">{s.batch}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteStudent(s.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8">
                            <Trash2 size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setIsStudentDialogOpen(false)} className="rounded-xl px-8">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Export Data</DialogTitle>
            <DialogDescription>Select date range and batch to download CSV report.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input type="date" value={exportStartDate} onChange={(e) => setExportStartDate(e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input type="date" value={exportEndDate} onChange={(e) => setExportEndDate(e.target.value)} className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Select Batch</Label>
              <Select value={exportBatch} onValueChange={setExportBatch}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="All Batches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map(b => (
                    <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsExportDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleExportData} className="bg-brand-blue hover:bg-blue-700 rounded-xl px-6"><Download size={16} className="mr-2" /> Download CSV</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Log Entry</DialogTitle>
            <DialogDescription>Modify the submitted details of the fieldwork log.</DialogDescription>
          </DialogHeader>
          {editLogData && (
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={editLogData.date} onChange={(e) => setEditLogData({ ...editLogData, date: e.target.value })} required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Batch</Label>
                  <Select value={editLogData.batch} onValueChange={(val) => setEditLogData({ ...editLogData, batch: val })}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select Batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map(b => (
                        <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Student Name</Label>
                  <Input value={editLogData.student_name} onChange={(e) => setEditLogData({ ...editLogData, student_name: e.target.value })} required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Roll Number</Label>
                  <Input value={editLogData.roll_number} onChange={(e) => setEditLogData({ ...editLogData, roll_number: e.target.value })} required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Out Time</Label>
                  <Input type="time" value={editLogData.out_time} onChange={(e) => setEditLogData({ ...editLogData, out_time: e.target.value })} required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>In Time</Label>
                  <Input type="time" value={editLogData.in_time} onChange={(e) => setEditLogData({ ...editLogData, in_time: e.target.value })} required className="h-11 rounded-xl" />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-brand-blue hover:bg-blue-700 rounded-xl px-6">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function renderTable(
  logs: LogEntry[], 
  loading: boolean, 
  onApprove: (id: string, cur: boolean) => void,
  onEdit: (log: LogEntry) => void,
  onDelete: (id: string) => void
) {
  return (
    <div className="overflow-x-auto">
      <Table className="data-table">
        <TableHeader className="bg-slate-50/50">
          <TableRow className="border-b border-slate-100 hover:bg-transparent">
            <TableHead className="w-[80px] text-[10px] uppercase font-bold text-slate-400 px-8 py-5 tracking-wider">SL</TableHead>
            <TableHead className="text-[10px] uppercase font-bold text-slate-400 px-6 py-5 tracking-wider">Student Info</TableHead>
            <TableHead className="text-[10px] uppercase font-bold text-slate-400 px-6 py-5 tracking-wider">Out Time</TableHead>
            <TableHead className="text-[10px] uppercase font-bold text-slate-400 px-6 py-5 tracking-wider">In Time</TableHead>
            <TableHead className="text-[10px] uppercase font-bold text-slate-400 px-6 py-5 tracking-wider">Work Duration</TableHead>
            <TableHead className="text-[10px] uppercase font-bold text-indigo-400 px-6 py-5 tracking-wider">Total Outing (Auto)</TableHead>
            <TableHead className="text-[10px] uppercase font-bold text-slate-400 px-8 py-5 text-right tracking-wider">Approval Status</TableHead>
            <TableHead className="text-[10px] uppercase font-bold text-slate-400 px-6 py-5 text-right tracking-wider">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="h-[400px] text-center">
                 <div className="flex flex-col items-center justify-center gap-4 h-full">
                   <div className="relative w-16 h-16">
                     <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                     <div className="absolute inset-0 rounded-full border-4 border-brand-blue border-t-transparent animate-spin"></div>
                     <FileText className="absolute inset-0 m-auto text-brand-blue/50" size={20} />
                   </div>
                   <p className="text-sm font-bold text-slate-400 animate-pulse tracking-wide uppercase">Syncing Cloud Database...</p>
                 </div>
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-[400px] text-center">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full max-w-sm mx-auto"
                >
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Search size={40} className="text-slate-300" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">No Records Found</h3>
                  <p className="text-sm text-slate-500 font-medium">There are no fieldwork logs matching your current filters or date selection.</p>
                </motion.div>
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log, index) => (
              <TableRow key={log.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-all duration-200 group">
                <TableCell className="px-8 py-6 text-xs font-black text-slate-300 group-hover:text-brand-blue transition-colors">
                  {(index + 1).toString().padStart(2, '0')}
                </TableCell>
                <TableCell className="px-6 py-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-slate-800">{log.student_name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-widest group-hover:bg-blue-100 group-hover:text-brand-blue transition-colors">
                        ID: {log.roll_number}
                      </span>
                      {log.batch && (
                        <span className="text-[10px] font-black text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-widest group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                          {log.batch}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-6 text-xs font-semibold">
                  <span className="text-slate-700 font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    {displayAsAMPM(log.out_time)}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-6 text-xs font-semibold">
                  <span className="text-slate-700 font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    {displayAsAMPM(log.in_time)}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-6">
                   <Badge variant="outline" className="bg-white border-slate-200 text-slate-700 text-[11px] px-3 py-1 font-extrabold shadow-sm">
                     {log.work_duration_value} {log.work_duration_unit}
                   </Badge>
                </TableCell>
                <TableCell className="px-6 py-6">
                   <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50/80 px-3 py-1.5 rounded-lg border border-indigo-100/50">
                     {calculateTimeDifference(log.out_time, log.in_time)}
                   </span>
                </TableCell>
                <TableCell className="px-8 py-6 text-right">
                   <button 
                     onClick={() => onApprove(log.id, log.teacher_approved)}
                     className={cn(
                       "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[11px] font-extrabold tracking-wider uppercase transition-all duration-300 transform active:scale-95 shadow-sm",
                       log.teacher_approved 
                         ? "bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600 hover:shadow-md" 
                         : "bg-white text-slate-500 border border-slate-200 hover:border-brand-blue hover:text-brand-blue hover:shadow-md"
                     )}
                   >
                     {log.teacher_approved ? <CheckCircle2 size={14} strokeWidth={2.5} /> : null}
                     {log.teacher_approved ? "Approved" : "Pending"}
                   </button>
                </TableCell>
                <TableCell className="px-6 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onEdit(log)}
                      className="p-2 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Log"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(log.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Log"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
