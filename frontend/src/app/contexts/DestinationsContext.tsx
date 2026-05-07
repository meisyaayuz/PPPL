import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Destination } from '../data/mockData';

interface DestinationsContextType {
  destinations: Destination[];
  loading: boolean;
  error: string | null;
  refreshDestinations: () => Promise<void>;
}

const DestinationsContext = createContext<DestinationsContextType | undefined>(undefined);

export function DestinationsProvider({ children }: { children: ReactNode }) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/destinasis');
      if (!response.ok) throw new Error('Gagal mengambil data destinasi dari server');
      
      const data = await response.json();
      
      const mappedData: Destination[] = data.map((item: any) => ({
        id: item.id.toString(),
        name: item.nama,
        region: item.region || 'Unknown Region',
        category: item.kategori,
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude),
        description: item.deskripsi,
        image: item.gambar,
        ecoStatus: item.eco_status || {
          pollutionLevel: 'sedang',
          safetyLevel: 'hati-hati'
        },
        weather: item.weather || {
          temperature: 0,
          condition: 'Unknown',
          humidity: 0
        },
        geoJson: item.geo_json || null,
        kodeWilayah: item.kode_wilayah || null
      }));
      
      setDestinations(mappedData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  return (
    <DestinationsContext.Provider value={{ destinations, loading, error, refreshDestinations: fetchDestinations }}>
      {children}
    </DestinationsContext.Provider>
  );
}

export function useDestinations() {
  const context = useContext(DestinationsContext);
  if (context === undefined) {
    throw new Error('useDestinations must be used within a DestinationsProvider');
  }
  return context;
}
