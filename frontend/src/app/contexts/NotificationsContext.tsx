import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { mockDestinations } from "../data/mockData";

export interface Notification {
  id: string;
  destinationId: string;
  destinationName: string;
  type: "warning" | "danger" | "info";
  title: string;
  message: string;
  date: string;
  read: boolean;
  target: "user" | "admin"; // Siapa yang bisa lihat notif ini
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  addNotification: (notif: Omit<Notification, 'id' | 'date' | 'read'>) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const generateEnvironmentalNotifications = (): Notification[] => {
  const notifications: Notification[] = [];

  mockDestinations.forEach(dest => {
    // Notif lingkungan → untuk USER
    if (dest.ecoStatus.pollutionLevel === "tinggi") {
      notifications.push({
        id: `n-pollution-${dest.id}`,
        destinationId: dest.id,
        destinationName: dest.name,
        type: "danger",
        title: "Tingkat Polusi Tinggi",
        message: `Tingkat polusi di ${dest.name} sedang tinggi. Tidak disarankan untuk aktivitas outdoor.`,
        date: new Date().toISOString(),
        read: false,
        target: "user",
      });
    }

    if (dest.weather.warning) {
      notifications.push({
        id: `n-weather-${dest.id}`,
        destinationId: dest.id,
        destinationName: dest.name,
        type: "warning",
        title: "Peringatan Cuaca",
        message: dest.weather.warning,
        date: new Date().toISOString(),
        read: false,
        target: "user",
      });
    }

    if (dest.ecoStatus.coralReefCondition === "buruk") {
      notifications.push({
        id: `n-coral-${dest.id}`,
        destinationId: dest.id,
        destinationName: dest.name,
        type: "danger",
        title: "Kondisi Terumbu Karang Buruk",
        message: `Terumbu karang di ${dest.name} dalam kondisi buruk. Bantulah melestarikan dengan tidak menyentuh karang.`,
        date: new Date().toISOString(),
        read: false,
        target: "user",
      });
    }

    if (dest.ecoStatus.forestFireRisk === "tinggi") {
      notifications.push({
        id: `n-fire-${dest.id}`,
        destinationId: dest.id,
        destinationName: dest.name,
        type: "danger",
        title: "Risiko Kebakaran Hutan Tinggi",
        message: `Risiko kebakaran hutan di ${dest.name} sedang tinggi. Harap berhati-hati dan jangan membuat api unggun.`,
        date: new Date().toISOString(),
        read: false,
        target: "user",
      });
    }

    if (dest.ecoStatus.safetyLevel === "berbahaya") {
      notifications.push({
        id: `n-safety-${dest.id}`,
        destinationId: dest.id,
        destinationName: dest.name,
        type: "danger",
        title: "Status Keamanan Berbahaya",
        message: `${dest.name} sedang dalam status berbahaya. Pertimbangkan untuk menunda kunjungan.`,
        date: new Date().toISOString(),
        read: false,
        target: "user",
      });
    }
  });

  return notifications;
};

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const [allNotifications, setAllNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem("all_notifications");
    if (saved) {
      return JSON.parse(saved);
    }
    return generateEnvironmentalNotifications();
  });

  useEffect(() => {
    localStorage.setItem("all_notifications", JSON.stringify(allNotifications));
  }, [allNotifications]);

  // Filter notif berdasarkan role user yang sedang login
  const currentRole = user?.role || "user";
  const notifications = allNotifications.filter(n => n.target === currentRole);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setAllNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setAllNotifications(prev =>
      prev.map(n => (n.target === currentRole ? { ...n, read: true } : n))
    );
  };

  const clearNotification = (id: string) => {
    setAllNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addNotification = (notif: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: new Date().toISOString(),
      read: false,
    };
    setAllNotifications(prev => [newNotif, ...prev]);
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
        addNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return context;
};
