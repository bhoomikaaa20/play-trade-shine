import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const assetId = String(body.asset_id ?? "");
    const quantity = Number(body.quantity);
    if (!assetId || !Number.isFinite(quantity) || quantity <= 0)
      return json({ error: "Invalid input" }, 400);

    const { data: asset, error: aErr } = await supabase
      .from("assets").select("id, symbol, current_price").eq("id", assetId).maybeSingle();
    if (aErr || !asset) return json({ error: "Asset not found" }, 404);

    const price = Number(asset.current_price);
    const total = price * quantity;

    const { data: profile, error: pErr } = await supabase
      .from("profiles").select("cash_balance").eq("id", user.id).maybeSingle();
    if (pErr || !profile) return json({ error: "Profile missing" }, 404);
    if (Number(profile.cash_balance) < total) return json({ error: "Insufficient balance" }, 400);

    const { data: existing } = await supabase
      .from("holdings").select("quantity, avg_cost").eq("user_id", user.id).eq("asset_id", assetId).maybeSingle();

    const newQty = Number(existing?.quantity ?? 0) + quantity;
    const newAvg = existing
      ? (Number(existing.avg_cost) * Number(existing.quantity) + total) / newQty
      : price;

    const { error: upErr } = await supabase.from("holdings").upsert({
      user_id: user.id, asset_id: assetId, quantity: newQty, avg_cost: newAvg,
    }, { onConflict: "user_id,asset_id" });
    if (upErr) return json({ error: upErr.message }, 500);

    const { error: balErr } = await supabase.from("profiles")
      .update({ cash_balance: Number(profile.cash_balance) - total }).eq("id", user.id);
    if (balErr) return json({ error: balErr.message }, 500);

    await supabase.from("transactions").insert({
      user_id: user.id, asset_id: assetId, symbol: asset.symbol,
      side: "buy", quantity, price, total,
    });

    return json({ ok: true, total, price });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
