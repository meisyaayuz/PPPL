import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Leaf } from "lucide-react";
import { toast } from "sonner";

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await register(name, email, password);
      if (result.success) {
        toast.success("Registrasi berhasil!");
        navigate("/home");
      } else {
        toast.error(result.message || "Registrasi gagal");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-3xl shadow-lg">
              <Leaf className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">Daftar Akun</h1>
          <p className="text-center text-gray-600 mb-8">
            Bergabunglah dengan GreenTour.Id
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="text-gray-700">Nama Lengkap</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-2 h-12 rounded-xl border-gray-200 bg-white/80 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 h-12 rounded-xl border-gray-200 bg-white/80 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 h-12 rounded-xl border-gray-200 bg-white/80 focus:bg-white transition-colors"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
              disabled={loading}
            >
              {loading ? "Loading..." : "Daftar"}
            </Button>
          </form>

          <p className="text-center mt-6 text-gray-600 text-sm">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">
            Masuk di sini
          </Link>
        </p>
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">
            &larr; Kembali ke Halaman Utama
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}