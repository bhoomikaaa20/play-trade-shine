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

    const { data: asset } = await supabase
      .from("assets").select("id, symbol, current_price").eq("id", assetId).maybeSingle();
    if (!asset) return json({ error: "Asset not found" }, 404);

    const { data: holding } = await supabase
      .from("holdings").select("quantity, avg_cost").eq("user_id", user.id).eq("asset_id", assetId).maybeSingle();
    if (!holding || Number(holding.quantity) < quantity)
      return json({ error: "Insufficient holdings" }, 400);

    const price = Number(asset.current_price);
    const total = price * quantity;
    const newQty = Number(holding.quantity) - quantity;

    if (newQty === 0) {
      await supabase.from("holdings").delete().eq("user_id", user.id).eq("asset_id", assetId);
    } else {
      await supabase.from("holdings").update({ quantity: newQty })
        .eq("user_id", user.id).eq("asset_id", assetId);
    }

    const { data: profile } = await supabase
      .from("profiles").select("cash_balance").eq("id", user.id).maybeSingle();
    await supabase.from("profiles")
      .update({ cash_balance: Number(profile?.cash_balance ?? 0) + total })
      .eq("id", user.id);

    await supabase.from("transactions").insert({
      user_id: user.id, asset_id: assetId, symbol: asset.symbol,
      side: "sell", quantity, price, total,
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
