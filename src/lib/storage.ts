import { collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { LogEntry, Batch, Student } from "./types";

export const getBatches = async (): Promise<Batch[]> => {
  try {
    const q = query(collection(db, "batches"), orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch));
  } catch (error) {
    console.error("Error fetching batches:", error);
    return [];
  }
};

export const addBatch = async (name: string) => {
  try {
    const docRef = await addDoc(collection(db, "batches"), { name, created_at: new Date().toISOString() });
    return { id: docRef.id, name, created_at: new Date().toISOString() };
  } catch (error) {
    console.error("Error adding batch:", error);
    throw error;
  }
};

export const getStudents = async (batchName?: string): Promise<Student[]> => {
  try {
    let q;
    if (batchName && batchName !== "all") {
      q = query(collection(db, "students"), where("batch", "==", batchName));
    } else {
      q = query(collection(db, "students"));
    }
    const snapshot = await getDocs(q);
    const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
    
    // Sort in-memory to avoid composite index requirement
    return students.sort((a, b) => a.roll_number.localeCompare(b.roll_number, undefined, { numeric: true }));
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
};

export const updateStudent = async (id: string, updates: Partial<Student>) => {
  try {
    const docRef = doc(db, "students", id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error("Error updating student:", error);
    throw error;
  }
};

export const addStudent = async (student: Omit<Student, "id" | "created_at">) => {
  try {
    const docRef = await addDoc(collection(db, "students"), {
      ...student,
      created_at: new Date().toISOString()
    });
    return { id: docRef.id, ...student, created_at: new Date().toISOString() };
  } catch (error) {
    console.error("Error adding student:", error);
    throw error;
  }
};

export const deleteStudent = async (id: string) => {
  try {
    const docRef = doc(db, "students", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting student:", error);
    throw error;
  }
};

export const getExportLogs = async (startDate: string, endDate: string, batch: string): Promise<LogEntry[]> => {
  try {
    const q = query(collection(db, "fieldwork_logs"));
    const snapshot = await getDocs(q);
    let logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LogEntry));

    logs = logs.filter(log => log.date >= startDate && log.date <= endDate);
    if (batch && batch !== "all") {
      logs = logs.filter(log => log.batch === batch);
    }

    logs.sort((a, b) => (a.date > b.date ? 1 : -1));
    return logs;
  } catch (error) {
    console.error("Error fetching export logs:", error);
    return [];
  }
};

export const getLogs = async (): Promise<LogEntry[]> => {
  try {
    const q = query(collection(db, "fieldwork_logs"), orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LogEntry));
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
};

export const getStudentLogs = async (rollNumber: string): Promise<LogEntry[]> => {
  try {
    const q = query(collection(db, "fieldwork_logs"), where("roll_number", "==", rollNumber));
    const snapshot = await getDocs(q);
    let logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LogEntry));
    logs.sort((a, b) => (a.date > b.date ? -1 : 1));
    return logs;
  } catch (error) {
    console.error("Error fetching student logs:", error);
    return [];
  }
};

export const getDailyLogs = async (startDate?: string, endDate?: string, batch?: string): Promise<LogEntry[]> => {
  try {
    const q = query(collection(db, "fieldwork_logs"));
    const snapshot = await getDocs(q);
    let logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LogEntry));

    if (startDate) {
      logs = logs.filter(log => log.date >= startDate);
    }
    if (endDate) {
      logs = logs.filter(log => log.date <= endDate);
    }
    if (batch && batch !== "all") {
      logs = logs.filter(log => log.batch === batch);
    }

    logs.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date > b.date ? -1 : 1;
      }
      return (a.created_at || "") > (b.created_at || "") ? -1 : 1;
    });

    return logs;
  } catch (error) {
    console.error("Error fetching daily logs:", error);
    return [];
  }
};

export const addLog = async (log: Omit<LogEntry, "id" | "created_at">) => {
  try {
    const q = query(
      collection(db, "fieldwork_logs"), 
      where("date", "==", log.date),
      where("roll_number", "==", log.roll_number),
      where("student_name", "==", log.student_name)
    );
    const searchSnapshot = await getDocs(q);

    if (!searchSnapshot.empty) {
      const batchOp = writeBatch(db);
      searchSnapshot.docs.forEach(doc => {
        batchOp.delete(doc.ref);
      });
      await batchOp.commit();
    }

    const docRef = await addDoc(collection(db, "fieldwork_logs"), {
      ...log,
      created_at: new Date().toISOString()
    });
    
    const newDoc = await getDoc(docRef);
    return { id: newDoc.id, ...newDoc.data() } as LogEntry;
  } catch (error) {
    console.error("Error adding log:", error);
    throw error;
  }
};

export const updateLog = async (id: string, updates: Partial<LogEntry>) => {
  try {
    const docRef = doc(db, "fieldwork_logs", id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error("Error updating log:", error);
    throw error;
  }
};

export const deleteLog = async (id: string) => {
  try {
    const docRef = doc(db, "fieldwork_logs", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting log:", error);
    throw error;
  }
};

export const updateBatch = async (id: string, oldName: string, newName: string) => {
  try {
    const batchRef = doc(db, "batches", id);
    await updateDoc(batchRef, { name: newName });

    const studentsQ = query(collection(db, "students"), where("batch", "==", oldName));
    const studentsSnapshot = await getDocs(studentsQ);
    
    const logsQ = query(collection(db, "fieldwork_logs"), where("batch", "==", oldName));
    const logsSnapshot = await getDocs(logsQ);

    const batchOp = writeBatch(db);
    
    studentsSnapshot.docs.forEach((docSnap) => {
      batchOp.update(docSnap.ref, { batch: newName });
    });
    
    logsSnapshot.docs.forEach((docSnap) => {
      batchOp.update(docSnap.ref, { batch: newName });
    });
    
    await batchOp.commit();
  } catch (error) {
    console.error("Error updating batch:", error);
    throw error;
  }
};

export const deleteBatch = async (id: string, batchName: string) => {
  try {
    const batchRef = doc(db, "batches", id);
    
    const studentsQ = query(collection(db, "students"), where("batch", "==", batchName));
    const studentsSnapshot = await getDocs(studentsQ);

    const batchOp = writeBatch(db);
    batchOp.delete(batchRef);
    
    studentsSnapshot.docs.forEach((docSnap) => {
      batchOp.delete(docSnap.ref);
    });
    
    await batchOp.commit();
  } catch (error) {
    console.error("Error deleting batch:", error);
    throw error;
  }
};

export const bulkAddStudents = async (students: Omit<Student, "id" | "created_at">[]) => {
  try {
    const chunks = [];
    for (let i = 0; i < students.length; i += 450) {
      chunks.push(students.slice(i, i + 450));
    }
    
    for (const chunk of chunks) {
      const batchOp = writeBatch(db);
      chunk.forEach(student => {
        const newStudentRef = doc(collection(db, "students"));
        batchOp.set(newStudentRef, {
          ...student,
          created_at: new Date().toISOString()
        });
      });
      await batchOp.commit();
    }
  } catch (error) {
    console.error("Error in bulk adding students:", error);
    throw error;
  }
};
