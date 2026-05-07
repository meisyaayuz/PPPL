import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { ReviewsProvider } from "./contexts/ReviewsContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { GalleryProvider } from "./contexts/GalleryContext";
import { DestinationsProvider } from "./contexts/DestinationsContext";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  useEffect(() => {
    // Uji coba fetch ke API Laravel
    fetch('/api/test')
      .then(res => res.json())
      .then(data => console.log('Response dari Backend:', data))
      .catch(err => console.error('Gagal memanggil API Backend:', err));
  }, []);

  return (
    <AuthProvider>
      <DestinationsProvider>
        <FavoritesProvider>
          <ReviewsProvider>
            <NotificationsProvider>
              <GalleryProvider>
                <RouterProvider router={router} />
                <Toaster />
              </GalleryProvider>
            </NotificationsProvider>
          </ReviewsProvider>
        </FavoritesProvider>
      </DestinationsProvider>
    </AuthProvider>
  );
}
