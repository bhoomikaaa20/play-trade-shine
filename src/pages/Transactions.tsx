import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import TerminalShell from "@/components/TerminalShell";
import { fmtMoney } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

type Tx = {
  id: string; symbol: string; side: string;
  quantity: number; price: number; total: number; created_at: string;
};

export default function Transactions() {
  const { user } = useAuth();
  const [txs, setTxs] = useState<Tx[] | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("transactions").select("*")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => setTxs((data ?? []) as Tx[]));
  }, [user]);

  return (
    <TerminalShell>
      <div className="px-4 py-4">
        <h1 className="font-mono text-sm uppercase tracking-widest text-primary mb-1">LEDGER</h1>
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Most recent 200 transactions</p>

        <div className="border border-border bg-surface overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead className="bg-surface-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2">Time</th>
                <th className="text-left px-3 py-2">Side</th>
                <th className="text-left px-3 py-2">Sym</th>
                <th className="text-right px-3 py-2">Qty</th>
                <th className="text-right px-3 py-2">Price</th>
                <th className="text-right px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {!txs && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-3 py-2"><Skeleton className="h-4 w-full bg-surface-3" /></td></tr>
              ))}
              {txs && txs.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">// no transactions yet</td></tr>
              )}
              {txs?.map((t) => (
                <tr key={t.id} className="border-b border-border/60 hover:bg-surface-2">
                  <td className="px-3 py-2 text-muted-foreground">{new Date(t.created_at).toISOString().replace("T", " ").slice(0, 19)}</td>
                  <td className={`px-3 py-2 uppercase font-semibold ${t.side === "buy" ? "text-gain" : "text-loss"}`}>{t.side}</td>
                  <td className="px-3 py-2 text-primary font-semibold">{t.symbol}</td>
                  <td className="px-3 py-2 text-right num">{Number(t.quantity)}</td>
                  <td className="px-3 py-2 text-right num">{fmtMoney(Number(t.price))}</td>
                  <td className="px-3 py-2 text-right num">{fmtMoney(Number(t.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TerminalShell>
  );
}
