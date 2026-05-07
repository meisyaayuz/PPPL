import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import { Destination } from "../../data/mockData";
import { useDestinations } from "../../contexts/DestinationsContext";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { X } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export function Map() {
  const navigate = useNavigate();
  const { destinations, loading, error } = useDestinations();
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  
  // Center of Indonesia
  const centerPosition: [number, number] = [-2.5, 118.0];

  const getSafetyColor = (level: string) => {
    switch (level) {
      case "aman": return "bg-green-100 text-green-800";
      case "hati-hati": return "bg-yellow-100 text-yellow-800";
      case "berbahaya": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white px-6 py-6 flex-shrink-0 shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Peta Interaktif</h1>
            <p className="text-sm text-emerald-100 mt-1">Jelajahi destinasi wisata Indonesia</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/30 transition"
          >
            Login
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        )}
        
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-100 text-red-800 px-4 py-2 rounded-lg shadow-lg">
            {error}
          </div>
        )}

        <MapContainer
          center={centerPosition}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {destinations.map((dest) => (
            <Marker
              key={dest.id}
              position={[dest.latitude, dest.longitude]}
              eventHandlers={{
                click: () => setSelectedDest(dest),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <h3 className="font-semibold mb-1">{dest.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{dest.region}</p>
                  <Badge className={getSafetyColor(dest.ecoStatus.safetyLevel)}>
                    {dest.ecoStatus.safetyLevel}
                  </Badge>
                </div>
              </Popup>
            </Marker>
          ))}
          {destinations.map((dest) => (
            dest.geoJson && (
              <GeoJSON
                key={`geo-${dest.id}`}
                data={dest.geoJson}
                style={{
                  color: "#10b981",
                  weight: 2,
                  opacity: 0.8,
                  fillColor: "#10b981",
                  fillOpacity: 0.2
                }}
                eventHandlers={{
                  click: () => setSelectedDest(dest)
                }}
              />
            )
          ))}
        </MapContainer>

        {/* Selected Destination Card */}
        {selectedDest && (
          <div className="absolute bottom-24 left-0 right-0 px-4 z-[1000]">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="flex gap-4 p-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                    <img
                      src={selectedDest.image}
                      alt={selectedDest.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-gray-800">{selectedDest.name}</h3>
                      <button
                        onClick={() => setSelectedDest(null)}
                        className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1 hover:bg-gray-200 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{selectedDest.region}</p>
                    <div className="flex gap-2 mb-3">
                      <Badge className={getSafetyColor(selectedDest.ecoStatus.safetyLevel)}>
                        {selectedDest.ecoStatus.safetyLevel}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-white/50 border-gray-200">
                        {selectedDest.weather.temperature}°C
                      </Badge>
                    </div>
                    <button
                      onClick={() => navigate(`/destination/${selectedDest.id}`)}
                      className="w-full text-sm text-white font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-4 py-2.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Lihat Detail →
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}