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
        ecoStatus: {
          pollutionLevel: 'sedang',
          safetyLevel: 'hati-hati'
        },
        weather: {
          temperature: 0,
          condition: 'Memuat...',
          humidity: 0
        },
        geoJson: item.geo_json || null,
        kodeWilayah: item.kode_wilayah || null
      }));
      
      setDestinations(mappedData);
      setError(null);
      setLoading(false); // Stop main loading so user can see the cards

      // Fetch Live Data lazily for each destination
      mappedData.forEach((dest) => {
        // Fetch Weather
        if (dest.kodeWilayah) {
          fetch(`/api/weather?kode_wilayah=${dest.kodeWilayah}`)
            .then(res => res.json())
            .then(weatherData => {
              if (weatherData && !weatherData.error) {
                setDestinations(prev => prev.map(d => 
                  d.id === dest.id ? { ...d, weather: weatherData } : d
                ));
              }
            })
            .catch(err => console.error("Weather API error for " + dest.name, err));
        }

        // Fetch Ecosystem (Overpass API)
        if (dest.latitude && dest.longitude) {
          fetch(`/api/ecosystem?lat=${dest.latitude}&lon=${dest.longitude}`)
            .then(res => res.json())
            .then(ecoData => {
              if (ecoData && !ecoData.error) {
                setDestinations(prev => prev.map(d => 
                  d.id === dest.id ? { ...d, ecoStatus: ecoData } : d
                ));
              }
            })
            .catch(err => console.error("Ecosystem API error for " + dest.name, err));
        }
      });

    } catch (err: any) {
      setError(err.message);
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
