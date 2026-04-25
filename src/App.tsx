/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import Dashboard from "./pages/AdminDashboard";
import PublicLogEntry from "./pages/PublicLogEntry";
import Login from "./pages/Login";

export default function App() {
  return (
    <Router>
      {/* @ts-ignore */}
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

