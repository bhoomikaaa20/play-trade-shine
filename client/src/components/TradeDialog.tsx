import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmtMoney } from "@/lib/format";
import { toast } from "sonner";
import axios from "axios";

const API = "http://localhost:5000/api";
export type TradeAsset = { _id: string; symbol: string; name: string; current_price: number };

export default function TradeDialog({
  asset, side, open, onOpenChange, onDone,
}: {
  asset: TradeAsset | null;
  side: "buy" | "sell";
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDone?: () => void;
}) {
  const [qty, setQty] = useState("1");
  const [loading, setLoading] = useState(false);

  if (!asset) return null;
  const quantity = Number(qty);
  const total = (quantity || 0) * asset.current_price;
  const isBuy = side === "buy";

  const submit = async () => {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const url = isBuy ? "/trade/buy" : "/trade/sell";

      const res = await axios.post(`${API}${url}`, {
        asset_id: asset._id,
        quantity
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data?.error) {
        throw new Error(res.data.error);
      }

      toast.success(
        `${isBuy ? "Bought" : "Sold"} ${quantity} ${asset.symbol} @ ${fmtMoney(asset.current_price)}`
      );

      onOpenChange(false);
      setQty("1");
      onDone?.();

    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Trade failed");
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono uppercase tracking-wider text-sm">
            <span className={isBuy ? "text-gain" : "text-loss"}>
              {isBuy ? "▲ BUY" : "▼ SELL"}
            </span>{" "}
            {asset.symbol}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border border-border bg-surface-2 p-3 font-mono text-xs space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">NAME</span><span>{asset.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">PRICE</span><span className="num text-primary">{fmtMoney(asset.current_price)}</span></div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="qty" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Quantity</Label>
            <Input
              id="qty" type="number" min="0" step="any" value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="font-mono num bg-surface-2 border-border"
            />
          </div>
          <div className="border border-border bg-surface-2 p-3 font-mono text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">EST. {isBuy ? "COST" : "PROCEEDS"}</span>
              <span className="num text-primary text-base">{fmtMoney(total)}</span>
            </div>
          </div>
          <Button
            onClick={submit} disabled={loading}
            className={`w-full font-mono uppercase tracking-wider ${isBuy ? "bg-gain text-gain-foreground hover:bg-gain/90" : "bg-loss text-loss-foreground hover:bg-loss/90"
              }`}
          >
            {loading ? "Executing…" : `Confirm ${isBuy ? "Buy" : "Sell"}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
