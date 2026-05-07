import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { useReviews } from "../../contexts/ReviewsContext";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useNotifications } from "../../contexts/NotificationsContext";
import { useDestinations } from "../../contexts/DestinationsContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent } from "../ui/dialog";
import { MapEditor } from "./MapEditor";
import {
  ArrowLeft,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Settings,
  Plus,
  Edit,
  Trash2,
  Users,
  MessageSquare,
  Heart,
  Bell,
  Activity,
  BarChart3
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { toast } from "sonner";

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { reviews } = useReviews();
  const { favorites } = useFavorites();
  const { notifications } = useNotifications();
  const { destinations: realDestinations } = useDestinations();
  const [editingMapId, setEditingMapId] = useState<string | null>(null);

  // Use real destinations directly
  const currentDestinations = realDestinations;

  // Redirect if not admin
  if (user?.role !== "admin") {
    navigate("/");
    return null;
  }

  const stats = {
    total: currentDestinations.length,
    safe: currentDestinations.filter(d => d.ecoStatus.safetyLevel === "aman").length,
    warning: currentDestinations.filter(d => d.ecoStatus.safetyLevel === "hati-hati").length,
    danger: currentDestinations.filter(d => d.ecoStatus.safetyLevel === "berbahaya").length,
    users: 127, // Mock data - in real app would come from database
    reviews: reviews.length,
    favorites: favorites.length,
    activeNotifications: notifications.filter(n => !n.read).length,
  };

  // Calculate environmental status distribution
  const pollutionStats = {
    rendah: currentDestinations.filter(d => d.ecoStatus.pollutionLevel === "rendah").length,
    sedang: currentDestinations.filter(d => d.ecoStatus.pollutionLevel === "sedang").length,
    tinggi: currentDestinations.filter(d => d.ecoStatus.pollutionLevel === "tinggi").length,
  };

  // Recent activities (mock data)
  const recentActivities = [
    { type: "review", text: "Review baru untuk Raja Ampat", time: "5 menit lalu" },
    { type: "destination", text: "Destinasi baru ditambahkan", time: "2 jam lalu" },
    { type: "alert", text: "Peringatan cuaca untuk Bromo", time: "5 jam lalu" },
  ];

  const handleUpdateStatus = (id: string) => {
    toast.info("Fitur update status akan membuka form edit");
    // In a real app, this would open a dialog to edit the destination
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/destinasis/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        toast.success("Destinasi berhasil dihapus");
        // Reload page to fetch new destinations, or call refreshDestinations from context
        window.location.reload();
      } else {
        toast.error("Gagal menghapus destinasi");
      }
    } catch (e) {
      toast.error("Gagal terhubung ke server");
    }
  };

  const handleSaveGeoJson = async (geoJson: any) => {
    if (!editingMapId) return;
    
    try {
      const response = await fetch(`/api/destinasis/${editingMapId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ geo_json: geoJson })
      });
      
      if (response.ok) {
        toast.success("Area destinasi berhasil disimpan");
        setEditingMapId(null);
        window.location.reload();
      } else {
        toast.error("Gagal menyimpan area destinasi");
      }
    } catch (e) {
      toast.error("Gagal terhubung ke server");
    }
  };

  const getSafetyColor = (level: string) => {
    switch (level) {
      case "aman": return "bg-green-100 text-green-800";
      case "hati-hati": return "bg-yellow-100 text-yellow-800";
      case "berbahaya": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-white px-6 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/profile")}
            className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-purple-100 text-sm mt-1">Monitor & kelola sistem GreenTour.Id</p>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-purple-100" />
              <div className="text-xs text-purple-100">Destinasi</div>
            </div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-100" />
              <div className="text-xs text-purple-100">Pengguna</div>
            </div>
            <div className="text-3xl font-bold">{stats.users}</div>
          </div>
          <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-purple-100" />
              <div className="text-xs text-purple-100">Reviews</div>
            </div>
            <div className="text-3xl font-bold">{stats.reviews}</div>
          </div>
          <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-purple-100" />
              <div className="text-xs text-purple-100">Notifikasi</div>
            </div>
            <div className="text-3xl font-bold">{stats.activeNotifications}</div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Add New Button */}
        <Button 
          className="w-full mb-6 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => toast.info("Fitur tambah destinasi akan membuka form")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Destinasi Baru
        </Button>

        {/* Tabs for Management */}
        <Tabs defaultValue="statistics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="statistics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Statistik
            </TabsTrigger>
            <TabsTrigger value="destinations">
              <MapPin className="w-4 h-4 mr-2" />
              Destinasi
            </TabsTrigger>
            <TabsTrigger value="status">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Status
            </TabsTrigger>
          </TabsList>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-4">
            {/* Safety Status Chart */}
            <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Status Keamanan Destinasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">Aman</span>
                        <span className="text-sm font-medium text-green-600">{stats.safe}</span>
                      </div>
                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                          style={{ width: `${(stats.safe / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">Hati-hati</span>
                        <span className="text-sm font-medium text-yellow-600">{stats.warning}</span>
                      </div>
                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all duration-500"
                          style={{ width: `${(stats.warning / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">Berbahaya</span>
                        <span className="text-sm font-medium text-red-600">{stats.danger}</span>
                      </div>
                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all duration-500"
                          style={{ width: `${(stats.danger / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pollution Level Chart */}
            <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tingkat Polusi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">Rendah</span>
                        <span className="text-sm font-medium text-green-600">{pollutionStats.rendah}</span>
                      </div>
                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                          style={{ width: `${(pollutionStats.rendah / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">Sedang</span>
                        <span className="text-sm font-medium text-yellow-600">{pollutionStats.sedang}</span>
                      </div>
                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
                          style={{ width: `${(pollutionStats.sedang / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">Tinggi</span>
                        <span className="text-sm font-medium text-red-600">{pollutionStats.tinggi}</span>
                      </div>
                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full"
                          style={{ width: `${(pollutionStats.tinggi / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Aktivitas Terkini
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className={`p-2 rounded-full ${
                        activity.type === "review" ? "bg-blue-100" :
                        activity.type === "destination" ? "bg-green-100" :
                        "bg-orange-100"
                      }`}>
                        {activity.type === "review" && <MessageSquare className="w-4 h-4 text-blue-600" />}
                        {activity.type === "destination" && <MapPin className="w-4 h-4 text-green-600" />}
                        {activity.type === "alert" && <AlertTriangle className="w-4 h-4 text-orange-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{activity.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="destinations" className="space-y-3">
            <p className="text-sm text-gray-600 mb-3">
              Kelola data lokasi wisata beserta koordinatnya
            </p>
            
            {currentDestinations.map((dest) => (
              <Card key={dest.id}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={dest.image}
                        alt={dest.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm">{dest.name}</h3>
                        <Badge className={`${getSafetyColor(dest.ecoStatus.safetyLevel)} text-xs`}>
                          {dest.ecoStatus.safetyLevel}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{dest.region}</p>
                      <div className="text-xs text-gray-500 mb-3">
                        📍 {dest.latitude.toFixed(4)}, {dest.longitude.toFixed(4)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          onClick={() => setEditingMapId(dest.id)}
                        >
                          <MapPin className="w-3 h-3 mr-1" />
                          Area
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          onClick={() => handleUpdateStatus(dest.id)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDelete(dest.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="status" className="space-y-3">
            <p className="text-sm text-gray-600 mb-3">
              Perbarui status darurat lingkungan secara manual
            </p>

            {currentDestinations
              .filter(d => d.ecoStatus.safetyLevel !== "aman" || d.weather.warning)
              .map((dest) => (
                <Card key={dest.id} className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-sm mb-1">{dest.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{dest.region}</p>
                        
                        {dest.weather.warning && (
                          <div className="bg-white rounded p-2 mb-2">
                            <p className="text-xs text-orange-800">{dest.weather.warning}</p>
                          </div>
                        )}
                        
                        <div className="flex gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            Polusi: {dest.ecoStatus.pollutionLevel}
                          </Badge>
                          {dest.ecoStatus.forestFireRisk && (
                            <Badge variant="outline" className="text-xs">
                              Kebakaran: {dest.ecoStatus.forestFireRisk}
                            </Badge>
                          )}
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          onClick={() => toast.info("Form update status darurat")}
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Update Status
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Map Editor Dialog */}
      <Dialog open={!!editingMapId} onOpenChange={(open: boolean) => !open && setEditingMapId(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-gray-50 border-0">
          {editingMapId && (() => {
            const dest = currentDestinations.find(d => d.id === editingMapId);
            if (!dest) return null;
            return (
              <MapEditor
                center={[dest.latitude, dest.longitude]}
                initialGeoJson={dest.geoJson}
                onSave={handleSaveGeoJson}
                onCancel={() => setEditingMapId(null)}
              />
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
