import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const API = "http://localhost:5000/api";

  useEffect(() => { if (user) nav("/", { replace: true }); }, [user, nav]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API}/auth/login`, {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);

      const user = res.data.user;

      if (user.role === "admin") {
        nav("/admin", { replace: true });   // ✅ ADMIN REDIRECT
      } else {
        nav("/", { replace: true });        // ✅ USER REDIRECT
      }

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    }

    setLoading(false);
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API}/auth/register`, {
        name,
        email,
        password
      });

      if (res.data.user.role === "admin") {
        nav("/admin");
      } else {
        nav("/");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Signup failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 terminal-grid">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-6">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h1 className="font-mono text-xl tracking-[0.3em] text-primary">TERMINAL</h1>
        </div>
        <div className="border border-border bg-surface p-6 shadow-2xl">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6 text-center">
            // authorized session required
          </p>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid grid-cols-2 w-full bg-surface-2 mb-4 rounded-none">
              <TabsTrigger value="signin" className="font-mono text-xs uppercase tracking-wider rounded-none">Sign in</TabsTrigger>
              <TabsTrigger value="signup" className="font-mono text-xs uppercase tracking-wider rounded-none">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-3">
                <Field label="Email" value={email} onChange={setEmail} type="email" />
                <Field label="Password" value={password} onChange={setPassword} type="password" />
                <Button disabled={loading} className="w-full font-mono uppercase tracking-wider">
                  {loading ? "Authenticating…" : "Enter Terminal"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="space-y-3">
                <Field label="Display name" value={name} onChange={setName} />
                <Field label="Email" value={email} onChange={setEmail} type="email" />
                <Field label="Password" value={password} onChange={setPassword} type="password" />
                <Button disabled={loading} className="w-full font-mono uppercase tracking-wider">
                  {loading ? "Provisioning…" : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
        <p className="text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-4">
          simulated paper trading · no real funds
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        required className="font-mono bg-surface-2 border-border rounded-none" />
    </div>
  );
}
