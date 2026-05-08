import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useDestinations } from "../../contexts/DestinationsContext";
import { useReviews } from "../../contexts/ReviewsContext";
import { useNotifications } from "../../contexts/NotificationsContext";
import {
  Leaf, MapPin, AlertTriangle, Shield, Heart,
  Star, BookOpen, Bell, ChevronRight
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export function Home() {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { destinations, loading } = useDestinations();
  const { getAverageRating, getReviewsByDestination } = useReviews();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const safeDestinations = destinations.filter(d => d.ecoStatus.safetyLevel === "aman");
  const warningDestinations = destinations.filter(d => d.weather.warning);
  const favoriteDestinations = destinations.filter(d => isFavorite(d.id));

  // Stats
  const totalReviews = destinations.reduce((sum, d) => sum + getReviewsByDestination(d.id).length, 0);

  const getSafetyColor = (level: string) => {
    switch (level) {
      case "aman": return "bg-green-100 text-green-800";
      case "hati-hati": return "bg-yellow-100 text-yellow-800";
      case "berbahaya": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white px-6 pt-8 pb-28 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-emerald-100 text-sm">Selamat datang,</p>
              <h1 className="text-2xl font-bold mt-1">{user?.name}</h1>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl shadow-lg">
              <Leaf className="w-6 h-6" />
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-5 border border-white/20 shadow-2xl">
            <p className="text-sm text-white/90 mb-3 font-medium">Ringkasan Dashboard</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-3xl font-bold mb-1">{destinations.length}</div>
                <div className="text-xs text-emerald-100">Total Destinasi</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-3xl font-bold mb-1">{safeDestinations.length}</div>
                <div className="text-xs text-emerald-100">Destinasi Aman</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-3xl font-bold mb-1">{favoriteDestinations.length}</div>
                <div className="text-xs text-emerald-100">Bookmark Saya</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-3xl font-bold mb-1">{totalReviews}</div>
                <div className="text-xs text-emerald-100">Total Review</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 -mt-20 relative z-20">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => navigate("/favorites")}
            className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all text-center"
          >
            <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <span className="text-xs font-semibold text-gray-700">Bookmark</span>
            {favoriteDestinations.length > 0 && (
              <Badge className="mt-1 bg-red-100 text-red-600 border-0 text-[10px]">
                {favoriteDestinations.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => navigate("/notifications")}
            className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all text-center relative"
          >
            <Bell className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <span className="text-xs font-semibold text-gray-700">Notifikasi</span>
            {unreadCount > 0 && (
              <Badge className="mt-1 bg-amber-100 text-amber-700 border-0 text-[10px]">
                {unreadCount} baru
              </Badge>
            )}
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all text-center"
          >
            <BookOpen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <span className="text-xs font-semibold text-gray-700">Review Saya</span>
          </button>
        </div>

        {/* My Bookmarks */}
        {favoriteDestinations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-bold text-gray-800">Bookmark Saya</h2>
              </div>
              <button
                onClick={() => navigate("/favorites")}
                className="text-sm text-emerald-600 font-semibold flex items-center gap-1 hover:text-emerald-700"
              >
                Lihat Semua <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {favoriteDestinations.slice(0, 6).map((dest) => {
                const avgRating = getAverageRating(dest.id);
                return (
                  <div
                    key={dest.id}
                    onClick={() => navigate(`/destination/${dest.id}`)}
                    className="flex-shrink-0 w-36 bg-white rounded-2xl overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-all border border-gray-100"
                  >
                    <div className="relative h-24">
                      <ImageWithFallback
                        src={dest.image}
                        alt={dest.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <Badge className={`absolute top-2 right-2 text-[10px] ${getSafetyColor(dest.ecoStatus.safetyLevel)} border-0 shadow`}>
                        {dest.ecoStatus.safetyLevel}
                      </Badge>
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-gray-800 truncate">{dest.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] text-gray-500 truncate">{dest.region}</span>
                      </div>
                      {avgRating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-[10px] font-medium">{avgRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Destinasi Unggulan (Real Data) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800">Destinasi Unggulan</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {destinations.slice(0, 4).map((dest) => {
                const avgRating = getAverageRating(dest.id);
                const reviewCount = getReviewsByDestination(dest.id).length;
                return (
                  <Card
                    key={dest.id}
                    className="group overflow-hidden cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
                    onClick={() => navigate(`/destination/${dest.id}`)}
                  >
                    <div className="relative h-36 overflow-hidden">
                      <ImageWithFallback
                        src={dest.image}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent"></div>
                      <Badge className={`absolute top-3 right-3 ${getSafetyColor(dest.ecoStatus.safetyLevel)} shadow-lg border-0 backdrop-blur-sm`}>
                        {dest.ecoStatus.safetyLevel}
                      </Badge>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(dest.id);
                        }}
                        className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 hover:bg-white transition-all shadow-lg"
                      >
                        <Heart
                          className={`w-4 h-4 transition-all ${
                            isFavorite(dest.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-600"
                          }`}
                        />
                      </button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold mb-1 line-clamp-1 text-gray-800">{dest.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="line-clamp-1">{dest.region}</span>
                        </div>
                        {avgRating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{avgRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Weather Warnings */}
        {warningDestinations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-xl shadow-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Peringatan Cuaca</h2>
            </div>
            
            <div className="space-y-3">
              {warningDestinations.slice(0, 3).map((dest) => (
                <Card 
                  key={dest.id}
                  className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50 cursor-pointer hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
                  onClick={() => navigate(`/destination/${dest.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                        <ImageWithFallback
                          src={dest.image}
                          alt={dest.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold mb-1 text-gray-800">{dest.name}</h3>
                        <p className="text-xs text-orange-800 line-clamp-2 leading-relaxed">
                          {dest.weather.warning}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Rekomendasi Aman */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Rekomendasi Aman</h2>
          </div>
          
          <div className="space-y-3">
            {safeDestinations.slice(0, 4).map((dest) => {
              const avgRating = getAverageRating(dest.id);
              return (
                <Card 
                  key={dest.id}
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-0.5 bg-white/80 backdrop-blur-sm"
                  onClick={() => navigate(`/destination/${dest.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="flex gap-3">
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
                        <ImageWithFallback
                          src={dest.image}
                          alt={dest.name}
                          className="w-full h-full object-cover rounded-l-2xl"
                        />
                      </div>
                      <div className="flex-1 py-3 pr-4 min-w-0">
                        <h3 className="text-sm font-semibold mb-1 text-gray-800">{dest.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>{dest.region}</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-white/90 border-0 text-emerald-700 shadow-sm text-[10px]">
                            {dest.category}
                          </Badge>
                          {avgRating > 0 && (
                            <Badge className="bg-yellow-50 text-yellow-700 border-0 text-[10px]">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-0.5" />
                              {avgRating.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}