import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import TerminalShell from "@/components/TerminalShell";
import TradeDialog, { TradeAsset } from "@/components/TradeDialog";
import { fmtMoney, fmtPct, signClass } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Asset = {
  id: string; symbol: string; name: string; sector: string | null;
  current_price: number; previous_close: number;
};

export default function Markets() {
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [active, setActive] = useState<{ asset: TradeAsset; side: "buy" | "sell" } | null>(null);

  const load = async () => {
    const { data } = await supabase.from("assets").select("*").order("symbol");
    setAssets((data ?? []) as Asset[]);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("assets-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "assets" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <TerminalShell>
      <div className="px-4 py-4">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <h1 className="font-mono text-sm uppercase tracking-widest text-primary">MARKETS</h1>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Live equities · simulated feed</p>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            {assets?.length ?? 0} INSTRUMENTS
          </span>
        </div>

        <div className="border border-border bg-surface overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead className="bg-surface-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2">Sym</th>
                <th className="text-left px-3 py-2 hidden sm:table-cell">Name</th>
                <th className="text-left px-3 py-2 hidden md:table-cell">Sector</th>
                <th className="text-right px-3 py-2">Last</th>
                <th className="text-right px-3 py-2 hidden sm:table-cell">Chg</th>
                <th className="text-right px-3 py-2">Chg %</th>
                <th className="text-right px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {!assets && Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border/60">
                  <td className="px-3 py-2" colSpan={7}><Skeleton className="h-4 w-full bg-surface-3" /></td>
                </tr>
              ))}
              {assets?.map((a) => {
                const chg = a.current_price - a.previous_close;
                const pct = a.previous_close ? (chg / a.previous_close) * 100 : 0;
                return (
                  <tr key={a.id} className="border-b border-border/60 hover:bg-surface-2 transition-colors">
                    <td className="px-3 py-2 font-semibold text-primary">{a.symbol}</td>
                    <td className="px-3 py-2 hidden sm:table-cell text-foreground/90">{a.name}</td>
                    <td className="px-3 py-2 hidden md:table-cell text-muted-foreground">{a.sector ?? "—"}</td>
                    <td className="px-3 py-2 text-right num">{fmtMoney(a.current_price)}</td>
                    <td className={`px-3 py-2 text-right num hidden sm:table-cell ${signClass(chg)}`}>
                      {chg >= 0 ? "+" : ""}{chg.toFixed(2)}
                    </td>
                    <td className={`px-3 py-2 text-right num ${signClass(pct)}`}>
                      {fmtPct(pct)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex gap-1">
                        <Button size="sm" onClick={() => setActive({ asset: a, side: "buy" })}
                          className="h-6 px-2 text-[10px] font-mono uppercase bg-gain text-gain-foreground hover:bg-gain/90 rounded-none">
                          Buy
                        </Button>
                        <Button size="sm" onClick={() => setActive({ asset: a, side: "sell" })}
                          className="h-6 px-2 text-[10px] font-mono uppercase bg-loss text-loss-foreground hover:bg-loss/90 rounded-none">
                          Sell
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <TradeDialog
        asset={active?.asset ?? null}
        side={active?.side ?? "buy"}
        open={!!active}
        onOpenChange={(v) => !v && setActive(null)}
        onDone={load}
      />
    </TerminalShell>
  );
}
