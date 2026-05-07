import { useState, useRef } from "react";
import { MapContainer, TileLayer, FeatureGroup, GeoJSON } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { Button } from "../ui/button";

interface MapEditorProps {
  initialGeoJson?: any;
  onSave: (geoJson: any) => void;
  onCancel: () => void;
  center?: [number, number];
}

export function MapEditor({ initialGeoJson, onSave, onCancel, center = [-2.5, 118.0] }: MapEditorProps) {
  const [geoJson, setGeoJson] = useState<any>(initialGeoJson);
  const featureGroupRef = useRef<any>(null);

  const _onEdited = (e: any) => {
    const layers = e.layers;
    let newGeoJson = geoJson ? { ...geoJson } : { type: "FeatureCollection", features: [] };
    
    // In a real app, you'd match the edited layers to the geojson features
    // For simplicity, we just grab everything from the feature group
    if (featureGroupRef.current) {
      newGeoJson = featureGroupRef.current.toGeoJSON();
    }
    setGeoJson(newGeoJson);
  };

  const _onCreated = (e: any) => {
    if (featureGroupRef.current) {
      const currentGeoJson = featureGroupRef.current.toGeoJSON();
      setGeoJson(currentGeoJson);
    }
  };

  const _onDeleted = (e: any) => {
    if (featureGroupRef.current) {
      const currentGeoJson = featureGroupRef.current.toGeoJSON();
      setGeoJson(currentGeoJson);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full rounded-xl overflow-hidden border">
      <div className="flex justify-between items-center bg-white p-3 border-b z-10">
        <h3 className="font-semibold text-gray-700">Gambar Area Destinasi (Polygon/Polyline)</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>Batal</Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onSave(geoJson)}>
            Simpan Area
          </Button>
        </div>
      </div>
      <div className="flex-1 relative">
        <MapContainer
          center={center}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FeatureGroup ref={featureGroupRef}>
            <EditControl
              position="topright"
              onEdited={_onEdited}
              onCreated={_onCreated}
              onDeleted={_onDeleted}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: true,
                polyline: true,
                polygon: true,
              }}
            />
            {initialGeoJson && <GeoJSON data={initialGeoJson} />}
          </FeatureGroup>
        </MapContainer>
      </div>
    </div>
  );
}
