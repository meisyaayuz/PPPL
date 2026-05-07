import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { 
  User, 
  Mail, 
  Shield, 
  LogOut, 
  Settings,
  ChevronRight,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleSaveProfile = () => {
    updateProfile(name, email);
    setIsEditing(false);
    toast.success("Profil berhasil diperbarui");
  };

  const handleLogout = () => {
    logout();
    toast.success("Berhasil keluar");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white px-6 pt-8 pb-16">
        <h1 className="text-2xl mb-2">Profil Saya</h1>
        <p className="text-emerald-100 text-sm">Kelola informasi akun Anda</p>
      </div>

      <div className="px-6 -mt-8 pb-24">
        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <User className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg">{user?.name}</h2>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>

            {user?.role === "admin" && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-purple-800">Administrator</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Informasi Pribadi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            {isEditing ? (
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveProfile}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  Simpan
                </Button>
                <Button 
                  onClick={() => {
                    setIsEditing(false);
                    setName(user?.name || "");
                    setEmail(user?.email || "");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="w-full"
              >
                Edit Profil
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card className="mb-6">
          <CardContent className="p-0">
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">Admin Dashboard</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            )}
            
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="text-sm">Tentang Aplikasi</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>GreenTour.Id</DialogTitle>
                  <DialogDescription className="space-y-3 pt-3">
                    <p>Platform wisata berkelanjutan yang membantu wisatawan menjelajahi destinasi Indonesia dengan mempertimbangkan aspek lingkungan dan keamanan.</p>
                    <div className="text-sm space-y-1">
                      <p><strong>Fitur Utama:</strong></p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Peta interaktif destinasi wisata</li>
                        <li>Informasi cuaca real-time (SDG 13)</li>
                        <li>Status ekosistem lingkungan (SDG 14, 15)</li>
                        <li>Rekomendasi destinasi alternatif</li>
                        <li>Manajemen data untuk admin</li>
                      </ul>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Keluar
        </Button>
      </div>
    </div>
  );
}
