/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FilePlus, Table, UserCircle, LogOut } from "lucide-react";
import Dashboard from "./pages/AdminDashboard";
import PublicLogEntry from "./pages/PublicLogEntry";
import Login from "./pages/Login";
import { cn } from "@/lib/utils";

export default function App() {
  return (
    <Router>
      <ThemeProvider attribute="class" defaultTheme="light">
        <Routes>
          <Route path="/" element={<PublicLogEntry />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </ThemeProvider>
      <Toaster />
    </Router>
  );
}

