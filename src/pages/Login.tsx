import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, LogIn } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-brand-border shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="text-center bg-white pt-10 pb-6 border-b border-brand-border">
          <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-brand-blue mx-auto mb-4">
            <ShieldCheck size={36} strokeWidth={1.5} />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Teacher Console</CardTitle>
          <CardDescription>Secure access for academic staff.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 bg-white">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@institute.edu"
                className="h-11 border-brand-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 border-brand-border"
                required
              />
            </div>
            <Button disabled={loading} type="submit" className="w-full bg-brand-main text-white h-11 rounded-lg font-semibold bg-brand-blue hover:bg-blue-700">
               {loading ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
               ) : (
                 <div className="flex items-center gap-2">
                   <LogIn size={18} />
                   Continue to Dashboard
                 </div>
               )}
            </Button>
            <div className="text-center">
              <button type="button" onClick={() => navigate("/")} className="text-xs text-brand-slate-sub hover:text-brand-blue font-medium transition-colors">
                Back to Public Portal
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
