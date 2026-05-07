import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (destinationId: string) => void;
  removeFavorite: (destinationId: string) => void;
  isFavorite: (destinationId: string) => boolean;
  toggleFavorite: (destinationId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (destinationId: string) => {
    setFavorites(prev => {
      if (!prev.includes(destinationId)) {
        return [...prev, destinationId];
      }
      return prev;
    });
  };

  const removeFavorite = (destinationId: string) => {
    setFavorites(prev => prev.filter(id => id !== destinationId));
  };

  const isFavorite = (destinationId: string) => {
    return favorites.includes(destinationId);
  };

  const toggleFavorite = (destinationId: string) => {
    if (isFavorite(destinationId)) {
      removeFavorite(destinationId);
    } else {
      addFavorite(destinationId);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
};
