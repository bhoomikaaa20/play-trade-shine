import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import TerminalShell from "@/components/TerminalShell";
import TradeDialog, { TradeAsset } from "@/components/TradeDialog";
import { fmtMoney, fmtPct, signClass } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

const API = "http://localhost:5000/api";

type Row = {
  asset_id: string;
  quantity: number;
  avg_cost: number;
  assets: { id: string; symbol: string; name: string; current_price: number };
};

export default function Portfolio() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [cash, setCash] = useState(0);
  const [active, setActive] = useState<{ asset: TradeAsset; side: "buy" | "sell" } | null>(null);

  const load = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/portfolio`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setRows(res.data.rows);
      setCash(res.data.cash);

    } catch (err) {
      console.error("Failed to load portfolio");
    }
  };

  useEffect(() => { load(); }, [user]);

  const positions = (rows ?? []).map((r) => {
    const qty = Number(r.quantity);
    const price = Number(r.assets.current_price);
    const avg = Number(r.avg_cost);
    const value = qty * price;
    const cost = qty * avg;
    const pl = value - cost;
    const plPct = cost > 0 ? (pl / cost) * 100 : 0;
    return { ...r, qty, price, avg, value, cost, pl, plPct };
  });

  const equity = positions.reduce((s, p) => s + p.value, 0);
  const totalCost = positions.reduce((s, p) => s + p.cost, 0);
  const totalPL = equity - totalCost;
  const totalPLPct = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;
  const account = equity + cash;

  return (
    <TerminalShell>
      <div className="px-4 py-4 space-y-4">
        <div>
          <h1 className="font-mono text-sm uppercase tracking-widest text-primary">PORTFOLIO</h1>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Holdings · P&amp;L · account equity</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Stat label="Account" value={fmtMoney(account)} />
          <Stat label="Cash" value={fmtMoney(cash)} />
          <Stat label="Market Value" value={fmtMoney(equity)} />
          <Stat label="Unrealized P&L" value={fmtMoney(totalPL)} sub={fmtPct(totalPLPct)} signed={totalPL} />
        </div>

        <div className="border border-border bg-surface overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead className="bg-surface-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2">Sym</th>
                <th className="text-right px-3 py-2">Qty</th>
                <th className="text-right px-3 py-2 hidden sm:table-cell">Avg</th>
                <th className="text-right px-3 py-2">Last</th>
                <th className="text-right px-3 py-2">Value</th>
                <th className="text-right px-3 py-2">P&amp;L</th>
                <th className="text-right px-3 py-2 hidden sm:table-cell">P&amp;L %</th>
                <th className="text-right px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {!rows && Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-3 py-2"><Skeleton className="h-4 w-full bg-surface-3" /></td></tr>
              ))}
              {rows && positions.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground font-mono text-xs">
                  // no positions · go to MARKETS to open a trade
                </td></tr>
              )}
              {positions.map((p) => (
                <tr key={p.asset_id} className="border-b border-border/60 hover:bg-surface-2">
                  <td className="px-3 py-2 font-semibold text-primary">{p.assets.symbol}</td>
                  <td className="px-3 py-2 text-right num">{p.qty}</td>
                  <td className="px-3 py-2 text-right num hidden sm:table-cell">{fmtMoney(p.avg)}</td>
                  <td className="px-3 py-2 text-right num">{fmtMoney(p.price)}</td>
                  <td className="px-3 py-2 text-right num">{fmtMoney(p.value)}</td>
                  <td className={`px-3 py-2 text-right num ${signClass(p.pl)}`}>{fmtMoney(p.pl)}</td>
                  <td className={`px-3 py-2 text-right num hidden sm:table-cell ${signClass(p.plPct)}`}>{fmtPct(p.plPct)}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex gap-1">
                      <Button size="sm" onClick={() => setActive({ asset: p.assets, side: "buy" })}
                        className="h-6 px-2 text-[10px] font-mono uppercase bg-gain text-gain-foreground hover:bg-gain/90 rounded-none">+</Button>
                      <Button size="sm" onClick={() => setActive({ asset: p.assets, side: "sell" })}
                        className="h-6 px-2 text-[10px] font-mono uppercase bg-loss text-loss-foreground hover:bg-loss/90 rounded-none">−</Button>
                    </div>
                  </td>
                </tr>
              ))}
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

function Stat({ label, value, sub, signed }: { label: string; value: string; sub?: string; signed?: number }) {
  const cls = signed === undefined ? "text-foreground" : signClass(signed);
  return (
    <div className="border border-border bg-surface p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-mono num text-lg mt-1 ${cls}`}>{value}</div>
      {sub && <div className={`font-mono num text-[11px] mt-0.5 ${cls}`}>{sub}</div>}
    </div>
  );
}
