import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useDestinations } from "../../contexts/DestinationsContext";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useReviews } from "../../contexts/ReviewsContext";
import { useGallery } from "../../contexts/GalleryContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationsContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ImageUpload } from "../ui/image-upload";
import { EnvironmentalIndicator } from "../ui/environmental-indicator";
import { EnvironmentalGauge } from "../ui/environmental-gauge";
import {
  ArrowLeft,
  MapPin,
  Cloud,
  Droplets,
  Thermometer,
  AlertTriangle,
  Leaf,
  Fish,
  Flame,
  TrendingUp,
  CheckCircle2,
  Heart,
  Star,
  Send,
  Camera,
  Upload,
  LogIn,
  Lock
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { toast } from "sonner";

export function DestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getReviewsByDestination, getAverageRating, addReview, getUserReview } = useReviews();
  const { getImagesByDestination, addImage } = useGallery();
  const { addNotification } = useNotifications();

  const { destinations } = useDestinations();
  const destination = destinations.find(d => d.id === id);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [realTimeWeather, setRealTimeWeather] = useState<{
    temperature: number;
    humidity: number;
    condition: string;
    windSpeed: number;
    windDir: string;
    visibility: string;
    iconUrl: string;
    forecasts: Array<{ datetime: string; temp: number; humidity: number; condition: string; iconUrl: string }>;
    loading: boolean;
    source: string;
  } | null>(null);

  const [ecosystemData, setEcosystemData] = useState<{
    protectedAreas: Array<{ name: string; type: string }>;
    natureFeatures: number;
    loading: boolean;
  }>({ protectedAreas: [], natureFeatures: 0, loading: true });

  // Fetch real-time weather from BMKG API
  useEffect(() => {
    if (!destination) return;
    setRealTimeWeather({
      temperature: 0, humidity: 0, condition: "Loading...",
      windSpeed: 0, windDir: "", visibility: "", iconUrl: "",
      forecasts: [], loading: true, source: ""
    });

    const kode = destination.kodeWilayah;
    if (kode) {
      fetch(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${kode}`)
        .then(r => r.json())
        .then(data => {
          const allCuaca = data?.data?.[0]?.cuaca?.flat() ?? [];
          const now = new Date();
          // Find the closest forecast entry to current time
          let closest = allCuaca[0];
          let closestDiff = Infinity;
          for (const c of allCuaca) {
            const diff = Math.abs(new Date(c.utc_datetime.replace(' ', 'T') + 'Z').getTime() - now.getTime());
            if (diff < closestDiff) { closestDiff = diff; closest = c; }
          }

          // Get next 8 forecast entries for the forecast view
          const nowIdx = allCuaca.indexOf(closest);
          const futureForecasts = allCuaca.slice(nowIdx, nowIdx + 8).map((c: any) => ({
            datetime: c.local_datetime,
            temp: c.t,
            humidity: c.hu,
            condition: c.weather_desc,
            iconUrl: c.image || ''
          }));

          setRealTimeWeather({
            temperature: closest.t,
            humidity: closest.hu,
            condition: closest.weather_desc,
            windSpeed: closest.ws,
            windDir: closest.wd,
            visibility: closest.vs_text || '',
            iconUrl: closest.image || '',
            forecasts: futureForecasts,
            loading: false,
            source: 'BMKG'
          });
        })
        .catch(() => {
          setRealTimeWeather({
            temperature: destination.weather.temperature,
            humidity: destination.weather.humidity,
            condition: destination.weather.condition,
            windSpeed: 0, windDir: '', visibility: '', iconUrl: '',
            forecasts: [], loading: false, source: 'Database'
          });
        });
    } else {
      setRealTimeWeather({
        temperature: destination.weather.temperature,
        humidity: destination.weather.humidity,
        condition: destination.weather.condition,
        windSpeed: 0, windDir: '', visibility: '', iconUrl: '',
        forecasts: [], loading: false, source: 'Database'
      });
    }
  }, [destination]);

  // Fetch ecosystem data from Overpass API (OpenStreetMap)
  useEffect(() => {
    if (!destination) return;
    setEcosystemData({ protectedAreas: [], natureFeatures: 0, loading: true });

    const lat = destination.latitude;
    const lon = destination.longitude;
    const radius = 10000; // 10km radius

    const query = `[out:json][timeout:15];(
      nwr["boundary"="protected_area"](around:${radius},${lat},${lon});
      nwr["leisure"="nature_reserve"](around:${radius},${lat},${lon});
      nwr["boundary"="national_park"](around:${radius},${lat},${lon});
      nwr["natural"](around:${radius},${lat},${lon});
    );out tags;`;

    fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`
    })
      .then(r => r.json())
      .then(data => {
        const elements = data.elements || [];
        const areas = elements
          .filter((e: any) => e.tags?.name && (e.tags?.boundary || e.tags?.leisure === 'nature_reserve'))
          .map((e: any) => ({
            name: e.tags.name,
            type: e.tags.boundary === 'national_park' ? 'Taman Nasional'
              : e.tags.boundary === 'protected_area' ? 'Area Lindung'
              : e.tags.leisure === 'nature_reserve' ? 'Cagar Alam'
              : 'Kawasan'
          }))
          .filter((v: any, i: number, s: any[]) => s.findIndex(x => x.name === v.name) === i) // unique
          .slice(0, 5);
        const natureCount = elements.filter((e: any) => e.tags?.natural).length;
        setEcosystemData({ protectedAreas: areas, natureFeatures: natureCount, loading: false });
      })
      .catch(() => {
        setEcosystemData({ protectedAreas: [], natureFeatures: 0, loading: false });
      });
  }, [destination]);

  if (!destination) {
    return null;
  }

  const reviews = getReviewsByDestination(destination.id);
  const avgRating = getAverageRating(destination.id);
  const userReview = user ? getUserReview(destination.id, user.id) : null;
  const galleryImages = getImagesByDestination(destination.id);

  const handleSubmitReview = () => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu");
      return;
    }

    if (userReview) {
      toast.error("Anda sudah memberikan review untuk destinasi ini");
      return;
    }

    if (!comment.trim()) {
      toast.error("Silakan tulis komentar Anda");
      return;
    }

    addReview({
      destinationId: destination.id,
      userId: user.id,
      userName: user.name,
      rating,
      comment: comment.trim(),
    });

    // Kirim notifikasi ke admin
    addNotification({
      destinationId: destination.id,
      destinationName: destination.name,
      type: "info",
      title: "Review Baru",
      message: `${user.name} memberikan review ${rating}⭐ untuk ${destination.name}: "${comment.trim().slice(0, 80)}${comment.trim().length > 80 ? '...' : ''}"`,
      target: "admin",
    });

    toast.success("Review berhasil ditambahkan!");
    setComment("");
    setRating(5);
  };

  const handleImageUpload = (imageUrl: string) => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu");
      return;
    }

    addImage({
      destinationId: destination.id,
      userId: user.id,
      userName: user.name,
      imageUrl,
    });
  };

  // Convert environmental data to percentage values for visualization
  const getPollutionPercentage = (level: string) => {
    switch (level) {
      case "rendah":
        return 25;
      case "sedang":
        return 60;
      case "tinggi":
        return 90;
      default:
        return 0;
    }
  };

  const getConditionPercentage = (condition?: string) => {
    if (!condition) return 0;
    switch (condition) {
      case "baik":
        return 90;
      case "sedang":
        return 60;
      case "buruk":
        return 25;
      default:
        return 0;
    }
  };

  const getSafetyPercentage = (level: string) => {
    switch (level) {
      case "aman":
        return 90;
      case "hati-hati":
        return 60;
      case "berbahaya":
        return 25;
      default:
        return 0;
    }
  };

  if (!destination) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Destinasi tidak ditemukan</p>
          <Button onClick={() => navigate("/")}>Kembali ke Beranda</Button>
        </div>
      </div>
    );
  }

  // Simple alternative destinations from real context
  const alternatives = destinations
    .filter(d => d.id !== destination.id && d.category === destination.category && d.ecoStatus.safetyLevel === "aman")
    .slice(0, 3);

  const getSafetyColor = (level: string) => {
    switch (level) {
      case "aman": return "bg-green-100 text-green-800 border-green-200";
      case "hati-hati": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "berbahaya": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPollutionColor = (level: string) => {
    switch (level) {
      case "rendah": return "text-green-600";
      case "sedang": return "text-yellow-600";
      case "tinggi": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getConditionColor = (condition?: string) => {
    if (!condition) return "text-gray-600";
    switch (condition) {
      case "baik": return "text-green-600";
      case "sedang": return "text-yellow-600";
      case "buruk": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Hero Image */}
      <div className="relative h-64">
        <ImageWithFallback
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            if (user) {
              toggleFavorite(destination.id);
            } else {
              navigate('/login');
            }
          }}
          className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg"
          title={user ? 'Simpan ke favorit' : 'Login untuk bookmark'}
        >
          <Heart
            className={`w-5 h-5 ${
              user && isFavorite(destination.id)
                ? "fill-red-500 text-red-500"
                : "text-gray-600"
            }`}
          />
        </button>

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="text-2xl mb-2">{destination.name}</h1>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{destination.region}</span>
            </div>
            {avgRating > 0 && (
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Status Card */}
        <Card className={`border-2 ${getSafetyColor(destination.ecoStatus.safetyLevel)}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs mb-1">Status Keamanan</p>
                <p className="text-lg uppercase">{destination.ecoStatus.safetyLevel}</p>
              </div>
              {destination.ecoStatus.safetyLevel === "aman" ? (
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-700 leading-relaxed">{destination.description}</p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                <span className="font-semibold text-gray-700">Kategori:</span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {destination.category}
                </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Gallery Section */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Camera className="w-5 h-5" />
                Galeri Foto ({galleryImages.length})
              </CardTitle>
              {user && (
                <Button
                  size="sm"
                  onClick={() => setShowUpload(!showUpload)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {showUpload && user && (
              <div className="mb-4">
                <ImageUpload
                  onImageUpload={handleImageUpload}
                  maxImages={3}
                />
              </div>
            )}

            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {galleryImages.slice(0, 9).map((img) => (
                  <div key={img.id} className="aspect-square rounded-lg overflow-hidden border-2 border-white shadow-md">
                    <img
                      src={img.imageUrl}
                      alt={`Foto oleh ${img.userName}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500">Belum ada foto</p>
                <p className="text-xs text-gray-400 mt-1">Bagikan momen Anda di sini!</p>
              </div>
            )}

            {galleryImages.length > 9 && (
              <button className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                Lihat Semua Foto ({galleryImages.length})
              </button>
            )}
          </CardContent>
        </Card>

        {/* Weather Info - BMKG */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Prakiraan Cuaca (SDG 13)
              </span>
              {realTimeWeather?.source && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  Sumber: {realTimeWeather.source}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current weather */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl p-4 flex items-center gap-4">
                {realTimeWeather?.iconUrl ? (
                  <img src={realTimeWeather.iconUrl} alt="weather" className="w-14 h-14" />
                ) : (
                  <Cloud className="w-14 h-14 text-blue-500" />
                )}
                <div>
                  <p className="text-3xl font-bold text-slate-800">
                    {realTimeWeather?.loading ? "..." : `${realTimeWeather?.temperature ?? destination.weather.temperature}°C`}
                  </p>
                  <p className="text-sm text-slate-600">
                    {realTimeWeather?.loading ? "..." : (realTimeWeather?.condition ?? destination.weather.condition)}
                  </p>
                </div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Kelembaban</p>
                <p className="text-sm font-semibold">{realTimeWeather?.loading ? "..." : `${realTimeWeather?.humidity ?? destination.weather.humidity}%`}</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Angin</p>
                <p className="text-sm font-semibold">{realTimeWeather?.loading ? "..." : realTimeWeather?.windSpeed ? `${realTimeWeather.windSpeed} km/j ${realTimeWeather.windDir}` : '-'}</p>
              </div>
            </div>

            {/* BMKG Forecast */}
            {realTimeWeather?.forecasts && realTimeWeather.forecasts.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Prakiraan 3 Hari ke Depan</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {realTimeWeather.forecasts.map((fc, idx) => (
                    <div key={idx} className="flex-shrink-0 w-20 bg-gradient-to-b from-sky-50 to-blue-50 rounded-xl p-2.5 text-center border border-blue-100">
                      {fc.iconUrl ? (
                        <img src={fc.iconUrl} alt="" className="w-8 h-8 mx-auto mb-1" />
                      ) : (
                        <Cloud className="w-8 h-8 text-blue-400 mx-auto mb-1" />
                      )}
                      <p className="text-xs font-bold text-slate-700">{fc.temp}°C</p>
                      <p className="text-[10px] text-gray-500 truncate">{fc.condition}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {fc.datetime ? new Date(fc.datetime.replace(' ', 'T')).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : ''}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {fc.datetime ? new Date(fc.datetime.replace(' ', 'T')).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {destination.weather.warning && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-800">{destination.weather.warning}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ecosystem Status - Enhanced Visualization */}
        <Card className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-emerald-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Leaf className="w-5 h-5 text-emerald-600" />
              Status Ekosistem (SDG 14, 15)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Safety Status Gauge */}
            <div className="mb-4">
              <EnvironmentalGauge
                value={getSafetyPercentage(destination.ecoStatus.safetyLevel)}
                label="Status Keamanan"
                level={destination.ecoStatus.safetyLevel}
                icon={destination.ecoStatus.safetyLevel === "aman" ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                unit="%"
              />
            </div>

            {/* Pollution Indicator */}
            <EnvironmentalIndicator
              icon={Leaf}
              label="Tingkat Polusi"
              value={destination.ecoStatus.pollutionLevel}
              level={destination.ecoStatus.pollutionLevel}
              progress={getPollutionPercentage(destination.ecoStatus.pollutionLevel)}
            />

            {/* Coral Reef Condition */}
            {destination.ecoStatus.coralReefCondition && (
              <EnvironmentalIndicator
                icon={Fish}
                label="Kondisi Terumbu Karang"
                value={destination.ecoStatus.coralReefCondition}
                level={destination.ecoStatus.coralReefCondition}
                progress={getConditionPercentage(destination.ecoStatus.coralReefCondition)}
              />
            )}

            {/* Forest Fire Risk */}
            {destination.ecoStatus.forestFireRisk && (
              <EnvironmentalIndicator
                icon={Flame}
                label="Risiko Kebakaran Hutan"
                value={destination.ecoStatus.forestFireRisk}
                level={destination.ecoStatus.forestFireRisk}
                progress={getPollutionPercentage(destination.ecoStatus.forestFireRisk)}
              />
            )}
          </CardContent>
        </Card>

        {/* Ecosystem Data from Overpass API (OpenStreetMap) */}
        <Card className="border-teal-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                Data Ekosistem Sekitar
              </span>
              <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">
                OpenStreetMap
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ecosystemData.loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
              </div>
            ) : (
              <>
                {ecosystemData.protectedAreas.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Kawasan Lindung Terdekat</p>
                    <div className="space-y-2">
                      {ecosystemData.protectedAreas.map((area, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-teal-50 rounded-xl px-4 py-2.5 border border-teal-100">
                          <Leaf className="w-4 h-4 text-teal-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-teal-800">{area.name}</p>
                            <p className="text-xs text-teal-600">{area.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <p className="text-sm font-semibold text-emerald-800">
                    {ecosystemData.natureFeatures > 0
                      ? `${ecosystemData.natureFeatures} fitur alam terdeteksi dalam radius 10 km`
                      : 'Tidak ada fitur alam khusus terdeteksi di area sekitar'
                    }
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">Data bersumber dari kontributor OpenStreetMap</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Alternative Recommendations */}
        {destination.ecoStatus.safetyLevel !== "aman" && alternatives.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5" />
                Rekomendasi Alternatif Aman
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 mb-3">
                Destinasi serupa dengan status lingkungan yang lebih aman:
              </p>
              {alternatives.map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => navigate(`/destination/${alt.id}`)}
                  className="flex gap-3 p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={alt.image}
                      alt={alt.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm mb-1">{alt.name}</h4>
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                      <MapPin className="w-3 h-3" />
                      <span>{alt.region}</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Status: {alt.ecoStatus.safetyLevel}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                Review & Rating
              </CardTitle>
              {avgRating > 0 && (
                <div className="text-right">
                  <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">{reviews.length} review</div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Review Form - Login required */}
            {!user ? (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100 text-center">
                <Lock className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-800 mb-1">Login untuk Memberikan Review</p>
                <p className="text-xs text-gray-500 mb-4">Bergabung dan bagikan pengalamanmu!</p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('/login')}>
                    <LogIn className="w-4 h-4 mr-1" /> Masuk
                  </Button>
                  <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700" onClick={() => navigate('/register')}>
                    Daftar Gratis
                  </Button>
                </div>
              </div>
            ) : !userReview ? (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm font-medium mb-3 text-gray-800">Berikan Review Anda</p>

                {/* Star Rating */}
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoveredStar || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <Textarea
                  placeholder="Ceritakan pengalaman Anda..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mb-3 bg-white"
                  rows={3}
                />

                <Button
                  onClick={handleSubmitReview}
                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Kirim Review
                </Button>
              </div>
            ) : null}

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm text-gray-800">
                          {review.userName}
                        </p>
                        <div className="flex gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Belum ada review</p>
                <p className="text-xs mt-1">Jadilah yang pertama memberikan review!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View on Map Button */}
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          onClick={() => navigate("/map")}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Lihat di Peta
        </Button>
      </div>
    </div>
  );
}
