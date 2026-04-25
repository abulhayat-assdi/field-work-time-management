/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FilePlus, Table, UserCircle, LogOut } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import LogEntryForm from "./pages/LogEntryForm";
import MasterSheet from "./pages/MasterSheet";
import IndividualLogbook from "./pages/IndividualLogbook";
import { cn } from "@/lib/utils";

function Navigation() {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Add Log Entry", path: "/add", icon: FilePlus },
    { name: "Daily Master Sheet", path: "/sheet", icon: Table },
    { name: "Individual Logbook", path: "/logbook", icon: UserCircle },
  ];

  return (
    <nav className="flex flex-col h-full bg-white border-r border-brand-border py-6">
      <div className="px-6 mb-8">
        <h1 className="text-lg font-bold text-brand-blue flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          FieldLog Pro
        </h1>
      </div>
      <div className="flex-1 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all border-l-3",
              location.pathname === item.path
                ? "nav-item-active"
                : "nav-item-inactive"
            )}
          >
            <item.icon size={18} />
            {item.name}
          </Link>
        ))}
      </div>
      <div className="px-4 mt-auto">
        <button className="flex items-center gap-3 px-6 py-3 w-full rounded-lg text-sm font-medium text-brand-slate-sub hover:bg-slate-50 transition-colors">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      {/* @ts-ignore */}
      <ThemeProvider attribute="class" defaultTheme="light">
        <div className="flex min-h-screen bg-brand-bg font-sans antialiased text-brand-slate-main">
          <aside className="w-[240px] sticky top-0 h-screen hidden md:block shrink-0">
            <Navigation />
          </aside>
          <main className="flex-1 flex flex-col min-w-0">
            <header className="h-[64px] border-b border-brand-border bg-white flex items-center justify-between px-8 sticky top-0 z-10">
               <h2 className="text-xl font-semibold">
                 {/* Logic to show page title based on path could be here */}
                 Overview
               </h2>
               <div className="flex items-center gap-3">
                 <Button variant="outline" className="border-brand-border text-xs h-9 font-medium">
                   {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                 </Button>
                 <Link to="/add">
                   <Button className="bg-brand-blue hover:bg-blue-700 text-white h-9 px-4 text-xs font-medium">
                     + New Log
                   </Button>
                 </Link>
               </div>
            </header>
            <div className="flex-1 overflow-y-auto w-full">
              <div className="p-8 max-w-7xl mx-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/add" element={<LogEntryForm />} />
                  <Route path="/sheet" element={<MasterSheet />} />
                  <Route path="/logbook" element={<IndividualLogbook />} />
                </Routes>
              </div>
            </div>
          </main>
        </div>
      </ThemeProvider>
      <Toaster />
    </Router>
  );
}

