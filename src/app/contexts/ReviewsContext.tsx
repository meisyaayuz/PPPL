import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface Review {
  id: string;
  destinationId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}

interface ReviewsContextType {
  reviews: Review[];
  addReview: (review: Omit<Review, "id" | "date">) => void;
  getReviewsByDestination: (destinationId: string) => Review[];
  getAverageRating: (destinationId: string) => number;
  getUserReview: (destinationId: string, userId: string) => Review | undefined;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

// Mock initial reviews
const initialReviews: Review[] = [
  {
    id: "r1",
    destinationId: "1",
    userId: "2",
    userName: "Budi Santoso",
    rating: 5,
    comment: "Raja Ampat luar biasa! Terumbu karangnya masih sangat terjaga dan airnya jernih sekali.",
    date: "2026-03-15",
  },
  {
    id: "r2",
    destinationId: "1",
    userId: "3",
    userName: "Siti Nurhaliza",
    rating: 5,
    comment: "Pengalaman snorkeling terbaik dalam hidup saya. Sangat direkomendasikan!",
    date: "2026-03-20",
  },
  {
    id: "r3",
    destinationId: "2",
    userId: "2",
    userName: "Budi Santoso",
    rating: 4,
    comment: "Komodo sangat menakjubkan, tapi perjalanan cukup melelahkan.",
    date: "2026-02-10",
  },
];

export const ReviewsProvider = ({ children }: { children: ReactNode }) => {
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem("reviews");
    return saved ? JSON.parse(saved) : initialReviews;
  });

  useEffect(() => {
    localStorage.setItem("reviews", JSON.stringify(reviews));
  }, [reviews]);

  const addReview = (review: Omit<Review, "id" | "date">) => {
    const newReview: Review = {
      ...review,
      id: `r${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    };
    setReviews(prev => [newReview, ...prev]);
  };

  const getReviewsByDestination = (destinationId: string) => {
    return reviews.filter(r => r.destinationId === destinationId);
  };

  const getAverageRating = (destinationId: string) => {
    const destReviews = getReviewsByDestination(destinationId);
    if (destReviews.length === 0) return 0;
    const sum = destReviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / destReviews.length;
  };

  const getUserReview = (destinationId: string, userId: string) => {
    return reviews.find(r => r.destinationId === destinationId && r.userId === userId);
  };

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        addReview,
        getReviewsByDestination,
        getAverageRating,
        getUserReview
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error("useReviews must be used within ReviewsProvider");
  }
  return context;
};
