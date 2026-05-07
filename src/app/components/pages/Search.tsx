import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useDestinations } from "../../contexts/DestinationsContext";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useReviews } from "../../contexts/ReviewsContext";
import { useAuth } from "../../contexts/AuthContext";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Search as SearchIcon, MapPin, Filter, Heart, Star, ArrowLeft, LogIn } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function Search() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getAverageRating, getReviewsByDestination } = useReviews();
  const { destinations, loading } = useDestinations();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<"all" | "Pariwisata" | "Biota Laut" | "Biota Darat" | "Flora Fauna">("all");
  const [safetyFilter, setSafetyFilter] = useState<"all" | "aman" | "hati-hati" | "berbahaya">("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");

  const regions = useMemo(() => {
    const uniqueRegions = [...new Set(destinations.map(d => d.region))];
    return uniqueRegions.sort();
  }, [destinations]);

  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           dest.region.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = category === "all" || dest.category === category;
      const matchesSafety = safetyFilter === "all" || dest.ecoStatus.safetyLevel === safetyFilter;
      const matchesRegion = regionFilter === "all" || dest.region === regionFilter;
      
      return matchesSearch && matchesCategory && matchesSafety && matchesRegion;
    });
  }, [destinations, searchQuery, category, safetyFilter, regionFilter]);

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
      <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white px-6 pt-8 pb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate(-1)}
                className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold">Cari Destinasi</h1>
              {!user && (
                <button
                  onClick={() => navigate('/login')}
                  className="ml-auto flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-xl hover:bg-white/30 transition"
                >
                  <LogIn className="w-4 h-4" /> Login
                </button>
              )}
            </div>
          
          {/* Search Bar */}
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari berdasarkan nama atau daerah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/95 backdrop-blur-sm border-0 shadow-xl h-12 rounded-2xl focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-5 bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 rounded-lg">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-700">Filter Pencarian</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Select value={safetyFilter} onValueChange={(v: any) => setSafetyFilter(v)}>
            <SelectTrigger className="text-sm h-11 rounded-xl border-gray-200 bg-white shadow-sm">
              <SelectValue placeholder="Status Keamanan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="aman">Aman</SelectItem>
              <SelectItem value="hati-hati">Hati-hati</SelectItem>
              <SelectItem value="berbahaya">Berbahaya</SelectItem>
            </SelectContent>
          </Select>

          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="text-sm h-11 rounded-xl border-gray-200 bg-white shadow-sm">
              <SelectValue placeholder="Wilayah" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Wilayah</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={category} onValueChange={(v: any) => setCategory(v)} className="px-6 pt-5">
        <TabsList className="flex flex-wrap w-full gap-2 mb-4 bg-transparent border-0 h-auto p-0">
          <TabsTrigger value="all" className="flex-1 min-w-[80px] bg-white/80 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white shadow-sm border border-gray-100">Semua</TabsTrigger>
          <TabsTrigger value="Pariwisata" className="flex-1 min-w-[80px] bg-white/80 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white shadow-sm border border-gray-100">🏖️ Pariwisata</TabsTrigger>
          <TabsTrigger value="Biota Laut" className="flex-1 min-w-[80px] bg-white/80 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white shadow-sm border border-gray-100">🐠 Biota Laut</TabsTrigger>
          <TabsTrigger value="Biota Darat" className="flex-1 min-w-[80px] bg-white/80 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white shadow-sm border border-gray-100">🐅 Biota Darat</TabsTrigger>
          <TabsTrigger value="Flora Fauna" className="flex-1 min-w-[80px] bg-white/80 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white shadow-sm border border-gray-100">🌴 Flora Fauna</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Results */}
      <div className="px-6 pb-24">
        <p className="text-sm text-gray-600 mb-4 font-medium">
          {filteredDestinations.length} destinasi ditemukan
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-3xl shadow-lg">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">Tidak ada destinasi yang ditemukan</p>
            <p className="text-sm text-gray-500 mt-2">Coba ubah filter pencarian Anda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDestinations.map((dest) => {
              const avgRating = getAverageRating(dest.id);
              const reviewCount = getReviewsByDestination(dest.id).length;

              return (
                <Card
                  key={dest.id}
                  className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 bg-white/80 backdrop-blur-sm overflow-hidden"
                  onClick={() => navigate(`/destination/${dest.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="flex gap-4">
                      <div className="w-32 h-32 flex-shrink-0 relative overflow-hidden">
                        <ImageWithFallback
                          src={dest.image}
                          alt={dest.name}
                          className="w-full h-full object-cover rounded-l-2xl group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        <Badge className={`absolute top-2 right-2 text-xs ${getSafetyColor(dest.ecoStatus.safetyLevel)} shadow-lg border-0`}>
                          {dest.ecoStatus.safetyLevel}
                        </Badge>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (user) {
                              toggleFavorite(dest.id);
                            } else {
                              navigate('/login');
                            }
                          }}
                          className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 hover:bg-white transition-all shadow-lg"
                          title={user ? 'Simpan favorit' : 'Login untuk bookmark'}
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
                      <div className="flex-1 py-4 pr-4 min-w-0">
                        <h3 className="text-sm font-bold mb-1 text-gray-800">{dest.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{dest.region}</span>
                          </div>
                          {avgRating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium text-gray-700">
                                {avgRating.toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-400">({reviewCount})</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                          {dest.description}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs border-gray-200 bg-white/50">
                            {dest.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-gray-200 bg-white/50">
                            {dest.weather.temperature}°C
                          </Badge>
                          <Badge variant="outline" className="text-xs border-gray-200 bg-white/50">
                            Polusi: {dest.ecoStatus.pollutionLevel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}