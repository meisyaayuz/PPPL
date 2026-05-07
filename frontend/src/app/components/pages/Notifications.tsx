import { useNotifications } from "../../contexts/NotificationsContext";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCheck,
  X,
} from "lucide-react";

export function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } =
    useNotifications();
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case "danger":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "danger":
        return "bg-red-50/80 border-red-200";
      case "warning":
        return "bg-yellow-50/80 border-yellow-200";
      case "info":
        return "bg-blue-50/80 border-blue-200";
      default:
        return "bg-gray-50/80 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) {
      return `${diffInMins} menit yang lalu`;
    } else if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`;
    } else if (diffInDays < 7) {
      return `${diffInDays} hari yang lalu`;
    } else {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 pb-24 pt-6">
      <div className="px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl mb-2 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Notifikasi
            </h1>
            <p className="text-gray-600">
              {unreadCount} notifikasi belum dibaca
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
              className="gap-2 bg-white/60 backdrop-blur-sm border-white/20"
            >
              <CheckCheck className="w-4 h-4" />
              Tandai Semua
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl mb-2 text-gray-800">
                Tidak Ada Notifikasi
              </h3>
              <p className="text-gray-600">
                Anda akan menerima notifikasi tentang kondisi lingkungan di sini
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notification => (
              <Card
                key={notification.id}
                className={`overflow-hidden bg-white/60 backdrop-blur-xl border shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  getTypeColor(notification.type)
                } ${!notification.read ? "border-l-4" : ""}`}
                onClick={() => {
                  markAsRead(notification.id);
                  navigate(`/destination/${notification.destinationId}`);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <Badge className="bg-blue-500 text-white text-xs flex-shrink-0">
                            Baru
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-700 mb-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {notification.destinationName} • {formatDate(notification.date)}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notification.id);
                          }}
                          className="p-1 hover:bg-gray-200/50 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
