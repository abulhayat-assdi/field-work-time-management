import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { addLog, getBatches } from "@/lib/storage";
import { formatTo12Hour } from "@/lib/time-utils";
import { motion } from "motion/react";
import { ClipboardList, Send, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Batch } from "@/lib/types";
import { Logo } from "@/components/Logo";

export default function PublicLogEntry() {
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    student_name: "",
    roll_number: "",
    batch: "",
    out_time: "09:00",
    in_time: "17:00",
    work_duration_value: 0,
    work_duration_unit: "Hours" as "Hours" | "Minutes",
  });

  useEffect(() => {
    const fetchBatches = async () => {
      const data = await getBatches();
      setBatches(data);
    };
    fetchBatches();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_name || !formData.roll_number || !formData.batch || formData.work_duration_value <= 0) {
      toast.error("Please fill in all required fields accurately.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        out_time: formatTo12Hour(formData.out_time),
        in_time: formatTo12Hour(formData.in_time),
        teacher_approved: false
      };
      await addLog(payload);
      toast.success("Log entry submitted successfully!");
      setFormData({
        ...formData,
        student_name: "",
        roll_number: "",
        batch: "",
        work_duration_value: 0
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit entry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <Logo />
          <Link to="/login">
            <Button variant="ghost" className="text-xs text-brand-slate-sub font-semibold">Teacher Login</Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-brand-border shadow-sm rounded-2xl">
            <CardHeader className="text-center border-b border-brand-border bg-white rounded-t-2xl px-6 py-8">
              <ClipboardList className="mx-auto text-brand-blue mb-3" size={36} />
              <CardTitle className="text-2xl font-bold">The Art of Sales & Marketing</CardTitle>
              <CardDescription>Submit your fieldwork activity details below.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="border-brand-border h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roll_number">Roll Number / Student ID</Label>
                    <Input
                      id="roll_number"
                      placeholder="e.g. S12345"
                      value={formData.roll_number}
                      onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                      className="border-brand-border h-11"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="student_name">Full Name</Label>
                    <Input
                      id="student_name"
                      placeholder="Enter your registered name"
                      value={formData.student_name}
                      onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                      className="border-brand-border h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Batch</Label>
                    <Select
                      value={formData.batch}
                      onValueChange={(val: string) => setFormData({ ...formData, batch: val })}
                      required
                    >
                      <SelectTrigger className="h-11 border-brand-border">
                        <SelectValue placeholder="Select your batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.length === 0 ? (
                          <SelectItem value="none" disabled>No batches available</SelectItem>
                        ) : (
                          batches.map((batch) => (
                            <SelectItem key={batch.id} value={batch.name}>{batch.name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="out_time">Out Time (Leaving Center)</Label>
                    <Input
                      id="out_time"
                      type="time"
                      value={formData.out_time}
                      onChange={(e) => setFormData({ ...formData, out_time: e.target.value })}
                      className="border-brand-border h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="in_time">In Time (Returning Center)</Label>
                    <Input
                      id="in_time"
                      type="time"
                      value={formData.in_time}
                      onChange={(e) => setFormData({ ...formData, in_time: e.target.value })}
                      className="border-brand-border h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Actual Working Time (Excluding Transit)</Label>
                  <div className="flex gap-4">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 2.5"
                      className="border-brand-border h-11 flex-1"
                      value={formData.work_duration_value || ""}
                      onChange={(e) => setFormData({ ...formData, work_duration_value: parseFloat(e.target.value) || 0 })}
                      required
                    />
                    <Select
                      value={formData.work_duration_unit}
                      onValueChange={(val: any) => setFormData({ ...formData, work_duration_unit: val })}
                    >
                      <SelectTrigger className="w-[120px] h-11 border-brand-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hours">Hours</SelectItem>
                        <SelectItem value="Minutes">Minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button disabled={loading} type="submit" className="w-full bg-brand-blue hover:bg-blue-700 h-12 rounded-xl font-bold shadow-md shadow-blue-200 transition-all active:scale-[0.98]">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send size={18} />
                      Submit Activity Log
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
        
        <p className="text-center text-brand-slate-sub mt-8 text-xs font-medium">
          Professional Fieldwork Tracking System &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
