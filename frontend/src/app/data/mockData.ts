export interface Destination {
  id: string;
  name: string;
  region: string;
  category: "darat" | "laut";
  latitude: number;
  longitude: number;
  description: string;
  image: string;
  ecoStatus: {
    pollutionLevel: "rendah" | "sedang" | "tinggi";
    coralReefCondition?: "baik" | "sedang" | "buruk";
    forestFireRisk?: "rendah" | "sedang" | "tinggi";
    safetyLevel: "aman" | "hati-hati" | "berbahaya";
  };
  weather: {
    temperature: number;
    condition: string;
    humidity: number;
    warning?: string;
  };
  geoJson?: any;
  kodeWilayah?: string;
}

export const mockDestinations: Destination[] = [
  {
    id: "1",
    name: "Raja Ampat",
    region: "Papua Barat",
    category: "laut",
    latitude: -0.5833,
    longitude: 130.5167,
    description: "Surga bawah laut dengan keanekaragaman hayati laut tertinggi di dunia",
    image: "https://images.unsplash.com/photo-1724258406486-555bd0cf91bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWphJTIwYW1wYXQlMjBpbmRvbmVzaWF8ZW58MXx8fHwxNzc1NDg5NTcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ecoStatus: { pollutionLevel: "rendah", safetyLevel: "aman" },
    weather: { temperature: 0, condition: "Memuat...", humidity: 0 },
  },
  {
    id: "2",
    name: "Taman Nasional Komodo",
    region: "Nusa Tenggara Timur",
    category: "darat",
    latitude: -8.5333,
    longitude: 119.5000,
    description: "Habitat komodo dan pemandangan alam yang menakjubkan",
    image: "https://images.unsplash.com/photo-1676127956513-e44031879b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb21vZG8lMjBpc2xhbmQlMjBpbmRvbmVzaWF8ZW58MXx8fHwxNzc1NDg5NTcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ecoStatus: { pollutionLevel: "rendah", safetyLevel: "aman" },
    weather: { temperature: 0, condition: "Memuat...", humidity: 0 },
  },
  {
    id: "3",
    name: "Danau Toba",
    region: "Sumatera Utara",
    category: "darat",
    latitude: 2.6833,
    longitude: 98.8667,
    description: "Danau vulkanik terbesar di Indonesia dengan keindahan alam yang memukau",
    image: "https://images.unsplash.com/photo-1615009820619-d69e2f948e8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWtlJTIwdG9iYSUyMGluZG9uZXNpYXxlbnwxfHx8fDE3NzU0ODk1NzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ecoStatus: { pollutionLevel: "rendah", safetyLevel: "aman" },
    weather: { temperature: 0, condition: "Memuat...", humidity: 0 },
  },
  {
    id: "4",
    name: "Pantai Kuta",
    region: "Bali",
    category: "laut",
    latitude: -8.7184,
    longitude: 115.1689,
    description: "Pantai terkenal dengan ombak yang cocok untuk berselancar",
    image: "https://images.unsplash.com/photo-1567520595865-0da8e017f2c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrdXRhJTIwYmVhY2glMjBiYWxpfGVufDF8fHx8MTc3NTQ4OTU3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ecoStatus: { pollutionLevel: "rendah", safetyLevel: "aman" },
    weather: { temperature: 0, condition: "Memuat...", humidity: 0 },
  },
  {
    id: "5",
    name: "Bromo Tengger Semeru",
    region: "Jawa Timur",
    category: "darat",
    latitude: -7.9425,
    longitude: 112.9531,
    description: "Gunung berapi aktif dengan pemandangan sunrise yang spektakuler",
    image: "https://images.unsplash.com/photo-1679109426640-966f09b70c88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudCUyMGJyb21vJTIwaW5kb25lc2lhfGVufDF8fHx8MTc3NTQ4OTU3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ecoStatus: { pollutionLevel: "rendah", safetyLevel: "aman" },
    weather: { temperature: 0, condition: "Memuat...", humidity: 0 },
  },
  {
    id: "6",
    name: "Kepulauan Seribu",
    region: "DKI Jakarta",
    category: "laut",
    latitude: -5.6167,
    longitude: 106.5500,
    description: "Gugusan pulau-pulau kecil yang indah dekat Jakarta",
    image: "https://images.unsplash.com/photo-1657020924917-0039de1e1b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aG91c2FuZCUyMGlzbGFuZHMlMjBpbmRvbmVzaWF8ZW58MXx8fHwxNzc1NDg5NTcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ecoStatus: { pollutionLevel: "rendah", safetyLevel: "aman" },
    weather: { temperature: 0, condition: "Memuat...", humidity: 0 },
  },
  {
    id: "7",
    name: "Tanjung Puting",
    region: "Kalimantan Tengah",
    category: "darat",
    latitude: -2.7500,
    longitude: 111.6667,
    description: "Taman nasional dengan populasi orangutan liar terbesar",
    image: "https://images.unsplash.com/photo-1630509930233-0053317bf0ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmFuZ3V0YW4lMjBib3JuZW8lMjBmb3Jlc3R8ZW58MXx8fHwxNzc1NDg5NTcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ecoStatus: { pollutionLevel: "rendah", safetyLevel: "aman" },
    weather: { temperature: 0, condition: "Memuat...", humidity: 0 },
  },
  {
    id: "8",
    name: "Wakatobi",
    region: "Sulawesi Tenggara",
    category: "laut",
    latitude: -5.4833,
    longitude: 123.7500,
    description: "Surga diving dengan terumbu karang yang masih pristine",
    image: "https://images.unsplash.com/photo-1729673766457-13ab5fc16dcf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YWthdG9iaSUyMGRpdmluZyUyMGluZG9uZXNpYXxlbnwxfHx8fDE3NzU0ODk1NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ecoStatus: { pollutionLevel: "rendah", safetyLevel: "aman" },
    weather: { temperature: 0, condition: "Memuat...", humidity: 0 },
  },
];

export const getAlternativeDestinations = (excludeId: string, category: string): Destination[] => {
  return mockDestinations
    .filter(d => d.id !== excludeId && d.category === category && d.ecoStatus.safetyLevel === "aman")
    .slice(0, 3);
};