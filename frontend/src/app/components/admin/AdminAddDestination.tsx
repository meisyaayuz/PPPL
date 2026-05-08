import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { MapContainer, TileLayer, FeatureGroup, Marker, Popup, useMapEvents } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowLeft, MapPin, Save, Image, Layers, Info } from "lucide-react";
import { toast } from "sonner";
import { useDestinations } from "../../contexts/DestinationsContext";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const KATEGORI_OPTIONS = [
  "Pariwisata",
  "Biota Laut",
  "Biota Darat",
  "Flora Fauna",
];

const REGION_OPTIONS = [
  "Sumatera",
  "Jawa",
  "Bali",
  "Nusa Tenggara",
  "Kalimantan",
  "Sulawesi",
  "Maluku",
  "Papua",
];

// Component to handle click-to-place-marker on the map
function LocationPicker({ position, onLocationSelect }: {
  position: [number, number] | null;
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>
        <div className="text-sm">
          <strong>Lokasi Destinasi</strong><br />
          Lat: {position[0].toFixed(6)}<br />
          Lng: {position[1].toFixed(6)}
        </div>
      </Popup>
    </Marker>
  ) : null;
}

export function AdminAddDestination() {
  const navigate = useNavigate();
  const { refreshDestinations } = useDestinations();
  const featureGroupRef = useRef<any>(null);

  // Form state
  const [nama, setNama] = useState("");
  const [region, setRegion] = useState("Sumatera");
  const [kategori, setKategori] = useState("Pariwisata");
  const [deskripsi, setDeskripsi] = useState("");
  const [gambar, setGambar] = useState("");
  const [kodeWilayah, setKodeWilayah] = useState("");
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "map">("form");

  // Drawing event handlers
  const onCreated = (e: any) => {
    if (featureGroupRef.current) {
      const data = featureGroupRef.current.toGeoJSON();
      setGeoJsonData(data);
    }
  };

  const onEdited = (e: any) => {
    if (featureGroupRef.current) {
      const data = featureGroupRef.current.toGeoJSON();
      setGeoJsonData(data);
    }
  };

  const onDeleted = (e: any) => {
    if (featureGroupRef.current) {
      const data = featureGroupRef.current.toGeoJSON();
      setGeoJsonData(data.features.length > 0 ? data : null);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
  };

  const handleSubmit = async () => {
    // Validation
    if (!nama.trim()) {
      toast.error("Nama destinasi wajib diisi");
      return;
    }
    if (!deskripsi.trim()) {
      toast.error("Deskripsi wajib diisi");
      return;
    }
    if (!markerPosition) {
      toast.error("Klik pada peta untuk menentukan lokasi destinasi (marker)");
      setActiveTab("map");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("access_token");
      const payload: any = {
        nama: nama.trim(),
        region,
        kategori,
        deskripsi: deskripsi.trim(),
        latitude: markerPosition[0],
        longitude: markerPosition[1],
        gambar: gambar.trim() || null,
        kode_wilayah: kodeWilayah.trim() || null,
        geo_json: geoJsonData || null,
      };

      const response = await fetch("/api/destinasis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Destinasi berhasil ditambahkan!");
        await refreshDestinations();
        navigate("/admin");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Gagal menambahkan destinasi");
      }
    } catch (error) {
      toast.error("Gagal terhubung ke server");
    } finally {
      setSaving(false);
    }
  };

  const featureCount = geoJsonData?.features?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 text-white px-6 pt-8 pb-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate("/admin")}
            className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Tambah Destinasi Baru</h1>
            <p className="text-emerald-100 text-sm mt-1">Lengkapi informasi dan gambar area pada peta</p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="px-6 py-4">
        <div className="flex bg-white/60 backdrop-blur-xl rounded-2xl p-1.5 border border-white/30 shadow-lg">
          <button
            onClick={() => setActiveTab("form")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === "form"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Info className="w-4 h-4" />
            Informasi
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === "map"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            Peta & Area
            {(markerPosition || featureCount > 0) && (
              <Badge className="bg-white/30 text-white text-xs ml-1">
                {(markerPosition ? 1 : 0) + featureCount}
              </Badge>
            )}
          </button>
        </div>
      </div>

      <div className="px-6">
        {/* Form Tab */}
        {activeTab === "form" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <Card className="bg-white/70 backdrop-blur-xl border-white/30 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-gray-800">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  Data Destinasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nama" className="text-gray-700 text-sm">Nama Destinasi *</Label>
                  <Input
                    id="nama"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Danau Toba"
                    className="mt-1.5 h-11 rounded-xl border-gray-200 bg-white/80 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="region" className="text-gray-700 text-sm">Region</Label>
                    <select
                      id="region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="mt-1.5 w-full h-11 rounded-xl border border-gray-200 bg-white/80 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {REGION_OPTIONS.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="kategori" className="text-gray-700 text-sm">Kategori</Label>
                    <select
                      id="kategori"
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value)}
                      className="mt-1.5 w-full h-11 rounded-xl border border-gray-200 bg-white/80 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {KATEGORI_OPTIONS.map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="deskripsi" className="text-gray-700 text-sm">Deskripsi *</Label>
                  <textarea
                    id="deskripsi"
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    placeholder="Jelaskan destinasi ini..."
                    rows={3}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white/80 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="gambar" className="text-gray-700 text-sm flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5" />
                    URL Gambar
                  </Label>
                  <Input
                    id="gambar"
                    value={gambar}
                    onChange={(e) => setGambar(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="mt-1.5 h-11 rounded-xl border-gray-200 bg-white/80 focus:bg-white"
                  />
                  {gambar && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 h-32">
                      <img src={gambar} alt="Preview" className="w-full h-full object-cover" onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }} />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="kode_wilayah" className="text-gray-700 text-sm">Kode Wilayah BMKG (untuk data cuaca)</Label>
                  <Input
                    id="kode_wilayah"
                    value={kodeWilayah}
                    onChange={(e) => setKodeWilayah(e.target.value)}
                    placeholder="Contoh: 12.12.05.2001"
                    className="mt-1.5 h-11 rounded-xl border-gray-200 bg-white/80 focus:bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: XX.XX.XX.XXXX (kode adm4 dari BMKG)</p>
                </div>
              </CardContent>
            </Card>

            {/* Coordinate Preview */}
            {markerPosition && (
              <Card className="bg-emerald-50/80 backdrop-blur-xl border-emerald-200/50 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-800">Lokasi Terpilih</span>
                  </div>
                  <p className="text-sm text-emerald-700">
                    Lat: {markerPosition[0].toFixed(6)}, Lng: {markerPosition[1].toFixed(6)}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Feature Count */}
            {featureCount > 0 && (
              <Card className="bg-blue-50/80 backdrop-blur-xl border-blue-200/50 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      <strong>{featureCount}</strong> area (polygon/polyline/marker) telah digambar pada peta
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg"
              onClick={handleSubmit}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Menyimpan..." : "Simpan Destinasi"}
            </Button>
          </div>
        )}

        {/* Map Tab */}
        {activeTab === "map" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Instructions */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 shadow-lg">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Petunjuk Penggunaan Peta:</h3>
                <ul className="text-xs text-blue-800 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                    <span><strong>Klik pada peta</strong> untuk menempatkan <strong>Marker</strong> lokasi utama destinasi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                    <span>Gunakan tool <strong>Polygon</strong> (ikon segi banyak) di kanan atas untuk menandai area/daerah</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                    <span>Gunakan tool <strong>Polyline</strong> (ikon garis) untuk menggambar jalur/rute</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
                    <span>Gunakan tool <strong>Marker</strong> (ikon pin) di toolbar untuk menambah titik penting lainnya</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Map */}
            <Card className="bg-white/70 backdrop-blur-xl border-white/30 shadow-xl overflow-hidden">
              <div className="h-[500px] relative">
                <MapContainer
                  center={markerPosition || [-2.5, 118.0]}
                  zoom={markerPosition ? 12 : 5}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Click-to-place main marker */}
                  <LocationPicker
                    position={markerPosition}
                    onLocationSelect={handleLocationSelect}
                  />

                  {/* Drawing tools for Polygon, Polyline, extra Markers */}
                  <FeatureGroup ref={featureGroupRef}>
                    <EditControl
                      position="topright"
                      onCreated={onCreated}
                      onEdited={onEdited}
                      onDeleted={onDeleted}
                      draw={{
                        rectangle: false,
                        circle: false,
                        circlemarker: false,
                        marker: true,
                        polyline: true,
                        polygon: true,
                      }}
                    />
                  </FeatureGroup>
                </MapContainer>
              </div>
            </Card>

            {/* Status indicator */}
            <div className="flex gap-3">
              <div className={`flex-1 rounded-xl p-3 border text-center text-sm font-medium ${
                markerPosition
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-gray-50 border-gray-200 text-gray-500"
              }`}>
                <MapPin className="w-4 h-4 mx-auto mb-1" />
                {markerPosition ? "✓ Marker ditempatkan" : "Belum ada marker"}
              </div>
              <div className={`flex-1 rounded-xl p-3 border text-center text-sm font-medium ${
                featureCount > 0
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-gray-50 border-gray-200 text-gray-500"
              }`}>
                <Layers className="w-4 h-4 mx-auto mb-1" />
                {featureCount > 0 ? `✓ ${featureCount} area digambar` : "Belum ada area"}
              </div>
            </div>

            <Button
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg"
              onClick={handleSubmit}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Menyimpan..." : "Simpan Destinasi"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
