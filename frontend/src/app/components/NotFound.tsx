import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Home } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h1 className="text-2xl mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-gray-600 mb-6">
          Maaf, halaman yang Anda cari tidak tersedia
        </p>
        <Button 
          onClick={() => navigate("/")}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Home className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </Button>
      </div>
    </div>
  );
}
