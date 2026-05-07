import { useFavorites } from "../../contexts/FavoritesContext";
import { mockDestinations } from "../../data/mockData";
import { useNavigate } from "react-router";
import { Heart, MapPin, Star } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useReviews } from "../../contexts/ReviewsContext";

export function Favorites() {
  const { favorites, toggleFavorite } = useFavorites();
  const { getAverageRating, getReviewsByDestination } = useReviews();
  const navigate = useNavigate();

  const favoriteDestinations = mockDestinations.filter(dest =>
    favorites.includes(dest.id)
  );

  const getSafetyColor = (level: string) => {
    switch (level) {
      case "aman":
        return "bg-green-500/20 text-green-600 border-green-500/30";
      case "hati-hati":
        return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
      case "berbahaya":
        return "bg-red-500/20 text-red-600 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-600 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 pb-24 pt-6">
      <div className="px-6">
        <div className="mb-6">
          <h1 className="text-3xl mb-2 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Destinasi Favorit
          </h1>
          <p className="text-gray-600">
            {favoriteDestinations.length} destinasi disimpan
          </p>
        </div>

        {favoriteDestinations.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl mb-2 text-gray-800">
                Belum Ada Favorit
              </h3>
              <p className="text-gray-600 mb-6">
                Mulai simpan destinasi favorit Anda dengan menekan ikon hati
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-full hover:from-emerald-600 hover:to-blue-600 transition-all shadow-lg"
              >
                Jelajahi Destinasi
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {favoriteDestinations.map(destination => {
              const avgRating = getAverageRating(destination.id);
              const reviewCount = getReviewsByDestination(destination.id).length;

              return (
                <Card
                  key={destination.id}
                  className="overflow-hidden bg-white/60 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/destination/${destination.id}`)}
                >
                  <div className="relative">
                    <ImageWithFallback
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(destination.id);
                      }}
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2.5 hover:bg-white transition-all shadow-lg"
                    >
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </button>

                    <Badge
                      className={`absolute top-3 left-3 ${getSafetyColor(
                        destination.ecoStatus.safetyLevel
                      )} backdrop-blur-sm border`}
                    >
                      {destination.ecoStatus.safetyLevel.toUpperCase()}
                    </Badge>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="text-xl mb-1 text-gray-800">
                      {destination.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{destination.region}</span>
                    </div>

                    {avgRating > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-800">
                            {avgRating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          ({reviewCount} review)
                        </span>
                      </div>
                    )}

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {destination.description}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-50/50 text-blue-700 border-blue-200"
                      >
                        {destination.weather.condition}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs bg-emerald-50/50 text-emerald-700 border-emerald-200"
                      >
                        {destination.weather.temperature}°C
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
