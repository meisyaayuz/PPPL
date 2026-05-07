import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import { Button } from "../ui/button";
import {
  Map, Sun, Leaf, ArrowRight, Lock, MapPin, Thermometer,
  Droplets, Shield, AlertTriangle, CheckCircle2, LogIn, X
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Destination {
  id: string;
  name: string;
  region: string;
  category: string;
  latitude: number;
  longitude: number;
  description: string;
  image: string;
  ecoStatus: { safetyLevel: string; pollutionLevel: string };
  weather: { temperature: number; condition: string; humidity: number };
  geoJson?: any;
}

interface WeatherPreview {
  temp: number;
  humidity: number;
  condition: string;
  loading: boolean;
}

export function Landing() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [weatherPreviews, setWeatherPreviews] = useState<Record<string, WeatherPreview>>({});

  // Featured destinations to show weather for (first 4 from API)
  const featuredDests = destinations.slice(0, 4);

  useEffect(() => {
    fetch('/api/destinasis')
      .then(r => r.json())
      .then((data: any[]) => {
        const mapped: Destination[] = data.map(item => ({
          id: item.id.toString(),
          name: item.nama,
          region: item.region || '',
          category: item.kategori,
          latitude: parseFloat(item.latitude),
          longitude: parseFloat(item.longitude),
          description: item.deskripsi,
          image: item.gambar,
          ecoStatus: item.eco_status || { safetyLevel: 'aman', pollutionLevel: 'rendah' },
          weather: item.weather || { temperature: 28, condition: 'Cerah', humidity: 75 },
          geoJson: item.geo_json || null,
          kodeWilayah: item.kode_wilayah || null
        }));
        setDestinations(mapped);
      })
      .catch(() => {});
  }, []);

  // Fetch real-time weather from BMKG API for featured destinations
  useEffect(() => {
    featuredDests.forEach(dest => {
      if (weatherPreviews[dest.id]) return;
      const kode = (dest as any).kodeWilayah;
      if (!kode) {
        setWeatherPreviews(prev => ({
          ...prev,
          [dest.id]: { temp: dest.weather.temperature, humidity: dest.weather.humidity, condition: dest.weather.condition, loading: false }
        }));
        return;
      }
      setWeatherPreviews(prev => ({ ...prev, [dest.id]: { temp: 0, humidity: 0, condition: '...', loading: true } }));
      fetch(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${kode}`)
        .then(r => r.json())
        .then(data => {
          const allCuaca = data?.data?.[0]?.cuaca?.flat() ?? [];
          const now = new Date();
          let closest = allCuaca[0];
          let closestDiff = Infinity;
          for (const c of allCuaca) {
            const diff = Math.abs(new Date(c.utc_datetime.replace(' ', 'T') + 'Z').getTime() - now.getTime());
            if (diff < closestDiff) { closestDiff = diff; closest = c; }
          }
          if (closest) {
            setWeatherPreviews(prev => ({
              ...prev,
              [dest.id]: { temp: closest.t, humidity: closest.hu, condition: closest.weather_desc, loading: false }
            }));
          }
        })
        .catch(() => {
          setWeatherPreviews(prev => ({
            ...prev,
            [dest.id]: { temp: dest.weather.temperature, humidity: dest.weather.humidity, condition: dest.weather.condition, loading: false }
          }));
        });
    });
  }, [destinations]);

  const getSafetyBadge = (level: string) => {
    if (level === 'aman') return { color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Aman' };
    if (level === 'hati-hati') return { color: 'bg-yellow-100 text-yellow-700', icon: <AlertTriangle className="w-3 h-3" />, label: 'Hati-hati' };
    return { color: 'bg-red-100 text-red-700', icon: <AlertTriangle className="w-3 h-3" />, label: 'Berbahaya' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/50 to-teal-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="w-full py-5 px-6 sm:px-12 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-xl border-b border-emerald-100/50 shadow-sm" style={{ zIndex: 9000 }}>
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow-lg">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-800">
            GreenTour.Id
          </span>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" className="hidden sm:flex text-emerald-800 hover:text-emerald-900 hover:bg-emerald-100/50 rounded-full px-6" onClick={() => navigate('/login')}>
            Masuk
          </Button>
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full px-6 shadow-md hover:shadow-xl transition-all duration-300" onClick={() => navigate('/register')}>
            Daftar Sekarang
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-200/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <span className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full shadow-sm">
          ✨ Jelajahi Keajaiban Nusantara
        </span>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight max-w-4xl">
          Eksplorasi Alam Indonesia<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
            Lebih Cerdas & Lestari
          </span>
        </h1>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl leading-relaxed">
          Platform pemetaan interaktif yang memandumu mencari destinasi pariwisata, memantau kondisi iklim dan kelestarian ekosistem Indonesia.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl px-8 h-14 text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group" onClick={() => navigate('/register')}>
            Mulai Petualangan
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button size="lg" variant="outline" className="rounded-2xl px-8 h-14 text-lg border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-all duration-300" onClick={() => navigate('/login')}>
            Sudah Punya Akun?
          </Button>
        </div>
      </section>

      {/* ─── SECTION 1: PETA INTERAKTIF ─── */}
      <section className="px-6 sm:px-12 pb-16">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            icon={<Map className="w-6 h-6 text-emerald-600" />}
            label="Peta Interaktif GIS"
            title="Visualisasi Destinasi di Seluruh Indonesia"
            subtitle="Lihat persebaran destinasi wisata, biota, dan ekosistem. Login untuk melihat detail, rute, dan area polygon."
          />
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-100" style={{ height: 400, isolation: 'isolate' }}>
            {destinations.length > 0 ? (
              <MapContainer center={[-2.5, 118]} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {destinations.map(dest => (
                  <Marker key={dest.id} position={[dest.latitude, dest.longitude]}>
                    <Popup>
                      <div className="text-sm font-semibold mb-1">{dest.name}</div>
                      <div className="text-xs text-gray-500 mb-2">{dest.region}</div>
                      <button
                        className="w-full text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-600 transition"
                        onClick={() => navigate(`/destination/${dest.id}`)}
                      >
                        Lihat Detail →
                      </button>
                    </Popup>
                  </Marker>
                ))}
                {destinations.map(dest => dest.geoJson && (
                  <GeoJSON key={`geo-${dest.id}`} data={dest.geoJson} style={{ color: '#10b981', weight: 2, fillOpacity: 0.15 }} />
                ))}
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-emerald-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
              </div>
            )}
            {/* Overlay CTA */}
            <div className="absolute bottom-4 right-4 z-[1000]">
              <button onClick={() => setShowLoginPrompt(true)} className="flex items-center gap-2 bg-white/95 backdrop-blur-sm shadow-xl border border-emerald-100 text-emerald-700 font-semibold text-sm px-4 py-2.5 rounded-2xl hover:bg-emerald-50 transition">
                <Lock className="w-4 h-4" />
                Buka Fitur Penuh →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: CUACA REAL-TIME ─── */}
      <section className="px-6 sm:px-12 pb-16 bg-gradient-to-br from-sky-50 to-blue-50/50 py-16">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            icon={<Sun className="w-6 h-6 text-amber-500" />}
            label="Cuaca Real-time (SDG 13)"
            title="Pantau Iklim Destinasi Favoritmu"
            subtitle="Data suhu dan kelembaban diambil langsung dari API BMKG. Klik untuk melihat prakiraan 3 hari ke depan."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredDests.length > 0 ? featuredDests.map(dest => {
              const w = weatherPreviews[dest.id];
              return (
                <div key={dest.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-800 text-sm leading-tight">{dest.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{dest.region}</p>
                    </div>
                    <div className="text-2xl">
                      {w?.condition === 'Cerah' ? '☀️' : w?.condition === 'Berawan' ? '⛅' : w?.condition === 'Hujan' ? '🌧️' : w?.condition === 'Kabut' ? '🌫️' : '⛈️'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold text-slate-700">{w?.loading ? '...' : `${w?.temp ?? dest.weather.temperature}°C`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-slate-600">{w?.loading ? '...' : `${w?.humidity ?? dest.weather.humidity}%`}</span>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/destination/${dest.id}`)} className="mt-auto flex items-center justify-center gap-1.5 w-full text-xs text-emerald-600 font-semibold border border-emerald-200 rounded-xl py-2 hover:bg-emerald-50 transition">
                    Prediksi 7 Hari →
                  </button>
                </div>
              );
            }) : (
              Array.from({length: 4}).map((_, i) => (
                <div key={i} className="bg-white/80 rounded-2xl p-5 border border-blue-100 shadow-lg animate-pulse h-44" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: ANALISIS EKOSISTEM ─── */}
      <section className="px-6 sm:px-12 py-16 pb-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            icon={<Leaf className="w-6 h-6 text-teal-600" />}
            label="Analisis Ekosistem"
            title="Status Lingkungan Destinasi Indonesia"
            subtitle="Pantau tingkat polusi dan keamanan ekosistem. Login untuk filter detail per destinasi."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { label: 'Aman', color: 'from-green-400 to-emerald-500', bg: 'bg-green-50 border-green-100', icon: <CheckCircle2 className="w-8 h-8 text-green-500" />, count: destinations.filter(d => d.ecoStatus.safetyLevel === 'aman').length },
              { label: 'Hati-hati', color: 'from-yellow-400 to-amber-500', bg: 'bg-yellow-50 border-yellow-100', icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />, count: destinations.filter(d => d.ecoStatus.safetyLevel === 'hati-hati').length },
              { label: 'Berbahaya', color: 'from-red-400 to-rose-500', bg: 'bg-red-50 border-red-100', icon: <AlertTriangle className="w-8 h-8 text-red-500" />, count: destinations.filter(d => d.ecoStatus.safetyLevel === 'berbahaya').length },
            ].map(item => (
              <div key={item.label} className={`${item.bg} border rounded-3xl p-6 flex items-center gap-5 shadow-lg hover:shadow-xl transition-all duration-300`}>
                <div className="flex-shrink-0">{item.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600">Status {item.label}</p>
                  <p className="text-4xl font-extrabold text-slate-800">{destinations.length > 0 ? item.count : '–'}</p>
                  <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${item.color} rounded-full`} style={{ width: destinations.length > 0 ? `${(item.count / destinations.length) * 100}%` : '0%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Destination cards preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {destinations.slice(0, 6).map(dest => {
              const badge = getSafetyBadge(dest.ecoStatus.safetyLevel);
              return (
                <div key={dest.id} className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-36 overflow-hidden">
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className={`absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                      {badge.icon}{badge.label}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-800 text-sm mb-0.5 truncate">{dest.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-3"><MapPin className="w-3 h-3" />{dest.region}</p>
                    <button onClick={() => navigate(`/destination/${dest.id}`)} className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 border border-emerald-200 rounded-xl py-2 hover:bg-emerald-50 transition">
                      Lihat Detail Ekosistem →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {destinations.length > 6 && (
            <div className="text-center mt-8">
              <button onClick={() => navigate('/search')} className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold px-8 py-3 rounded-2xl hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300">
                Lihat Semua {destinations.length} Destinasi <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm border-t border-slate-100 bg-white/50">
        © {new Date().getFullYear()} GreenTour.Id. Hak Cipta Dilindungi.
      </footer>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLoginPrompt(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
            <button onClick={() => setShowLoginPrompt(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1.5 hover:bg-gray-200 transition">
              <X className="w-4 h-4" />
            </button>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Akses Terbatas</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Fitur detail hanya tersedia untuk pengguna terdaftar. Daftar gratis dan jelajahi seluruh fitur GreenTour.Id!
            </p>
            <div className="flex flex-col gap-3">
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl h-12 font-semibold" onClick={() => navigate('/register')}>
                Daftar Gratis Sekarang
              </Button>
              <Button variant="outline" className="w-full rounded-xl h-12 font-semibold border-emerald-200 text-emerald-700" onClick={() => navigate('/login')}>
                <LogIn className="w-4 h-4 mr-2" />
                Sudah Punya Akun? Masuk
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ icon, label, title, subtitle }: { icon: React.ReactNode; label: string; title: string; subtitle: string }) {
  return (
    <div className="text-center mb-10">
      <div className="inline-flex items-center gap-2 bg-white border border-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full shadow-sm mb-4">
        {icon}{label}
      </div>
      <h2 className="text-3xl font-extrabold text-slate-900 mb-3">{title}</h2>
      <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">{subtitle}</p>
    </div>
  );
}
