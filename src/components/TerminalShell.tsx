import { Link, NavLink, useNavigate } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fmtMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { LogOut, TrendingUp } from "lucide-react";

export default function TerminalShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [cash, setCash] = useState<number | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = () =>
      supabase.from("profiles").select("cash_balance").eq("id", user.id).maybeSingle()
        .then(({ data }) => setCash(Number(data?.cash_balance ?? 0)));
    load();
    const ch = supabase.channel("profile-cash")
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-surface-3"
    }`;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top status bar */}
      <header className="border-b border-border bg-surface">
        <div className="flex items-center justify-between h-10 px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-mono font-bold text-sm tracking-widest text-primary">TERMINAL</span>
              <span className="font-mono text-[10px] text-muted-foreground uppercase">v1.0 · sim</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 font-mono text-xs">
              <span className="text-muted-foreground">CASH</span>
              <span className="text-primary font-semibold num">
                {cash === null ? "—" : fmtMoney(cash)}
              </span>
            </div>
            <span className="hidden sm:inline font-mono text-[11px] text-muted-foreground">
              {now.toISOString().slice(11, 19)} UTC
            </span>
            <Button
              size="sm" variant="ghost"
              onClick={async () => { await signOut(); nav("/auth"); }}
              className="h-7 text-xs font-mono uppercase"
            >
              <LogOut className="h-3 w-3" /> Logout
            </Button>
          </div>
        </div>
        <nav className="flex items-center gap-1 px-2 border-t border-border bg-surface-2">
          <NavLink to="/" end className={navCls}>Markets</NavLink>
          <NavLink to="/portfolio" className={navCls}>Portfolio</NavLink>
          <NavLink to="/transactions" className={navCls}>Ledger</NavLink>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-surface px-4 py-2 font-mono text-[10px] text-muted-foreground flex justify-between">
        <span>SIMULATED MARKET DATA · NOT FINANCIAL ADVICE</span>
        <span>{user?.email}</span>
      </footer>
    </div>
  );
}
