import { useEffect, useState } from "react";
import axios from "axios";
import TerminalShell from "@/components/TerminalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

const API = "http://localhost:5000/api";

export default function Admin() {
    const { user, isAdmin, loading } = useAuth();
    const [assets, setAssets] = useState<any[]>([]);
    const [form, setForm] = useState({
        symbol: "",
        name: "",
        sector: "",
        price: ""
    });

    const token = localStorage.getItem("token");

    const load = async () => {
        const res = await axios.get(`${API}/assets`);
        setAssets(res.data);
    };

    useEffect(() => {
        load();
    }, []);

    // ➕ Add Asset
    const addAsset = async () => {
        await axios.post(`${API}/admin/asset`, {
            ...form,
            current_price: Number(form.price)
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        setForm({ symbol: "", name: "", sector: "", price: "" });
        load();
    };

    // ✏️ Update Price
    const updatePrice = async (id: string) => {
        const price = prompt("Enter new price:");
        if (!price) return;

        await axios.put(`${API}/admin/asset/${id}`, {
            price: Number(price)
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        load();
    };

    // ❌ Delete
    const remove = async (id: string) => {
        await axios.delete(`${API}/admin/asset/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        load();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">// loading session…</span>
            </div>
        );
    }

    if (!isAdmin) {
        return <div className="p-4 text-destructive font-mono uppercase">Access denied</div>;
    }

    return (
        <TerminalShell>
            <div className="p-4 space-y-4">
                <h1 className="font-mono text-primary">ADMIN PANEL</h1>

                {/* Add Asset */}
                <div className="space-y-2">
                    <Input placeholder="Symbol" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} />
                    <Input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    <Input placeholder="Sector" value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} />
                    <Input placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />

                    <Button onClick={addAsset}>Add Asset</Button>
                </div>

                {/* Asset List */}
                <div className="space-y-2">
                    {assets.map(a => (
                        <div key={a._id} className="flex justify-between border p-2">
                            <span>{a.symbol} - ₹{a.current_price}</span>
                            <div className="flex gap-2">
                                <Button onClick={() => updatePrice(a._id)}>Update</Button>
                                <Button onClick={() => remove(a._id)}>Delete</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </TerminalShell>
    );
}