import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit3, Trash2, Save, Users, Upload } from "lucide-react";
import { getBatches, addBatch, updateBatch, deleteBatch, bulkAddStudents, getStudents, updateStudent, deleteStudent } from "@/lib/storage";
import { Batch, Student } from "@/lib/types";

export function BatchManagerDialog({ open, onOpenChange, onBatchesUpdated }: { open: boolean, onOpenChange: (open: boolean) => void, onBatchesUpdated: () => void }) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  
  // Add state
  const [newBatchName, setNewBatchName] = useState("");
  const [pastedData, setPastedData] = useState("");
  const [parsedStudents, setParsedStudents] = useState<{name: string, roll_number: string}[]>([]);
  
  // Edit state
  const [editBatch, setEditBatch] = useState<Batch | null>(null);
  const [editBatchNewName, setEditBatchNewName] = useState("");
  const [studentsInBatch, setStudentsInBatch] = useState<Student[]>([]);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [tempStudentData, setTempStudentData] = useState({ name: "", roll_number: "" });

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const data = await getBatches();
      setBatches(data);
    } catch (err) {
      toast.error("Failed to load batches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchBatches();
      setView("list");
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setNewBatchName("");
    setPastedData("");
    setParsedStudents([]);
    setEditBatch(null);
    setEditBatchNewName("");
    setStudentsInBatch([]);
    setEditingStudentId(null);
  };

  const fetchBatchStudents = async (batchName: string) => {
    setLoading(true);
    try {
      const data = await getStudents(batchName);
      setStudentsInBatch(data);
    } catch (err) {
      toast.error("Failed to load students for this batch.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasteData = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPastedData(val);
    if (!val.trim()) {
       setParsedStudents([]);
       return;
    }
    const rows = val.split('\n').map(row => row.trim()).filter(row => row);
    const parsed = rows.map(row => {
      const cols = row.split('\t');
      let col1 = (cols[0] || '').trim();
      let col2 = (cols[1] || '').trim();
      
      // If no tab, maybe comma
      if (!col2 && cols.length === 1) {
         const commaCols = row.split(',');
         if (commaCols.length > 1) {
            col1 = commaCols[0].trim();
            col2 = commaCols[1].trim();
         }
      }
      
      // Detect which is roll (usually numeric)
      let name = col1;
      let roll = col2;
      if (/^\d+$/.test(col1) && !/^\d+$/.test(col2)) {
         name = col2;
         roll = col1;
      }
      
      return { name, roll_number: roll };
    }).filter(s => s.name || s.roll_number);
    setParsedStudents(parsed);
  };

  const handleSaveNewBatch = async () => {
    if (!newBatchName.trim()) {
      toast.error("Batch name is required.");
      return;
    }
    setLoading(true);
    try {
      await addBatch(newBatchName.trim());
      if (parsedStudents.length > 0) {
        const studentsToAdd = parsedStudents.map(s => ({
          name: s.name,
          roll_number: s.roll_number,
          batch: newBatchName.trim()
        }));
        await bulkAddStudents(studentsToAdd);
      }
      toast.success(`Batch ${newBatchName} and ${parsedStudents.length} students added!`);
      await fetchBatches();
      onBatchesUpdated();
      setView("list");
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to add batch.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBatch = async () => {
    if (!editBatch || !editBatchNewName.trim()) return;
    setLoading(true);
    try {
      await updateBatch(editBatch.id, editBatch.name, editBatchNewName.trim());
      toast.success("Batch updated successfully!");
      await fetchBatches();
      onBatchesUpdated();
      setView("list");
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to update batch.");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteBatch = async (batch: Batch) => {
    if (!window.confirm(`Are you sure you want to delete ${batch.name}? This will also delete ALL students in this batch!`)) return;
    setLoading(true);
    try {
      await deleteBatch(batch.id, batch.name);
      toast.success(`Batch ${batch.name} and its students deleted!`);
      await fetchBatches();
      onBatchesUpdated();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete batch.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudent = async (studentId: string) => {
    if (!tempStudentData.name || !tempStudentData.roll_number) return;
    setLoading(true);
    try {
      await updateStudent(studentId, tempStudentData);
      toast.success("Student updated!");
      setEditingStudentId(null);
      if (editBatch) fetchBatchStudents(editBatch.name);
    } catch (err: any) {
      toast.error(err.message || "Failed to update student.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIndividualStudent = async (studentId: string) => {
    if (!window.confirm("Delete this student?")) return;
    setLoading(true);
    try {
      await deleteStudent(studentId);
      toast.success("Student removed!");
      if (editBatch) fetchBatchStudents(editBatch.name);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete student.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl rounded-2xl max-h-[90vh] overflow-y-auto flex flex-col bg-slate-50">
        <DialogHeader className="mb-2 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Users className="text-brand-blue" />
                Manage Batches
              </DialogTitle>
              <DialogDescription>Create, edit, or delete batches and bulk-import students.</DialogDescription>
            </div>
            {view !== "add" && (
              <Button onClick={() => { setView("add"); resetForm(); }} className="bg-brand-blue hover:bg-blue-700 rounded-xl px-4 h-10 font-bold shadow-md shadow-blue-200">
                <Plus size={18} className="mr-2" /> Add New Batch
              </Button>
            )}
          </div>
        </DialogHeader>

        {view === "list" && (
          <div className="flex-1 bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="font-bold text-xs">Batch Name</TableHead>
                  <TableHead className="font-bold text-xs">Created At</TableHead>
                  <TableHead className="text-right font-bold text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-slate-400 font-medium">No batches found. Create one to get started.</TableCell>
                  </TableRow>
                ) : (
                  batches.map((b) => (
                    <TableRow key={b.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-bold text-slate-800">{b.name}</TableCell>
                      <TableCell className="text-xs text-slate-500">{new Date(b.created_at || Date.now()).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { 
                            setEditBatch(b); 
                            setEditBatchNewName(b.name); 
                            setView("edit");
                            fetchBatchStudents(b.name);
                          }} className="text-slate-400 hover:text-brand-blue hover:bg-blue-50 h-8 w-8">
                            <Edit3 size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteBatch(b)} className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {view === "add" && (
          <div className="flex-1 space-y-6 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Batch Name</Label>
              <Input placeholder="e.g. Batch_10" value={newBatchName} onChange={(e) => setNewBatchName(e.target.value)} className="h-11 rounded-xl bg-slate-50 border-slate-200" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-brand-blue bg-blue-50 p-3 rounded-xl border border-blue-100">
                <Upload size={18} />
                <div className="text-xs font-semibold">
                  Paste data from Excel or Google Sheets. The grid will automatically parse Name and Roll Number.
                </div>
              </div>
              <textarea 
                value={pastedData}
                onChange={handlePasteData}
                placeholder="Paste here...&#10;John Doe&#9;101&#10;Jane Smith&#9;102"
                className="w-full min-h-[140px] p-4 rounded-xl border-2 border-dashed border-slate-200 text-sm focus:border-brand-blue focus:ring-0 outline-none resize-y font-mono bg-slate-50/50"
              />
            </div>
            
            {parsedStudents.length > 0 && (
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[250px] overflow-y-auto">
                 <Table>
                   <TableHeader className="bg-slate-100 sticky top-0 shadow-sm z-10">
                     <TableRow>
                       <TableHead className="font-bold text-xs w-16">#</TableHead>
                       <TableHead className="font-bold text-xs">Student Name</TableHead>
                       <TableHead className="font-bold text-xs">Roll Number</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {parsedStudents.map((s, idx) => (
                       <TableRow key={idx} className="hover:bg-slate-50">
                         <TableCell className="text-xs text-slate-400 font-medium">{idx + 1}</TableCell>
                         <TableCell className="text-sm font-semibold text-slate-700">{s.name}</TableCell>
                         <TableCell className="text-sm font-bold text-brand-blue">{s.roll_number}</TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
              </div>
            )}
            
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setView("list")} className="rounded-xl px-6 h-11 font-bold">Cancel</Button>
              <Button onClick={handleSaveNewBatch} disabled={loading || !newBatchName.trim()} className="bg-brand-blue hover:bg-blue-700 rounded-xl px-6 h-11 font-bold shadow-md shadow-blue-200">
                {loading ? "Saving..." : <><Save size={16} className="mr-2" /> Save Batch & {parsedStudents.length} Students</>}
              </Button>
            </div>
          </div>
        )}

        {view === "edit" && editBatch && (
          <div className="flex-1 space-y-6 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Batch Name</Label>
                <Input value={editBatchNewName} onChange={(e) => setEditBatchNewName(e.target.value)} className="h-11 rounded-xl bg-slate-50 border-slate-200" />
              </div>
              <Button onClick={handleUpdateBatch} disabled={loading || !editBatchNewName.trim() || editBatchNewName === editBatch.name} className="bg-brand-blue hover:bg-blue-700 rounded-xl px-6 h-11 font-bold">
                {loading ? "Updating..." : "Update Batch Name"}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Students in this Batch ({studentsInBatch.length})</h4>
              </div>
              
              <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-bold text-xs">Roll No</TableHead>
                      <TableHead className="font-bold text-xs">Full Name</TableHead>
                      <TableHead className="text-right font-bold text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsInBatch.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-6 text-slate-400">No students found.</TableCell>
                      </TableRow>
                    ) : (
                      studentsInBatch.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="py-3">
                            {editingStudentId === student.id ? (
                              <Input 
                                value={tempStudentData.roll_number} 
                                onChange={(e) => setTempStudentData({...tempStudentData, roll_number: e.target.value})}
                                className="h-8 text-xs font-bold w-24"
                              />
                            ) : (
                              <span className="text-xs font-bold text-brand-blue">{student.roll_number}</span>
                            )}
                          </TableCell>
                          <TableCell className="py-3">
                            {editingStudentId === student.id ? (
                              <Input 
                                value={tempStudentData.name} 
                                onChange={(e) => setTempStudentData({...tempStudentData, name: e.target.value})}
                                className="h-8 text-xs"
                              />
                            ) : (
                              <span className="text-xs font-medium text-slate-700">{student.name}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <div className="flex items-center justify-end gap-1">
                              {editingStudentId === student.id ? (
                                <>
                                  <Button variant="ghost" size="icon" onClick={() => handleUpdateStudent(student.id)} className="text-emerald-500 hover:bg-emerald-50 h-7 w-7">
                                    <Save size={14} />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => setEditingStudentId(null)} className="text-slate-400 hover:bg-slate-50 h-7 w-7">
                                    <X size={14} />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button variant="ghost" size="icon" onClick={() => { 
                                    setEditingStudentId(student.id); 
                                    setTempStudentData({ name: student.name, roll_number: student.roll_number });
                                  }} className="text-slate-400 hover:text-brand-blue hover:bg-blue-50 h-7 w-7">
                                    <Edit3 size={14} />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteIndividualStudent(student.id)} className="text-red-300 hover:text-red-500 hover:bg-red-50 h-7 w-7">
                                    <Trash2 size={14} />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setView("list")} className="rounded-xl px-8 h-11 font-bold">Back to List</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
