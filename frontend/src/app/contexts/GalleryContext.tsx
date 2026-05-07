import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface GalleryImage {
  id: string;
  destinationId: string;
  userId: string;
  userName: string;
  imageUrl: string;
  caption?: string;
  uploadDate: string;
}

interface GalleryContextType {
  images: GalleryImage[];
  addImage: (image: Omit<GalleryImage, "id" | "uploadDate">) => void;
  getImagesByDestination: (destinationId: string) => GalleryImage[];
  removeImage: (imageId: string) => void;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export const GalleryProvider = ({ children }: { children: ReactNode }) => {
  const [images, setImages] = useState<GalleryImage[]>(() => {
    const saved = localStorage.getItem("gallery");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("gallery", JSON.stringify(images));
  }, [images]);

  const addImage = (image: Omit<GalleryImage, "id" | "uploadDate">) => {
    const newImage: GalleryImage = {
      ...image,
      id: `img${Date.now()}`,
      uploadDate: new Date().toISOString(),
    };
    setImages((prev) => [newImage, ...prev]);
  };

  const getImagesByDestination = (destinationId: string) => {
    return images.filter((img) => img.destinationId === destinationId);
  };

  const removeImage = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  return (
    <GalleryContext.Provider
      value={{
        images,
        addImage,
        getImagesByDestination,
        removeImage,
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
};

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error("useGallery must be used within GalleryProvider");
  }
  return context;
};
