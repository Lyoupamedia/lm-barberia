import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scissors, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function LoginPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [claimingAdmin, setClaimingAdmin] = useState(false);
  const { toast } = useToast();

  // Check if any admin exists via edge function (bypasses RLS)
  useEffect(() => {
    supabase.functions.invoke("check-admin-exists").then(({ data }) => {
      setHasAdmin(data?.hasAdmin ?? true);
    }).catch(() => setHasAdmin(true));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        toast({ title: "Account created!", description: "Check your email to confirm." });
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaimAdmin = async () => {
    setClaimingAdmin(true);
    try {
      // First sign in
      const { error: signInError } = await signIn(email, password);
      if (signInError) throw signInError;

      // Then claim admin
      const { data, error } = await supabase.functions.invoke("claim-admin");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Admin role claimed!", description: "You are now the admin. Redirecting..." });
      // Reload to refresh auth context with new role
      window.location.href = "/dashboard";
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setClaimingAdmin(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-sidebar p-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-6">
          <Scissors className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-sidebar-accent-foreground font-heading mb-3">LM Barberia</h1>
        <p className="text-sidebar-foreground text-center max-w-sm">
          The complete salon management platform. Track appointments, clients, income, and team performance all in one place.
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Scissors className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold font-heading">LM Barberia</h1>
          </div>

          <h2 className="text-2xl font-bold font-heading mb-1">
            {isSignUp ? "Create account" : "Welcome back"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isSignUp ? "Sign up to get started" : "Sign in to your account"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          {/* First-time admin setup - only shows when no admin exists */}
          {hasAdmin === false && !isSignUp && (
            <div className="mt-4 p-4 rounded-lg border border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm font-heading">First-time Setup</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                No admin found. Sign in with your credentials above, then claim admin access.
              </p>
              <Button
                onClick={handleClaimAdmin}
                variant="outline"
                className="w-full border-primary/30 text-primary hover:bg-primary/10"
                disabled={claimingAdmin || !email || !password}
              >
                {claimingAdmin ? "Claiming..." : "Sign In & Claim Admin"}
              </Button>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline font-medium">
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
