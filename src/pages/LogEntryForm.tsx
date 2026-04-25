import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { addLog } from "@/lib/storage";
import { format } from "date-fns";
import { motion } from "motion/react";
import { ArrowLeft, Save } from "lucide-react";

export default function LogEntryForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    student_name: "",
    student_id: "",
    out_time: "09:00",
    in_time: "17:00",
    actual_work_time: "",
    student_submitted: true,
    teacher_approved: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.student_name || !formData.student_id || !formData.actual_work_time) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      await addLog(formData);
      toast.success("Log entry submitted successfully!");
      navigate("/");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit entry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Add New Entry</h2>
          <p className="text-slate-500">Log a student's fieldwork activity.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm max-w-2xl">
        <CardHeader>
          <CardTitle>Log Details</CardTitle>
          <CardDescription>Enter the fieldwork specifics for the student.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID</Label>
                <Input
                  id="student_id"
                  placeholder="e.g. S12345"
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student_name">Student Name</Label>
              <Input
                id="student_name"
                placeholder="Full Name"
                value={formData.student_name}
                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="out_time">Out Time (Leaving Center)</Label>
                <Input
                  id="out_time"
                  type="time"
                  value={formData.out_time}
                  onChange={(e) => setFormData({ ...formData, out_time: e.target.value })}
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
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual_work_time">Actual Working Time (in field)</Label>
              <Input
                id="actual_work_time"
                placeholder="e.g. 4 hours 30 mins"
                value={formData.actual_work_time}
                onChange={(e) => setFormData({ ...formData, actual_work_time: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="student_submitted"
                  checked={formData.student_submitted}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, student_submitted: checked === true })
                  }
                />
                <Label
                  htmlFor="student_submitted"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Student Signature (Verified by Student)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="teacher_approved"
                  checked={formData.teacher_approved}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, teacher_approved: checked === true })
                  }
                />
                <Label
                  htmlFor="teacher_approved"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Teacher Signature (Verified by Instructor)
                </Label>
              </div>
            </div>

            <Button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Save size={18} />
              {loading ? "Submitting..." : "Submit Log Entry"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
